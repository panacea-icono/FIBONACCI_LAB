let ws: WebSocket | null = null;

export function connectWebSocket(): WebSocket {
  if (ws) return ws;

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}`;

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('WebSocket Conectado');
  };

  ws.onclose = () => {
    console.log('WebSocket Desconectado');
    ws = null;
    // Reconectar después de 5 segundos
    setTimeout(connectWebSocket, 5000);
  };

  ws.onerror = (error) => {
    console.error('Error de WebSocket:', error);
  };

  return ws;
}

export function getWebSocket(): WebSocket | null {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    try {
      ws = connectWebSocket();
    } catch (error) {
      console.error('Error al conectar WebSocket:', error);
      return null;
    }
  }
  return ws;
}

export function sendMessage(content: string, senderId: number): void {
  const socket = getWebSocket();
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'chat',
      content,
      senderId
    }));
  } else {
    console.warn('WebSocket no está conectado. El mensaje se enviará solo por HTTP.');
  }
}