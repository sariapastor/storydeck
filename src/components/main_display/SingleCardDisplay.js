import PropTypes from "prop-types";
import MediaDisplay from "./MediaDisplay";
import TranscriptExcerptDisplay from "./TranscriptExcerptDisplay";
import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";
import "./SingleCardDisplay.css";

const SingleCardDisplay = ({
  card,
  decks,
  updateRecord,
  updateActive,
  newDeckFromCard,
}) => {
  const [transcript, setTranscript] = useState({});
  const [mediaTime, setMediaTime] = useState(0);

  useEffect(() => {
    if (card.recording) {
      switch (card.recording.transcriptStatus) {
        case "Complete":
          invoke("query_transcripts", {
            filter: { _id: card.recording.transcript },
          }).then((response) => {
            setTranscript(JSON.parse(response)[0]);
          });
          break;
        case "Error":
          setTranscript({ lines: [{ line: "Unable to transcribe" }] });
          break;
        case "Processing":
          setTranscript({ lines: [{ line: "Transcript processing.." }] });
          break;
        case undefined:
        default:
          console.log(card);
          break;
      }
    }
  }, [card]);

  const updateCard = (e) => {
    // e.preventDefault();
    const attribute = e.target.className;
    const updatedCard = { ...card };
    updatedCard[attribute] = e.target.textContent;
    const isCommit = e.type === "blur";
    const change = {};
    change[attribute] = updatedCard[attribute];
    updateRecord("card", updatedCard, change, isCommit);
  };

  const updateRelatedDecks = (oid) => {
    document.getElementById("deckPicker").classList.add("hidden");
    const updatedCard = { ...card };
    updatedCard.decks.push(oid);
    const change = { decks: updatedCard.decks };
    updateRecord("card", updatedCard, change, true);
  };

  const showDeckPicker = () => {
    document.getElementById("deckPicker").classList.remove("hidden");
  };

  return (
    <div className="card-expansion">
      <MediaDisplay recording={card.recording} setMediaTime={setMediaTime} />
      <TranscriptExcerptDisplay transcript={transcript} mediaTime={mediaTime} />
      <section className="expanded-card-summary">
        <div id="deckPicker" className="deck-picker hidden">
          {decks
            .filter((d) => !card.decks.some((cd) => cd.$oid === d._id.$oid))
            .map((d) => (
              <div onClick={() => updateRelatedDecks(d._id)}>{d.name}</div>
            ))}
          <div onClick={() => newDeckFromCard(card)}>
            + create new collection
          </div>
        </div>
        <section className="overview">
          <h2
            className="name"
            contentEditable={true}
            onChange={updateCard}
            onBlur={updateCard}
          >
            {card.name}
          </h2>
          <p
            className="description"
            contentEditable={true}
            onChange={updateCard}
            onBlur={updateCard}
          >
            {card.description}
          </p>
        </section>
        <section className="related">
          <h4>related collections</h4>
          <ul>
            {card.decks.map((deck) => (
              <li
                className="deck-link"
                onClick={() => updateActive("deck", deck)}
              >
                {decks.find((d) => d._id.$oid === deck.$oid).name}
              </li>
            ))}
            <li onClick={showDeckPicker}>+ Add to another</li>
          </ul>
        </section>
        <section className="view-buttons">
          <button
            onClick={() => {
              updateActive("transcript", card.recording.transcript);
            }}
          >
            View full transcript
          </button>
          <button>View notes</button>
        </section>
      </section>
    </div>
  );
};

SingleCardDisplay.propTypes = {
  card: PropTypes.shape({
    _id: PropTypes.shape({
      $oid: PropTypes.string,
    }).isRequired,
    name: PropTypes.string.isRequired,
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
    recording: PropTypes.shape({
      _id: PropTypes.shape({
        $oid: PropTypes.string,
      }),
      name: PropTypes.string,
      filename: PropTypes.string,
      transcriptStatus: PropTypes.string,
      transcript: PropTypes.shape({
        $oid: PropTypes.string,
      }),
    }),
    decks: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.shape({
          $oid: PropTypes.string,
        }),
      })
    ),
  }),
  updateActive: PropTypes.func,
};

export default SingleCardDisplay;
