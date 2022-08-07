import PropTypes from "prop-types";
import MediaDisplay from "./MediaDisplay";
import TranscriptExcerptDisplay from "./TranscriptExcerptDisplay";
import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";

const SingleCardDisplay = ({ card }) => {
  const [transcript, setTranscript] = useState([]);
  const [mediaTime, setMediaTime] = useState(0);
  useEffect(() => {
    if (card.recording) {
      switch (card.recording.transcriptionStatus) {
        case "complete":
          invoke("query_by_transcript_id", {
            _id: card.recording.transcriptId,
          }).then((response) => {
            setTranscript(JSON.parse(response));
          });
          break;
        case "error":
          setTranscript(["Unable to transcribe"]);
          break;
        case "processing":
          setTranscript(["Transcribing recording.."]);
          break;
        case undefined:
        default:
          break;
      }
    }
  }, [card]);

  return (
    <div className="card-expansion">
      <MediaDisplay recording={card.recording} setMediaTime={setMediaTime} />
      <TranscriptExcerptDisplay transcript={transcript} mediaTime={mediaTime} />
      <section className="expanded-card-summary">
        <h3>{card.name}</h3>
        <h4>Other info</h4>
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
      filePath: PropTypes.string,
      transcriptionStatus: PropTypes.string,
      transcriptId: PropTypes.shape({
        $oid: PropTypes.string,
      }),
    }),
  }).isRequired,
};

export default SingleCardDisplay;
