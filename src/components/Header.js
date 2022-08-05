import PropTypes from "prop-types";
import Controls from "./header/Controls";

const Header = (props) => {
  return (
    <header>
      <h1>{props.title}</h1>
      <Controls setCards={props.setCards} setDecks={props.setDecks} />
    </header>
  );
};

Header.propTypes = {
  title: PropTypes.string.isRequired,
  setCards: PropTypes.func.isRequired,
  setDecks: PropTypes.func.isRequired,
};

export default Header;
