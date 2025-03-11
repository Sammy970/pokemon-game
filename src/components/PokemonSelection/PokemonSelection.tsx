import { useEffect, useState } from "react";
import { Pokemon } from "../../types/pokemon";
import { fetchPokemonList } from "../../services/pokemonService";
import { getTypeColor } from "../../utils/typeColors";
import PokemonSearch from "../PokemonSearch/PokemonSearch";

interface PokemonSelectionProps {
  onSelectPokemon: (pokemon: Pokemon) => void;
}

const PokemonSelection = ({ onSelectPokemon }: PokemonSelectionProps) => {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(10); // Start with 10 Pokémon

  useEffect(() => {
    const loadPokemon = async () => {
      try {
        setLoading(true);
        setError(null);
        const pokemon = await fetchPokemonList(limit);
        setPokemonList(pokemon);
      } catch (error) {
        console.error("Failed to load Pokemon:", error);
        setError("Failed to load Pokémon. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadPokemon();
  }, [limit]);

  const loadMorePokemon = () => {
    setLimit((prevLimit) => prevLimit + 10);
  };

  if (loading && pokemonList.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="text-2xl font-bold">Loading Pokémon...</div>
        <div className="mt-4 text-gray-600">Fetching data from PokéAPI</div>
      </div>
    );
  }

  if (error && pokemonList.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="text-2xl font-bold text-red-500">Error</div>
        <div className="mt-4">{error}</div>
        <button
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => setLimit(10)}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Choose Your Pokémon
      </h2>

      {/* Add the search component */}
      <PokemonSearch onSelect={onSelectPokemon} />

      <h3 className="text-xl font-bold mb-4">Browse Pokémon</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {pokemonList.map((pokemon) => (
          <div
            key={pokemon.id}
            className="border rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => onSelectPokemon(pokemon)}
          >
            <div className="flex justify-center">
              <img
                src={pokemon.sprites.front}
                alt={pokemon.name}
                className="w-32 h-32"
              />
            </div>
            <h3 className="text-xl capitalize text-center font-semibold">
              {pokemon.name}
            </h3>
            <div className="flex justify-center gap-2 mt-2">
              {pokemon.types.map((type) => (
                <span
                  key={type}
                  className={`px-2 py-1 rounded-full text-sm capitalize ${getTypeColor(
                    type
                  )}`}
                >
                  {type}
                </span>
              ))}
            </div>
            <div className="mt-2 text-center text-sm text-gray-600">
              <span className="font-bold">HP:</span> {pokemon.stats.hp} |{" "}
              <span className="font-bold"> ATK:</span> {pokemon.stats.attack} |{" "}
              <span className="font-bold"> DEF:</span> {pokemon.stats.defense}
            </div>
          </div>
        ))}
      </div>

      {loading && pokemonList.length > 0 && (
        <div className="text-center mt-6">
          <div className="text-lg">Loading more Pokémon...</div>
        </div>
      )}

      {!loading && (
        <div className="text-center mt-6">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={loadMorePokemon}
          >
            Load More Pokémon
          </button>
        </div>
      )}
    </div>
  );
};

export default PokemonSelection;
