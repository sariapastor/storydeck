import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";
import { appWindow } from "@tauri-apps/api/window";
import Header from "./components/Header";
import MainDisplay from "./components/MainDisplay";
import AddNewForm from "./components/AddNewForm";
import "./App.css";

function App() {
  const [cards, setCards] = useState([]);
  const [decks, setDecks] = useState([]);
  const [updating, setUpdating] = useState([false, ""]);
  const [viewStack, setViewStack] = useState([
    { view: "loading", activeDeck: {}, activeCard: {}, activeTranscript: {} },
  ]);

  const hideForm = () => setUpdating([false, ""]);

  const addNewCard = ({ name, recordingFilePath }) => {
    hideForm();
    const filePath = recordingFilePath.length === 0 ? null : recordingFilePath;
    console.log("invoking create_story_card");
    invoke("create_story_card", { name, filePath })
      .then((response) => {
        const newCard = JSON.parse(response);
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
            .catch((e) => console.log(e));
        }
      })
      .then(() => reloadDecksAndCardsFromDB())
      .catch((e) => console.log(e));
  };

  const addNewDeck = ({ name }) => {
    hideForm();
    console.log("invoking create_story_deck");
    invoke("create_story_deck", { name })
      .then((response) => {
        const newDeck = JSON.parse(response);
        newDeck.cards = [];
        setDecks([...decks, newDeck]);
        updateActive("deck", newDeck._id);
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

  const updateActive = (type, oid) => {
    const newView = { ...viewStack[viewStack.length - 1] };
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
        console.log("executing default");
        break;
    }
    setViewStack([...viewStack, newView]);
  };

  useEffect(() => {
    reloadDecksAndCardsFromDB().then(() =>
      setViewStack([
        {
          view: "decks-overview",
          activeDeck: {},
          activeCard: {},
          activeTranscript: {},
        },
      ])
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
        <AddNewForm
          addMethods={[addNewCard, addNewDeck]}
          hideForm={hideForm}
          updating={updating}
        />
        <MainDisplay
          currentView={viewStack[viewStack.length - 1]}
          // setViewStack={setViewStack}
          decks={decks}
          cards={cards}
          updateActive={updateActive}
        />
      </main>
    </>
  );
}

export default App;
