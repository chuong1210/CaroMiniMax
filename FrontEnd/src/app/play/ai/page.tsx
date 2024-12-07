// "use client";

// import { useState, useEffect } from "react";
// import CircularCountdown from "@/Components/CircularCountdown";
// import MiniMax from "@/libary/MiniMax";
// import { alphaBeta } from "@/libary/AlphaBeta";

// import { mctsCore } from "@/libary/MCTS";

// const { minimax, calculateWinner } = MiniMax;

// const TIMEOUT = 3000;

// type Difficulty = "Easy" | "Medium" | "Hard";

// const GameWithAI = () => {
//   const [board, setBoard] = useState<Array<string | null>>(
//     Array(100).fill(null)
//   );
//   const [isXNext, setIsXNext] = useState(true);
//   const [status, setStatus] = useState("");
//   const [timer, setTimer] = useState(TIMEOUT / 1000);
//   const [isGameOver, setIsGameOver] = useState(false);
//   const [difficulty, setDifficulty] = useState<Difficulty>("Medium");

//   const getDifficultyDepth = (difficulty: Difficulty): number => {
//     switch (difficulty) {
//       case "Easy":
//         return 1;
//       case "Medium":
//         return 3;
//       case "Hard":
//         return 5;
//     }
//   };

//   const handleClick = (index: number) => {
//     if (board[index] || calculateWinner(board)) return;

//     const newBoard = [...board];
//     newBoard[index] = "X";
//     setBoard(newBoard);
//     setIsXNext(false);
//     setTimer(TIMEOUT / 1000);
//     handleAI(newBoard);
//   };

//   const reset = () => {
//     setBoard(Array(100).fill(null));
//     setIsXNext(true);
//     setTimer(TIMEOUT / 1000);
//     setStatus("");
//     setIsGameOver(false);
//   };

//   const handleAI = (currentBoard: Array<string | null>) => {
//     if (calculateWinner(currentBoard)) return;

//     let move: number;

//     if (difficulty === "Hard") {
//       const result = alphaBeta(currentBoard, 5, -Infinity, Infinity, false);
//       move = result.row * 10 + result.col; // Số lần lặp MCTS là 1000.
//     } else {
//       const result = minimax(
//         currentBoard.map((cell) => cell ?? ""),
//         getDifficultyDepth(difficulty),
//         true
//       );
//       move = result.move ? result.move[0] * 10 + result.move[1] : -1;
//     }

//     if (move !== -1) {
//       const newBoard = [...currentBoard];
//       newBoard[move] = "O";
//       setBoard(newBoard);
//       setIsXNext(true);
//       setTimer(TIMEOUT / 1000);
//     }
//   };

//   useEffect(() => {
//     if (!isXNext && !calculateWinner(board)) {
//       handleAI(board);
//     }
//   }, [isXNext, board, difficulty]);

//   useEffect(() => {
//     if (isXNext && !calculateWinner(board) && !isGameOver) {
//       const interval = setInterval(() => {
//         setTimer((prev) => {
//           if (prev <= 1) {
//             clearInterval(interval);
//             setIsXNext(false);
//             return 0;
//           }
//           return prev - 1;
//         });
//       }, 1000);
//       return () => clearInterval(interval);
//     }
//   }, [isXNext, board, isGameOver]);

//   const winner = calculateWinner(board);
//   const isBoardFull = board.every((cell) => cell !== null);
//   const gameStatus = winner
//     ? `Winner: ${winner}`
//     : isBoardFull
//     ? "Tie Match"
//     : `Next player: ${isXNext ? "X" : "O"}`;

//   useEffect(() => {
//     setStatus(gameStatus);
//   }, [gameStatus]);

