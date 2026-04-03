import type { UUID } from "@/types/UUID"

export type AckSendMessage = {
    type: 'ACK_SEND_MESSAGE' | 'DENIEN_SEND_MESSAGE',
    localId: UUID,
    globalId?: UUID,
    chatId: UUID,
    timestamp?: number,
} 