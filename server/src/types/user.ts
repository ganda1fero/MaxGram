import type { UUID } from "node:crypto";

export type User = {
    readonly ID: UUID, // UUID
    username: string,
    avatarUrl?: string,
    status: 'online' | 'offline',
    lastSeen: number, // timestamp
    createdAt: number, // timestamp
}