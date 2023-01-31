import React from 'react';
import { ViewState } from '../../types';

interface BackButtonProps {
  viewStack: ViewState[];
  setViewStack: React.Dispatch<React.SetStateAction<ViewState[]>>;
}

export const BackButton: React.FC<BackButtonProps> = ({ viewStack, setViewStack }) => {
  const goBack = () => {
    viewStack.pop();
    setViewStack([...viewStack]);
  };
  return (
    <button
      className={`${viewStack.length === 1 ? "hidden" : ""}`}
      onClick={goBack}
    >
      ⬅
    </button>
  );
};
