import type { UUID } from "node:crypto";

export type ReplyMessagePacket = {
    type: 'REPLY_MESSAGE',
    localId: UUID,
    chatId: UUID,
    text: string,
    repliedMessageId: UUID,
}