import { useState } from "react";
import PropTypes from "prop-types";

const AddNewCardForm = ({ addNewCard, updatingCards, hideForm }) => {
  const [formFields, setFormFields] = useState({
    name: "",
    recordingFilePath: "",
    recordingLocation: "",
  });

  const onNameChange = (e) => {
    setFormFields({ ...formFields, name: e.target.value });
  };

  const onPathChange = (e) => {
    setFormFields({ ...formFields, recordingFilePath: e.target.value });
  };

  const onLocationChange = (e) => {
    setFormFields({ ...formFields, recordingLocation: e.target.value });
  };

  const onFormSubmit = (e) => {
    e.preventDefault();

    addNewCard(formFields);

    setFormFields({
      name: "",
      recordingFilePath: "",
    });
  };

  return (
    <section className={`${updatingCards ? "active-form" : "hidden-form"}`}>
      <section className="form-container">
        <button className="close pointer" onClick={hideForm}>
          ✖
        </button>
        <form onSubmit={onFormSubmit}>
          <div>
            <label htmlFor="cardName">Card Name:</label>
            <br />
            <input
              name="cardName"
              value={formFields.name}
              onChange={onNameChange}
            />
          </div>
          <div>
            <label htmlFor="filePath">Recording File Path:</label>
            <br />
            <input
              name="filePath"
              value={formFields.recordingFilePath}
              onChange={onPathChange}
            />
          </div>
          <div>
            <label htmlFor="recordingLocation">Recording Location:</label>
            <br />
            <input
              name="frecordingLocation"
              value={formFields.recordingLocation}
              onChange={onLocationChange}
            />
          </div>
          <input type="submit" value="Add New Card" />
        </form>
      </section>
    </section>
  );
};

AddNewCardForm.propTypes = {
  addNewCard: PropTypes.func.isRequired,
  updatingCards: PropTypes.bool.isRequired,
  hideForm: PropTypes.func.isRequired,
};

export default AddNewCardForm;
