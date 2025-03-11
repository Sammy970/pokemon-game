import { PokemonMove } from "../../types/pokemon";
import { getTypeColor } from "../../utils/typeColors";

interface MoveSelectionProps {
  moves: PokemonMove[];
  movesPP: Record<number, number>;
  onSelectMove: (move: PokemonMove) => void;
  disabled: boolean;
}

const MoveSelection = ({
  moves,
  movesPP,
  onSelectMove,
  disabled,
}: MoveSelectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
      {moves.map((move) => {
        const currentPP = movesPP[move.id] || 0;
        const isMoveDepleted = currentPP <= 0;
        const isDisabled = disabled || isMoveDepleted;

        return (
          <button
            key={move.id}
            onClick={() => !isDisabled && onSelectMove(move)}
            disabled={isDisabled}
            className={`p-3 rounded-lg border flex flex-col items-start ${
              isDisabled
                ? "bg-gray-100 cursor-not-allowed opacity-70"
                : "hover:bg-gray-100"
            } ${isMoveDepleted ? "border-red-300" : ""}`}
          >
            <div className="flex justify-between w-full items-center mb-2">
              <span className="font-bold capitalize text-left">
                {move.name}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full capitalize ${getTypeColor(
                  move.type
                )}`}
              >
                {move.type}
              </span>
            </div>
            <div className="flex justify-between w-full text-sm">
              <span>Power: {move.power || "–"}</span>
              <span className={isMoveDepleted ? "text-red-500 font-bold" : ""}>
                PP: {currentPP}/{move.pp}
              </span>
            </div>
            <div className="text-xs text-gray-600 mt-1 capitalize">
              {move.category} move
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default MoveSelection;
