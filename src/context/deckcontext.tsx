import React, { createContext, PropsWithChildren, useContext, useEffect, useReducer } from 'react';
import { invoke } from '@tauri-apps/api';
import { ObjectIdExtended } from 'bson';
import { toast } from 'react-toastify';

import { DbRecord, Deck, FormType, Telling, Transcript, ViewState } from 'src/types';
import { useNavigation } from 'src/context';


//--- State, Action, Dispatch types

interface ResourceState {
  collections: Deck[];
  relations: Telling[];
  transcript?: Transcript;
}

type FormModalState = FormType | 'closed';

type DeckState = ResourceState & { formState: FormModalState };

type DeckAction =
  | { type: 'loadRelations'; payload: [Telling[], Deck[]] }
  | { type: 'loadTranscript', payload: Transcript }
  | { type: 'setForm', payload: FormModalState };

export type DbCollection = 'deck' | 'telling' | 'transcript';

interface LocalUpdate {
  newRelation?: Telling;
  newCollection?: Deck;
}

interface Dispatches {
  loadRelations: (update?: LocalUpdate) => Promise<void>;
  loadTranscript: (oid: ObjectIdExtended) => Promise<void>;
  updateResource: (resourceType: DbCollection, id: ObjectIdExtended, update: Partial<DbRecord>) => Promise<void>;
  deleteResource: (resourceType: DbCollection, id: ObjectIdExtended) => Promise<void>;
  setActive: (resourceType: DbCollection, id: ObjectIdExtended) => void;
  showForm: (formType: FormType) => void;
  hideForm: () => void;
}

export type DeckContextType = DeckState & Dispatches;


//--- State reducer and database methods

const deckReducer = (state: DeckState, action: DeckAction): DeckState => {
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

const getRelations = async (): Promise<[Telling[], Deck[]] | undefined> => {
  try {
    const response = await invoke<string>("query_cards_and_decks", {});
    const [relations, dbCollections]: [Telling[], Omit<Deck, "cards">[]] = JSON.parse(response);
    const collections = dbCollections.map((deck) => {
      const deckCards = relations.filter((card) =>
        card.decks.map((oid) => oid.$oid).includes(deck._id.$oid)
      );
      return { ...deck, cards: deckCards };
    });
    return [relations, collections];
  } catch (e) {
    if (e instanceof SyntaxError) {
      console.error("Format of response was not valid:", e);
    }
    toast.error("Failed to fetch records from database, please retry.");
  }
};

const getTranscript = async (oid: ObjectIdExtended): Promise<Transcript | undefined> => {
  try {
    return JSON.parse(await invoke<string>("query_transcripts", { filter: { _id: oid } }))[0];
  } catch (e) {
    if (e instanceof SyntaxError) {
      console.error("Format of response was not valid:", e);
    }
    toast.error("Failed to fetch record from database, please retry.");
  }
};

const updateRecord = async (recordType: "deck" | "telling" | "transcript", id: ObjectIdExtended, update: Partial<DbRecord>): Promise<boolean> => {
  console.info(`Updating ${recordType} record with new values:`, update);
  try {
    return await invoke<boolean>("update_record", { recordType, id, update });
  } catch (e) {
    toast.error(`Failed to update record with error: ${e}`)
    return false;
  }
};

const deleteRecord = async (recordType: "deck" | "telling" | "transcript", id: ObjectIdExtended): Promise<boolean> => {
  console.info(`Deleting ${recordType} record with id: ${id.$oid}`);
  try {
    return await invoke<boolean>("delete_record", { recordType, id });
  } catch (e) {
    toast.error(`Failed to delete record with error: ${e}`)
    return false;
  }
};


//--- Exported context hook and provider

const DeckContext = createContext<DeckContextType | null>(null);

export const useDeck = (): DeckContextType => {
  const context = useContext(DeckContext);
  if (!context) {
    throw new Error("DeckContext requires a Provider");
  }
  return context;
};

const initialDeckState = { relations: [], collections: [], formState: 'closed' as FormModalState };

export const DeckContextProvider: React.FC<PropsWithChildren> = ({ children, }) => {
  const { pushView, initializeViewStack } = useNavigation();
  const [state, dispatch] = useReducer(deckReducer, initialDeckState);

  const dispatches: Dispatches = {
    loadRelations: async (update?: LocalUpdate) => {
      if (update) {
        const relations = update.newRelation ? [...state.relations, update.newRelation] : state.relations;
        const collections = update.newCollection ? [...state.collections, update.newCollection] : state.collections;
        dispatch({ type: 'loadRelations', payload: [relations, collections] });
      }
      const dbResult = await getRelations();
      if (dbResult) { dispatch({ type: 'loadRelations', payload: dbResult }); }
    },
    loadTranscript: async (oid: ObjectIdExtended) => {
      const dbResult = await getTranscript(oid);
      if (dbResult) { dispatch({ type: 'loadTranscript', payload: dbResult }) }
    },
    updateResource: async (resourceType: DbCollection, id: ObjectIdExtended, update: Partial<DbRecord>) => {
      if (await updateRecord(resourceType, id, update)) {
        const dbRefresh = await getRelations();
        if (dbRefresh) { dispatch({ type: 'loadRelations', payload: dbRefresh }) }
      }
    },
    deleteResource: async (resourceType: DbCollection, id: ObjectIdExtended) => {
      if (await deleteRecord(resourceType, id)) {
        const dbRefresh = await getRelations();
        if (dbRefresh) { dispatch({ type: 'loadRelations', payload: dbRefresh }) }
      }
    },
    setActive: (resourceType: DbCollection, id: ObjectIdExtended) => {
      let newView: ViewState;
      switch (resourceType) {
        case 'deck':
          newView = { view: 'collection', activeResource: id };
          break;
        case 'telling':
          newView = { view: 'recording', activeResource: id };
          break;
        case 'transcript':
          newView = { view: 'transcript', activeResource: id };
          break;
      }
      pushView(newView);
    },
    showForm: (formType: FormType) => dispatch({ type: 'setForm', payload: formType }),
    hideForm: () => dispatch({ type: 'setForm', payload: 'closed' })
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