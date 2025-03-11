import { useState } from "react";
import { Pokemon } from "../../types/pokemon";
import { searchPokemon } from "../../services/pokemonService";
import { getTypeColor } from "../../utils/typeColors";

interface PokemonSearchProps {
  onSelect: (pokemon: Pokemon) => void;
}

const PokemonSearch = ({ onSelect }: PokemonSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError("Please enter a Pokémon name or ID");
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResult(null);

    try {
      const result = await searchPokemon(searchTerm);

      if (result) {
        setSearchResult(result);
      } else {
        setError(`No Pokémon found with name or ID "${searchTerm}"`);
      }
    } catch (error) {
      setError("Failed to search for Pokémon. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Pokémon name or ID"
          className="px-4 py-2 border rounded-lg flex-grow"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {searchResult && (
        <div className="mt-4 p-4 border rounded-lg bg-white">
          <h3 className="text-xl font-bold mb-2">Search Result</h3>
          <div
            className="flex items-center border rounded-lg p-4 cursor-pointer hover:bg-gray-100"
            onClick={() => onSelect(searchResult)}
          >
            <div className="mr-4">
              <img
                src={searchResult.sprites.front}
                alt={searchResult.name}
                className="w-24 h-24"
              />
            </div>
            <div>
              <h4 className="text-lg font-semibold capitalize">
                {searchResult.name}
              </h4>
              <div className="flex gap-2 mt-1">
                {searchResult.types.map((type) => (
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
              <div className="mt-2 text-sm">
                <span className="font-bold">HP:</span> {searchResult.stats.hp} |
                <span className="font-bold"> ATK:</span>{" "}
                {searchResult.stats.attack} |
                <span className="font-bold"> DEF:</span>{" "}
                {searchResult.stats.defense}
              </div>
              <div className="mt-2 text-blue-600 font-semibold">
                Click to select this Pokémon
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PokemonSearch;
