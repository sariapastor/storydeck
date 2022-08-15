import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import ReactWaves from "@dschoon/react-waves";
import { documentDir, join } from "@tauri-apps/api/path";
import "./MediaDisplay.css";

const MediaDisplay = ({ recording, setMediaTime }) => {
  const [playing, setPlaying] = useState(false);
  const [file, setFile] = useState("");
  const [loaded, setLoaded] = useState(false);

  const onPosChange = (pos) => setMediaTime(pos);

  const recordingBlobUrlFromAssetUrl = async (assetUrl) => {
    try {
      const response = await fetch(assetUrl, {
        method: "GET",
        headers: {
          "Content-Type": "audio/x-wav",
        },
      });
      const blobUrl = URL.createObjectURL(await response.blob());
      return blobUrl;
    } catch {
      console.log("unable to create blob url from input: ", assetUrl);
    }
  };

  useEffect(() => {
    if (recording) {
      documentDir()
        .then((basePath) => join(basePath, "StoryDecks", recording.filename))
        .then((fullPath) => "asset://" + fullPath)
        .then((assetUrl) => recordingBlobUrlFromAssetUrl(assetUrl))
        .then((blobUrl) => {
          setFile(blobUrl);
          setLoaded(true);
        });
    }
  }, [recording]);

  return (
    <section className={`media-display${recording ? "" : " hidden"}`}>
      {loaded ? (
        <>
          <div className="play button" onClick={() => setPlaying(!playing)}>
            {playing ? "■" : "▶"}
          </div>
          <ReactWaves
            audioFile={file}
            className={"react-waves"}
            onPosChange={onPosChange}
            options={{
              barHeight: 2,
              cursorWidth: 0,
              height: 200,
              hideScrollbar: true,
              progressColor: "#AAD1AB",
              responsive: true,
              waveColor: "#D1D6DA",
            }}
            volume={1}
            zoom={1}
            playing={playing}
          />
          {/* <audio src={file} type="audio/x-wav" controls />{" "} */}
        </>
      ) : (
        <div className="placeholder">Loading media..</div>
      )}
    </section>
  );
};

MediaDisplay.propTypes = {
  recording: PropTypes.shape({
    _id: PropTypes.shape({
      $oid: PropTypes.string,
    }),
    name: PropTypes.string,
    filename: PropTypes.string,
  }),
  setMediaTime: PropTypes.func.isRequired,
};

export default MediaDisplay;
