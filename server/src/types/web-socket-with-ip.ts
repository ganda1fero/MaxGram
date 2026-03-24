import { WebSocket } from "ws";

export interface WebSocketWithIp extends WebSocket {
    ip: string,
}