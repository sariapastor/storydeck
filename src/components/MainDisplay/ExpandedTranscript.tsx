import React, { SyntheticEvent } from "react";
import { invoke } from "@tauri-apps/api";
import { useForm } from "react-hook-form";

import { useDeck, useNavigation } from "src/context";
import "./ExpandedTranscript.scss";

export const ExpandedTranscript: React.FC = () => {
  const { relations, transcript, loadTranscript, updateResource } = useDeck();
  const { viewStack, position } = useNavigation();
  
  if (!transcript) { loadTranscript(viewStack[position].activeResource!) }
  
  const card = relations.find(c => c._id === transcript?.card_id);
  const { register } = useForm<{recordingFile: string; recordingName: string;}>({defaultValues: { recordingFile: card?.recording.filename, recordingName: card?.recording.name }});

  const updateRecording = async (e: SyntheticEvent) => {
    const attribute = (e.target as HTMLElement).id;
    const updateField =
      attribute === "filename" ? "recording.filename" : "recording.name";
    const change: {[key: string]: string} = {};
    change[updateField] = (e.target as HTMLInputElement).value;
    if (attribute === "filename") {
      try {
        await invoke<string>("rename_file", {
          recordingId: card!.recording._id,
          filename: change["recording.filename"],
        });
        updateResource("telling", card!._id, change);
      } catch (e: unknown) {
        console.error(e);
      }
    } else {
      updateResource("telling", card!._id, change);
    }
  };
  

  return (
    <>
      {transcript ? (
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
          <p>{transcript.text}</p>
        </section>
      ) : <p> Loading.. </p>}
    </>
  );
};
