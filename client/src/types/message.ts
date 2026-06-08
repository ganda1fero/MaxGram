import type { UUID } from "./UUID";

import type { MessageReaction } from './reaction';

export type Message = {
    ID: UUID, // UUID 
    technicalId: UUID, // const id wiil be used like id in v-for
    CHAT_ID: UUID, // chat UUID
    SENDER_ID: UUID, // user UUID
    text: string,
    edited: boolean,
    repliedMessage?: Message,
    reactions?: MessageReaction[],
    timestamp: number,
    status?: 'sending' | 'deniend',
}