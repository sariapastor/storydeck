import PropTypes from "prop-types";
import StoryCard from "./StoryCard";

const StoryDeck = ({ deck }) => {
  const cardComponents = deck.cards.map((card, index) => (
    <StoryCard key={index} card={card} />
  ));
  const summary = deck.description ? deck.description : "";
  return (
    <div className="deck-container">
      <div className="card-element top">
        <div className="card-display">
          <h3>{deck.name}</h3>
          <h4>{summary}</h4>
        </div>
      </div>
      {cardComponents}
    </div>
  );
};

StoryDeck.propTypes = {
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

export default StoryDeck;
