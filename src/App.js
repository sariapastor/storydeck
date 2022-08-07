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
  const [view, setView] = useState("loading");
  const [activeDeck, setActiveDeck] = useState({});
  const [activeCard, setActiveCard] = useState({});

  const hideForm = () => setUpdating([false, ""]);
  const addNewCard = ({ name, recordingFilePath }) => {
    hideForm();
    const filePath = recordingFilePath.length === 0 ? null : recordingFilePath;
    console.log("invoking db function");
    invoke("create_story_card", { name, filePath })
      .then((response) => {
        const newCard = JSON.parse(response);
        setCards([...cards, newCard]);
        setActiveCard(newCard);
        setView("single-card");
      })
      .catch((e) => console.log(e));
  };
  const addNewDeck = ({ name }) => {
    hideForm();
    console.log("invoking db function");
    invoke("create_story_deck", { name })
      .then((response) => {
        const newDeck = JSON.parse(response);
        setDecks([...decks, newDeck]);
        setActiveCard({});
        setActiveDeck(newDeck);
        setView("single-deck");
      })
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
    switch (type) {
      case "deck":
        setActiveDeck(value);
        setActiveCard({});
        setView("single-deck");
        break;
      case "card":
        setActiveCard(value);
        setActiveDeck({});
        setView("single-card");
        break;
      default:
        setActiveCard({});
        setActiveDeck({});
        console.log("executing default");
        setView("decks-overview");
        break;
    }
  };

  useEffect(() => {
    reloadDecksAndCardsFromDB().then(() => setView("decks-overview"));
  }, []);

  useEffect(() => {
    reloadDecksAndCardsFromDB();
  }, [cards, decks]);

  appWindow.listen("Add", ({ event, payload }) => {
    console.log(event, payload);
    setUpdating([true, payload]);
  });

  return (
    <>
      <Header title="Story Decks" setUpdating={setUpdating} />
      <main>
        <AddNewResourceForm
          addMethods={[addNewCard, addNewDeck]}
          hideForm={hideForm}
          updating={updating}
        />
        <MainDisplay
          view={view}
          setView={setView}
          decks={decks}
          cards={cards}
          activeDeck={activeDeck}
          activeCard={activeCard}
          updateActive={updateActive}
        />
        {/* <SearchResultsDisplay view={view} /> */}
      </main>
    </>
  );
}

export default App;
