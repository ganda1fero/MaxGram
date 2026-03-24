import type { UUID } from "@/types/UUID"

export type AckGetUser = {
    type: 'ACK_GET_USER',
    readonly ID: UUID,
    username: string,
    avatarUrl?: string,
    status: 'online' | 'offline',
    lastSeen: number,
};