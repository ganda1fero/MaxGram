import type { UUID } from "node:crypto";
import { type User } from "../types/user.js";
import { WebSocket } from 'ws'
import { usersStore } from "./users-store.js";

class ConnectionsStote {
    private _ipConnections: Map<string, number> = new Map(); // <string...> = ip
    private _socketToUser: Map<WebSocket, UUID> = new Map();
    private _userToSockets: Map<UUID, Set<WebSocket>> = new Map();
    private readonly MAX_CONNECTIONS_PER_IP = 5;

    canConnect(ip: string): boolean {
        const connectionsCount = this._ipConnections.get(ip) || 0;
        return connectionsCount < this.MAX_CONNECTIONS_PER_IP;
    }

    addIp(ip: string): void {
        this._ipConnections.set(ip, (this._ipConnections.get(ip) || 0) + 1);
    }

    removeIp(ip: string): void {
        const count = this._ipConnections.get(ip) || 0;
        if (count <= 1) this._ipConnections.delete(ip);
        else this._ipConnections.set(ip, count - 1);
    }

    bindSocketToUser(ws: WebSocket, user: User) {
        this._socketToUser.set(ws, user.ID);
        
        if (!this._userToSockets.has(user.ID)) {
            this._userToSockets.set(user.ID, new Set());
            // c++ inside me tels to put `user.status = 'online'` here. IDK
        }
        this._userToSockets.get(user.ID)!.add(ws);

        user.status = 'online';
    }

    unbindSocket(ws: WebSocket): void {
        const userId = this._socketToUser.get(ws);
        if (!userId) return;

        const user = usersStore.getByID(userId)!;
        const wsSet = this._userToSockets.get(userId);
        if (wsSet) {
            wsSet.delete(ws);

            if (wsSet.size === 0) {
                user.lastSeen = Date.now();
                user.status = 'offline';
            }
        }

        this._socketToUser.delete(ws);
    }

    _setAllUsersOffline(): void {
        this._userToSockets.forEach((_, userId) => {
            const user = usersStore.getByID(userId);
            if (user) {
                user.lastSeen = Date.now();
                user.status = 'offline';
            }
        });
        this._userToSockets.clear();
        this._socketToUser.clear();
    }

    getUserUUID(ws: WebSocket): UUID | undefined {
        return this._socketToUser.get(ws);
    }

    getUserSockets(userId: UUID): Set<WebSocket> | undefined {
        return this._userToSockets.get(userId);
    }
}

export const connectionsStore = new ConnectionsStote();