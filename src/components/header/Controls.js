import PropTypes from "prop-types";

const Controls = ({ setCards, setDecks }) => {
  const createDialog = () => {
    console.log("open dialog here");
  };
  return (
    <button className="header-control" onClick={createDialog}>
      + New
    </button>
  );
};

Controls.propTypes = {
  setCards: PropTypes.func.isRequired,
  setDecks: PropTypes.func.isRequired,
};

export default Controls;
