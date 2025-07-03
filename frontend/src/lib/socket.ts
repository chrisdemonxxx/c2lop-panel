import { io, Socket } from 'socket.io-client';

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://sysmanagepro-backend.netlify.app';

export const socket: Socket = io(socketUrl, {
  withCredentials: true,
  autoConnect: true,
});

export default socket;
