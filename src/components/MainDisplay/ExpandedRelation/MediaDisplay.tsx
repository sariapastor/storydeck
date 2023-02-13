import React, { useEffect, useState } from "react";
import ReactWaves from "@dschoon/react-waves";
import { documentDir, join } from "@tauri-apps/api/path";
import { Recording } from 'src/types';
import "./MediaDisplay.css";


interface MediaDisplayProps {
  recording: Recording;
  setMediaTime: React.Dispatch<React.SetStateAction<number>>;
}

export const MediaDisplay: React.FC<MediaDisplayProps> = ({ recording, setMediaTime }) => {
  const [playing, setPlaying] = useState(false);
  const [file, setFile] = useState("");
  const [loaded, setLoaded] = useState(false);

  const onPosChange = (pos: number) => setMediaTime(pos);

  const recordingBlobUrlFromAssetUrl = async (assetUrl: string) => {
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
      (async () => {
        const pathString: string = await join(await documentDir(), "storydeck", recording.filename);
        const assetUrl = "asset://" + pathString;
        const blobUrl = await recordingBlobUrlFromAssetUrl(assetUrl);
        blobUrl ? setFile(blobUrl) : console.log('error getting blob from input');
        setLoaded(true);
      })()
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
      <div id='waveform'></div>
    </section>
  );
};
