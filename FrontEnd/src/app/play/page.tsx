"use client";
import React, { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";

interface MoveData {
  gameNumber: string;
  index: number;
  symbol: string;
}

const Game: React.FC = () => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null
  );
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [status, setStatus] = useState("");
  const [gameNumber, setGameNumber] = useState<string | null>(null);
  const [mySymbol, setMySymbol] = useState<string | null>(null);

  // Kết nối SignalR khi component load
  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:5251/gameHub")
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);

    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log("Connected to GameHub");

          // Nhận các sự kiện từ SignalR
          connection.on("gameCreated", ({ gameNumber }) => {
            setGameNumber(gameNumber);
            setMySymbol("X");
            setStatus(`Game created. Your game number is ${gameNumber}`);
          });

          connection.on("gameJoined", ({ gameNumber }) => {
            setGameNumber(gameNumber);
            setMySymbol("O");
            setStatus(`Joined game ${gameNumber}`);
          });

          connection.on("userJoined", ({ userId }) => {
            setStatus(`User ${userId} joined the game`);
          });

          connection.on("move", (data: MoveData) => {
            handleMove(data.index, data.symbol);
          });

          connection.on("resetGame", () => {
            resetBoard();
          });

          connection.on("error", (error) => {
            setStatus(`Error: ${error}`);
          });
        })
        .catch((error) => console.error("Connection failed:", error));
    }
  }, [connection]);

  const handleMove = (index: number, symbol: string) => {
    setBoard((prevBoard) => {
      const newBoard = [...prevBoard];
      newBoard[index] = symbol;
      setIsXNext(symbol !== "X");
      return newBoard;
    });
  };

  const handleClick = async (index: number) => {
    if (board[index] || calculateWinner(board)) return;
    if ((isXNext && mySymbol !== "X") || (!isXNext && mySymbol !== "O")) {
      setStatus("Please wait for opponent's move");
      return;
    }

    const symbol = isXNext ? "X" : "O";
    if (connection && gameNumber) {
      await connection.invoke("Move", gameNumber, index, symbol);
    }
  };

  const resetBoard = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  };

  const handleCreateGame = async () => {
    if (connection) {
      await connection.invoke("CreateGame");
    }
  };

  const handleJoinGame = async () => {
    if (connection && gameNumber) {
      await connection.invoke("JoinGame", gameNumber);
    }
  };

  const calculateWinner = (board: (string | null)[]): string | null => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  const winner = calculateWinner(board);
  const isBoardFull = board.every((cell) => cell !== null);
  const gameStatus = winner
    ? `Winner: ${winner}`
    : isBoardFull
    ? "Tie Match"
    : `Next player: ${isXNext ? "X" : "O"}`;

  return (
    <div className="game-container">
      <div className="status">{status}</div>
      <div className="game-status">{gameStatus}</div>
      <div className="board">
        {board.map((cell, index) => (
          <button key={index} onClick={() => handleClick(index)}>
            {cell}
          </button>
        ))}
      </div>
      <div>
        <button onClick={handleCreateGame}>Create Game</button>
        <input
          type="text"
          placeholder="Enter game number"
          value={gameNumber || ""}
          onChange={(e) => setGameNumber(e.target.value)}
        />
        <button onClick={handleJoinGame}>Join Game</button>
        {gameStatus.includes("Winner") || gameStatus.includes("Tie") ? (
          <button onClick={resetBoard}>Reset</button>
        ) : null}
      </div>
    </div>
  );
};

export default Game;
