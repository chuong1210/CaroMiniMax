// hooks/useSocket.ts
import { SocketContext } from "@/app/play/page";
import { useContext, useEffect, useState } from "react";

const useSocket = () => {
  const socket = useContext(SocketContext); // Lấy socket từ context
  const [isConnected, setIsConnected] = useState(false);
  const [serverError, setServerError] = useState(false);

  useEffect(() => {
    if (!socket) return; // Kiểm tra nếu socket là null

    socket.on("connect", () => {
      setIsConnected(true);
      setServerError(false);
    });

    socket.on("connect_error", () => {
      setServerError(true);
      setIsConnected(false);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
    };
  }, [socket]);

  return { isConnected, serverError, socket };
};

export default useSocket;
