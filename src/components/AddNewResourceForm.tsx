import React from "react";
import { invoke } from "@tauri-apps/api";
import { SubmitHandler, useForm } from 'react-hook-form';

import { useDeck } from "../context";
import { NewRecordingInfo, StoryDeck, Telling } from "../types";
import "./AddNewResourceForm.scss";

declare global{
  interface Window {
    __TAURI__: any; //eslint-disable-line @typescript-eslint/no-explicit-any
  }
}

export const AddNewResourceForm: React.FC = () => {
  const { formState, hideForm, loadCardsAndDecks, setActive } = useDeck();
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<NewRecordingInfo>();
  
  const isOpen = formState !== 'closed';
  const resource = isOpen ? formState : undefined;
  
  const addNewCard = async ({ name, recordingFilePath: filePath }: NewRecordingInfo) => {
    console.log("invoking create_story_card");
    const newCard: Telling = JSON.parse(await invoke<string>("create_story_card", { name, filePath }));
    loadCardsAndDecks({ newCard }).catch(console.log);
    setActive("card", newCard._id);
    if (filePath) {
      console.log(`invoking create_transcript\nfilePath: ${filePath}, cardId: ${newCard._id}`);
      await invoke("create_transcript", {
        filePath,
        cardId: newCard._id,
      });
      loadCardsAndDecks().catch(console.log);
    }
  };

  const addNewDeck = async ( name: string ) => {
    console.log("invoking create_story_deck");
    const newDeck: StoryDeck = JSON.parse(await invoke<string>("create_story_deck", { name }));
    newDeck.cards = [];
    loadCardsAndDecks({ newDeck }).catch(console.log);
    setActive("deck", newDeck._id);
  };

  const onSubmit: SubmitHandler<NewRecordingInfo> = (data) => {
    hideForm();
    switch (resource) {
      case "collection":
        addNewDeck(data.name);
        break;
      case "recording":
      case "plan":
        addNewCard(data);
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
            className={`field file-field ${
              resource === "recording" ? "active-field" : "hidden"
            }`} 
          >
            <div className="input-group">
              <input className="hidden" {...register("recordingFilePath", { required: { value: resource === "recording", message: "File path is required." } })} />
              <button onClick={createDialog}>Choose File</button>
              <div className="filename-display">
                {watch("recordingFilePath").split('/').pop()}
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
