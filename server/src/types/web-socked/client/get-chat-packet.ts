import type { UUID } from "node:crypto";

export type GetChatPacket = {
    type: 'GET_CHAT',
    chatId: UUID,
}