import type { UUID } from "node:crypto"

export type PushNewMessage = {
    type: 'PUSH_NEW_MESSAGE',
    id: UUID,
    chatId: UUID,
    senderId: UUID,
    text: string,
    timestamp: number,
}