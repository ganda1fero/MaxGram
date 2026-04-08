import type { UUID } from "node:crypto";

export type EditMessagePacket = {
    type: 'EDIT_MESSAGE',
    chatId: UUID,
    messageId: UUID,
    newText: string,
}