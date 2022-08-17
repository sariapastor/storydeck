import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import "./TranscriptExcerptDisplay.css";

const TranscriptExcerptDisplay = ({ transcript, mediaTime }) => {
  const [excerptIndex, setExcerptIndex] = useState(0);
  const minutes = Math.floor(mediaTime / 60);
  const seconds = mediaTime % 60;
  const displaySeconds = seconds < 10 ? `0${seconds}` : seconds;
  const displayTime = `${minutes}:${displaySeconds}`;
  // TODO: convert mediaTime (seconds float) to proper display format

  useEffect(() => {
    if (
      transcript.lines &&
      transcript.lines[excerptIndex].endTime &&
      transcript.lines[excerptIndex].endTime < mediaTime &&
      excerptIndex < transcript.lines.length - 1
    ) {
      setExcerptIndex(
        transcript.lines.findIndex((entry) => entry.endTime > mediaTime)
      );
    }
  }, [transcript, mediaTime, excerptIndex]);

  return (
    <section className={`excerpt-display ${transcript.lines ? "" : " hidden"}`}>
      <h2>{displayTime}</h2>
      <h4>{transcript.lines ? transcript.lines[excerptIndex].line : ""}</h4>
    </section>
  );
};

TranscriptExcerptDisplay.propTypes = {
  transcript: PropTypes.shape({
    _id: PropTypes.shape({
      $oid: PropTypes.string,
    }),
    language: PropTypes.string,
    text: PropTypes.string,
    lines: PropTypes.arrayOf(
      PropTypes.shape({
        startTime: PropTypes.number,
        endTime: PropTypes.number,
        line: PropTypes.string,
      })
    ),
  }),
};

export default TranscriptExcerptDisplay;
