import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api";
import "./FullTranscriptView.css";

import { ObjectIdExtended } from 'bson';
import { DBRecord, Telling, Transcript } from '../../types';

interface FullTranscriptViewProps {
  transcriptId: ObjectIdExtended;
  card: Telling;
  updateRecord: (type: "card" | "deck" | "transcript", record: DBRecord, change: Partial<DBRecord>, isCommit: boolean) => void;
}

export const FullTranscriptView: React.FC<FullTranscriptViewProps> = ({ transcriptId, card, updateRecord }) => {
  const [transcript, setTranscript] = useState<Transcript | { text: "Loading transcript.." }>({
    text: "Loading transcript.."
  });
  const updateRecording = (e: any) => {
    const attribute = (e.target as HTMLElement).className;
    const updatedCard = { ...card };
    updatedCard.recording[attribute as "name" | "filename"] = e.target.textContent;
    const isCommit = e.type === "blur";
    const updateField =
      attribute === "filename" ? "recording.filename" : "recording.name";
    const change: {[key: string]: string} = {};
    change[updateField] = updatedCard.recording[attribute as "name" | "filename"];
    console.log(change);
    if (isCommit && attribute === "filename") {
      invoke("rename_file", {
        recordingId: card.recording._id,
        filename: e.target.textContent,
      })
        .then(() => updateRecord("card", updatedCard, change, isCommit))
        .catch(console.log);
    } else {
      updateRecord("card", updatedCard, change, isCommit);
    }
  };
  useEffect(() => {
    invoke<string>("query_transcripts", {
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
