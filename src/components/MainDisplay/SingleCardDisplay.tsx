import React, { useEffect, useState } from 'react';
import { invoke } from "@tauri-apps/api";
import { ObjectIdExtended } from 'bson';

import { MediaDisplay } from "./MediaDisplay";
import { TranscriptExcerptDisplay } from "./TranscriptExcerptDisplay";
import { ErrorBoundary } from '../ErrorBounds';
import { StoryDeck, Telling, TranscriptStatus } from '../../types';
import { useDeck, useNavigation } from '../../context';
import "./SingleCardDisplay.css";

export const SingleCardDisplay: React.FC = () => {
  const { viewStack, position } = useNavigation();
  const { cards, decks, transcript, loadCardsAndDecks, loadTranscript, setActive, updateResource } = useDeck();
  const [mediaTime, setMediaTime] = useState(0);
  
  const card = cards.find(c => c._id.$oid === viewStack[position].activeCard?.$oid)!;

  let transcriptStatusMsg;
  useEffect(() => {
    if (card.recording) {
      switch (card.recording.transcriptStatus) {
        case TranscriptStatus.Complete:
          loadTranscript(card.recording.transcript!);
          break;
        case TranscriptStatus.Error:
          transcriptStatusMsg = "Error on attempt to transcribe";
          break;
        case TranscriptStatus.Processing:
          transcriptStatusMsg = "Transcript processing..";
          break;
        case undefined:
        default:
          console.log(card);
          break;
      }
    }
  }, [card]);
  
  const newDeckFromCard = async (card: Telling) => {
    const newDeck: StoryDeck = JSON.parse(await invoke<string>("create_story_deck", { name: "untitled collection" }));
    newDeck.cards = [card];
    const updatedCard = { ...card };
    updatedCard.decks.push(newDeck._id);
    loadCardsAndDecks({newDeck});
    setActive("deck", newDeck._id);
    await updateResource("card", updatedCard._id, { decks: updatedCard.decks });
    loadCardsAndDecks().catch(console.log);
  };

  const updateCard = (e: any) => { //eslint-disable-line @typescript-eslint/no-explicit-any
    // e.preventDefault();
    const attribute = (e.target as HTMLElement).className;
    const updatedCard = { ...card };
    updatedCard[attribute as "name" | "description" | "notes"] = e.target.textContent;
    const isCommit = e.type === "blur";
    const change: { [key: string]: string | undefined } = {};
    change[attribute] = updatedCard[attribute as "name" | "description" | "notes"];
    if (isCommit) { updateResource("card", updatedCard._id, change); }
  };

  const updateRelatedDecks = (oid: ObjectIdExtended) => {
    document.getElementById("deckPicker")!.classList.add("hidden");
    const updatedCard = { ...card };
    updatedCard.decks.push(oid);
    const change = { decks: updatedCard.decks };
    updateResource("card", updatedCard._id, change);
  };

  const showDeckPicker = () => {
    document.getElementById("deckPicker")!.classList.remove("hidden");
  };

  return (
    <div className="card-expansion">
      <ErrorBoundary name='Media Display'>
        <>
          <MediaDisplay recording={card.recording} setMediaTime={setMediaTime} />
          {transcript ? <TranscriptExcerptDisplay mediaTime={mediaTime} /> : transcriptStatusMsg}
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
                onClick={() => setActive("deck", deck)}
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
              setActive("transcript", card.recording.transcript!);
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
