import React from "react";
import { invoke } from "@tauri-apps/api";
import { SubmitHandler, useForm } from 'react-hook-form';

import { useDeck } from "../context";
import { NewRecordingInfo, Deck, Telling } from "../types";
import "./AddNewResourceForm.scss";

declare global {
  interface Window {
    __TAURI__: any; //eslint-disable-line @typescript-eslint/no-explicit-any
  }
}

export const AddNewResourceForm: React.FC = () => {
  const { formState, hideForm, loadRelations, setActive } = useDeck();
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<NewRecordingInfo>();

  const isOpen = formState !== 'closed';
  const resource = isOpen ? formState : undefined;

  const addNewRelation = async ({ name, recordingFilePath: filePath }: NewRecordingInfo) => {
    console.log("invoking create_story_card");
    const newRelation: Telling = JSON.parse(await invoke<string>("create_story_card", { name, filePath }));
    loadRelations({ newRelation }).catch(console.log);
    setActive("telling", newRelation._id);
    if (filePath) {
      console.log(`invoking create_transcript\nfilePath: ${filePath}, cardId: ${newRelation._id}`);
      await invoke("create_transcript", {
        filePath,
        cardId: newRelation._id,
      });
      loadRelations().catch(console.log);
    }
  };

  const addNewCollection = async (name: string) => {
    console.log("invoking create_story_deck");
    const newCollection: Deck = JSON.parse(await invoke<string>("create_story_deck", { name }));
    newCollection.cards = [];
    loadRelations({ newCollection }).catch(console.log);
    setActive("deck", newCollection._id);
  };

  const onSubmit: SubmitHandler<NewRecordingInfo> = (data) => {
    hideForm();
    switch (resource) {
      case "collection":
        addNewCollection(data.name);
        break;
      case "relation":
      case "outline":
        addNewRelation(data);
        break;
      default:
        console.log(`resource name ${resource ? `"${resource}" not recognized` : 'undefined'}`);
    }
  };

  const cancelAdd = () => {
    reset();
    hideForm();
  };

  const createDialog = () => {
    window.__TAURI__.dialog
      .open({
        multiple: false,
        directory: false,
        recursive: true,
      })
      .then((path: string) => {
        if (path) {
          setValue("recordingFilePath", path, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
          console.log("set field value: ", path);
        }
      })
      .catch(console.log);
  };

  const resourceDisplayName = resource ? resource[0].toUpperCase() + resource.substring(1) : '';

  return (
    <div className={`${isOpen ? "active-form" : "hidden"}`}>
      <div className="form-container">
        <div className="form-header">
          <h2>{`Add New ${resourceDisplayName}`}</h2>
        </div>
        <form id="addForm" onSubmit={handleSubmit(onSubmit)}>
          <div className={`field name-field ${errors.name ? 'has-error' : ''}`}>
            <div className="input-group">
              <label htmlFor="name">
                Name for new {resource}:
              </label>
              <input className="text-input" {...register("name", { required: 'Name is required.' })} />
            </div>
            <div className="field-errors">
              {errors.name?.message}
            </div>
          </div>
          <div
            className={`field file-field ${resource === "relation" ? "active-field" : "hidden"
              }`}
          >
            <div className="input-group">
              <input className="hidden" {...register("recordingFilePath", { required: { value: resource === "relation", message: "File path is required." } })} />
              <button onClick={createDialog}>Choose File</button>
              <div className="filename-display">
                {watch("recordingFilePath")?.split('/').pop()}
              </div>
            </div>
            <div className="field-errors">
              {errors.recordingFilePath?.message}
            </div>
          </div>
        </form>
        <div className="form-footer">
          <button onClick={cancelAdd}>Cancel</button>
          <button type="submit" form="addForm" disabled={!!(errors.name || errors.recordingFilePath)}>
            {`Add New ${resourceDisplayName}`}
          </button>
        </div>
      </div>
    </div>
  );
};
