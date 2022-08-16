import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api";
import "./FullTranscriptView.css";

const FullTranscriptView = ({ transcriptId, card, updateRecord }) => {
  const [transcript, setTranscript] = useState({
    text: "Loading transcript..",
  });
  const updateRecording = (e) => {
    const attribute = e.target.className;
    const updatedCard = { ...card };
    updatedCard.recording[attribute] = e.target.textContent;
    const isCommit = e.type === "blur";
    const updateField =
      attribute === "filename" ? "recording.filename" : "recording.name";
    const change = {};
    change[updateField] = updatedCard.recording[attribute];
    console.log(change);
    if (isCommit && attribute === "filename") {
      invoke("rename_file", {
        recordingId: card.recording._id,
        filename: e.target.textContent,
      })
        .then(() => updateRecord("card", updatedCard, change, isCommit))
        .catch((e) => console.log(e));
    } else {
      updateRecord("card", updatedCard, change, isCommit);
    }
  };
  useEffect(() => {
    invoke("query_transcripts", {
      filter: { _id: transcriptId },
    }).then((response) => {
      setTranscript(JSON.parse(response)[0]);
    });
  }, [transcriptId]);
  return (
    <section className="full-text">
      <h2
        className="name"
        contentEditable={true}
        onChange={updateRecording}
        onBlur={updateRecording}
      >
        {card.recording.name}
      </h2>
      <h2
        className="filename"
        contentEditable={true}
        onChange={updateRecording}
        onBlur={updateRecording}
      >
        {card.recording.filename}
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
