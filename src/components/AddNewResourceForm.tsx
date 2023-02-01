import React, { useState } from "react";
import { SubmitHandler, useForm } from 'react-hook-form';
import { NewRecordingInfo } from "../types";
import "./AddNewResourceForm.css";

declare global{
  interface Window {
    __TAURI__: any; //eslint-disable-line @typescript-eslint/no-explicit-any
  }
}

interface AddNewResourceFormProps {
  addMethods: [(input: NewRecordingInfo) => void, (input: string) => void];
  updating: [boolean, string];
  hideForm: () => void;
}

export const AddNewResourceForm: React.FC<AddNewResourceFormProps> = ({ addMethods, updating, hideForm }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<NewRecordingInfo>();
  const [formFields, setFormFields] = useState<NewRecordingInfo>({
    name: "",
    recordingFilePath: "",
  });

  const [isUpdating, updateResource] = updating;
  const [addNewCard, addNewDeck] = addMethods;

  const onNameChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setFormFields({ ...formFields, name: e.target.value });
  };

  const onSubmit: SubmitHandler<NewRecordingInfo> = (data) => {
    switch (updateResource) {
      case "Deck":
        addNewDeck(data.name);
        break;
      case "Recording":
      case "Planned Recording":
        addNewCard(data);
        break;
      default:
        console.log(`resource name "${updateResource}" not recognized`);
    }

    setFormFields({
      name: "",
      recordingFilePath: "",
    });
  };

  const cancelAdd = () => {
    setFormFields({
      name: "",
      recordingFilePath: "",
    });
    hideForm();
  };

  const createDialog = () => {
    // const input = document.getElementById("filePath");
    window.__TAURI__.dialog
      .open({
        multiple: false,
        directory: false,
        recursive: true,
      })
      .then((path: string) => {
        if (path) {
          setFormFields({ ...formFields, recordingFilePath: path });
          console.log("added to formFields: ", path);
        }
      })
      .catch(console.log);
  };

  const resourceDisplayName =
    updateResource === "Deck" ? "Collection" : "Recording";

  return (
    <section className={`${isUpdating ? "active-form" : "hidden-form"}`}>
      <section className="form-container">
        <button className="close" onClick={cancelAdd}>
          ✖
        </button>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* <div className="fields"> */}
          <div className="name-field">
            <label htmlFor="name">
              Name for new {resourceDisplayName.toLowerCase()}:
            </label>
            {/* <br /> */}
            <input
              // name="name"
              {...register("name")}
              // value={formFields.name}
              // onChange={onNameChange}

            />
          </div>
          <div
            className={`${
              updateResource === "Recording" ? "active-field" : "hidden-field"
            }`}
          >
            <input type="file" {...register("recordingFilePath")} />
            <button onClick={createDialog}>Choose File</button>
            <div className="filename-display">
              {/* {formFields.recordingFilePath.split("/").pop()} */}
              {watch("recordingFilePath")}
            </div>
          </div>
          <input type="submit" value={`Add New ${updateResource}`} />
        </form>
      </section>
    </section>
  );
};
