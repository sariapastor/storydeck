import PropTypes from "prop-types";
import "./StoryCard.css";

const StoryCard = ({ card, updateActive }) => {
  // const summary = card.description ? card.description : "";
  const setToActive = () => updateActive("card", card._id);
  return (
    <div className="cassette-container" onClick={setToActive}>
      <div className="vertical-tape-case">
        <div className="face front"></div>
        <div className="face cassette"></div>
        <div className="face label-spine">{card.name}</div>
        <div className="face back"></div>
        <div className="face open-spine"></div>
        <div className="face top"></div>
        <div className="face bottom"></div>
        {/* <div className="label-sticker"> */}
        {/* <h3>{card.name}</h3> */}
        {/* </div> */}
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
