import type { UUID } from "node:crypto"

export type AckGetPrivateChatId = {
    type: 'GET_PRIVATE_CHAT_ID',
    chatId: UUID,
};