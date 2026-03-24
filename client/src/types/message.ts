import type { UUID } from "./UUID";

export type Message = {
    readonly ID: UUID, // UUID 
    readonly CHAT_ID: UUID, // chat UUID
    readonly SENDER_ID: UUID, // user UUID
    text: string,
    timestamp: number,
}