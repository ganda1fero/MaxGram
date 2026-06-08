import type { UUID } from "node:crypto";

import type { MessageReaction } from './reaction.js';

export type Message = {
    readonly ID: UUID, // UUID 
    readonly CHAT_ID: UUID, // chat UUID
    readonly SENDER_ID: UUID, // user UUID
    text: string,
    edited: boolean,
    repliedMessage?: Message,
    reactions?: MessageReaction[],
    timestamp: number,
}