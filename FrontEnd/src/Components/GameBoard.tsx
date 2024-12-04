import React from "react";
import { Board, Player } from "../types/game";

interface GameBoardProps {
  board: Board;
  onCellClick: (row: number, col: number) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ board, onCellClick }) => {
  return (
    <div className="grid grid-cols-10 gap-2 p-4 rounded-lg shadow-lg bg-white bg-opacity-20 backdrop-filter backdrop-blur-lgv">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <button
            key={`${rowIndex}-${colIndex}`}
            className={`w-10 h-10 bg-white border-2 border-gray-400 flex items-center justify-center text-2xl font-bold hover:bg-gray-100 transition-colors duration-200 ${
              cell === "X"
                ? "text-red-500"
                : cell === "O"
                ? "text-blue-500"
                : ""
            }`}
            onClick={() => onCellClick(rowIndex, colIndex)}
            disabled={cell !== null}
          >
            {cell}
          </button>
        ))
      )}
    </div>
  );
};

export default GameBoard;
