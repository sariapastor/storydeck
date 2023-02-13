import React, { SyntheticEvent, useEffect, useState } from 'react';
import { invoke } from "@tauri-apps/api";
import { ObjectIdExtended } from 'bson';
import { useForm } from 'react-hook-form';

import { MediaDisplay } from "./MediaDisplay";
import { TranscriptExcerptDisplay } from "./TranscriptExcerptDisplay";
import { ErrorBoundary } from 'src/components/ErrorBounds';
import { Deck, Telling, TranscriptStatus } from 'src/types';
import { useDeck, useNavigation } from 'src/context';
import "./ExpandedRelation.scss";

export const ExpandedRelation: React.FC = () => {
  const { viewStack, position } = useNavigation();
  const { relations, collections, transcript, loadRelations, loadTranscript, setActive, updateResource } = useDeck();
  
  const card = relations.find(c => c._id.$oid === viewStack[position].activeResource!.$oid)!;
  const { register } = useForm<{cardName: string; cardDescription?: string;}>({ defaultValues: { cardName: card.name, cardDescription: card.description } });
  const [mediaTime, setMediaTime] = useState(0);

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
    const newCollection: Deck = JSON.parse(await invoke<string>("create_story_deck", { name: "untitled collection" }));
    newCollection.cards = [card];
    const updatedCard = { ...card };
    updatedCard.decks.push(newCollection._id);
    loadRelations({newCollection});
    setActive("deck", newCollection._id);
    await updateResource("telling", updatedCard._id, { decks: updatedCard.decks });
    loadRelations().catch(console.log);
  };

  const updateCard = (e: SyntheticEvent) => { 
    const attribute = (e.target as HTMLElement).id as "name" | "description" | "notes";
    const change: { [key: string]: string | undefined } = {};
    change[attribute] = (e.target as HTMLInputElement).value;
    if (change[attribute] !== card[attribute]) { updateResource("telling", card._id, change); }
  };

  const updateRelatedDecks = (oid: ObjectIdExtended) => {
    document.getElementById("deckPicker")!.classList.add("hidden");
    const updatedDeckList = [ ...card.decks, oid ];
    const change = { decks: updatedDeckList };
    updateResource("telling", card._id, change);
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
          {collections
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
          />
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
                {collections.find((d) => d._id.$oid === deck.$oid)!.name}
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
