import React from 'react';

import { withErrorBoundary } from '../ErrorBounds';
import { StoryDeckIcon } from "./StoryDeck";
import { SingleCardDisplay } from "./SingleCardDisplay";
import { ExpandedStoryDeck } from "./ExpandedStoryDeck";
import { FullTranscriptView } from "./FullTranscriptView";
import { ViewState } from '../../types';
import { useDeck } from '../../context';
import "./MainDisplay.scss";

interface MainDisplayProps {
  currentView: ViewState;
}

const LoadingAnimation: React.FC = () => { return <h2>Loading...</h2>; } // Placeholder

const AllDecksView: React.FC = () => {
  const { decks } = useDeck();
  return (
    <section className="collections-layout">
      {decks.map((deck, index) => (
        <StoryDeckIcon key={index} deck={deck} />
      ))}
    </section>
  );
};

export const MainDisplay: React.FC<MainDisplayProps> = ({ currentView }) => {
  console.info("currentView: ", currentView);
  
  let DisplayComponent;
  switch (currentView.view) {
    case "loading":
      DisplayComponent = withErrorBoundary(LoadingAnimation);
      break;
    case "collection":
      DisplayComponent = withErrorBoundary(ExpandedStoryDeck);
      break;
    case "recording":
      DisplayComponent = withErrorBoundary(SingleCardDisplay);
      break;
    case "transcript":
      DisplayComponent = withErrorBoundary(FullTranscriptView);
      break;
    case "collections-overview":
    default:
      DisplayComponent = withErrorBoundary(AllDecksView);
  }

  return (
    <main>
      <DisplayComponent />
    </main>
  );
};
