import { WebSocket, WebSocketServer } from 'ws';
import { handleConnection } from './socket/socket-handler.js';
import { shutdownAutoSave } from './utils/shutdown-auto-save.js';
import { usersStore } from './stores/users-store.js';
import { messagesStore } from './stores/messages-store.js';
import { chatsStorage } from './stores/chats-store.js';
import { type WebSocketWithIp } from './types/web-socket-with-ip.js';

async function boot() {
  // init patr (read JSONs)
  await usersStore.init();
  await messagesStore.init();
  await chatsStorage.init();

  // socket open part
  const wss = new WebSocketServer({ port: 8080 });
  console.log("socket is open");

  wss.on('connection', (ws: WebSocket, req) => {
    const wsWithIp = ws as WebSocketWithIp;
    wsWithIp.ip = req.socket.remoteAddress || "never";

    console.log('new user connected');
    handleConnection(wsWithIp);
  });

  process.on('SIGINT', () => shutdownAutoSave('SIGINT')); // Ctrl+C
  process.on('SIGTERM', () => shutdownAutoSave('SIGTERM')); // other shutdown
}

boot();