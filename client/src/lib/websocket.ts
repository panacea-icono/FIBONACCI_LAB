import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function connectWebSocket(): Socket {
  if (socket) return socket;

  // Creamos una instancia de socket.io que se conecta a la misma URL que la página
  socket = io();

  socket.on('connect', () => {
    console.log('Socket.IO Conectado');
  });

  socket.on('disconnect', () => {
    console.log('Socket.IO Desconectado');
  });

  socket.on('connect_error', (error) => {
    console.error('Error de conexión Socket.IO:', error);
  });

  return socket;
}

export function getWebSocket(): Socket | null {
  if (!socket || !socket.connected) {
    try {
      socket = connectWebSocket();
    } catch (error) {
      console.error('Error al conectar Socket.IO:', error);
      return null;
    }
  }
  return socket;
}

export function sendMessage(content: string, senderId: number): void {
  const socket = getWebSocket();
  if (socket?.connected) {
    socket.emit('chat', {
      content,
      senderId
    });
  } else {
    console.warn('Socket.IO no está conectado. El mensaje se enviará solo por HTTP.');
  }
}