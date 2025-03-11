import { Pokemon, PokemonMove } from "../types/pokemon";

const API_BASE_URL = "https://pokeapi.co/api/v2";

// Convert PokéAPI data format to our Pokemon interface
const formatPokemonData = async (pokemon: any): Promise<Pokemon> => {
  // Fetch additional details for moves
  const movePromises = pokemon.moves.slice(0, 4).map(async (moveData: any) => {
    const response = await fetch(moveData.move.url);
    const moveDetails = await response.json();

    return {
      id: moveDetails.id,
      name: moveDetails.name.replace("-", " "),
      type: moveDetails.type.name,
      power: moveDetails.power || 0,
      accuracy: moveDetails.accuracy || 100,
      pp: moveDetails.pp || 10,
      category: moveDetails.damage_class?.name || "physical",
    } as PokemonMove;
  });

  const moves = await Promise.all(movePromises);

  return {
    id: pokemon.id,
    name: pokemon.name,
    types: pokemon.types.map((type: any) => type.type.name),
    stats: {
      hp: pokemon.stats.find((stat: any) => stat.stat.name === "hp").base_stat,
      attack: pokemon.stats.find((stat: any) => stat.stat.name === "attack")
        .base_stat,
      defense: pokemon.stats.find((stat: any) => stat.stat.name === "defense")
        .base_stat,
      specialAttack: pokemon.stats.find(
        (stat: any) => stat.stat.name === "special-attack"
      ).base_stat,
      specialDefense: pokemon.stats.find(
        (stat: any) => stat.stat.name === "special-defense"
      ).base_stat,
      speed: pokemon.stats.find((stat: any) => stat.stat.name === "speed")
        .base_stat,
    },
    moves: moves.slice(0, 4), // Limit to 4 moves like in the real games
    sprites: {
      front: pokemon.sprites.front_default,
      back: pokemon.sprites.back_default,
    },
  };
};

export const fetchPokemonList = async (limit = 10): Promise<Pokemon[]> => {
  try {
    // Get a list of pokemon (limited to prevent too many requests)
    const response = await fetch(`${API_BASE_URL}/pokemon?limit=${limit}`);
    const data = await response.json();

    // Fetch detailed data for each pokemon
    const pokemonDetailsPromises = data.results.map(async (pokemon: any) => {
      const detailResponse = await fetch(pokemon.url);
      const pokemonData = await detailResponse.json();
      return formatPokemonData(pokemonData);
    });

    return await Promise.all(pokemonDetailsPromises);
  } catch (error) {
    console.error("Error fetching pokemon list:", error);
    return [];
  }
};

export const getRandomPokemon = async (): Promise<Pokemon> => {
  // Generate a random ID between 1 and 151 (Gen 1 Pokémon)
  const randomId = Math.floor(Math.random() * 151) + 1;
  try {
    const response = await fetch(`${API_BASE_URL}/pokemon/${randomId}`);
    const pokemonData = await response.json();
    return await formatPokemonData(pokemonData);
  } catch (error) {
    console.error("Error fetching random pokemon:", error);
    throw error;
  }
};

export const searchPokemon = async (
  searchTerm: string
): Promise<Pokemon | null> => {
  try {
    // Convert search term to lowercase as the API requires it
    const term = searchTerm.toLowerCase().trim();

    // If no search term, return null
    if (!term) return null;

    const response = await fetch(`${API_BASE_URL}/pokemon/${term}`);

    // If Pokémon not found, return null
    if (response.status === 404) {
      return null;
    }

    const pokemonData = await response.json();
    return await formatPokemonData(pokemonData);
  } catch (error) {
    console.error("Error searching for pokemon:", error);
    return null;
  }
};
