import type { UUID } from "@/types/UUID";

export type PushDeleteMessage = {
    type: 'PUSH_DELETE_MESSAGE',
    chatId: UUID,
    messageId: UUID,
    timestamp: number,
}