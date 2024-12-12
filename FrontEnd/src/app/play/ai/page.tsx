"use client";

import React, { useState, useEffect, useRef } from "react";
import GameBoard from "@/Components/GameBoard";
import Timer from "@/Components/Timer";
import { getAIMove, getAIMoveMinimax } from "@/libary/AlphaBeta";
import { createEmptyBoard, checkWinner } from "@/libary/GameLogic";
import {
  trainAgent,
  QLearningAgent,
  loadQTableFromFile,
} from "@/libary/Qlearning";
import { GameState, Board } from "@/types/game";

export default function GameWithAI() {
  const [gameState, setGameState] = useState<GameState>({
    board: createEmptyBoard(),
    currentPlayer: "X",
    winner: null,
  });
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [aiType, setAiType] = useState<"alphabeta" | "qlearning" | "minimax">(
    "minimax"
  );
  const qLearningAgent = useRef<QLearningAgent | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stopTrainingSignal = useRef<boolean>(false);

  const handleCellClick = (row: number, col: number) => {
    if (gameState.board[row][col] !== null || gameState.winner || isTraining)
      return;

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
    if (gameState.currentPlayer === "O" && !gameState.winner && !isTraining) {
      let aiMove;
      if (aiType === "qlearning" && qLearningAgent.current) {
        aiMove = qLearningAgent.current.chooseAction(gameState.board);
      } else if (aiType === "minimax") {
        // Sử dụng thuật toán Minimax
        aiMove = getAIMoveMinimax(gameState.board); // Giả sử getAIMoveMinimax là hàm Minimax
      } else {
        aiMove = getAIMove(gameState.board); // Alpha-Beta mặc định
      }
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
  }, [gameState, isTraining, aiType]); // AiType đã được đưa vào dependency

  const resetGame = () => {
    setGameState({
      board: createEmptyBoard(),
      currentPlayer: "X",
      winner: null,
    });
    setIsTimerRunning(false);
  };

  const handleTraining = async () => {
    setIsTraining(true);
    setTrainingProgress(0);
    stopTrainingSignal.current = false;

    const updateBoard = (board: Board) => {
      setGameState((prevState) => ({
        ...prevState,
        board: board,
      }));
    };

    if (!qLearningAgent.current) {
      qLearningAgent.current = new QLearningAgent();
    }

    try {
      const qTable = await trainAgent(
        setTrainingProgress,
        updateBoard,
        stopTrainingSignal
      );

      qLearningAgent.current.setQTable(qTable);
    } catch (error) {
      console.error("Training error:", error);
    }

    setIsTraining(false);
    resetGame();
  };

  const handleStopTraining = () => {
    stopTrainingSignal.current = true;
  };

  const handleSaveQTable = () => {
    if (qLearningAgent.current) {
      const qTable = qLearningAgent.current.getQTable();
      console.log("Q-Table to be saved:", qTable);

      // Check if the Q-table is empty
      if (Object.keys(qTable).length === 0) {
        alert("The Q-table is empty. Train the AI before saving.");
        return;
      }

      const blob = new Blob([JSON.stringify(qTable, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "qtable.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      alert("No Q-learning agent available. Train the AI before saving.");
    }
  };
  const handleAITypeChange = (value: "alphabeta" | "qlearning" | "minimax") => {
    setAiType(value);
    if (value === "qlearning") {
      if (!qLearningAgent.current) {
        fileInputRef.current?.click();
      } else {
        if (window.confirm("Load file q table lên?")) {
          fileInputRef.current?.click();
        }
      }
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const qTable = await loadQTableFromFile(file);
        if (!qLearningAgent.current) {
          qLearningAgent.current = new QLearningAgent();
        }
        qLearningAgent.current.setQTable(qTable);
        alert("Q-table load thành công!");
      } catch (error) {
        console.error("lỗi khi loading Q-table:", error);
        alert("Lỗi khi loading Q-table. quay về đánh với Alpha-Beta AI.");
        setAiType("alphabeta");
      }
    } else {
      // If no file was selected, revert to Alpha-Beta
      setAiType("alphabeta");
    }
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
        <div className="mt-4 flex justify-between items-center">
          <select
            value={aiType}
            onChange={(e) =>
              handleAITypeChange(
                e.target.value as "alphabeta" | "qlearning" | "minimax"
              )
            }
            className="px-4 py-2 rounded-lg bg-white bg-opacity-20 text-white border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
          >
            <option value="minimax">Minimax</option>{" "}
            <option value="alphabeta">Alpha-Beta</option>
            <option value="qlearning">Q-Learning</option>
          </select>
          {isTraining ? (
            <>
              <button
                className="px-4 py-2 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-md hover:from-red-500 hover:to-red-600 transition duration-300 ease-in-out font-bold text-sm shadow-md"
                onClick={handleStopTraining}
              >
                Stop Training
              </button>
              <button
                className="px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-md hover:from-blue-500 hover:to-blue-600 transition duration-300 ease-in-out font-bold text-sm shadow-md"
                onClick={handleSaveQTable}
              >
                Save Q-Table
              </button>
            </>
          ) : (
            <button
              className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-md hover:from-yellow-500 hover:to-orange-600 transition duration-300 ease-in-out font-bold text-sm shadow-md"
              onClick={handleTraining}
            >
              Start Training
            </button>
          )}
        </div>
        {isTraining && (
          <div className="mt-4">
            <div className="text-white text-center mb-2">
              Episodes: {trainingProgress}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div className="bg-blue-600 h-2.5 rounded-full w-full animate-pulse"></div>
            </div>
          </div>
        )}
        <button
          className="mt-8 px-6 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg hover:from-green-500 hover:to-blue-600 transition duration-300 ease-in-out w-full font-bold text-lg shadow-md"
          onClick={resetGame}
        >
          Reset Game
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileUpload}
          accept=".json"
        />
      </div>
    </div>
  );
}
