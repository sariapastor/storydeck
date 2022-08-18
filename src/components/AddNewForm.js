import { useState } from "react";
import PropTypes from "prop-types";
import "./AddNewForm.css";

const AddNewResourceForm = ({ addMethods, updating, hideForm }) => {
  const [isUpdating, updateResource] = updating;
  const [addNewCard, addNewDeck] = addMethods;
  const [formFields, setFormFields] = useState({
    name: "",
    recordingFilePath: "",
  });

  const onNameChange = (e) => {
    setFormFields({ ...formFields, name: e.target.value });
  };

  const handleSubmit = (e) => {
    // e.preventDefault();

    switch (updateResource) {
      case "Deck":
        addNewDeck({ name: formFields.name });
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
      .then((p) => {
        if (p) {
          setFormFields({ ...formFields, recordingFilePath: p });
          console.log("added to formFields: ", p);
        }
      })
      .catch((e) => console.log(e));
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

AddNewResourceForm.propTypes = {
  addMethods: PropTypes.arrayOf(PropTypes.func).isRequired,
  updating: PropTypes.array.isRequired,
  hideForm: PropTypes.func.isRequired,
};

export default AddNewResourceForm;
