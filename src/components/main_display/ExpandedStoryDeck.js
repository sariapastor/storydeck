import PropTypes from "prop-types";
import StoryCard from "./StoryCard";

const ExpandedStoryDeck = ({ deck, updateActive }) => {
  const cardComponents = deck.cards.map((card, index) => (
    <StoryCard key={index} card={card} updateActive={updateActive} />
  ));
  return (
    <div className="deck-expansion">
      <section className="expanded-deck-summary">
        <h3>{deck.name}</h3>
        <h4>Other info</h4>
      </section>
      <div className="deck-cards-layout">{cardComponents}</div>
    </div>
  );
};

ExpandedStoryDeck.propTypes = {
  deck: PropTypes.shape({
    _id: PropTypes.shape({
      $oid: PropTypes.string,
    }).isRequired,
    name: PropTypes.string.isRequired,
    cards: PropTypes.arrayOf(PropTypes.object).isRequired,
    description: PropTypes.string,
    notes: PropTypes.string,
    tags: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.shape({
          $oid: PropTypes.string,
        }),
        name: PropTypes.string,
      })
    ),
  }).isRequired,
};

export default ExpandedStoryDeck;
