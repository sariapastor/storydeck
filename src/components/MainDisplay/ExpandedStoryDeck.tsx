import React from 'react';
import { StoryCard } from "./StoryCard";
import { useDeck, useNavigation } from '../../context';
import "./ExpandedStoryDeck.css";

export const ExpandedStoryDeck: React.FC = () => {
  const { decks, setActive, updateResource } = useDeck();
  const { viewStack, position } = useNavigation();

  const deck = decks.find(d => d._id.$oid === viewStack[position].activeDeck?.$oid)!
  const cardComponents = deck.cards.map((card, index) => (
    <StoryCard key={index} card={card} updateActive={setActive} />
  ));

  const summary = deck.description ? deck.description : "Add description";

  const updateDeck = (e: any) => { //eslint-disable-line @typescript-eslint/no-explicit-any
    const attribute = (e.target as HTMLElement).className;
    const updatedDeck = { ...deck };
    updatedDeck[attribute as "name" | "description" | "notes"] = e.target.textContent;
    const isCommit = e.type === "blur";
    const change: {[key: string]: string | undefined} = {};
    change[attribute] = updatedDeck[attribute as "name" | "description" | "notes"];
    if (isCommit) { updateResource("deck", updatedDeck._id, change); }
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

