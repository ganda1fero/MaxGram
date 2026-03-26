import type { UUID } from "@/types/UUID"

export type GetChatPacket = {
    type: 'GET_CHAT',
    chatId: UUID,
}