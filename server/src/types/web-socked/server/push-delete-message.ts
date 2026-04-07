import type { UUID } from "node:crypto"

export type PushDeleteMessage = {
    type: 'PUSH_DELETE_MESSAGE',
    chatId: UUID,
    messageId: UUID,
    timestamp: number,
}