// pages/api/socket.ts

import { Server } from "socket.io";
import { NextApiRequest } from "next";
import { NextApiResponseWithSocket } from "@/Interfaces/Socker";

const handler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (res.socket?.server?.io) {
    console.log("Socket.io already running");

  }
  else {
    console.log('Socket is initializing')
    const io = new Server(res.socket.server)
    res.socket.server.io = io
  }
  const io = new Server(res.socket.server, {
    path: '/api/socket',
    transports: ['websocket'], // Chỉ sử dụng WebSocket
    cors: {
      origin: '*', // Hoặc bạn có thể chỉ định domain cụ thể
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("createRoom", () => {
      const roomCode = Math.random().toString(36).substring(2, 7);
      console.log(roomCode)
      socket.emit("roomCreated", roomCode);
    });

    socket.on("joinRoom", (roomCode: string) => {
      socket.join(roomCode);
      socket.emit("startGame", "X");
    });

    socket.on("makeMove", ({ roomCode, x, y }: { roomCode: string; x: number; y: number }) => {
      socket.to(roomCode).emit("opponentMove", { x, y });
    });

    socket.on("endGame", (winner: string) => {
      socket.emit("gameOver", winner);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  res.end();
};

export default handler;
