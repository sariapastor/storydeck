import React from 'react';
import { useDeck } from 'src/context';
import { DeckIcon } from './DeckIcon';


export const CollectionsOverview: React.FC = () => {
    const { collections } = useDeck();
    return (
        <section className="collections-layout">
          {collections.map((deck, index) => (
              <DeckIcon key={index} deck={deck} />
          ))}
        </section>
    );
};