import { useState, useRef, useCallback, useEffect } from "react";
import { Pokemon, PokemonMove } from "../types/pokemon";
import { BattleState } from "../types/battle";
import {
  calculateMaxHP,
  calculateDamage,
  selectBotMove,
} from "../utils/battleUtils";

interface AttackResult {
  moveId: number;
  effectiveness: number;
  critical: boolean;
  damage: number;
  attacker: "player" | "bot";
}

export interface BattleHookResult {
  battle: BattleState;
  playerSelectedMove: PokemonMove | null;
  botSelectedMove: PokemonMove | null;
  playerMovesPP: Record<number, number>;
  botMovesPP: Record<number, number>;
  lastPlayerMove: PokemonMove | null;
  lastBotMove: PokemonMove | null;
  lastAttackResult: AttackResult | null;
  playerHPPercent: number;
  botHPPercent: number;
  handleMoveSelect: (move: PokemonMove) => void;
  hasMovesWithPP: boolean;
  isBattleOver: boolean;
  currentMessage: string;
  firstAttacker: "player" | "bot" | null;
}

export const useBattle = (
  playerPokemon: Pokemon,
  botPokemon: Pokemon
): BattleHookResult => {
  const playerMaxHP = calculateMaxHP(playerPokemon.stats.hp);
  const botMaxHP = calculateMaxHP(botPokemon.stats.hp);

  // Determine which Pokémon is faster based on speed stat - this only affects the very first turn
  const playerIsFaster = playerPokemon.stats.speed > botPokemon.stats.speed;
  const equalSpeed = playerPokemon.stats.speed === botPokemon.stats.speed;
  
  // Track if this is the first turn of the battle
  const [isFirstTurn, setIsFirstTurn] = useState(true);
  
  // Set first attacker based on speed (with tie-breaker for equal speeds) - only for first turn
  const [firstAttacker, setFirstAttacker] = useState<"player" | "bot" | null>(
    equalSpeed ? (Math.random() < 0.5 ? "player" : "bot") : (playerIsFaster ? "player" : "bot")
  );

  // Current message to display
  const [currentMessage, setCurrentMessage] = useState<string>(
    `The battle begins! ${
      playerIsFaster ? "You are" : equalSpeed ? "Both Pokémon have equal speed. Randomly, " + 
      (firstAttacker === "player" ? "you are" : "the opponent is") : "The opponent is"
    } faster and will move first.`
  );

  // Initialize battle state
  const [battle, setBattle] = useState<BattleState>({
    turn: 1,
    status: "player-turn",
    playerHP: playerMaxHP,
    playerMaxHP,
    botHP: botMaxHP,
    botMaxHP,
    lastAction: undefined,
    battleLog: [], // Keep the array but we won't use it
    animating: false,
  });

  // Keep track of selected moves for both players in current turn
  const [playerSelectedMove, setPlayerSelectedMove] =
    useState<PokemonMove | null>(null);
  const [botSelectedMove, setBotSelectedMove] = useState<PokemonMove | null>(
    null
  );

  // Keep track of PP remaining for each move
  const [playerMovesPP, setPlayerMovesPP] = useState<Record<number, number>>(
    playerPokemon.moves.reduce(
      (acc, move) => ({
        ...acc,
        [move.id]: move.pp,
      }),
      {}
    )
  );

  // Also track bot's PP (even though UI doesn't show it)
  const [botMovesPP, setBotMovesPP] = useState<Record<number, number>>(
    botPokemon.moves.reduce(
      (acc, move) => ({
        ...acc,
        [move.id]: move.pp,
      }),
      {}
    )
  );

  // Track the last move used by each side (for UI effects)
  const [lastPlayerMove, setLastPlayerMove] = useState<PokemonMove | null>(
    null
  );
  const [lastBotMove, setLastBotMove] = useState<PokemonMove | null>(null);

  // Track attack results for visual feedback
  const [lastAttackResult, setLastAttackResult] = useState<AttackResult | null>(
    null
  );

  // Track current battle state for use in callbacks
  const battleRef = useRef(battle);
  useEffect(() => {
    battleRef.current = battle;
  }, [battle]);

  // Calculate HP percentages for the health bars
  const playerHPPercent = Math.max(
    (battle.playerHP / battle.playerMaxHP) * 100,
    0
  );
  const botHPPercent = Math.max((battle.botHP / battle.botMaxHP) * 100, 0);

  // Execute an attack by either the player or bot
  const executeAttack = useCallback(
    (attacker: "player" | "bot", move: PokemonMove, onComplete: () => void) => {
      const attackingPokemon =
        attacker === "player" ? playerPokemon : botPokemon;
      const defendingPokemon =
        attacker === "player" ? botPokemon : playerPokemon;

      // Show attacking message
      setCurrentMessage(`${attackingPokemon.name} uses ${move.name}!`);

      // Calculate damage
      const { damage, typeEffectiveness, critical } = calculateDamage(
        move,
        attackingPokemon,
        defendingPokemon
      );

      // Store attack result for visual feedback
      setLastAttackResult({
        moveId: move.id,
        effectiveness: typeEffectiveness,
        critical,
        damage,
        attacker,
      });

      // Update the last move used
      if (attacker === "player") {
        setLastPlayerMove(move);
      } else {
        setLastBotMove(move);
      }

      // Delay for animation
      setTimeout(() => {
        // Update HP
        setBattle((prev) => {
          let newState = { ...prev };

          if (attacker === "player") {
            const newBotHP = Math.max(prev.botHP - damage, 0);
            newState = {
              ...newState,
              botHP: newBotHP,
              lastAction:
                damage > 0
                  ? `${playerPokemon.name} dealt ${damage} damage!`
                  : `${playerPokemon.name}'s move had no effect!`,
            };

            // Check if bot fainted
            if (newBotHP <= 0) {
              setCurrentMessage(
                `${botPokemon.name} fainted! You won the battle!`
              );
              newState.status = "player-won";
            } else {
              // Provide feedback based on effectiveness
              if (typeEffectiveness === 0) {
                setCurrentMessage("It has no effect...");
              } else if (typeEffectiveness < 1) {
                setCurrentMessage("It's not very effective...");
              } else if (typeEffectiveness > 1) {
                setCurrentMessage("It's super effective!");
              } else if (critical) {
                setCurrentMessage("A critical hit!");
              } else if (damage > 0) {
                setCurrentMessage(
                  `${attackingPokemon.name} dealt ${damage} damage!`
                );
              }
            }
          } else {
            const newPlayerHP = Math.max(prev.playerHP - damage, 0);
            newState = {
              ...newState,
              playerHP: newPlayerHP,
              lastAction:
                damage > 0
                  ? `${botPokemon.name} dealt ${damage} damage!`
                  : `${botPokemon.name}'s move had no effect!`,
            };

            // Check if player fainted
            if (newPlayerHP <= 0) {
              setCurrentMessage(
                `${playerPokemon.name} fainted! You lost the battle!`
              );
              newState.status = "bot-won";
            } else {
              // Provide feedback based on effectiveness
              if (typeEffectiveness === 0) {
                setCurrentMessage("It has no effect...");
              } else if (typeEffectiveness < 1) {
                setCurrentMessage("It's not very effective...");
              } else if (typeEffectiveness > 1) {
                setCurrentMessage("It's super effective!");
              } else if (critical) {
                setCurrentMessage("A critical hit!");
              } else if (damage > 0) {
                setCurrentMessage(
                  `${attackingPokemon.name} dealt ${damage} damage!`
                );
              }
            }
          }

          return newState;
        });

        // Continue to the next step after a short delay
        setTimeout(() => {
          setLastAttackResult(null);
          onComplete();
        }, 1200);
      }, 1000);
    },
    [playerPokemon, botPokemon]
  );

  // Handle player's turn
  const handlePlayerTurn = useCallback(
    (move: PokemonMove) => {
      setBattle((prev) => ({ ...prev, animating: true }));
      
      // Determine who goes first ONLY for the first turn
      // After the first turn, always follow player -> bot order
      const playerFirst = !isFirstTurn || firstAttacker === "player";
      
      // Bot selects a move
      const botMove = selectBotMove(botPokemon, playerPokemon, botMovesPP);
      
      // Deduct PP for bot's move
      if (botMove.id !== -1) {
        setBotMovesPP((prev) => ({
          ...prev,
          [botMove.id]: Math.max(0, (prev[botMove.id] || 0) - 1),
        }));
      }
      
      setBotSelectedMove(botMove);
      
      if (playerFirst) {
        // Player goes first
        const speedMessage = isFirstTurn && firstAttacker === "player" 
          ? "You're faster! " 
          : "";
          
        setCurrentMessage(`${speedMessage}${playerPokemon.name} uses ${move.name}!`);
        
        // Execute player's attack
        executeAttack("player", move, () => {
          // Check if battle is over after player's attack
          if (battleRef.current.botHP <= 0) {
            setBattle((prev) => ({ ...prev, animating: false }));
            return;
          }
          
          // Bot's turn
          setCurrentMessage(`${botPokemon.name} uses ${botMove.name}!`);
          
          // Execute bot's attack
          setTimeout(() => {
            executeAttack("bot", botMove, () => {
              // End turn and prepare for next one
              endTurn();
            });
          }, 1000);
        });
      } else {
        // Bot goes first (only happens in the first turn if bot is faster)
        setCurrentMessage(`${botPokemon.name} is faster! It uses ${botMove.name}!`);
        
        // Execute bot's attack
        executeAttack("bot", botMove, () => {
          // Check if battle is over after bot's attack
          if (battleRef.current.playerHP <= 0) {
            setBattle((prev) => ({ ...prev, animating: false }));
            return;
          }
          
          // Player's turn
          setCurrentMessage(`${playerPokemon.name} uses ${move.name}!`);
          
          // Execute player's attack
          setTimeout(() => {
            executeAttack("player", move, () => {
              // End turn and prepare for next one
              endTurn();
            });
          }, 1000);
        });
      }
      
      // After processing the first turn, set isFirstTurn to false
      if (isFirstTurn) {
        setIsFirstTurn(false);
      }
    },
    [botPokemon, executeAttack, playerPokemon, botMovesPP, isFirstTurn, firstAttacker]
  );
  
  // Helper function to end the turn and prepare for the next one
  const endTurn = useCallback(() => {
    // Check if battle is over
    if (battleRef.current.playerHP <= 0 || battleRef.current.botHP <= 0) {
      setBattle((prev) => ({ ...prev, animating: false }));
      return;
    }
    
    // Prepare for next turn - after first turn, player always goes first
    const nextTurn = battleRef.current.turn + 1;
    setCurrentMessage(`Turn ${nextTurn}. Choose your move!`);
    
    // Always set player as first attacker after the first turn
    if (isFirstTurn) {
      setFirstAttacker("player");
    }
    
    setBattle((prev) => ({
      ...prev,
      turn: nextTurn,
      status: "player-turn",
      animating: false,
    }));
    
    // Reset selected moves
    setPlayerSelectedMove(null);
    setBotSelectedMove(null);
  }, [isFirstTurn]);

  // When player selects a move
  const handleMoveSelect = useCallback(
    (move: PokemonMove) => {
      if (battle.status !== "player-turn" || battle.animating) return;

      // Deduct PP for the selected move
      setPlayerMovesPP((prev) => ({
        ...prev,
        [move.id]: Math.max(0, (prev[move.id] || 0) - 1),
      }));

      // Set player's selected move
      setPlayerSelectedMove(move);
      setCurrentMessage(`You chose ${move.name}!`);

      // Set status to indicate player has made a choice
      setBattle((prev) => ({ ...prev, status: "bot-turn" }));

      // Start player's turn
      setTimeout(() => {
        handlePlayerTurn(move);
      }, 1000);
    },
    [battle.status, battle.animating, handlePlayerTurn]
  );

  // Check if any player move has PP left
  const hasMovesWithPP = playerPokemon.moves.some(
    (move) => (playerMovesPP[move.id] || 0) > 0
  );

  // Check if the battle is over
  const isBattleOver = ["player-won", "bot-won", "draw"].includes(
    battle.status
  );

  // If no moves have PP left and it's player's turn, use Struggle
  useEffect(() => {
    if (
      battle.status === "player-turn" &&
      !hasMovesWithPP &&
      !battle.animating &&
      !isBattleOver
    ) {
      // Use struggle
      const struggleMove: PokemonMove = {
        id: -1,
        name: "Struggle",
        type: "normal",
        power: 40,
        accuracy: 100,
        pp: 1,
        category: "physical",
      };

      setTimeout(() => {
        setCurrentMessage(`${playerPokemon.name} has no moves left!`);
        handleMoveSelect(struggleMove);
      }, 1000);
    }
  }, [
    battle.status,
    hasMovesWithPP,
    battle.animating,
    playerPokemon.name,
    handleMoveSelect,
    isBattleOver,
  ]);

  return {
    battle,
    playerSelectedMove,
    botSelectedMove,
    playerMovesPP,
    botMovesPP,
    lastPlayerMove,
    lastBotMove,
    lastAttackResult,
    playerHPPercent,
    botHPPercent,
    handleMoveSelect,
    hasMovesWithPP,
    isBattleOver,
    currentMessage,
    firstAttacker,
  };
};
