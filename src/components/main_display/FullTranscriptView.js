import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api";
import "./FullTranscriptView.css";

const FullTranscriptView = ({ transcriptId, card }) => {
  const [transcript, setTranscript] = useState({
    text: "Loading transcript..",
  });
  useEffect(() => {
    invoke("query_transcripts", {
      filter: { _id: transcriptId },
    }).then((response) => {
      setTranscript(JSON.parse(response)[0]);
    });
  }, [transcriptId]);
  return (
    <section className="full-text">
      <h2>
        {card.recording.name} [{card.recording.filename}]
      </h2>
      <p>{transcript.text}</p>
    </section>
  );
};

FullTranscriptView.propTypes = {
  transcriptId: PropTypes.shape({
    $oid: PropTypes.string,
  }).isRequired,
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
    people: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.shape({ $oid: PropTypes.string }),
        name: PropTypes.string,
        notes: PropTypes.string,
      })
    ),
    places: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        locData: PropTypes.shape({
          type: PropTypes.string,
          coordinates: PropTypes.array,
        }),
      })
    ),
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
      }).isRequired,
      name: PropTypes.string.isRequired,
      filename: PropTypes.string.isRequired,
      participants: PropTypes.arrayOf(
        PropTypes.shape({
          _id: PropTypes.shape({ $oid: PropTypes.string }),
          name: PropTypes.string,
          notes: PropTypes.string,
        })
      ),
      dateRecorded: PropTypes.number,
      recordingLocation: PropTypes.shape({
        name: PropTypes.string,
        locData: PropTypes.shape({
          type: PropTypes.string,
          coordinates: PropTypes.array,
        }),
      }),
      transcriptStatus: PropTypes.string,
      transcript: PropTypes.shape({
        $oid: PropTypes.string,
      }),
    }),
  }).isRequired,
};

export default FullTranscriptView;
