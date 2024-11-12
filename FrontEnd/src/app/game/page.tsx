"use client";
import { useState, useEffect } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Image from "next/image";
import io from "socket.io-client";

const socket = io("http://localhost:3001");

const Game = () => {
  const [board, setBoard] = useState<Array<string | null>>(
    Array(100).fill(null)
  ); // 10x10 board

  const [isXNext, setIsXNext] = useState(true);
  const [gameNumber, setGameNumber] = useState("");
  const [currentGame, setCurrentGame] = useState(null);
  const [status, setStatus] = useState("");
  const [mySymbol, setMySymbol] = useState("");
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    let statusTimer: NodeJS.Timeout | undefined; // Định nghĩa kiểu cho statusTimer

    if (status) {
      statusTimer = setTimeout(() => {
        setStatus("");
      }, 5000); // 5000 milliseconds = 5 seconds
    }

    return () => {
      if (statusTimer) {
        clearTimeout(statusTimer); // Clear the timer on cleanup
      }
    };
  }, [status]);

  useEffect(() => {
    socket.on("move", ({ gameNumber, index, symbol }) => {
      setBoard((prevBoard) => {
        const newBoard = [...prevBoard];
        newBoard[index] = symbol;
        setIsXNext(symbol !== "X");
        return newBoard;
      });
    });

    socket.on("gameCreated", ({ gameNumber }) => {
      setCurrentGame(gameNumber);
      setStatus(`Game created. Your game number is ${gameNumber}`);
    });

    socket.on("gameJoined", ({ gameNumber }) => {
      setCurrentGame(gameNumber);
      setStatus(`Joined game ${gameNumber}`);
    });

    socket.on("userJoined", ({ userId }) => {
      setHasStarted(true);
      setStatus(`User ${userId} joined the game`);
    });

    socket.on("resetGame", () => {
      reset(false);
    });

    socket.on("error", (error) => {
      setStatus(`Error: ${error}`);
    });

    return () => {
      socket.off("move");
      socket.off("gameCreated");
      socket.off("gameJoined");
      socket.off("userJoined");
      socket.off("resetGame");
      socket.off("error");
    };
  }, []);

  const handleClick = (index: number) => {
    if (!currentGame) {
      setStatus("Create or join a game first!");
      return;
    }
    if (!hasStarted) {
      setStatus("Please wait for opponent to join");
      return;
    }
    if (board[index] || calculateWinner(board)) return;
    if (isXNext && mySymbol != "X") {
      setStatus("Please wait for opponent's move");
      return;
    }
    if (isXNext == false && mySymbol == "X") {
      setStatus("Please wait for opponent's move");
      return;
    }
    const symbol = isXNext ? "X" : "O";
    socket.emit("move", { gameNumber: currentGame, index, symbol });
  };

  const reset = (isUserInitiated = true) => {
    setBoard(Array(100).fill(null));
    setIsXNext(true);
    if (isUserInitiated) {
      socket.emit("resetGame", currentGame);
    }
  };

  const handleCreateGame = () => {
    setMySymbol("X");
    socket.emit("createGame");
  };

  const handleJoinGame = () => {
    if (!gameNumber) return;
    setMySymbol("O");
    socket.emit("joinGame", gameNumber);
  };

  const winner = calculateWinner(board);
  const isBoardFull = board.every((cell) => cell !== null);
  const gameStatus = winner
    ? `Winner: ${winner}`
    : isBoardFull
    ? "Tie Match"
    : `Next player: ${isXNext ? "X" : "O"}`;

  return (
    <div className="p-4 bg-gray-100 min-h-screen flex flex-col items-center">
      <div className="mb-6 text-center">
        {!currentGame && (
          <div>
            <button
              onClick={handleCreateGame}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Create Game
            </button>
            <div className="mt-4 flex items-center space-x-2">
              <input
                type="text"
                value={gameNumber}
                onChange={(e) => setGameNumber(e.target.value)}
                placeholder="Enter game number"
                className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
              />
              <button
                onClick={handleJoinGame}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Join Game
              </button>
            </div>
          </div>
        )}
        {currentGame && (
          <div className="mt-2 text-lg font-bold text-gray-700 items-center justify-center flex">
            {`Game No: ${currentGame}`}
            <CopyToClipboard
              text={currentGame}
              onCopy={() => setStatus("Game number copied!")}
            >
              <Image
                src="/images/copy.png"
                alt="Copy Game Number"
                width={15}
                height={20}
                className="ml-2 cursor-pointer"
              />
            </CopyToClipboard>
          </div>
        )}
        {currentGame && gameStatus && (
          <div className="mt-2 text-lg text-gray-700">{gameStatus}</div>
        )}
        {currentGame && mySymbol && (
          <div className="mt-2 text-lg text-gray-700">{`You are ${mySymbol}`}</div>
        )}
        {status && <div className="mt-2 text-red-500">{status}</div>}
      </div>
      <div className="grid grid-cols-10 gap-2">
        {board.map((cell, index) => (
          <button
            key={index}
            className="w-10 h-10 bg-white border border-gray-300 text-xl flex items-center justify-center hover:bg-gray-100"
            onClick={() => handleClick(index)}
          >
            {cell}
          </button>
        ))}
      </div>
      {(gameStatus.includes("Winner") || gameStatus.includes("Tie")) && (
        <button
          type="button"
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          onClick={() => reset(true)}
        >
          Reset
        </button>
      )}
    </div>
  );
};

const calculateWinner = (board: (string | null)[]): string | null => {
  const size = 10; // Kích thước bàn cờ 10x10
  const winLength = 5; // Cần 5 quân liên tiếp để thắng
  const lines = [];

  // Kiểm tra các hàng
  for (let row = 0; row < size; row++) {
    for (let col = 0; col <= size - winLength; col++) {
      lines.push(
        Array.from({ length: winLength }, (_, i) => row * size + col + i)
      );
    }
  }

  // Kiểm tra các cột
  for (let col = 0; col < size; col++) {
    for (let row = 0; row <= size - winLength; row++) {
      lines.push(
        Array.from({ length: winLength }, (_, i) => (row + i) * size + col)
      );
    }
  }

  // Kiểm tra các đường chéo (diagonal từ trái lên phải)
  for (let row = 0; row <= size - winLength; row++) {
    for (let col = 0; col <= size - winLength; col++) {
      lines.push(
        Array.from({ length: winLength }, (_, i) => (row + i) * size + col + i)
      );
    }
  }

  // Kiểm tra các đường chéo (diagonal từ phải lên trái)
  for (let row = 0; row <= size - winLength; row++) {
    for (let col = winLength - 1; col < size; col++) {
      lines.push(
        Array.from({ length: winLength }, (_, i) => (row + i) * size + col - i)
      );
    }
  }

  // Kiểm tra từng dòng có 5 quân liên tiếp không
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const [a, b, c, d, e] = line.map((index) => board[index]);
    if (a && a === b && a === c && a === d && a === e) {
      return a; // Trả về "X" hoặc "O" nếu có người thắng
    }
  }

  return null; // Nếu không có ai thắng, trả về null
};

export default Game;
