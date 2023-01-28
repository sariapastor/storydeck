import React from 'react';

interface BackButtonProps {
  viewStack: any[];
  setViewStack: React.Dispatch<React.SetStateAction<any[]>>;
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
