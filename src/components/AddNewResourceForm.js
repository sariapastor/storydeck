import { useState } from "react";
import PropTypes from "prop-types";

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

  const onPathChange = (e) => {
    setFormFields({ ...formFields, recordingFilePath: e.target.value });
  };

  const onFormSubmit = (e) => {
    e.preventDefault();

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

  return (
    <section className={`${isUpdating ? "active-form" : "hidden-form"}`}>
      <section className="form-container">
        <button className="close pointer" onClick={cancelAdd}>
          ✖
        </button>
        <form onSubmit={onFormSubmit}>
          <div>
            <label htmlFor="name">Name for new resource:</label>
            <br />
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
            <label htmlFor="filePath">Recording File Path:</label>
            <br />
            <input
              name="filePath"
              value={formFields.recordingFilePath}
              onChange={onPathChange}
            />
          </div>
          <input type="submit" value={`Add New ${updateResource}`} />
        </form>
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
