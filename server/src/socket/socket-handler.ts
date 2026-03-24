import type { WebSocketWithIp } from '../types/web-socket-with-ip.js';
import type { Packet } from '../types/web-socked/packet.js';
import { connectionsStore } from '../stores/connections-store.js';
import { handleIncomingPacket } from './message-router.js';


export function handleConnection(ws: WebSocketWithIp) {
    if (!connectionsStore.canConnect(ws.ip)) {
        ws.close();
        console.error(`connection denied to ip: ${ws.ip} to much connections per ip`);
        return;
    }

    connectionsStore.addIp(ws.ip);

    ws.on('message', (message: string) => {
        console.log(`Получено сообщение ${message}`);
        const data = JSON.parse(message) as Packet;

        handleIncomingPacket(data, ws);
    });

    ws.on('close', () => {
        connectionsStore.unbindSocket(ws);

        console.log('Клиент отключился');
        connectionsStore.removeIp(ws.ip);
    });
}