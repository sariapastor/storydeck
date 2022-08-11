import PropTypes from "prop-types";

const MediaDisplay = ({ recording }) => {
  return (
    <section className={`media-display${recording ? "" : " hidden"}`}>
      <h2>[Media controls go here]</h2>
    </section>
  );
};

MediaDisplay.propTypes = {
  recording: PropTypes.shape({
    _id: PropTypes.shape({
      $oid: PropTypes.string,
    }),
    name: PropTypes.string,
    filePath: PropTypes.string,
  }),
};

export default MediaDisplay;
