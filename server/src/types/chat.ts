import { type Message } from "./message.js"
import type { UUID } from "node:crypto"

export type Chat = {
    readonly ID: UUID, // UUID
    readonly type: 'private' | 'group',
    title?: string | undefined, // title for public groups
    participants: Map<UUID, { lastReadedMessageId?: UUID | undefined}>, // <userId, lastReadedMessageId>
    lastMessage?: Message | undefined,
    messages?: Message[] | undefined, // just a link
    createdAt: number, // timestamp
    updatedAt: number, // timestamp
}

export type StringifiedChat = {
    readonly ID: UUID, // UUID
    readonly type: 'private' | 'group',
    title?: string | undefined, // title for public groups
    participants: { userId: UUID, lastReadedMessageId?: UUID | undefined }[],
    lastMessage?: Message | undefined,
    createdAt: number, // timestamp
    updatedAt: number, // timestamp
}