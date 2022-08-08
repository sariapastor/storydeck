import PropTypes from "prop-types";

const TranscriptExcerptDisplay = ({ transcript, mediaTime }) => {
  // TODO: convert mediaTime (seconds float) to display format
  // TODO: create 'excerpt' state variable to reset when mediaTime updates
  return (
    <section className={`excerpt-display${transcript.length ? "" : " hidden"}`}>
      <h2>00:00.00</h2>
      <h4>[Transcribed text here]</h4>
    </section>
  );
};

TranscriptExcerptDisplay.propTypes = {
  transcript: PropTypes.shape({
    _id: PropTypes.shape({
      $oid: PropTypes.string,
    }),
    language: PropTypes.string,
    text: PropTypes.arrayOf(
      PropTypes.shape({
        startTime: PropTypes.number,
        endTime: PropTypes.number,
        line: PropTypes.string,
      })
    ),
  }).isRequired,
};

export default TranscriptExcerptDisplay;
