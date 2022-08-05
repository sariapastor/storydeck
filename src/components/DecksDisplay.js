import PropTypes from "prop-types";
import StoryDeck from "./StoryDeck";

const DecksDisplay = ({ decks }) => {
  return decks[0].message ? (
    <h2>{decks[0].message}</h2>
  ) : (
    <>
      {decks.map((deck, index) => (
        <StoryDeck key={index} deck={deck} />
      ))}
    </>
  );
};

DecksDisplay.propTypes = {
  decks: PropTypes.array.isRequired,
};

export default DecksDisplay;