//   return (
//     <div className="p-4 bg-gray-100 min-h-screen flex flex-col items-center bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
//       <div className="mb-6 text-center flex items-center justify-between w-full max-w-4xl">
//         <div className="flex-1">
//           <div className="relative inline-block w-48">
//             <select
//               value={difficulty}
//               onChange={(e) => {
//                 setDifficulty(e.target.value as Difficulty);
//                 reset();
//               }}
//               className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-700"
//             >
//               <option value="Easy">Easy</option>
//               <option value="Medium">Medium</option>
//               <option value="Hard">Hard (MCTS)</option>
//             </select>
//             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
//               <svg
//                 className="fill-current h-4 w-4"
//                 xmlns="http://www.w3.org/2000/svg"
//                 viewBox="0 0 20 20"
//               >
//                 <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
//               </svg>
//             </div>
//           </div>
//           <div className="mt-2 text-lg text-white font-semibold">{status}</div>
//           <button
//             type="button"
//             className="mt-4 px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
//             onClick={reset}
//           >
//             Reset
//           </button>
//         </div>
//         <div className="flex-1 flex justify-end">
//           <CircularCountdown timeLeft={timer} maxTime={TIMEOUT / 1000} />
//         </div>
//       </div>

//       <div className="grid grid-cols-10 gap-2 p-4 rounded-lg shadow-lg bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg">
//         {board.map((cell, index) => (
//           <button
//             key={index}
//             className={`w-12 h-12 border border-gray-300 text-4xl flex items-center justify-center
//                 ${
//                   cell === "X"
//                     ? "text-red-500 bg-red-100"
//                     : cell === "O"
//                     ? "text-blue-500 bg-blue-100"
//                     : "bg-white"
//                 }
//                 hover:bg-gray-100 transition duration-200 rounded-md shadow-sm`}
//             onClick={() => isXNext && handleClick(index)}
//           >
//             {cell}
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default GameWithAI;
"use client";

import React, { useState, useEffect } from "react";
import GameBoard from "@/Components/GameBoard";
import Timer from "@/Components/Timer";
import { createEmptyBoard, checkWinner, getAIMove } from "@/libary/AlphaBeta";
import { GameState, Player } from "@/types/game";

export default function Home() {
  const [gameState, setGameState] = useState<GameState>({
    board: createEmptyBoard(),
    currentPlayer: "X",
    winner: null,
  });
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const handleCellClick = (row: number, col: number) => {
    if (gameState.board[row][col] !== null || gameState.winner) return;

    const newBoard = gameState.board.map((r) => [...r]);
    newBoard[row][col] = gameState.currentPlayer;

    const winner = checkWinner(newBoard, row, col);

    setGameState({
      board: newBoard,
      currentPlayer: "O",
      winner,
    });

    if (!isTimerRunning) {
      setIsTimerRunning(true);
    }
  };

  useEffect(() => {
    if (gameState.currentPlayer === "O" && !gameState.winner) {
      const aiMove = getAIMove(gameState.board);
      const newBoard = gameState.board.map((r) => [...r]);
      newBoard[aiMove.row][aiMove.col] = "O";

      const winner = checkWinner(newBoard, aiMove.row, aiMove.col);

      setGameState({
        board: newBoard,
        currentPlayer: "X",
        winner,
      });
    }

    if (gameState.winner) {
      setIsTimerRunning(false);
    }
  }, [gameState]);

  const resetGame = () => {
    setGameState({
      board: createEmptyBoard(),
      currentPlayer: "X",
      winner: null,
    });
    setIsTimerRunning(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8">
      <div className="bg-white bg-opacity-20 p-8 rounded-xl shadow-2xl backdrop-blur-sm">
        <h1 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Tic Tac Toe (10x10)
        </h1>
        <GameBoard board={gameState.board} onCellClick={handleCellClick} />
        <div className="mt-8 flex justify-between items-center">
          <Timer isRunning={isTimerRunning} onReset={resetGame} />
          {gameState.winner && (
            <div className="text-2xl font-bold text-center">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                {gameState.winner === "Draw"
                  ? "It's a draw!"
                  : `${gameState.winner} wins!`}
              </span>
            </div>
          )}
        </div>
        <button
          className="mt-8 px-6 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg hover:from-green-500 hover:to-blue-600 transition duration-300 ease-in-out w-full font-bold text-lg shadow-md"
          onClick={resetGame}
        >
          Reset Game
        </button>
      </div>
    </div>
  );
}
