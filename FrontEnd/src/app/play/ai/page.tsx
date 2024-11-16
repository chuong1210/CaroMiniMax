"use client";

import CircularCountdown from "@/Components/CircularCountdown";
import MiniMax from "@/libary/MiniMax";
import { useState, useEffect } from "react";

const { minimax, calculateWinner } = MiniMax;

const AI_DEPTH = 3;
const TIMEOUT = 3000;

const GameWithAI = () => {
  const [board, setBoard] = useState<Array<string | null>>(
    Array(100).fill(null)
  );
  const [isXNext, setIsXNext] = useState(true);
  const [status, setStatus] = useState("");
  const [timer, setTimer] = useState(TIMEOUT / 1000);
  const [isGameOver, setIsGameOver] = useState(false);

  const handleClick = (index: number) => {
    if (board[index] || calculateWinner(board)) return;

    const newBoard = [...board];
    newBoard[index] = "X";
    setBoard(newBoard);
    setIsXNext(false);
    setTimer(TIMEOUT / 1000);
    handleAI();
  };

  const reset = () => {
    setBoard(Array(100).fill(null));
    setIsXNext(true);
    setTimer(TIMEOUT / 1000);
    setStatus("");
    setIsGameOver(false);
  };

  useEffect(() => {
    if (!isXNext && !calculateWinner(board)) {
      const { move } = minimax(
        board.map((cell) => cell ?? ""),
        AI_DEPTH,
        true
      );
      if (move) {
        const newBoard = [...board];
        newBoard[move[0] * 10 + move[1]] = "O";
        setBoard(newBoard);
        setIsXNext(true);
        setTimer(TIMEOUT / 1000);
      }
    }
  }, [isXNext, board]);

  useEffect(() => {
    if (isXNext && !calculateWinner(board) && !isGameOver) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsXNext(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isXNext, board, isGameOver]);

  const handleAI = () => {
    if (!isXNext && !calculateWinner(board)) {
      const { move } = minimax(
        board.map((cell) => cell ?? ""),
        AI_DEPTH,
        true
      );
      if (move) {
        const newBoard = [...board];
        newBoard[move[0] * 10 + move[1]] = "O";
        setBoard(newBoard);
        setIsXNext(true);
        setTimer(TIMEOUT / 1000);
      }
    }
  };

  const winner = calculateWinner(board);
  const isBoardFull = board.every((cell) => cell !== null);
  const gameStatus = winner
    ? `Winner: ${winner}`
    : isBoardFull
    ? "Tie Match"
    : `Next player: ${isXNext ? "X" : "O"}`;

  useEffect(() => {
    setStatus(gameStatus);
  }, [gameStatus]);

  return (
    <div className="p-4 bg-gray-100 min-h-screen flex flex-col items-center bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
      <div className="mb-6 text-center">
        <div className="mt-2 text-lg text-gray-700">{status}</div>
        <div className="mt-4 flex justify-center items-center">
          <CircularCountdown timeLeft={timer} maxTime={TIMEOUT / 1000} />
        </div>
        <button
          type="button"
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          onClick={reset}
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-10 gap-2  p-4 rounded-lg shadow-lg">
        {board.map((cell, index) => (
          <button
            key={index}
            className={`w-12 h-12 border border-gray-300 text-4xl flex items-center justify-center 
                ${
                  cell === "X"
                    ? "text-red-500"
                    : cell === "O"
                    ? "text-blue-500"
                    : ""
                } 
                hover:bg-gray-100 transition duration-200`}
            onClick={() => isXNext && handleClick(index)}
          >
            {cell}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GameWithAI;
