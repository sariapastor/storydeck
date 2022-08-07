import PropTypes from "prop-types";

const SingleCardDisplay = ({ card }) => {
  return (
    <div className="card-expansion">
      <section className="expanded-card-summary">
        <h3>{card.name}</h3>
        <h4>Other info</h4>
      </section>
    </div>
  );
};

SingleCardDisplay.propTypes = {
  card: PropTypes.shape({
    _id: PropTypes.shape({
      $oid: PropTypes.string,
    }).isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    notes: PropTypes.string,
    tags: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.shape({
          $oid: PropTypes.string,
        }),
        name: PropTypes.string,
      })
    ),
    recording: PropTypes.shape({
      _id: PropTypes.shape({
        $oid: PropTypes.string,
      }),
      name: PropTypes.string,
      filePath: PropTypes.string,
    }),
  }).isRequired,
};

export default SingleCardDisplay;
