import type { UUID } from "node:crypto";

export type DeleteMessagePacket = {
    type: 'DELETE_MESSAGE_PACKET',
    chatId: UUID,
    messageId: UUID,
}