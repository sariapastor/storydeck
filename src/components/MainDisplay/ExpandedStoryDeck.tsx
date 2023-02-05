import React, { SyntheticEvent } from 'react';
import { useForm } from 'react-hook-form';
import { StoryCard } from "./StoryCard";
import { useDeck, useNavigation } from '../../context';
import "./ExpandedStoryDeck.scss";

export const ExpandedStoryDeck: React.FC = () => {
  const { decks, setActive, updateResource } = useDeck();
  const { viewStack, position } = useNavigation();
  const deck = decks.find(d => d._id.$oid === viewStack[position].activeDeck?.$oid)!
  const { register } = useForm<{deckName: string; deckDescription?: string; deckNotes?: string;}>({ defaultValues: {deckName: deck.name, deckDescription: deck.description, deckNotes: deck.notes}});

  const cardComponents = deck.cards.map((card, index) => (
    <StoryCard key={index} card={card} updateActive={setActive} />
  ));

  const updateDeck = (e: SyntheticEvent) => { 
    const attribute = (e.target as HTMLInputElement).id as "name" | "description" | "notes";
    const change: {[key: string]: string | undefined} = {};
    change[attribute] = (e.target as HTMLInputElement).value;
    if (change[attribute] !== deck[attribute]) { updateResource("deck", deck._id, change); }
  };

  return (
    <div className="deck-expansion">
      <section className="expanded-deck-summary">
        <input
          id="name"
          className="h2"
          {...register("deckName", { onBlur: updateDeck })}
        />
        <input
          id="description"
          className="p"
          {...register("deckDescription", { onBlur: updateDeck })}
          placeholder="Add description"
        />
      </section>
      <div className="deck-cards-layout">{cardComponents}</div>
    </div>
  );
};

