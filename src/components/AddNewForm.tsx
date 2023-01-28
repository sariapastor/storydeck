import React, { useState } from "react";
import { NewRecordingInfo } from "../types";
import "./AddNewForm.css";

declare global{
  interface Window {
    __TAURI__: any;
  }
}

interface AddNewFormProps {
  addMethods: [(input: NewRecordingInfo) => void, (input: string) => void];
  updating: [boolean, string];
  hideForm: () => void;
}

export const AddNewResourceForm: React.FC<AddNewFormProps> = ({ addMethods, updating, hideForm }) => {
  const [isUpdating, updateResource] = updating;
  const [addNewCard, addNewDeck] = addMethods;
  const [formFields, setFormFields] = useState<NewRecordingInfo>({
    name: "",
    recordingFilePath: "",
  });

  const onNameChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setFormFields({ ...formFields, name: e.target.value });
  };

  const handleSubmit: React.MouseEventHandler<HTMLButtonElement> = () => {
    switch (updateResource) {
      case "Deck":
        addNewDeck(formFields.name);
        break;
      case "Recording":
      case "Planned Recording":
        addNewCard(formFields);
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
        <div className="fields">
          <div className="name-field">
            <label htmlFor="name">
              Name for new {resourceDisplayName.toLowerCase()}:
            </label>
            {/* <br /> */}
            <input
              name="name"
              value={formFields.name}
              onChange={onNameChange}
            />
          </div>
          <div
            className={`${
              updateResource === "Recording" ? "active-field" : "hidden-field"
            }`}
          >
            <button onClick={createDialog}>Choose File</button>
            <div className="filename-display">
              {formFields.recordingFilePath.split("/").pop()}
            </div>
          </div>
        </div>
        <button className="sub" onClick={handleSubmit}>
          Add New {resourceDisplayName}
        </button>
        {/* <input type="submit" value={`Add New ${updateResource}`} /> */}
        {/* </form> */}
      </section>
    </section>
  );
};
