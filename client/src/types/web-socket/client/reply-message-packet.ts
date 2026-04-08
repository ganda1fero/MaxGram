import type { UUID } from "@/types/UUID"

export type ReplyMessagePacket = {
    type: 'REPLY_MESSAGE',
    localId: UUID,
    chatId: UUID,
    text: string,
    repliedMessageId: UUID,
}