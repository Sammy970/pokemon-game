export const typeColors: Record<string, string> = {
  normal: "bg-gray-300",
  fire: "bg-red-400 text-white",
  water: "bg-blue-400 text-white",
  electric: "bg-yellow-300",
  grass: "bg-green-400",
  ice: "bg-blue-200",
  fighting: "bg-red-700 text-white",
  poison: "bg-purple-500 text-white",
  ground: "bg-yellow-600 text-white",
  flying: "bg-indigo-300",
  psychic: "bg-pink-400 text-white",
  bug: "bg-green-500 text-white",
  rock: "bg-yellow-700 text-white",
  ghost: "bg-purple-700 text-white",
  dragon: "bg-indigo-600 text-white",
  dark: "bg-gray-700 text-white",
  steel: "bg-gray-400",
  fairy: "bg-pink-300",
};

export const getTypeColor = (type: string): string => {
  return typeColors[type] || "bg-gray-200";
};
