import React, {createContext, PropsWithChildren, useContext, useEffect, useReducer} from 'react';
import { invoke } from '@tauri-apps/api';
import { ObjectIdExtended } from 'bson';
import { toast } from 'react-toastify';
import { DbRecord, Deck, FormType, Telling, Transcript, ViewState } from 'src/types';
import { useNavigation } from 'src/context';


interface ResourceState {
  collections: Deck[];
  relations: Telling[];
  transcript?: Transcript;
}

type FormModalState = FormType | 'closed';

type DeckState = ResourceState & { formState: FormModalState };

type ResourceAction = 
  | { type: 'loadRelations'; payload: [Telling[], Deck[]] }
  | { type: 'loadTranscript', payload: Transcript };

type FormAction = { type: 'setForm', payload: FormModalState };

type DeckAction = ResourceAction | FormAction;

export type DbCollection = 'deck' | 'telling' | 'transcript';

interface LocalUpdate {
  newRelation?: Telling;
  newCollection?: Deck;  
}

interface Dispatches {
  loadRelations: (update?: LocalUpdate) => Promise<void>;
  loadTranscript: (oid: ObjectIdExtended) => Promise<void>;
  updateResource: (resourceType: DbCollection, id: ObjectIdExtended, update: Partial<DbRecord>) => Promise<void>;
  setActive: (resourceType: DbCollection, id: ObjectIdExtended) => void;
  showForm: (formType: FormType) => void;
  hideForm: () => void;
}

export type DeckContextType = DeckState & Dispatches;


const DeckReducer = (state: DeckState, action: DeckAction): DeckState => {
  switch (action.type) {
    case 'loadTranscript':
      return {
        ...state,
        transcript: action.payload
      };
    case 'loadRelations':
      return {
        ...state,
        relations: action.payload[0],
        collections: action.payload[1]
      };
    case 'setForm':
      return {
        ...state,
        formState: action.payload
      }
  }
};


//--- Database query and update methods

const getRelations = async (): Promise<[Telling[], Deck[]]> => {
    let relations: Telling[] = [];
    let collections: Deck[] = [];
    try {
      const response = await invoke<string>("query_cards_and_decks", {});
      const [dbCards, dbDecks]: [Telling[], Omit<Deck, "cards">[]] = JSON.parse(response);
      const processedDecks = dbDecks.map((deck) => {
        const deckCards = dbCards.filter((card) =>
          card.decks.map((oid) => oid.$oid).includes(deck._id.$oid)
        );
        return { ...deck, cards: deckCards };
      });
      relations = dbCards;
      collections = processedDecks;
    } catch (e) {
      if (e instanceof SyntaxError) {
        console.error("Format of response was not valid:", e);
      }
      toast.error("Failed to update from database, try again.")
    }
    return [relations, collections];
};

const getTranscript = async (oid: ObjectIdExtended): Promise<Transcript> => {
  return JSON.parse(await invoke<string>("query_transcripts", { filter: { _id: oid} }))[0];
};

const updateRecord = async (recordType: "deck" | "telling" | "transcript", id: ObjectIdExtended, update: Partial<DbRecord>): Promise<boolean> => {
  console.log(recordType, update);
  try {
    await invoke("update_record", { recordType, id, update });
  } catch {
    return false;
  }
  return true;
};

//--------------------------------

const DeckContext = createContext<DeckContextType | null>(null);

export const useDeck = (): DeckContextType => {
  const context = useContext(DeckContext);
  if (!context) {
    throw new Error("DeckContext requires a Provider");
  }
  return context;
};

const initialDeckState = { relations: [], collections: [], formState: 'closed' as FormModalState };

export const DeckContextProvider: React.FC<PropsWithChildren> = ({ children,  }) => {
  const { pushView, initializeViewStack } = useNavigation();
  const [state, dispatch] = useReducer(DeckReducer, initialDeckState);

  const dispatches: Dispatches = {
    loadRelations: async (update?: LocalUpdate) => {
        if (update) {
            const relations = update.newRelation ? [ ...state.relations, update.newRelation ] : state.relations;
            const collections = update.newCollection ? [ ...state.collections, update.newCollection ] : state.collections; 
            dispatch({ type: 'loadRelations', payload: [relations, collections] });
        }
        dispatch({ type: 'loadRelations', payload: await getRelations() });
    },
    loadTranscript: async (oid: ObjectIdExtended) => dispatch({ type: 'loadTranscript', payload: await getTranscript(oid) }),
    updateResource: async (resourceType: DbCollection, id: ObjectIdExtended, update: Partial<DbRecord>) => {
        if (await updateRecord(resourceType, id, update)) {
            dispatch({ type: 'loadRelations', payload: await getRelations() })
        }
    },
    setActive: (resourceType: DbCollection, id: ObjectIdExtended) => {
        let newView: ViewState;
        switch (resourceType) {
            case 'deck':
              newView = { view: 'collection', activeResource: id};
              break;
            case 'telling':
                newView = { view: 'recording', activeResource: id};
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
    dispatches.loadRelations().then(() => initializeViewStack());
  }, []);

  return (
    <DeckContext.Provider value={{ ...state, ...dispatches }}>
      {children}
    </DeckContext.Provider>
  );
};