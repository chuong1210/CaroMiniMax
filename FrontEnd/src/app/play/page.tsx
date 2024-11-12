"use client";
import { createContext } from "react";
import { io } from "socket.io-client"; // Đảm bảo import io từ socket.io-client
import GameRoom from "@/Components/GameRoom";

// Tạo socket mà không cần chỉ định tham số kiểu
const socket = io("/api/socket");
export const SocketContext = createContext(socket); // Cung cấp socket vào context

const GamePage = () => {
  return (
    <SocketContext.Provider value={socket}>
      <div>
        <h1>Welcome to the Game Room!</h1>
        <GameRoom />
      </div>
    </SocketContext.Provider>
  );
};

export default GamePage;
