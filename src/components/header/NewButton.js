import PropTypes from "prop-types";

const menuItems = {
  TELLING: "+ New Recording",
  TEMPLATE: "+ New Planned Recording",
  DECK: "+ New Deck Group",
};

const NewButton = ({ setUpdating }) => {
  const showForm = (e) => {
    let payload = "";
    switch (e.target.textContent) {
      case menuItems.TELLING:
        payload = "Recording";
        break;
      case menuItems.TEMPLATE:
        payload = "Planned Recording";
        break;
      case menuItems.DECK:
        payload = "Deck";
        break;
      default:
        console.log("Unrecognized menu item: ", e.target.textContent);
    }
    setUpdating([true, payload]);
  };
  return (
    <div className="header-menu">
      <button className="header-control">+ New</button>
      <ul className="drop-down">
        <li onClick={showForm}>{menuItems.TELLING}</li>
        <li onClick={showForm}>{menuItems.TEMPLATE}</li>
        <li onClick={showForm}>{menuItems.DECK}</li>
      </ul>
    </div>
  );
};

NewButton.propTypes = {
  setUpdating: PropTypes.func.isRequired,
};

export default NewButton;
