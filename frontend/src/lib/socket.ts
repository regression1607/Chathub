// src/lib/socket.ts
import { io, Socket } from 'socket.io-client';

let socket: Socket;

export const connectSocket = () => {
  if (!socket) {
    socket = io('http://localhost:3001');
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return connectSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = undefined;
  }
};