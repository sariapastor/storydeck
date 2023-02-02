import React, {createContext, PropsWithChildren, useContext, useEffect, useReducer} from 'react';
import { ObjectIdExtended } from 'bson';

import { DbRecord, StoryDeck, Telling, Transcript, ViewState } from '../types';
import { invoke } from '@tauri-apps/api';
import { useNavigation } from './navcontext';

interface ResourceState {
  decks: StoryDeck[];
  cards: Telling[];
  transcript?: Transcript;
}

type FormState = "recording" | "plan" | "collection" | "closed";

export type FormType = Exclude<FormState, "closed">;

type AppState = ResourceState & { formState: FormState };

type ResourceAction = { type: 'loadCardsAndDecks'; payload: [Telling[], StoryDeck[]] }
  | { type: 'loadTranscript', payload: Transcript };

type FormAction = { type: 'setForm', payload: FormState };

type AppAction = ResourceAction | FormAction;

type DbCollection = 'card' | 'deck' | 'transcript';

interface LocalUpdate {
  newCard?: Telling;
  newDeck?: StoryDeck;  
}

interface Dispatches {
  loadCardsAndDecks: (update?: LocalUpdate) => Promise<void>;
  loadTranscript: (oid: ObjectIdExtended) => Promise<void>;
  updateResource: (resourceType: DbCollection, id: ObjectIdExtended, update: Partial<DbRecord>) => Promise<void>;
  setActive: (resourceType: DbCollection, id: ObjectIdExtended) => void;
  showForm: (formType: FormType) => void;
  hideForm: () => void;
}

export type DeckContextType = Omit<AppState, 'viewState'> & Dispatches;

const DeckReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'loadTranscript':
      return {
        ...state,
        transcript: action.payload
      };
    case 'loadCardsAndDecks':
      return {
        ...state,
        cards: action.payload[0],
        decks: action.payload[1]
      };
    case 'setForm':
      return {
        ...state,
        formState: action.payload
      }
  }
};

// Database query/update methods

const getCardsAndDecks = async (): Promise<[Telling[], StoryDeck[]]> => {
    let cards: Telling[] = [];
    let decks: StoryDeck[] = [];
    try {
      const response = await invoke<string>("query_cards_and_decks", {});
      const [dbCards, dbDecks]: [Telling[], StoryDeck[]] = JSON.parse(response);
      const processedDecks = dbDecks.map((deck) => {
        const deckCards = dbCards.filter((card) =>
          card.decks.map((oid) => oid.$oid).includes(deck._id.$oid)
        );
        return { ...deck, cards: deckCards };
      });
      cards = dbCards;
      decks = processedDecks;
    } catch (e) {
      console.log(e);
    }
    return [cards, decks];
};

const getTranscript = async (oid: ObjectIdExtended): Promise<Transcript> => {
  return JSON.parse(await invoke<string>("query_transcripts", { filter: { _id: oid} }))[0];
};

const updateRecord = async (recordType: "card" | "deck" | "transcript", id: ObjectIdExtended, update: Partial<DbRecord>): Promise<boolean> => {
  console.log(recordType, update);
  try {
    await invoke("update_record", { recordType, id, update });
  } catch {
    return false;
  }
  return true;
};

const DeckContext = createContext<DeckContextType | null>(null);

export const useDeck = (): DeckContextType => {
  const context = useContext(DeckContext);
  if (!context) {
    throw new Error("DeckContext requires a Provider");
  }
  return context;
};

const initialAppState = { cards: [], decks: [], formState: 'closed' as FormState };

export const DeckContextProvider: React.FC<PropsWithChildren> = ({ children,  }) => {
  const { viewStack, position, addView, initializeViewStack } = useNavigation();
  const [state, dispatch] = useReducer(DeckReducer, initialAppState);

  const dispatches: Dispatches = {
    loadCardsAndDecks: async (update?: LocalUpdate) => {
        if (update) {
            const cards = update.newCard ? [ ...state.cards, update.newCard ] : state.cards;
            const decks = update.newDeck ? [ ...state.decks, update.newDeck ] : state.decks; 
            dispatch({ type: 'loadCardsAndDecks', payload: [cards, decks] });
        }
        dispatch({ type: 'loadCardsAndDecks', payload: await getCardsAndDecks() });
    },
    loadTranscript: async (oid: ObjectIdExtended) => dispatch({ type: 'loadTranscript', payload: await getTranscript(oid) }),
    updateResource: async (resourceType: DbCollection, id: ObjectIdExtended, update: Partial<DbRecord>) => {
        if (await updateRecord(resourceType, id, update)) {
            dispatch({ type: 'loadCardsAndDecks', payload: await getCardsAndDecks() })
        }
    },
    setActive: (resourceType: DbCollection, id: ObjectIdExtended) => {
        let newView: ViewState;
        switch (resourceType) {
            case 'card':
                newView = {...viewStack[position], view: 'single-card', activeCard: id};
                break;
            case 'deck':
                newView = {...viewStack[position], view: 'single-deck', activeDeck: id};
                break;
            case 'transcript':
                newView = {...viewStack[position], view: 'full-transcript', activeTranscript: id};
                break;
        }
        addView(newView);
    },
    showForm: (formType: FormType) => dispatch({ type: 'setForm', payload: formType }),
    hideForm: () => dispatch({ type: 'setForm', payload: 'closed'})
  };

  useEffect(() => {
    dispatches.loadCardsAndDecks().then(() => initializeViewStack());
  }, []);

  return (
    <DeckContext.Provider value={{ cards: state.cards, decks: state.decks, transcript: state.transcript, formState: state.formState, ...dispatches }}>
      {children}
    </DeckContext.Provider>
  );
};