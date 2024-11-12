// pages/api/socket.ts
import { NextApiResponseWithSocket } from '@/Interfaces/Socker'; // Import your custom interface
import { NextApiRequest } from 'next';
import { Server } from 'socket.io';

interface User {
  id: string;
  name: string;
}

let io: Server;
const users: { [socketId: string]: User } = {};


const SocketHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    console.log('Socket is initializing');
    io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('a user connected');
      
      // Handle user joining
      socket.on('join', (userData: User) => {
        users[socket.id] = userData;
        console.log(`User ${userData.name} joined with id ${socket.id}`)
        // Inform other clients about the new user
        socket.broadcast.emit('userJoined', userData);
      });


      // Handle disconnection
      socket.on('disconnect', (reason) => {
        console.log('User disconnected:', reason);
        if (users[socket.id]) {
          const leavingUser = users[socket.id];
          delete users[socket.id];
          socket.broadcast.emit('userLeft', leavingUser);
        }
      });

      // Handle receiving messages
      socket.on('message', (message: { from: string; to: string; content: string }) => {
        const { from, to, content } = message;
        const sender = users[socket.id];
        if (!sender) {
          console.error('Sender not found');
          return;
        }


        console.log(`Message from ${sender.name}: ${content}`);
        // Find the recipient's socket ID using the users map.
        const recipientSocket = Object.entries(users)
          .find(([_id, user]) => user.id === message.to)?.[0];

          if (recipientSocket) {
            io.to(recipientSocket).emit('message', { sender, content });
          } else {
            console.log(`Recipient ${message.to} not found`);
          }
      });


    });
  } else {
    console.log('Socket is already running');
  }
  res.end();
};

export default SocketHandler;