import React from 'react';
import { useNavigation } from '../../context/navcontext';


export const Navigation: React.FC = () => {
  const { viewStack, position, goBack, goForward } = useNavigation();

  return (
    <nav>
      <button
        className={position === 0 ? "disabled" : ""}
        onClick={goBack}
        disabled={position === 0}
      >
        ⬅
      </button>
      <button
        className={position === viewStack.length - 1 ? "disabled" : ""}
        onClick={goForward}
        disabled={position === viewStack.length - 1}
      >
        ➡
      </button>
    </nav>
  );
};
