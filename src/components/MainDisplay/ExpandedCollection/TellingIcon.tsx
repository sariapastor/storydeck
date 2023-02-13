import React from 'react';
import { ObjectIdExtended } from 'bson';
import { DbCollection } from 'src/context';
import { Telling } from 'src/types';
import "src/components/MainDisplay/ExpandedCollection/TellingIcon.css";


interface TellingIconProps {
  card: Telling;
  updateActive: (type: DbCollection, oid: ObjectIdExtended) => void;
}

export const TellingIcon: React.FC<TellingIconProps> = ({ card, updateActive }) => {
  const summary = card.description ? card.description : "SOme text";
  const setToActive = () => updateActive("telling", card._id);
  const unflip = (e: any) => e.target.childNodes[0].classList.add("resetting"); //eslint-disable-line @typescript-eslint/no-explicit-any
  const resetDone: React.AnimationEventHandler<HTMLDivElement> = (e) => {
    if (e.animationName === "reversetapeflip") {
      (e.target as HTMLDivElement).classList.remove("resetting");
    }
  };

  return (
    <div className="cassette-container" onMouseLeave={unflip}>
      <div
        className="vertical-tape-case"
        onClick={setToActive}
        onAnimationEnd={resetDone}
      >
        <div className="face front"></div>
        <div className="face cassette"></div>
        <div className="face cassette obverse"></div>
        <div className="face label-spine">{card.name}</div>
        <div className="face back">
          <div className="label-desc">{summary}</div>
        </div>
        <div className="face open-spine"></div>
        <div className="face top"></div>
        <div className="face bottom"></div>
      </div>
    </div>
  );
};
