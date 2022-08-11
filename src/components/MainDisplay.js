import PropTypes from "prop-types";
import StoryDeck from "./main_display/StoryDeck";
import SingleCardDisplay from "./main_display/SingleCardDisplay";
import ExpandedStoryDeck from "./main_display/ExpandedStoryDeck";
import "./MainDisplay.css";

const MainDisplay = ({
  currentView,
  setViewStack,
  decks,
  cards,
  updateActive,
}) => {
  console.log("md: ", currentView);

  switch (currentView.view) {
    case "loading":
      return <h2>Loading...</h2>;
    case "single-deck":
      return (
        <ExpandedStoryDeck
          deck={decks.find((d) => d._id.$oid === currentView.activeDeck.$oid)}
          updateActive={updateActive}
        />
      );
    case "single-card":
      return (
        <SingleCardDisplay
          card={cards.find((c) => c._id.$oid === currentView.activeCard.$oid)}
          updateActive={updateActive}
        />
      );
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
  currentView: PropTypes.shape({
    view: PropTypes.string,
    activeCard: PropTypes.object,
    activeDeck: PropTypes.object,
  }).isRequired,
  setViewStack: PropTypes.func.isRequired,
  decks: PropTypes.array.isRequired,
  cards: PropTypes.array.isRequired,
  updateActive: PropTypes.func.isRequired,
};

export default MainDisplay;
