import React, { SyntheticEvent, useEffect, useState } from 'react';
import { invoke } from "@tauri-apps/api";
import { ObjectIdExtended } from 'bson';
import { useForm } from 'react-hook-form';

import { MediaDisplay } from "./MediaDisplay";
import { TranscriptExcerptDisplay } from "./TranscriptExcerptDisplay";
import { ErrorBoundary } from '../ErrorBounds';
import { StoryDeck, Telling, TranscriptStatus } from '../../types';
import { useDeck, useNavigation } from '../../context';
import "./SingleCardDisplay.scss";

export const SingleCardDisplay: React.FC = () => {
  const { viewStack, position } = useNavigation();
  const { cards, decks, transcript, loadCardsAndDecks, loadTranscript, setActive, updateResource } = useDeck();
  const [mediaTime, setMediaTime] = useState(0);
  
  const card = cards.find(c => c._id.$oid === viewStack[position].activeCard?.$oid)!;
  const { register, watch } = useForm<{cardName: string; cardDescription?: string;}>({ defaultValues: { cardName: card.name, cardDescription: card.description } });

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

  const updateCard = (e: SyntheticEvent) => { 
    const attribute = (e.target as HTMLElement).id as "name" | "description" | "notes";
    const change: { [key: string]: string | undefined } = {};
    change[attribute] = (e.target as HTMLInputElement).value;
    if (change[attribute] !== card[attribute]) { updateResource("card", card._id, change); }
  };

  const updateRelatedDecks = (oid: ObjectIdExtended) => {
    document.getElementById("deckPicker")!.classList.add("hidden");
    const updatedDeckList = [ ...card.decks, oid ];
    const change = { decks: updatedDeckList };
    updateResource("card", card._id, change);
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
          <input
            id="name"
            className="h2"
            { ...register("cardName", { onBlur: updateCard }) }
          />
          <textarea
            id="description"
            { ...register("cardDescription", { onBlur: updateCard }) }
          >
            { watch("cardDescription") }
          </textarea>
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
