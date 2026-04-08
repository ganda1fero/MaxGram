import type { UUID } from "node:crypto";

export type Message = {
    readonly ID: UUID, // UUID 
    readonly CHAT_ID: UUID, // chat UUID
    readonly SENDER_ID: UUID, // user UUID
    text: string,
    edited: boolean,
    timestamp: number,
}