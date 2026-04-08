import type { UUID } from "node:crypto"
import type { Message } from "../../message.js"

export type PushNewMessage = {
    type: 'PUSH_NEW_MESSAGE',
    id: UUID,
    chatId: UUID,
    senderId: UUID,
    text: string,
    repliedMessage?: Message | undefined,
    timestamp: number,
}