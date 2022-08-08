import PropTypes from "prop-types";
import StoryDeck from "./StoryDeck";
import SingleCardDisplay from "./SingleCardDisplay";
import ExpandedStoryDeck from "./ExpandedStoryDeck";

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
      console.log("loading");
      return <h2>Loading...</h2>;
    case "single-deck":
      return (
        <ExpandedStoryDeck
          deck={currentView.activeDeck}
          updateActive={updateActive}
        />
      );
    case "single-card":
      console.log("single-card");
      return (
        <SingleCardDisplay
          card={currentView.activeCard}
          updateActive={updateActive}
        />
      );
    case "decks-overview":
    default:
      console.log(currentView);
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
