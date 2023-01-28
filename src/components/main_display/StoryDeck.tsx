import React from 'react';
import { StoryDeck } from '../../types';
import { ObjectIdExtended } from 'bson';
import "./StoryDeck.css";

interface StoryDeckIconProps {
  deck: StoryDeck;
  updateActive: (type: "deck" | "card" | "transcript", oid: ObjectIdExtended) => void;
}

export const StoryDeckIcon: React.FC<StoryDeckIconProps> = ({ deck, updateActive }) => {
  const summary = deck.description ? deck.description : "";
  const setToActive = () => updateActive("deck", deck._id);
  return (
    <div className="collection-container" onClick={setToActive}>
      <div className="collection-title">
        <h3>{deck.name}</h3>
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