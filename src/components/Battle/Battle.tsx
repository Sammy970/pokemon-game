import React from "react";
import { Pokemon } from "../../types/pokemon";
import { useBattle } from "../../hooks/useBattle";
import PokemonDisplay from "./PokemonDisplay";
import MoveSelection from "./MoveSelection";

interface BattleProps {
  playerPokemon: Pokemon;
  botPokemon: Pokemon;
  onReturnToSelection: () => void;
}

const Battle: React.FC<BattleProps> = ({
  playerPokemon,
  botPokemon,
  onReturnToSelection,
}) => {
  // Use the battle hook to manage all battle state and logic
  const {
    battle,
    playerSelectedMove,
    botSelectedMove,
    lastPlayerMove,
    lastBotMove,
    lastAttackResult,
    playerMovesPP,
    botMovesPP,
    handleMoveSelect,
    hasMovesWithPP,
    isBattleOver,
    currentMessage,
  } = useBattle(playerPokemon, botPokemon);

  return (
    <div
      className="flex flex-col justify-between h-screen overflow-scroll"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Action Button - Always visible in top right */}
      <div className="absolute top-2 right-2 z-10">
        <button
          className="bg-blue-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-700 text-sm sm:text-base shadow-md"
          onClick={onReturnToSelection}
          disabled={battle.animating && !isBattleOver}
        >
          {isBattleOver ? "New Battle" : "Forfeit"}
        </button>
      </div>

      {/* Battle Content - Main layout */}
      <div className="flex-1 flex flex-col p-2 sm:p-4 max-w-6xl mx-auto w-full">
        {/* Top section - Pokémon displays */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Player's Pokémon - Left side */}
          <div className="order-2 sm:order-1">
            <PokemonDisplay
              pokemon={playerPokemon}
              hp={battle.playerHP}
              maxHP={battle.playerMaxHP}
              isPlayer={true}
              lastMove={lastPlayerMove}
              selectedMove={playerSelectedMove}
              lastAttackResult={lastAttackResult}
              isAttackTarget={lastAttackResult?.attacker === "bot"}
              animating={battle.animating}
              showMoveSelection={false}
              movesPP={playerMovesPP}
              hasMovesWithPP={hasMovesWithPP}
            />
          </div>

          {/* Bot's Pokémon - Right side */}
          <div className="order-1 sm:order-2">
            <PokemonDisplay
              pokemon={botPokemon}
              hp={battle.botHP}
              maxHP={battle.botMaxHP}
              isPlayer={false}
              lastMove={lastBotMove}
              selectedMove={botSelectedMove}
              lastAttackResult={lastAttackResult}
              isAttackTarget={lastAttackResult?.attacker === "player"}
              animating={battle.animating}
              showMoveSelection={false}
              movesPP={botMovesPP}
              hasMovesWithPP={true}
            />
          </div>
        </div>

        {/* Middle area - Current Message */}
        <div className="bg-white p-2 sm:p-3 rounded-lg shadow-md opacity-90 text-center mb-4">
          <div className="text-base sm:text-lg font-medium">
            {currentMessage}
          </div>
        </div>

        {/* Bottom area - Move Selection */}
        <div className="mt-auto">
          {battle.status === "player-turn" &&
            !isBattleOver &&
            hasMovesWithPP && (
              <div className="bg-white bg-opacity-90 p-2 rounded-lg shadow-md">
                <MoveSelection
                  moves={playerPokemon.moves}
                  movesPP={playerMovesPP}
                  onSelectMove={handleMoveSelect}
                  disabled={battle.animating}
                />
              </div>
            )}

          {/* No moves left message */}
          {battle.status === "player-turn" &&
            !isBattleOver &&
            !hasMovesWithPP && (
              <div className="p-2 bg-red-100 text-red-700 rounded text-center">
                No PP left for any moves. Will use Struggle automatically...
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Battle;
