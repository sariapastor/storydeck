import React, {createContext, PropsWithChildren, useContext, useReducer} from 'react';

import { ViewState } from '../types';

interface ViewStack {
  viewStack: ViewState[];
  position: number;
}

type NavigationAction =
  | { type: 'goBack' }
  | { type: 'goForward' }
  | { type: 'add'; payload: ViewState }
  | { type: 'initialize' };

interface Dispatches {
  goBack: () => void;
  goForward: () => void;
  pushView: (newView: ViewState) => void;
  initializeViewStack: () => void;
}

export type NavigationContextType = ViewStack & Dispatches;

const navigationReducer = (state: ViewStack, action: NavigationAction): ViewStack => {
  switch (action.type) {
    case 'goBack':
      if (state.position === 0) { return state; }
      return {
        ...state,
        position: state.position - 1
      };
    case 'goForward':
      if (state.position === state.viewStack.length - 1) { return state; }
      return {
        ...state,
        position: state.position + 1
      };
    case 'add':
      return {
        viewStack: [ ...state.viewStack.slice(0, state.position + 1), action.payload ],
        position: state.position + 1
      };
    case 'initialize':
      return {
        viewStack: [ { view: "collections-overview" } ],
        position: 0
      };
  }
};

const NavigationContext = createContext<NavigationContextType | null>(null);

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("NavigationContext requires a Provider");
  }
  return context;
};

export const NavigationContextProvider: React.FC<PropsWithChildren<ViewState>> = ({ children, ...initialView }) => {
  const [state, dispatch] = useReducer(navigationReducer, { viewStack: [initialView], position: 0 });
  const dispatches: Dispatches = {
    goBack: () => dispatch({ type: 'goBack' }),
    goForward: () => dispatch({ type: 'goForward' }),
    pushView: (newView: ViewState) => dispatch({ type: 'add', payload: newView }),
    initializeViewStack: () => dispatch({ type: 'initialize' })
  };
  return (
    <NavigationContext.Provider value={{ ...state, ...dispatches }}>
      {children}
    </NavigationContext.Provider>
  );
};