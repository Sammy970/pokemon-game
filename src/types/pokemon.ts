export interface Pokemon {
  id: number;
  name: string;
  types: string[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  moves: PokemonMove[];
  sprites: {
    front: string;
    back: string;
  };
}

export interface PokemonMove {
  id: number;
  name: string;
  type: string;
  power: number;
  accuracy: number;
  pp: number;
  category: "physical" | "special" | "status";
}