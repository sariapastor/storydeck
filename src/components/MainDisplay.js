import PropTypes from "prop-types";
import StoryDeck from "./StoryDeck";
import SingleCardDisplay from "./SingleCardDisplay";
import ExpandedStoryDeck from "./ExpandedStoryDeck";

const MainDisplay = ({
  view,
  setView,
  decks,
  cards,
  activeDeck,
  activeCard,
  updateActive,
}) => {
  switch (view) {
    case "loading":
      return <h2>Loading...</h2>;
    case "single-deck":
      return <ExpandedStoryDeck deck={activeDeck} />;
    case "single-card":
      return <SingleCardDisplay card={activeCard} />;
    case "decks-overview":
    default:
      return (
        <>
          {decks.map((deck, index) => (
            <StoryDeck key={index} deck={deck} updateActive={updateActive} />
          ))}
        </>
      );
  }
};

MainDisplay.propTypes = {
  view: PropTypes.string.isRequired,
  setView: PropTypes.func.isRequired,
  decks: PropTypes.array.isRequired,
  cards: PropTypes.array.isRequired,
  activeDeck: PropTypes.object,
  activeCard: PropTypes.object,
};

export default MainDisplay;
