import React, { useEffect, useState } from "react";

import { invoke } from "@tauri-apps/api";
import { appWindow } from "@tauri-apps/api/window";
import { ObjectIdExtended } from 'bson';

import { Header } from "./components/Header";
import { MainDisplay } from "./components/MainDisplay";
import { AddNewResourceForm } from "./components/AddNewResourceForm";
import "./App.css";
import { DBRecord, NewRecordingInfo, StoryDeck, Telling, ViewState } from "./types";
import { NavigationContextProvider, useNavigation } from "./context/navcontext";

function App(): JSX.Element {
  const [cards, setCards] = useState<Telling[]>([]);
  const [decks, setDecks] = useState<StoryDeck[]>([]);
  const [updating, setUpdating] = useState<[boolean, string]>([false, ""]);

  const { viewStack, position, add } = useNavigation();

  const addNewCard = ({ name, recordingFilePath }: NewRecordingInfo) => {
    hideForm();
    const filePath = recordingFilePath.length === 0 ? null : recordingFilePath;
    console.log("invoking create_story_card");
    invoke<string>("create_story_card", { name, filePath })
      .then((response) => {
        const newCard: Telling = JSON.parse(response);
        setCards([...cards, newCard]);
        updateActive("card", newCard._id);
        if (filePath) {
          console.log(
            `invoking create_transcript with filePath: ${filePath} and cardId: ${newCard._id}`
          );
          invoke("create_transcript", {
            filePath,
            cardId: newCard._id,
          })
            .then(() => reloadDecksAndCardsFromDB())
            .catch(console.log);
        }
      })
      .then(() => reloadDecksAndCardsFromDB())
      .catch(console.log);
  };

  const addNewDeck = ( name: string ) => {
    hideForm();
    console.log("invoking create_story_deck");
    invoke<string>("create_story_deck", { name })
      .then((response) => {
        const newDeck = JSON.parse(response);
        newDeck.cards = [];
        setDecks([...decks, newDeck]);
        updateActive("deck", newDeck._id);
      })
      .then(() => reloadDecksAndCardsFromDB())
      .catch(console.log);
  };

  const reloadDecksAndCardsFromDB = async () => {
    try {
      const response = await invoke<string>("query_cards_and_decks", {});
      const [cardsResponse, decksResponse]: [Telling[], StoryDeck[]] = JSON.parse(response);
      setCards(cardsResponse);
      const processedDecks = decksResponse.map((deck) => {
        const deckCards = cardsResponse.filter((card) =>
          card.decks.map((oid) => oid.$oid).includes(deck._id.$oid)
        );
        return { ...deck, cards: deckCards };
      });
      setDecks(processedDecks);
    } catch (e) {
      console.log(e);
    }
  };

  const updateActive = (type: "deck" | "card" | "transcript", oid: ObjectIdExtended): void => {
    const newView: ViewState = { ...viewStack[viewStack.length - 1] };
    switch (type) {
      case "deck":
        newView.view = "single-deck";
        newView.activeDeck = oid;
        break;
      case "card":
        newView.view = "single-card";
        newView.activeCard = oid;
        break;
      case "transcript":
        newView.view = "full-transcript";
        newView.activeTranscript = oid;
        break;
      default:
        console.log("executing default for unmatched input type: ", type);
        break;
    }
    setViewStack([...viewStack, newView]);
  };

  const updateRecord = (type: "card" | "deck" | "transcript", record: DBRecord, change: Partial<DBRecord>, isCommit: boolean) => {
    console.log(type, change, isCommit);
    let updatedCards, updatedDecks;
    switch (type) {
      case "card":
        updatedCards = cards.map((card) =>
          card._id.$oid === record._id.$oid ? record as Telling : card
        );
        setCards(updatedCards);
        break;
      case "deck":
        updatedDecks = decks.map((deck) =>
          deck._id.$oid === record._id.$oid ? record as StoryDeck : deck
        );
        setDecks(updatedDecks);
        break;
      case "transcript":
        // do nothing here but transcript state should be updated at subcomponent
        break;
      default:
        console.log("executing default for unmatched input type: ", type);
        break;
    }
    if (isCommit) {
      invoke("update_record", {
        recordType: type,
        id: record._id,
        update: change,
      })
        .then(() => reloadDecksAndCardsFromDB())
        .catch(console.log);
    }
  };

  const newDeckFromCard = (card: Telling) => {
    invoke<string>("create_story_deck", { name: "untitled collection" })
      .then((response) => {
        const newDeck: StoryDeck = JSON.parse(response);
        newDeck.cards = [card];
        setDecks([...decks, newDeck]);
        const updatedCard = { ...card };
        updatedCard.decks.push(newDeck._id);
        updateRecord("card", updatedCard, { decks: updatedCard.decks }, true);
        updateActive("deck", newDeck._id);
      })
      .then(() => reloadDecksAndCardsFromDB())
      .catch(console.log);
  };

  useEffect(() => {
    reloadDecksAndCardsFromDB().then(() => setViewStack([ { view: "decks-overview" } ]));
  }, []);

  appWindow.listen<string>("Add", ({ event, payload }) => {
    console.log(event, payload);
    setUpdating([true, payload]);
  });

  return (
    <NavigationContextProvider view='loading'>
      <Header
        title="Story Deck"
        setUpdating={setUpdating}
      />
      <main>
        <AddNewResourceForm
          addMethods={[addNewCard, addNewDeck]}
          hideForm={() => setUpdating([false, ""])}
          updating={updating}
        />
        <MainDisplay
          currentView={viewStack[position]}
          decks={decks}
          cards={cards}
          updateRecord={updateRecord}
          updateActive={updateActive}
          newDeckFromCard={newDeckFromCard}
        />
      </main>
    </NavigationContextProvider>
  );
}

export default App;
