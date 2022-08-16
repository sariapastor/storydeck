import PropTypes from "prop-types";
import StoryCard from "./StoryCard";
import "./ExpandedStoryDeck.css";

const ExpandedStoryDeck = ({ deck, updateActive, updateRecord }) => {
  const cardComponents = deck.cards.map((card, index) => (
    <StoryCard key={index} card={card} updateActive={updateActive} />
  ));

  const summary = deck.description ? deck.description : "Add description";

  const updateDeck = (e) => {
    const attribute = e.target.className;
    const updatedDeck = { ...deck };
    updatedDeck[attribute] = e.target.textContent;
    const isCommit = e.type === "blur";
    const change = {};
    change[attribute] = updatedDeck[attribute];
    updateRecord("deck", updatedDeck, change, isCommit);
  };

  return (
    <div className="deck-expansion">
      <section className="expanded-deck-summary">
        <h2
          className="name"
          contentEditable={true}
          onChange={updateDeck}
          onBlur={updateDeck}
        >
          {deck.name}
        </h2>
        <p
          className="description"
          contentEditable={true}
          onChange={updateDeck}
          onBlur={updateDeck}
        >
          {summary}
        </p>
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
