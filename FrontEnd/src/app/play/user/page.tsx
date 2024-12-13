"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { CopyToClipboard } from "react-copy-to-clipboard";
import * as signalR from "@microsoft/signalr";
import CircularCountdown from "@/Components/CircularCountdown";

const URL = "https://localhost:5251/gameHub";
const connection = new signalR.HubConnectionBuilder().withUrl(URL).build();

const TURN_TIME = 5; // 30 seconds per turn

const Game = () => {
  const [board, setBoard] = useState<Array<string | null>>(
    Array(100).fill(null)
  );
  const [isXNext, setIsXNext] = useState(true);
  const [gameNumber, setGameNumber] = useState("");
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [mySymbol, setMySymbol] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [error, setError] = useState<string>("");
  const [timer, setTimer] = useState(TURN_TIME);

  useEffect(() => {
    let statusTimer: NodeJS.Timeout | undefined;

    if (status) {
      statusTimer = setTimeout(() => {
        setStatus("");
      }, 5000);
    }

    return () => {
      if (statusTimer) {
        clearTimeout(statusTimer);
      }
    };
  }, [status]);

  useEffect(() => {
    connection
      .start()
      .catch((err) => console.error("SignalR Connection Error:", err));

    connection.on("move", ({ gameNumber, index, symbol }) => {
      setBoard((prevBoard) => {
        const newBoard = [...prevBoard];
        newBoard[index] = symbol;
        setIsXNext(symbol !== "X");
        setTimer(TURN_TIME); // Reset timer after each move
        return newBoard;
      });
    });

    connection.on("gameCreated", ({ gameNumber }) => {
      setCurrentGame(gameNumber);
      setStatus(`Game created. Your game number is ${gameNumber}`);
    });

    connection.on("gameJoined", ({ gameNumber }) => {
      setCurrentGame(gameNumber);
      setStatus(`Joined game ${gameNumber}`);
    });

    connection.on("userJoined", ({ userId }) => {
      setHasStarted(true);
      setStatus(`User ${userId} joined the game`);
      setTimer(TURN_TIME); // Start timer when game starts
    });

    connection.on("resetGame", () => {
      reset(false);
    });

    connection.on("error", (error) => {
      setStatus(`Error: ${error}`);
    });
    connection.on("timeout", ({ gameNumber, currentSymbol, message }) => {
      setStatus(message); // Hiển thị thông báo trên giao diện
      setIsXNext(currentSymbol === "X"); // Cập nhật lượt hiện tại
      setTimer(TURN_TIME); // Reset lại thời gian
    });
    return () => {
      connection.off("move");
      connection.off("gameCreated");
      connection.off("gameJoined");
      connection.off("userJoined");
      connection.off("resetGame");
      connection.off("error");
      connection.off("timeout");
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (hasStarted && !calculateWinner(board) && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(interval);

            // Gửi tín hiệu tới backend rằng người chơi mất lượt
            if (currentGame) {
              connection
                .invoke("timeout", currentGame, mySymbol)
                .catch((err) => {
                  console.error("Timeout signal failed:", err);
                });
            }

            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [hasStarted, board, timer]);

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
    if (isXNext && mySymbol !== "X") {
      setStatus("Please wait for opponent's move");
      return;
    }
    if (!isXNext && mySymbol === "X") {
      setStatus("Please wait for opponent's move");
      return;
    }
    const symbol = isXNext ? "X" : "O";

    connection.invoke("move", currentGame, index, symbol).catch((err) => {
      console.error("Failed to invoke 'Move': ", err);
      setStatus("Error: Failed to make move.");
    });
  };

  // const reset = (isUserInitiated = true) => {
  //   setBoard(Array(100).fill(null));
  //   setIsXNext(true);
  //   setTimer(TURN_TIME);
  //   if (isUserInitiated && currentGame) {
  //     connection.invoke("resetGame", currentGame).catch((err) => {
  //       console.error("Game reset failed:", err);
  //       setError("Failed to reset game. Please try again.");
  //     });
  //   }
  // };
  const reset = (isUserInitiated = true) => {
    setBoard(Array(100).fill(null));
    setIsXNext(true);
    setTimer(TURN_TIME);
    if (isUserInitiated && currentGame) {
      connection.invoke("resetGame", currentGame).catch((err) => {
        console.error("Game reset failed:", err);
        setError("Failed to reset game. Please try again.");
      });
    } else {
      // Đảo vai trò người chơi khi reset mà không phải do người dùng yêu cầu
      setMySymbol((prevSymbol) => (prevSymbol === "X" ? "O" : "X"));
    }
  };

  const handleCreateGame = () => {
    setMySymbol("X");
    connection.invoke("createGame").catch((err) => {
      console.error("Game creation failed:", err);
      setError("Failed to create game. Please try again.");
    });
  };

  const handleJoinGame = () => {
    if (!gameNumber) return;
    setMySymbol("O");
    connection.invoke("joinGame", gameNumber).catch((err) => {
      console.error("Join game failed:", err);
      setError("Failed to join game. Please check the game number.");
    });
  };
  const winner = calculateWinner(board);
  const isBoardFull = board.every((cell) => cell !== null);
  const gameStatus = winner
    ? `Winner: ${winner}`
    : isBoardFull
    ? "Tie Match"
    : `Next player: ${isXNext ? "X" : "O"}`;

  const handleFindGame = () => {
    setMySymbol("O");

    connection.invoke("findGame").catch((err) => {
      console.error("Find game failed:", err);
      setError("Failed to find or create game. Please try again.");
    });
  };

  return (
    <div className="p-4 min-h-screen bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2 ml-20">
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
                onClick={() => handleClick(index)}
              >
                {cell}
              </button>
            ))}
          </div>
        </div>

        <div className="md:w-1/3 space-y-6 ">
          {!currentGame ? (
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <button
                onClick={handleCreateGame}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Create Game
              </button>
              <div className="mt-4 flex items-center space-x-2">
                <input
                  type="text"
                  value={gameNumber}
                  onChange={(e) => setGameNumber(e.target.value)}
                  placeholder="Enter game number"
                  className="flex-grow h-[100px] px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                />
                <div className="flex flex-col items-center gap-4">
                  <button
                    onClick={handleJoinGame}
                    className="w-full max-w-[200px] px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 shadow-md"
                  >
                    Join Game
                  </button>
                  <button
                    onClick={handleFindGame}
                    className="w-full max-w-[200px] px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all duration-200 shadow-md"
                  >
                    Find Game
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-lg shadow-lg space-y-4">
              <div className="text-lg font-bold text-gray-700 flex items-center justify-between">
                <span>Game No: {currentGame}</span>
                <CopyToClipboard
                  text={currentGame}
                  onCopy={() => setStatus("Game number copied!")}
                >
                  <Image
                    src="/2076261.png"
                    alt="Copy Game Number"
                    width={20}
                    height={20}
                    className="cursor-pointer"
                  />
                </CopyToClipboard>
              </div>
              <div className="text-lg text-gray-700">{gameStatus}</div>
              {mySymbol && (
                <div className="text-lg text-gray-700">You are {mySymbol}</div>
              )}
              {hasStarted && (
                <div className="flex justify-center">
                  <CircularCountdown timeLeft={timer} maxTime={TURN_TIME} />
                </div>
              )}
              {(gameStatus.includes("Winner") ||
                gameStatus.includes("Tie")) && (
                <button
                  type="button"
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  onClick={() => reset(true)}
                >
                  Reset
                </button>
              )}
            </div>
          )}
          {status && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-lg">
              {status}
            </div>
          )}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-lg">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const calculateWinner = (board: (string | null)[]): string | null => {
  const size = 10;
  const winLength = 5;
  const lines = [];

  for (let row = 0; row < size; row++) {
    for (let col = 0; col <= size - winLength; col++) {
      lines.push(
        Array.from({ length: winLength }, (_, i) => row * size + col + i)
      );
    }
  }

  for (let col = 0; col < size; col++) {
    for (let row = 0; row <= size - winLength; row++) {
      lines.push(
        Array.from({ length: winLength }, (_, i) => (row + i) * size + col)
      );
    }
  }

  for (let row = 0; row <= size - winLength; row++) {
    for (let col = 0; col <= size - winLength; col++) {
      lines.push(
        Array.from({ length: winLength }, (_, i) => (row + i) * size + col + i)
      );
    }
  }

  for (let row = 0; row <= size - winLength; row++) {
    for (let col = winLength - 1; col < size; col++) {
      lines.push(
        Array.from({ length: winLength }, (_, i) => (row + i) * size + col - i)
      );
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const [a, b, c, d, e] = line.map((index) => board[index]);
    if (a && a === b && a === c && a === d && a === e) {
      return a;
    }
  }

  return null;
};

export default Game;
