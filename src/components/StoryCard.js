import PropTypes from "prop-types";

const StoryCard = ({ card }) => {
  const summary = card.description ? card.description : "";
  return (
    <div className="card-element">
      <div className="card-display">
        <h3>{card.name}</h3>
        <h4>{summary}</h4>
      </div>
    </div>
  );
};

StoryCard.propTypes = {
  card: PropTypes.shape({
    _id: PropTypes.shape({
      $oid: PropTypes.string,
    }).isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    decks: PropTypes.arrayOf(
      PropTypes.shape({
        $oid: PropTypes.string,
      })
    ).isRequired,
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

export default StoryCard;
