import React, { SyntheticEvent } from "react";
import { invoke } from "@tauri-apps/api";
import { useForm } from "react-hook-form";

import { useDeck, useNavigation } from "../../context";
import "./FullTranscriptView.scss";

export const FullTranscriptView: React.FC = () => {
  const { cards, transcript, loadTranscript, updateResource } = useDeck();
  const { viewStack, position } = useNavigation();
  const card = cards.find(c => c._id === viewStack[position].activeCard)!

  const { register } = useForm<{recordingFile: string; recordingName: string;}>({defaultValues: { recordingFile: card.recording.filename, recordingName: card.recording.name }})


  const updateRecording = (e: SyntheticEvent) => {
    const attribute = (e.target as HTMLElement).id;
    const updateField =
      attribute === "filename" ? "recording.filename" : "recording.name";
    const change: {[key: string]: string} = {};
    change[updateField] = (e.target as HTMLInputElement).value;
    if (attribute === "filename") {
      invoke("rename_file", {
        recordingId: card.recording._id,
        filename: change[updateField],
      })
        .then(() => updateResource("card", card._id, change))
        .catch(console.log);
    } else {
      updateResource("card", card._id, change);
    }
  };
  if (!transcript) { loadTranscript(card.recording.transcript!); }

  return (
    <section className="full-text">
      <input
        id="name"
        className="h2"
        { ...register("recordingName", { onBlur: updateRecording }) }
      />
      <input
        id="filename"
        className="h2"
        { ...register("recordingFile", { onBlur: updateRecording }) }
      />
      <p>{transcript?.text}</p>
    </section>
  );
};
