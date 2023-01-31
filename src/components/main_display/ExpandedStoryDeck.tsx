import React from 'react';

import { StoryCard } from "./StoryCard";
import "./ExpandedStoryDeck.css";
import { ObjectIdExtended } from 'bson';
import { DBRecord, StoryDeck } from '../../types';

interface StoryDeckProps {
  deck: StoryDeck;
  updateActive: (type: "deck" | "card" | "transcript", oid: ObjectIdExtended) => void;
  updateRecord: (type: "card" | "deck" | "transcript", record: DBRecord, change: Partial<DBRecord>, isCommit: boolean) => void;
}

export const ExpandedStoryDeck: React.FC<StoryDeckProps> = ({ deck, updateActive, updateRecord }) => {
  const cardComponents = deck.cards.map((card, index) => (
    <StoryCard key={index} card={card} updateActive={updateActive} />
  ));

  const summary = deck.description ? deck.description : "Add description";

  const updateDeck = (e: any) => { //eslint-disable-line @typescript-eslint/no-explicit-any
    const attribute = (e.target as HTMLElement).className;
    const updatedDeck = { ...deck };
    updatedDeck[attribute as "name" | "description" | "notes"] = e.target.textContent;
    const isCommit = e.type === "blur";
    const change: {[key: string]: string | undefined} = {};
    change[attribute] = updatedDeck[attribute as "name" | "description" | "notes"];
    updateRecord("deck", updatedDeck, change, isCommit);
  };

  return (
    <div className="deck-expansion">
      <section className="expanded-deck-summary">
        <h2
          className="name"
          contentEditable={true}
          onChange={updateDeck}
          onBlur={updateDeck}
        >
          {deck.name}
        </h2>
        <p
          className="description"
          contentEditable={true}
          onChange={updateDeck}
          onBlur={updateDeck}
        >
          {summary}
        </p>
      </section>
      <div className="deck-cards-layout">{cardComponents}</div>
    </div>
  );
};

