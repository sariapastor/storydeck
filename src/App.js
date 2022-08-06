import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";
import Header from "./components/Header";
import DecksDisplay from "./components/DecksDisplay";
import AddNewCardForm from "./components/AddNewForm";
import "./App.css";

function App() {
  const [cards, setCards] = useState([]);
  const [decks, setDecks] = useState([{ message: "Loading.." }]);
  const [updating, setUpdating] = useState({ cards: false, decks: false });

  const hideForm = () => setUpdating({ cards: false, decks: false });
  const addNewCard = ({ name, recordingFilePath }) => {
    hideForm();
    const filePath = recordingFilePath.length === 0 ? null : recordingFilePath;
    console.log("invoking db function");
    invoke("create_story_card", { name, filePath })
      .then((response) => {
        setCards([...cards, JSON.parse(response)]);
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
        <div className="titlebar-spacer"></div>
        <section className="content">
          <AddNewCardForm
            addNewCard={addNewCard}
            hideForm={hideForm}
            updatingCards={updating.cards}
          />
          <DecksDisplay decks={decks} />
        </section>
      </main>
    </>
  );
}

export default App;
