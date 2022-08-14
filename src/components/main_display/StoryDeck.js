import PropTypes from "prop-types";
import "./StoryDeck.css";

const StoryDeck = ({ deck, updateActive }) => {
  const summary = deck.description ? deck.description : "";
  const setToActive = () => updateActive("deck", deck._id);
  return (
    <div className="deck-container" onClick={setToActive}>
      <div className="collection-title">
        <h3>{deck.name}</h3>
      </div>
      <div className="cassette-rack">
        <div className="rack-background"></div>
        {[0, 1, 2, 3, 4].map((i) => (
          <div className="tape-slot" key={i}>
            {i + 1 < deck.cards.length ? (
              <>
                <div className="tape-label">{deck.cards[i].name}</div>
                <div className="tape-case"></div>
              </>
            ) : (
              <div className="empty-slot">+</div>
            )}
          </div>
        ))}
      </div>
      <div className="collection-description">{summary}</div>
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
