import type { UUID } from "./UUID";

export type Message = {
    ID: UUID, // UUID 
    technicalId: UUID, // const id wiil be used like id in v-for
    CHAT_ID: UUID, // chat UUID
    SENDER_ID: UUID, // user UUID
    text: string,
    timestamp: number,
    status?: 'sending' | 'deniend',
}