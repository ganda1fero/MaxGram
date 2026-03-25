import type { UUID } from "./UUID"

export type User = {
    isLoad: boolean,
    readonly ID: UUID, // UUID
    username: string,
    avatarUrl?: string,
    status: 'online' | 'offline',
    lastSeen?: number, // timestamp
}