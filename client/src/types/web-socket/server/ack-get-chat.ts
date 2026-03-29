import type { UUID } from "@/types/UUID"
import type { Message } from "../../message.js"

type AckChat = {
    ID: UUID,
    type: 'private' | 'group',
    title?: string | undefined,
    participants: UUID[],
    lastMessage?: Message | undefined,
    updatedAt: number,
}

export type AckGetChat = {
    type: 'GET_CHAT',
    payLoad: AckChat,
}