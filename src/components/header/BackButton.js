import PropTypes from "prop-types";

const BackButton = ({ viewStack, setViewStack }) => {
  const goBack = () => {
    viewStack.pop();
    setViewStack([...viewStack]);
  };
  return <button onClick={goBack}>⬅</button>;
};

BackButton.propTypes = {
  viewStack: PropTypes.arrayOf(PropTypes.object).isRequired,
  setViewStack: PropTypes.func.isRequired,
};

export default BackButton;
