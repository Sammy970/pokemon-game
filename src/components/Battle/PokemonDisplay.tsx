import React from "react";
import { Pokemon, PokemonMove } from "../../types/pokemon";
import { getTypeColor } from "../../utils/typeColors";
import { getHealthBarColor } from "../../utils/battleUtils";

interface PokemonDisplayProps {
  pokemon: Pokemon;
  hp: number;
  maxHP: number;
  isPlayer: boolean;
  lastMove: PokemonMove | null;
  selectedMove: PokemonMove | null;
  lastAttackResult: {
    moveId: number;
    effectiveness: number;
    critical: boolean;
    damage: number;
    attacker: "player" | "bot";
  } | null;
  isAttackTarget: boolean;
  animating: boolean;
  showMoveSelection: boolean;
  movesPP: Record<number, number>;
  hasMovesWithPP: boolean;
  onMoveSelect?: (move: PokemonMove) => void;
}

const PokemonDisplay: React.FC<PokemonDisplayProps> = ({
  pokemon,
  hp,
  maxHP,
  isPlayer,
  lastAttackResult,
  isAttackTarget,
  animating,
  selectedMove,
}) => {
  // Calculate HP percentage for the health bar
  const hpPercent = Math.max((hp / maxHP) * 100, 0);

  // Determine if this pokemon was the attacker or defender in the last attack
  const wasAttacker =
    lastAttackResult &&
    ((isPlayer && lastAttackResult.attacker === "player") ||
      (!isPlayer && lastAttackResult.attacker === "bot"));

  return (
    <div className="bg-white bg-opacity-90 rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold capitalize">{pokemon.name}</h3>
        <div className="text-sm">Lv.50</div>
      </div>
      
      {/* Types */}
      <div className="flex flex-wrap gap-1 mb-3">
        {pokemon.types.map((type) => (
          <span
            key={type}
            className={`px-2 py-1 rounded-full text-xs capitalize ${getTypeColor(type)}`}
          >
            {type}
          </span>
        ))}
      </div>
      
      {/* HP Bar */}
      <div className="mb-1">HP: {hp}/{maxHP}</div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full ${getHealthBarColor(hpPercent)} transition-all duration-500`}
          style={{ width: `${hpPercent}%` }}
        ></div>
      </div>

      {/* Pokemon Sprite */}
      <div className="flex justify-center items-center">
        <img
          src={isPlayer ? pokemon.sprites.front : pokemon.sprites.front}
          alt={pokemon.name}
          className={`h-36 ${
            isAttackTarget && animating
              ? "animate-bounce"
              : wasAttacker && animating
              ? "animate-pulse"
              : ""
          }`}
        />
      </div>
      
      {/* Show Bot's Selected Move */}
      {!isPlayer && selectedMove && animating && (
        <div className="mt-2 border border-red-300 rounded p-2 bg-red-50 text-center">
          <div className="font-semibold">Using: {selectedMove.name}</div>
          <div className="flex justify-center items-center gap-2 mt-1">
            <span
              className={`text-xs px-2 py-1 rounded-full capitalize ${getTypeColor(
                selectedMove.type
              )}`}
            >
              {selectedMove.type}
            </span>
            <span className="text-xs">Power: {selectedMove.power || "—"}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PokemonDisplay;
