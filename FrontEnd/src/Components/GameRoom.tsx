"use client";
import useSocket from "@/useHooks/useSocket";
import { useState, useEffect } from "react";

// Định nghĩa kiểu dữ liệu cho trạng thái phòng
interface InRoom {
  status: boolean;
  room: string | null;
  player: string | null;
  symbol: "X" | "O" | null;
}

const GameRoom = () => {
  const { socket } = useSocket();

  const [roomCode, setRoomCode] = useState<string>("");
  const [inRoom, setInRoom] = useState<InRoom>({
    status: false,
    room: null,
    player: null,
    symbol: null,
  });
  const [message, setMessage] = useState<string>("");

  // Khởi tạo bàn cờ 15x15, mỗi ô ban đầu là null
  const [gameBoard, setGameBoard] = useState<(string | null)[][]>(
    Array(15).fill(Array(15).fill(null))
  );

  // Lắng nghe các sự kiện socket từ server
  useEffect(() => {
    socket.on("roomCreated", (roomCode: string) => {
      setRoomCode(roomCode);
      setMessage(`Room created with code: ${roomCode}`);
    });

    socket.on("startGame", (playerSymbol: "X" | "O") => {
      setInRoom({
        status: true,
        room: roomCode,
        player: "player1", // Định danh người chơi, bạn có thể cải thiện thêm
        symbol: playerSymbol,
      });
    });

    socket.on("opponentMove", ({ x, y }: { x: number; y: number }) => {
      makeMove(x, y, false); // Đối thủ thực hiện nước đi
    });

    socket.on("gameOver", (winner: string) => {
      setMessage(`Game Over! ${winner} won!`);
    });

    return () => {
      socket.off("roomCreated");
      socket.off("startGame");
      socket.off("opponentMove");
      socket.off("gameOver");
    };
  }, [socket, roomCode]);

  // Tạo phòng
  const createRoom = () => {
    socket.on("connect", () => {
      console.log("connected");
    });

    socket.emit("createRoom");
    console.log(123);
  };

  // Tham gia phòng
  const joinRoom = () => {
    socket.emit("joinRoom", roomCode);
  };

  // Xử lý nước đi
  const makeMove = (x: number, y: number, isPlayerMove: boolean) => {
    if (gameBoard[x][y] === null) {
      const newBoard = gameBoard.map((row, i) =>
        row.map((cell, j) =>
          i === x && j === y ? (isPlayerMove ? "X" : "O") : cell
        )
      );
      setGameBoard(newBoard);

      if (isPlayerMove) {
        socket.emit("makeMove", { roomCode, x, y });
      }
    }
  };

  return (
    <div>
      <h1>{message}</h1>
      {!inRoom.status ? (
        <>
          <button onClick={createRoom}>Create Room</button>
          <input
            type="text"
            placeholder="Enter Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
          />
          <button onClick={joinRoom}>Join Room</button>
        </>
      ) : (
        <div>
          <h2>Game Board</h2>
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(15, 30px)" }}
          >
            {gameBoard.map((row, x) =>
              row.map((cell, y) => (
                <div
                  key={`${x}-${y}`}
                  onClick={() => makeMove(x, y, true)}
                  style={{
                    width: 30,
                    height: 30,
                    border: "1px solid black",
                    display: "inline-block",
                    textAlign: "center",
                    lineHeight: "30px",
                    backgroundColor: cell
                      ? cell === "X"
                        ? "blue"
                        : "red"
                      : "white",
                    cursor: "pointer",
                  }}
                >
                  {cell}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameRoom;
