import React from 'react';

import { withErrorBoundary } from 'src/components/ErrorBounds';
import { ExpandedRelation } from "./ExpandedRelation/ExpandedRelation";
import { ExpandedCollection } from "./ExpandedCollection/ExpandedCollection";
import { ExpandedTranscript } from "./ExpandedTranscript";
import { CollectionsOverview } from './CollectionsOverview';
import { ViewState } from '../../types';
import "./MainDisplay.scss";

interface MainDisplayProps {
  currentView: ViewState;
}

// TODO: Implement this placeholder loading component
const LoadingAnimation: React.FC = () => { return <h2>Loading...</h2>; }

export const MainDisplay: React.FC<MainDisplayProps> = ({ currentView }) => {
  console.info("currentView: ", currentView);
  
  let DisplayComponent;
  switch (currentView.view) {
    case "loading":
      DisplayComponent = withErrorBoundary(LoadingAnimation);
      break;
    case "collection":
      DisplayComponent = withErrorBoundary(ExpandedCollection);
      break;
    case "recording":
      DisplayComponent = withErrorBoundary(ExpandedRelation);
      break;
    case "transcript":
      DisplayComponent = withErrorBoundary(ExpandedTranscript);
      break;
    case "collections-overview":
    default:
      DisplayComponent = withErrorBoundary(CollectionsOverview);
  }

  return (
    <main>
      <DisplayComponent />
    </main>
  );
};
