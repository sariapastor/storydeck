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

  return (
    <section className={`${isUpdating ? "active-form" : "hidden-form"}`}>
      <section className="form-container">
        <button className="close pointer" onClick={cancelAdd}>
          ✖
        </button>
        <div>
          <label htmlFor="name">Name for new resource:</label>
          <br />
          <input name="name" value={formFields.name} onChange={onNameChange} />
        </div>
        <div
          className={`${
            updateResource === "Recording" ? "active-field" : "hidden-field"
          }`}
        >
          {/* <label htmlFor="filePath">Recording File Path:</label> */}
          {/* <br /> */}
          {/* <input
              id="filePath"
              type="file"
              // value={formFields.recordingFilePath}
              onChange={onFileChange}
              // className="hidden"
            /> */}
          <button onClick={createDialog}>Choose Recording File</button>
        </div>
        <button onClick={handleSubmit}> Add New {updateResource}</button>
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
