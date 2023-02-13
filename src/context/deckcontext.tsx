import React, {createContext, PropsWithChildren, useContext, useEffect, useReducer} from 'react';
import { ObjectIdExtended } from 'bson';
import { invoke } from '@tauri-apps/api';

import { DbRecord, Deck, Telling, Transcript, ViewState } from 'src/types';
import { useNavigation } from 'src/context';

interface ResourceState {
  decks: Deck[];
  cards: Telling[];
  transcript?: Transcript;
}

type FormModalState = "recording" | "plan" | "collection" | "closed";

export type FormType = Exclude<FormModalState, "closed">;

type AppState = ResourceState & { formState: FormModalState };

type ResourceAction = { type: 'loadCardsAndDecks'; payload: [Telling[], Deck[]] }
  | { type: 'loadTranscript', payload: Transcript };

type FormAction = { type: 'setForm', payload: FormModalState };

type AppAction = ResourceAction | FormAction;

type DbCollection = 'card' | 'deck' | 'transcript';

interface LocalUpdate {
  newCard?: Telling;
  newDeck?: Deck;  
}

interface Dispatches {
  loadCardsAndDecks: (update?: LocalUpdate) => Promise<void>;
  loadTranscript: (oid: ObjectIdExtended) => Promise<void>;
  updateResource: (resourceType: DbCollection, id: ObjectIdExtended, update: Partial<DbRecord>) => Promise<void>;
  setActive: (resourceType: DbCollection, id: ObjectIdExtended) => void;
  showForm: (formType: FormType) => void;
  hideForm: () => void;
}

export type DeckContextType = AppState & Dispatches;

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

const getCardsAndDecks = async (): Promise<[Telling[], Deck[]]> => {
    let cards: Telling[] = [];
    let decks: Deck[] = [];
    try {
      const response = await invoke<string>("query_cards_and_decks", {});
      const [dbCards, dbDecks]: [Telling[], Omit<Deck, "cards">[]] = JSON.parse(response);
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

const initialAppState = { cards: [], decks: [], formState: 'closed' as FormModalState };

export const DeckContextProvider: React.FC<PropsWithChildren> = ({ children,  }) => {
  const { pushView, initializeViewStack } = useNavigation();
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
                newView = { view: 'recording', activeResource: id};
                break;
            case 'deck':
                newView = { view: 'collection', activeResource: id};
                break;
            case 'transcript':
                newView = { view: 'transcript', activeResource: id};
                break;
        }
        pushView(newView);
    },
    showForm: (formType: FormType) => dispatch({ type: 'setForm', payload: formType }),
    hideForm: () => dispatch({ type: 'setForm', payload: 'closed'})
  };

  useEffect(() => {
    dispatches.loadCardsAndDecks().then(() => initializeViewStack());
  }, []);

  return (
    <DeckContext.Provider value={{ ...state, ...dispatches }}>
      {children}
    </DeckContext.Provider>
  );
};