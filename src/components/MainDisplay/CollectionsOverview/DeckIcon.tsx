import React from 'react';
import { Deck } from 'src/types';
import "./DeckIcon.css";
import { useDeck } from 'src/context';

interface DeckIconProps {
  deck: Deck;
}

export const DeckIcon: React.FC<DeckIconProps> = ({ deck }) => {
  const { setActive } = useDeck();
  const summary = deck.description ? deck.description : "";
  return (
    <div className="collection-container" onClick={() => setActive("deck", deck._id)}>
      <div className={`collection-title ${deck.name.length > 22 ? 'medium' : 'large'}`}>
        {deck.name}
      </div>
      <div className="cassette-rack">
        <div className="rack-background"></div>
        {[0, 1, 2, 3, 4].map((i) => (
          <div className="tape-slot" key={i}>
            {i < deck.cards.length ? (
              <>
                <div className="tape-label">{deck.cards[i].name}</div>
                <div className="tape-case"></div>
              </>
            ) : (
              <div className="empty-slot">+</div>
            )}
          </div>
        ))}
      </div>
      <div className="collection-description">{summary}</div>
    </div>
  );
};
