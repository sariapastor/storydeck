import React, { useEffect, useState } from 'react';
import { invoke } from "@tauri-apps/api";
import { ObjectIdExtended } from 'bson';

import { MediaDisplay } from "./MediaDisplay";
import { TranscriptExcerptDisplay } from "./TranscriptExcerptDisplay";
import { ErrorBoundary } from '../ErrorBoundary';
import { DBRecord, StoryDeck, Telling, Transcript, TranscriptStatus } from '../../types';
import "./SingleCardDisplay.css";


interface SingleCardDisplayProps {
  card: Telling;
  decks: StoryDeck[];
  updateRecord: (type: "card" | "deck" | "transcript", record: DBRecord, change: Partial<DBRecord>, isCommit: boolean) => void;
  updateActive: (type: "deck" | "card" | "transcript", oid: ObjectIdExtended) => void;
  newDeckFromCard: (card: Telling) => void;
}

export const SingleCardDisplay: React.FC<SingleCardDisplayProps> = ({
  card,
  decks,
  updateRecord,
  updateActive,
  newDeckFromCard,
}) => {
  const [transcript, setTranscript] = useState<Transcript | Omit<Transcript, '_id' | 'language' | 'text'>>({ lines: [{ line: '', startTime: 0, endTime: 0}]});
  const [mediaTime, setMediaTime] = useState(0);

  useEffect(() => {
    if (card.recording) {
      switch (card.recording.transcriptStatus) {
        case TranscriptStatus.Complete:
          invoke<string>("query_transcripts", {
            filter: { _id: card.recording.transcript },
          }).then((response) => {
            setTranscript(JSON.parse(response)[0]);
          });
          break;
        case TranscriptStatus.Error:
          setTranscript({ lines: [{ line: "Unable to transcribe", startTime: 0, endTime: 0 }] });
          break;
        case TranscriptStatus.Processing:
          setTranscript({ lines: [{ line: "Transcript processing..", startTime: 0, endTime: 0 }] });
          break;
        case undefined:
        default:
          console.log(card);
          break;
      }
    }
  }, [card]);

  const updateCard = (e: any) => { //eslint-disable-line @typescript-eslint/no-explicit-any
    // e.preventDefault();
    const attribute = (e.target as HTMLElement).className;
    const updatedCard = { ...card };
    updatedCard[attribute as "name" | "description" | "notes"] = e.target.textContent;
    const isCommit = e.type === "blur";
    const change: { [key: string]: string | undefined } = {};
    change[attribute] = updatedCard[attribute as "name" | "description" | "notes"];
    updateRecord("card", updatedCard, change, isCommit);
  };

  const updateRelatedDecks = (oid: ObjectIdExtended) => {
    document.getElementById("deckPicker")!.classList.add("hidden");
    const updatedCard = { ...card };
    updatedCard.decks.push(oid);
    const change = { decks: updatedCard.decks };
    updateRecord("card", updatedCard, change, true);
  };

  const showDeckPicker = () => {
    document.getElementById("deckPicker")!.classList.remove("hidden");
  };

  return (
    <div className="card-expansion">
      <ErrorBoundary feature='Media Display'>
        <>
          <MediaDisplay recording={card.recording} setMediaTime={setMediaTime} />
          {transcript && <TranscriptExcerptDisplay transcript={transcript} mediaTime={mediaTime} />}
        </>
      </ErrorBoundary>
      <section className="expanded-card-summary">
        <div id="deckPicker" className="deck-picker hidden">
          {decks
            .filter((d) => !card.decks.some((cd) => cd.$oid === d._id.$oid))
            .map((d, index) => (
              <div key={index} onClick={() => updateRelatedDecks(d._id)}>{d.name}</div>
            ))}
          <div onClick={() => newDeckFromCard(card)}>
            + create new collection
          </div>
        </div>
        <section className="overview">
          <h2
            className="name"
            contentEditable={true}
            onChange={updateCard}
            onBlur={updateCard}
          >
            {card.name}
          </h2>
          <p
            className="description"
            contentEditable={true}
            onChange={updateCard}
            onBlur={updateCard}
          >
            {card.description}
          </p>
        </section>
        <section className="related">
          <h4>related collections</h4>
          <ul>
            {card.decks.map((deck, index) => (
              <li
                className="deck-link"
                key={index}
                onClick={() => updateActive("deck", deck)}
              >
                {decks.find((d) => d._id.$oid === deck.$oid)!.name}
              </li>
            ))}
            <li onClick={showDeckPicker}>+ Add to another</li>
          </ul>
        </section>
        <section className="view-buttons">
          <button
            onClick={() => {
              updateActive("transcript", card.recording.transcript!);
            }}
            disabled={card.recording.transcript === undefined}
          >
            View full transcript
          </button>
          <button>View notes</button>
        </section>
      </section>
    </div>
  );
};
