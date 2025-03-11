import React from 'react';
import { BattleStatus } from '../../types/battle';
import { Pokemon } from '../../types/pokemon';

interface BattleStatusHeaderProps {
  turn: number;
  status: BattleStatus;
  playerPokemon: Pokemon;
  botPokemon: Pokemon;
  isBattleOver: boolean;
}

const BattleStatusHeader: React.FC<BattleStatusHeaderProps> = ({ 
  turn, 
  status, 
  playerPokemon, 
  botPokemon,
  isBattleOver 
}) => {
  // Battle status indicator text
  const getBattleStatusText = (): string => {
    switch (status) {
      case "ready":
        return "Battle is about to begin!";
      case "player-turn":
        return "Your turn - select a move!";
      case "bot-turn":
        return `${botPokemon.name} is thinking...`;
      case "player-won":
        return "You won the battle!";
      case "bot-won":
        return "You lost the battle!";
      case "draw":
        return "The battle ended in a draw!";
      default:
        return "";
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-3 mb-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-bold">Turn {turn}</span>
          {/* Speed Indicator */}
          <div className="text-xs text-gray-600 flex items-center gap-1">
            <span>Speed:</span>
            {playerPokemon.stats.speed > botPokemon.stats.speed ? (
              <span className="text-green-600 font-semibold">
                You're faster ({playerPokemon.stats.speed} vs{" "}
                {botPokemon.stats.speed})
              </span>
            ) : botPokemon.stats.speed > playerPokemon.stats.speed ? (
              <span className="text-red-600 font-semibold">
                Opponent is faster ({botPokemon.stats.speed} vs{" "}
                {playerPokemon.stats.speed})
              </span>
            ) : (
              <span className="text-yellow-600 font-semibold">
                Equal speed ({playerPokemon.stats.speed})
              </span>
            )}
          </div>
        </div>
        <div>
          <span
            className={`px-3 py-1 rounded-full text-white ${
              status === "player-turn"
                ? "bg-green-600"
                : status === "bot-turn"
                ? "bg-yellow-600"
                : isBattleOver
                ? "bg-red-600"
                : "bg-blue-600"
            }`}
          >
            {getBattleStatusText()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BattleStatusHeader;
