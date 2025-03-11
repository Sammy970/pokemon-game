import { Pokemon, PokemonMove } from "../types/pokemon";

// Calculate max HP based on the pokemon's base HP stat
export const calculateMaxHP = (baseHP: number): number => {
  // Simple formula to give a reasonable HP value
  return Math.floor(baseHP * 2);
};

// Calculate type effectiveness
export const calculateTypeEffectiveness = (
  moveType: string,
  defenderTypes: string[]
): number => {
  // This is a simplified type chart. In a full implementation, you'd include all type matchups
  const typeChart: Record<
    string,
    { strengths: string[]; weaknesses: string[] }
  > = {
    normal: { strengths: [], weaknesses: ["rock", "steel"] },
    fire: {
      strengths: ["grass", "ice", "bug", "steel"],
      weaknesses: ["fire", "water", "rock", "dragon"],
    },
    water: {
      strengths: ["fire", "ground", "rock"],
      weaknesses: ["water", "grass", "dragon"],
    },
    electric: {
      strengths: ["water", "flying"],
      weaknesses: ["electric", "grass", "dragon", "ground"],
    },
    grass: {
      strengths: ["water", "ground", "rock"],
      weaknesses: [
        "fire",
        "grass",
        "poison",
        "flying",
        "bug",
        "dragon",
        "steel",
      ],
    },
    ice: {
      strengths: ["grass", "ground", "flying", "dragon"],
      weaknesses: ["fire", "water", "ice", "steel"],
    },
    fighting: {
      strengths: ["normal", "ice", "rock", "dark", "steel"],
      weaknesses: ["poison", "flying", "psychic", "bug", "fairy"],
    },
    poison: {
      strengths: ["grass", "fairy"],
      weaknesses: ["poison", "ground", "rock", "ghost", "steel"],
    },
    ground: {
      strengths: ["fire", "electric", "poison", "rock", "steel"],
      weaknesses: ["grass", "bug", "flying"],
    },
    flying: {
      strengths: ["grass", "fighting", "bug"],
      weaknesses: ["electric", "rock", "steel"],
    },
    psychic: {
      strengths: ["fighting", "poison"],
      weaknesses: ["psychic", "steel", "dark"],
    },
    bug: {
      strengths: ["grass", "psychic", "dark"],
      weaknesses: [
        "fire",
        "fighting",
        "poison",
        "flying",
        "ghost",
        "steel",
        "fairy",
      ],
    },
    rock: {
      strengths: ["fire", "ice", "flying", "bug"],
      weaknesses: ["fighting", "ground", "steel"],
    },
    ghost: { strengths: ["psychic", "ghost"], weaknesses: ["dark", "normal"] },
    dragon: { strengths: ["dragon"], weaknesses: ["steel", "fairy"] },
    dark: {
      strengths: ["psychic", "ghost"],
      weaknesses: ["fighting", "dark", "fairy"],
    },
    steel: {
      strengths: ["ice", "rock", "fairy"],
      weaknesses: ["fire", "water", "electric", "steel"],
    },
    fairy: {
      strengths: ["fighting", "dragon", "dark"],
      weaknesses: ["fire", "poison", "steel"],
    },
  };

  let effectiveness = 1.0;

  // Some types might not be in our simplified chart
  if (!typeChart[moveType]) return 1.0;

  defenderTypes.forEach((defenderType) => {
    // Check if move type is super effective against defender type
    if (typeChart[moveType]?.strengths.includes(defenderType)) {
      effectiveness *= 2.0;
    }

    // Check if move type is not very effective against defender type
    if (typeChart[moveType]?.weaknesses.includes(defenderType)) {
      effectiveness *= 0.5;
    }

    // Check for immunity (ground is immune to electric)
    if (moveType === "electric" && defenderType === "ground") {
      effectiveness = 0;
    }

    // Ghost is immune to normal
    if (moveType === "normal" && defenderType === "ghost") {
      effectiveness = 0;
    }
  });

  return effectiveness;
};

// Calculate if the move gets STAB (Same Type Attack Bonus)
export const calculateSTAB = (moveType: string, attackerTypes: string[]): number => {
  return attackerTypes.includes(moveType) ? 1.5 : 1.0;
};

// Calculate critical hit (1/16 chance in Gen 1-3)
export const calculateCritical = (): { isCritical: boolean; multiplier: number } => {
  const criticalChance = Math.random() < 1 / 16;
  return {
    isCritical: criticalChance,
    multiplier: criticalChance ? 1.5 : 1.0,
  };
};

