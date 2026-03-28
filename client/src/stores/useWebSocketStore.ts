import type { UUID } from "@/types/UUID";
import type { Packet } from "@/types/web-socket/packet";
import { defineStore } from "pinia";
import { ref } from 'vue'
import { handleIncomingPacket } from "@/services/message-router";
import { useAuthStore } from "./useAuthStore";

type WebSocketState = 'CONNECTING' | 'OPEN' | 'CLOSED';

export const useWebSocketStore = defineStore('socket', () => {
    // --- state
    const socketStatus = ref<WebSocketState>('CLOSED');
    let socket: WebSocket | null = null;
    let retryCount = 0;
    const pendingRequests: Map<UUID, string> = new Map();
    const authStore = useAuthStore();
    
    // --- getters
    const isConnected = () => socketStatus.value === 'OPEN';

    // --- actions
    const connect = () => {
        socketStatus.value = 'CONNECTING';
        socket = new WebSocket('ws://localhost:8080'); // заменить на wss

        socket.onopen = async () => {
            socketStatus.value = 'OPEN';
            retryCount = 0; // clear reconnect tryes

            if (!!authStore.getUsername()) { // can auth immediately
                await authStore.authentificate();
            }

            reSend();
        };
        socket.onmessage = (event) => {
            console.log(`New mesage: ${event.data}`);
            const data = JSON.parse(event.data);

            if (data?.msgId) {
                console.log(`msg done. ID: ${data!.msgId}`);
                pendingRequests.delete(data.msgId);
            }

            handleIncomingPacket(data);
        };
        socket.onerror = (err) => {
            console.error("WS Error:", err);
        };
        socket.onclose = () => {
            socketStatus.value = 'CLOSED';
            reconnect();
        };
    };

    const reconnect = () => {
        if (socketStatus.value !== 'CLOSED') return;

        socketStatus.value = 'CONNECTING';

        // exponential delay (0.1s, 0.2s, 0.4s, 0.8s, 1.6s, 3.2s) max is 30s
        const delay = Math.min(100 * Math.pow(2, retryCount), 30_000);

        setTimeout(() => {
            if (delay < 30_000) retryCount++;
            connect();
        }, delay);
    };

    const send = <T extends object>(data: T) => {
        const msgId = crypto.randomUUID();
        const packetObj: Packet<T> = {
            msgId,
            payLoad: data,
        };
        const packet = JSON.stringify(packetObj);

        pendingRequests.set(msgId, packet);
        if (isConnected()) {
            socket!.send(packet);
        }
    };

    const sendUnreliable = <T extends object>(data: T): void => {
        if (!isConnected()) return;

        const packetObj: Packet<T> = {
            msgId: '_',
            payLoad: data,
        };
        const packet = JSON.stringify(packetObj);

        socket!.send(packet);
    };

    const reSend = () => {
        // sentPackages
        for (const data of pendingRequests.values()) {
            if (socketStatus.value !== 'OPEN') return;
            socket!.send(data!);
        }
    };
    
    // --- boot
    connect();

    return { send, sendUnreliable, isConnected }; // public field
});