"use client";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface User {
  id: string;
  name: string;
}

interface Message {
  sender: User;
  content: string;
}

const Home = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const initSocket = async () => {
      try {
        const response = await fetch("/api/socket2");
        if (!response.ok) {
          console.error("Failed to connect to socket");
          return;
        }
        const newSocket = io("/api/socket");
        setSocket(newSocket);

        newSocket.on("connect", () => {
          console.log("Connected");

          // Generate a unique ID for the user (replace with a better method)
          const uniqueId = crypto.randomUUID();
          setUserId(uniqueId);
          // Send the user data to the server
          newSocket.emit("join", { id: uniqueId, name: username });
        });

        //Handle messages from other clients
        newSocket.on("message", (message) => {
          setMessages((prevMessages) => [...prevMessages, message]);
        });

        // Handle user joining events
        newSocket.on("userJoined", (user) => {
          console.log(`${user.name} joined`);
        });

        // Handle user leaving events
        newSocket.on("userLeft", (user) => {
          console.log(`${user.name} left`);
        });

        return () => newSocket.disconnect();
      } catch (error) {
        console.error("Error initializing socket:", error);
      }
    };

    initSocket();
  }, [username]);

  const sendMessage = (message: string) => {
    if (socket) {
      console.log(userId);
      socket.emit("message", {
        from: userId,
        to: "otherUserId",
        content: message,
      }); // Use userId and 'otherUserId'
    }
  };

  // ... Rest of your component code (input field, display messages)

  return (
    <div>
      {/* Input and send message */}
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={() => sendMessage("hello")}>Send</button>
      {/* Display messages */}
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>
            <p>
              {msg.sender.name}: {msg.content}1
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
