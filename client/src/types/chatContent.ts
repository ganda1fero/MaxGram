import type { Message } from "./message"
import type { UUID } from "./UUID"

export type ChatContent = {
    messages: Message[],
    chatId: UUID,
    isLoading: boolean,
    hasMoreOlder: boolean,
    hasMoreNewer: boolean,
    lastReadMessageId?: UUID,
}