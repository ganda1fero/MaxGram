import type { UUID } from "node:crypto";

export type SendMessagePacket = {
    type: 'SEND_MESSAGE',
    localId: UUID,
    chatId: UUID,
    text: string,
};