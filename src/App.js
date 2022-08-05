import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";
import Header from "./components/Header";
import DecksDisplay from "./components/DecksDisplay";
import "./App.css";

function App() {
  const [cards, setCards] = useState([]);
  const [decks, setDecks] = useState([{ message: "Loading.." }]);

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
  }, []);

  return (
    <>
      <Header title="Story Decks" setCards={setCards} setDecks={setDecks} />
      <main>
        <DecksDisplay decks={decks} />
      </main>
    </>
  );
}

export default App;
