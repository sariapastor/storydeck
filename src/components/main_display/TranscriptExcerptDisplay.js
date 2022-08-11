import PropTypes from "prop-types";
import { useEffect, useState } from "react";

const TranscriptExcerptDisplay = ({ transcript, mediaTime }) => {
  // TODO: convert mediaTime (seconds float) to display format
  // TODO: create 'excerpt' state variable to reset when mediaTime updates
  const [excerpt, setExcerpt] = useState("");
  const displayTime = `${Math.floor(mediaTime / 60)}:${
    mediaTime - Math.floor(mediaTime / 60)
  }`;
  useEffect(() => {
    setExcerpt(transcript.lines ? transcript.lines[0].line : "");
  }, [transcript]);
  return (
    <section className={`excerpt-display ${transcript.lines ? "" : " hidden"}`}>
      <h2>{displayTime}</h2>
      <h4>{excerpt}</h4>
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
