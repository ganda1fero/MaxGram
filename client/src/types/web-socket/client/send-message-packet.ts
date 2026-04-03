import type { UUID } from "@/types/UUID"

export type SendMessagePacket = {
    type: 'SEND_MESSAGE',
    localId: UUID,
    chatId: UUID,
    senderId: UUID,
    text: string,
};