import PropTypes from "prop-types";
import { useEffect, useState } from "react";

const TranscriptExcerptDisplay = ({ transcript, mediaTime }) => {
  const [excerptIndex, setExcerptIndex] = useState(0);
  const displayTime = `${Math.floor(mediaTime / 60)}:${mediaTime % 60}`;
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
