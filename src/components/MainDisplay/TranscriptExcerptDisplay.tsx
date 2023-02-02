import React, { useEffect, useState } from "react";
import "./TranscriptExcerptDisplay.css";
import { useDeck } from "../../context";

interface TranscriptExcerptDisplayProps {
  mediaTime: number;
}

export const TranscriptExcerptDisplay: React.FC<TranscriptExcerptDisplayProps> = ({ mediaTime }) => {
  const { transcript } = useDeck();
  const [excerptIndex, setExcerptIndex] = useState(0);
  const minutes = Math.floor(mediaTime / 60);
  const seconds = mediaTime % 60;
  const displaySeconds = seconds < 10 ? `0${seconds}` : seconds;
  const displayTime = `${minutes}:${displaySeconds}`;
  // TODO: convert mediaTime (seconds float) to proper display format

  useEffect(() => {
    if (
      transcript &&
      excerptIndex < transcript.lines.length - 1 &&
      transcript.lines[excerptIndex].endTime < mediaTime
      
    ) {
      setExcerptIndex(
        transcript.lines.findIndex((entry) => entry.endTime > mediaTime) // not just incrementing to account for skipping around
      );
    }
  }, [transcript, mediaTime, excerptIndex]);

  return (
    <section className={`excerpt-display ${transcript?.lines ? "" : " hidden"}`}>
      <h2>{displayTime}</h2>
      <h4>{transcript?.lines ? transcript.lines[excerptIndex].line : ""}</h4>
    </section>
  );
};
