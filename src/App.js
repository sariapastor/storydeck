import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";
import { appWindow } from "@tauri-apps/api/window";
import Header from "./components/Header";
import MainDisplay from "./components/MainDisplay";
import AddNewResourceForm from "./components/AddNewResourceForm";
import "./App.css";

function App() {
  const [cards, setCards] = useState([]);
  const [decks, setDecks] = useState([]);
  const [updating, setUpdating] = useState([false, ""]);
  const [viewStack, setViewStack] = useState([
    { view: "loading", activeDeck: {}, activeCard: {} },
  ]);

  const hideForm = () => setUpdating([false, ""]);

  const addNewCard = ({ name, recordingFilePath }) => {
    hideForm();
    const filePath = recordingFilePath.length === 0 ? null : recordingFilePath;
    console.log("invoking db function");
    invoke("create_story_card", { name, filePath })
      .then((response) => {
        const newCard = JSON.parse(response);
        setCards([...cards, newCard]);
        const newView = {
          ...viewStack[-1],
          view: "single-card",
          activeCard: newCard,
        };
        setViewStack([...viewStack, newView]);
      })
      .then(() => reloadDecksAndCardsFromDB())
      .catch((e) => console.log(e));
  };

  const addNewDeck = ({ name }) => {
    hideForm();
    console.log("invoking db function");
    invoke("create_story_deck", { name })
      .then((response) => {
        const newDeck = JSON.parse(response);
        setDecks([...decks, newDeck]);
        const newView = {
          ...viewStack[-1],
          view: "single-deck",
          activeDeck: newDeck,
        };
        setViewStack([...viewStack, newView]);
      })
      .then(() => reloadDecksAndCardsFromDB())
      .catch((e) => console.log(e));
  };

  const reloadDecksAndCardsFromDB = async () => {
    try {
      const response = await invoke("query_cards_and_decks", {});
      const [cardsResponse, decksResponse] = JSON.parse(response);
      setCards(cardsResponse);
      const processedDecks = decksResponse.map((deck) => {
        const deckCards = cardsResponse.filter((card) =>
          card.decks.map((oid) => oid.$oid).includes(deck._id.$oid)
        );
        return { ...deck, cards: deckCards };
      });
      setDecks(processedDecks);
    } catch (e) {
      return console.log(e);
    }
  };

  const updateActive = (type, value) => {
    const newView = { ...viewStack[-1] };
    switch (type) {
      case "deck":
        newView.view = "single-deck";
        newView.activeDeck = value;
        break;
      case "card":
        newView.view = "single-card";
        newView.activeCard = value;
        break;
      default:
        console.log("executing default");
        break;
    }
    setViewStack([...viewStack, newView]);
  };

  useEffect(() => {
    reloadDecksAndCardsFromDB().then(() =>
      setViewStack([{ view: "decks-overview", activeDeck: {}, activeCard: {} }])
    );
  }, []);

  appWindow.listen("Add", ({ event, payload }) => {
    console.log(event, payload);
    setUpdating([true, payload]);
  });

  return (
    <>
      <Header
        title="Story Decks"
        setUpdating={setUpdating}
        viewStack={viewStack}
        setViewStack={setViewStack}
      />
      <main>
        <AddNewResourceForm
          addMethods={[addNewCard, addNewDeck]}
          hideForm={hideForm}
          updating={updating}
        />
        <MainDisplay
          currentView={viewStack[viewStack.length - 1]}
          setViewStack={setViewStack}
          decks={decks}
          cards={cards}
          updateActive={updateActive}
        />
        {/* <SearchResultsDisplay view={view} /> */}
      </main>
    </>
  );
}

export default App;
