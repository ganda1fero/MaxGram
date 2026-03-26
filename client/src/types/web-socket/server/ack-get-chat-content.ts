import type { UUID } from "@/types/UUID";
import type { Message } from "../../message.js";

export type AckGetChatContent = {
    type: 'INIT_CHAT_CONTENT' | 'LOADING_CHAT_CONTENT',
    chatId: UUID
    messages: Message[];
    pivotMessageId?: UUID | undefined,
    hasMoreOlder?: boolean,
    hasMoreNewer?: boolean,
}