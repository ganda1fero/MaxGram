import type { UUID } from "node:crypto";
import type { Message } from "../../message.js";

export type AckGetChatContent = {
    type: 'INIT_CHAT_CONTENT' | 'LOADING_CHAT_CONTENT',
    chatId: UUID
    messages: Message[];
    hasMoreOlder?: boolean,
    hasMoreNewer?: boolean,
}