import PropTypes from "prop-types";
import "./StoryCard.css";

const StoryCard = ({ card, updateActive }) => {
  const summary = card.description ? card.description : "SOme text";
  const setToActive = (e) => updateActive("card", card._id);
  const unflip = (e) => e.target.childNodes[0].classList.add("resetting");
  const resetDone = (e) => {
    if (e.animationName === "reversetapeflip") {
      e.target.classList.remove("resetting");
    }
  };

  return (
    <div className="cassette-container" onMouseLeave={unflip}>
      <div
        className="vertical-tape-case"
        onClick={setToActive}
        onAnimationEnd={resetDone}
      >
        <div className="face front"></div>
        <div className="face cassette"></div>
        <div className="face cassette obverse"></div>
        <div className="face label-spine">{card.name}</div>
        <div className="face back">
          <div className="label-desc">{summary}</div>
        </div>
        <div className="face open-spine"></div>
        <div className="face top"></div>
        <div className="face bottom"></div>
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
