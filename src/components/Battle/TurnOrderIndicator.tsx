import React from "react";
import { Pokemon } from "../../types/pokemon";

interface TurnOrderIndicatorProps {
  playerPokemon: Pokemon;
  botPokemon: Pokemon;
  firstAttacker: "player" | "bot" | null;
}

const TurnOrderIndicator: React.FC<TurnOrderIndicatorProps> = ({
  playerPokemon,
  botPokemon,
  firstAttacker,
}) => {
  // Determine which Pokémon is faster based on speed stat
  const playerIsFaster = playerPokemon.stats.speed > botPokemon.stats.speed;
  const equalSpeed = playerPokemon.stats.speed === botPokemon.stats.speed;
  
  // Show a message about first turn vs subsequent turns
  const isFirstTurn = playerPokemon.stats.speed !== botPokemon.stats.speed && firstAttacker !== "player";

  return (
    <div className="flex flex-col items-center justify-center gap-2 my-4 bg-white p-3 rounded-lg shadow-md">
      <div className="flex items-center gap-2">
        <div className="text-sm">Turn Order:</div>

        {/* Show who goes first based on speed or turn order */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center ${
              firstAttacker === "player" ? "order-1" : "order-2"
            }`}
          >
            <span 
              className={`font-semibold ${firstAttacker === "player" ? "text-green-600" : ""} capitalize`}
            >
              {playerPokemon.name}
            </span>
            <span className="mx-1 text-xs bg-blue-100 px-2 py-0.5 rounded-full">
              {playerPokemon.stats.speed}
            </span>
          </div>

          <div className="mx-2">→</div>

          <div
            className={`flex items-center ${
              firstAttacker === "bot" ? "order-1" : "order-2"
            }`}
          >
            <span 
              className={`font-semibold ${firstAttacker === "bot" ? "text-green-600" : ""} capitalize`}
            >
              {botPokemon.name}
            </span>
            <span className="mx-1 text-xs bg-red-100 px-2 py-0.5 rounded-full">
              {botPokemon.stats.speed}
            </span>
          </div>
        </div>
      </div>
      
      {/* Add explanatory text */}
      <div className="text-xs text-gray-600 mt-1 text-center">
        {isFirstTurn ? (
          <>Faster Pokémon moves first in the first turn. After that, you'll always go first.</>
        ) : (
          <>You move first in each turn. {playerIsFaster ? "Your Pokémon is faster." : equalSpeed ? "Both Pokémon have equal speed." : "Opponent's Pokémon is faster."}</>
        )}
      </div>
    </div>
  );
};

export default TurnOrderIndicator;
