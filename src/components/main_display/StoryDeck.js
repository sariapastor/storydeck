import PropTypes from "prop-types";

const StoryDeck = ({ deck, updateActive }) => {
  const summary = deck.description ? deck.description : "";
  const setToActive = () => updateActive("deck", deck);
  return (
    <div className="deck-container" onClick={setToActive}>
      <div className="card-element top">
        <div className="card-display">
          <h3>{deck.name}</h3>
          <h4>{summary}</h4>
        </div>
      </div>
    </div>
  );
};

StoryDeck.propTypes = {
  deck: PropTypes.shape({
    _id: PropTypes.shape({
      $oid: PropTypes.string,
    }).isRequired,
    name: PropTypes.string.isRequired,
    cards: PropTypes.arrayOf(PropTypes.object),
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
