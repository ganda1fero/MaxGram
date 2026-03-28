import type { UUID } from "@/types/UUID";

export type AckGetPrivateChatId = {
    type: 'GET_PRIVATE_CHAT_ID',
    chatId: UUID,
};