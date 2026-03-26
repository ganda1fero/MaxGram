import type { UUID } from "node:crypto";

export type GetChatContentPacket = {
    type: 'GET_CHAT_CONTENT',
    chatId: UUID,
    anchorMessageId?: UUID,
    loadOlder?: boolean,
    loadNewer?: boolean,
}