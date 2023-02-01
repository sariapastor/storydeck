import React from 'react';

import { ErrorBoundary } from './ErrorBoundary';
import { StoryDeckIcon } from "./main_display/StoryDeck";
import { SingleCardDisplay } from "./main_display/SingleCardDisplay";
import { ExpandedStoryDeck } from "./main_display/ExpandedStoryDeck";
import { FullTranscriptView } from "./main_display/FullTranscriptView";
import "./MainDisplay.css";
import { DBRecord, StoryDeck, Telling, ViewState } from '../types';
import { ObjectIdExtended } from 'bson';

interface MainDisplayProps {
  currentView: ViewState;
  decks: StoryDeck[];
  cards: Telling[];
  updateRecord: (type: "card" | "deck" | "transcript", record: DBRecord, change: Partial<DBRecord>, isCommit: boolean) => void;
  updateActive: (type: "deck" | "card" | "transcript", oid: ObjectIdExtended) => void;
  newDeckFromCard: (card: Telling) => void;
}

export const MainDisplay: React.FC<MainDisplayProps> = ({
  currentView,
  decks,
  cards,
  updateRecord,
  updateActive,
  newDeckFromCard,
}) => {
  console.info("currentView: ", currentView);

  switch (currentView.view) {
    case "loading":
      return <h2>Loading...</h2>;
    case "single-deck":
      return (
        <ErrorBoundary feature='Collection View'>
          <ExpandedStoryDeck
            deck={decks.find((d) => d._id.$oid === currentView.activeDeck!.$oid)!}
            updateActive={updateActive}
            updateRecord={updateRecord}
          />
        </ErrorBoundary>
      );
    case "single-card":
      return (
        <ErrorBoundary feature='Recording View'>
        <SingleCardDisplay
          card={cards.find((c) => c._id.$oid === currentView.activeCard!.$oid)!}
          decks={decks}
          updateRecord={updateRecord}
          updateActive={updateActive}
          newDeckFromCard={newDeckFromCard}
        />
        </ErrorBoundary>
        );
    case "full-transcript":
      return (
        <ErrorBoundary feature='Transcript View'>
        <FullTranscriptView
          transcriptId={currentView.activeTranscript!}
          card={cards.find((c) => c._id.$oid === currentView.activeCard!.$oid)!}
          updateRecord={updateRecord}
        />
        </ErrorBoundary>
        );
    case "decks-overview":
    default:
      return (
        <ErrorBoundary feature='Collections Overview'>
          <section className="collections-layout">
            {decks.map((deck, index) => (
              <StoryDeckIcon key={index} deck={deck} updateActive={updateActive} />
            ))}
          </section>
        </ErrorBoundary>
      );
  }
};
