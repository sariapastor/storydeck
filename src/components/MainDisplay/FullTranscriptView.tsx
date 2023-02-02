import React from "react";
import { invoke } from "@tauri-apps/api";
import { useDeck, useNavigation } from "../../context";
import "./FullTranscriptView.css";

export const FullTranscriptView: React.FC = () => {
  const { cards, transcript, loadTranscript, updateResource } = useDeck();
  const { viewStack, position } = useNavigation();

  const card = cards.find(c => c._id === viewStack[position].activeCard)!

  const updateRecording = (e: any) => { //eslint-disable-line @typescript-eslint/no-explicit-any
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
        .then(() => updateResource("card", updatedCard._id, change))
        .catch(console.log);
    } else {
      // updateResource("card", updatedCard._id, change);
      console.log("handle change", change)
    }
  };
  if (!transcript) { loadTranscript(card.recording.transcript!); }

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
      <p>{transcript?.text}</p>
    </section>
  );
};
