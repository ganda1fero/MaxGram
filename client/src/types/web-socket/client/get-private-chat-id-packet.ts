import type { UUID } from "@/types/UUID"

export type GetPrivateChatIdPacket = {
    type: 'GET_PRIVATE_CHAT_ID',
    otherUserId: UUID,
}