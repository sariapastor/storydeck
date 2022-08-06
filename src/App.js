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

  useEffect(() => {
    invoke("query_cards_and_decks", {})
      .then((response) => {
        const [cardsResponse, decksResponse] = JSON.parse(response);
        setCards(cardsResponse);
        const processedDecks = decksResponse.map((deck) => {
          const deckCards = cardsResponse.filter((card) =>
            card.decks.map((oid) => oid.$oid).includes(deck._id.$oid)
          );
          return { ...deck, cards: deckCards };
        });
        setDecks(processedDecks);
      })
      .catch((e) => console.log(e));
  }, [cards]);

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
