import type { UUID } from "@/types/UUID"

export type GetChatContentPacket = {
    type: 'GET_CHAT_CONTENT',
    chatId: UUID,
    anchorMessageId?: UUID,
    loadOlder?: boolean,
    loadNewer?: boolean,
}