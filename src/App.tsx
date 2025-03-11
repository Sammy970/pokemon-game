import { useState } from "react";
import "./App.css";
import PokemonSelection from "./components/PokemonSelection/PokemonSelection";
import Battle from "./components/Battle/Battle";
import { Pokemon } from "./types/pokemon";
import { getRandomPokemon } from "./services/pokemonService";

function App() {
  const [playerPokemon, setPlayerPokemon] = useState<Pokemon | null>(null);
  const [botPokemon, setBotPokemon] = useState<Pokemon | null>(null);
  const [gameState, setGameState] = useState<
    "selection" | "battle" | "loading"
  >("selection");

  const handlePokemonSelect = async (pokemon: Pokemon) => {
    setPlayerPokemon(pokemon);
    setGameState("loading");

    try {
      // Bot randomly selects a Pokemon
      const randomPokemon = await getRandomPokemon();
      setBotPokemon(randomPokemon);
      setGameState("battle");
    } catch (error) {
      console.error("Error setting up battle:", error);
      setGameState("selection");
      alert("Failed to start battle. Please try again.");
    }
  };

  const handleReturnToSelection = () => {
    setGameState("selection");
    // Reset the Pokemon selections (optional - can be kept to allow quick rematch with same Pokemon)
    // setPlayerPokemon(null);
    // setBotPokemon(null);
  };

  return (
    <div className="flex flex-col min-h-screen w-full overflow-hidden">
      {gameState !== "battle" && (
        <header className="bg-red-600 text-white p-4">
          <h1 className="text-3xl font-bold text-center">Pokémon Battle Game</h1>
        </header>
      )}

      <main className={`flex-1 ${gameState === "battle" ? "" : "container mx-auto p-4"}`}>
        {gameState === "selection" ? (
          <PokemonSelection onSelectPokemon={handlePokemonSelect} />
        ) : gameState === "loading" ? (
          <div className="text-center py-20">
            <div className="text-2xl font-bold">Setting up battle...</div>
            <div className="mt-4 text-gray-600">
              Your opponent is choosing their Pokémon
            </div>
          </div>
        ) : (
          playerPokemon &&
          botPokemon && (
            <Battle
              playerPokemon={playerPokemon}
              botPokemon={botPokemon}
              onReturnToSelection={handleReturnToSelection}
            />
          )
        )}
      </main>
    </div>
  );
}

export default App;
