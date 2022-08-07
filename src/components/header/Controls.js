import PropTypes from "prop-types";

const Controls = ({ setUpdating }) => {
  const createDialog = () => {
    // console.log("open dialog here");
    setUpdating([true, "Add"]);
  };
  return (
    <button className="header-control" onClick={createDialog}>
      + New
    </button>
  );
};

Controls.propTypes = {
  setUpdating: PropTypes.func.isRequired,
};

export default Controls;