// Calculate damage based on move and stats
export const calculateDamage = (
  move: PokemonMove,
  attacker: Pokemon,
  defender: Pokemon
): {
  damage: number;
  typeEffectiveness: number;
  critical: boolean;
} => {
  // If move has no power (status move), return 0 damage
  if (!move.power) {
    return { damage: 0, typeEffectiveness: 1.0, critical: false };
  }

  // Determine which attack/defense stats to use based on move category
  const attackStat =
    move.category === "physical"
      ? attacker.stats.attack
      : attacker.stats.specialAttack;

  const defenseStat =
    move.category === "physical"
      ? defender.stats.defense
      : defender.stats.specialDefense;

  // Calculate base damage
  let baseDamage = Math.floor(
    ((2 * 50 + 10) / 250) * (attackStat / defenseStat) * move.power + 2
  );

  // Apply STAB (Same Type Attack Bonus)
  const stabMultiplier = calculateSTAB(move.type, attacker.types);
  baseDamage = Math.floor(baseDamage * stabMultiplier);

  // Calculate type effectiveness
  const typeEffectiveness = calculateTypeEffectiveness(
    move.type,
    defender.types
  );
  baseDamage = Math.floor(baseDamage * typeEffectiveness);

  // Calculate critical hit
  const { isCritical, multiplier: criticalMultiplier } = calculateCritical();
  baseDamage = Math.floor(baseDamage * criticalMultiplier);

  // Add randomness (85-100% of calculated damage)
  const finalDamage = Math.max(
    Math.floor(baseDamage * (0.85 + Math.random() * 0.15)),
    typeEffectiveness > 0 ? 1 : 0
  );

  return {
    damage: finalDamage,
    typeEffectiveness,
    critical: isCritical,
  };
};

// Function to determine which pokemon goes first based on speed
export const determineFirstAttacker = (
  playerPokemon: Pokemon,
  botPokemon: Pokemon,
  playerMove: PokemonMove,
  botMove: PokemonMove
): "player" | "bot" => {
  // Priority moves always go first (not implemented in this version)

  // Compare speed stats
  if (playerPokemon.stats.speed > botPokemon.stats.speed) {
    return "player";
  } else if (botPokemon.stats.speed > playerPokemon.stats.speed) {
    return "bot";
  } else {
    // Speed tie: 50/50 chance
    return Math.random() < 0.5 ? "player" : "bot";
  }
};

// Function to select a move for the bot with improved AI
export const selectBotMove = (
  botPokemon: Pokemon, 
  playerPokemon: Pokemon,
  botMovesPP: Record<number, number>
): PokemonMove => {
  // Get moves that still have PP
  const availableMoves = botPokemon.moves.filter(
    (move) => (botMovesPP[move.id] || 0) > 0 && move.power > 0
  );

  // If no moves with PP left, use "Struggle" (basic attack)
  if (availableMoves.length === 0) {
    return {
      id: -1,
      name: "Struggle",
      type: "normal",
      power: 40,
      accuracy: 100,
      pp: 1,
      category: "physical",
    };
  }

  // Advanced AI - Calculate potential damage for each move and select best
  const moveScores = availableMoves.map((move) => {
    // Calculate type effectiveness
    const typeEffectiveness = calculateTypeEffectiveness(
      move.type,
      playerPokemon.types
    );

    // Calculate STAB bonus
    const stabBonus = calculateSTAB(move.type, botPokemon.types);

    // Calculate expected damage (simplified)
    const expectedDamage = move.power * typeEffectiveness * stabBonus;

    // Calculate a score with some randomness to avoid being too predictable
    const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2

    return {
      move,
      score: expectedDamage * randomFactor,
    };
  });

  // Sort by score and choose the best move (80% of the time) or random (20% of the time)
  moveScores.sort((a, b) => b.score - a.score);

  // Add randomness to bot's decision making
  if (Math.random() < 0.2) {
    // 20% chance to choose a random move
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
  } else {
    // 80% chance to choose the best move
    return moveScores[0].move;
  }
};

// Helper function to get health bar color based on remaining HP percentage
export const getHealthBarColor = (hpPercent: number): string => {
  if (hpPercent > 50) return "bg-green-500";
  if (hpPercent > 20) return "bg-yellow-500";
  return "bg-red-500";
};

// Visual helper function for type effectiveness
export const getEffectivenessText = (effectiveness: number | undefined): string => {
  if (!effectiveness) return "";
  if (effectiveness === 0) return "No Effect";
  if (effectiveness < 1) return "Not Very Effective";
  if (effectiveness > 1) return "Super Effective";
  return "Normal";
};

// Visual helper function for type effectiveness color
export const getEffectivenessColor = (effectiveness: number | undefined): string => {
  if (!effectiveness) return "";
  if (effectiveness === 0) return "text-gray-500";
  if (effectiveness < 1) return "text-red-500";
  if (effectiveness > 1) return "text-green-500";
  return "";
};
