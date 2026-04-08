import type { UUID } from "@/types/UUID"
import type { Message } from "@/types/message"

export type PushNewMessage = {
    type: 'PUSH_NEW_MESSAGE',
    id: UUID,
    chatId: UUID,
    senderId: UUID,
    text: string,
    repliedMessage?: Message | undefined,
    timestamp: number,
}