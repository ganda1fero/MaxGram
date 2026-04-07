import type { UUID } from "@/types/UUID"

export type DeleteMessagePacket = {
    type: 'DELETE_MESSAGE_PACKET',
    chatId: UUID,
    messageId: UUID,
}