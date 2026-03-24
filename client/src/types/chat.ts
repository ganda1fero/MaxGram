import { type Message } from "./message.js"
import type { UUID } from "./UUID.js"

export type Chat = {
    readonly ID: UUID, // UUID
    readonly type: 'private' | 'group',
    titile?: string, // title for public groups
    participants: Set<UUID>, // UUID Set (users UUID)
    lastMessage?: Message,
    messages?: Message[], // just a link
    createdAt: number, // timestamp
    updatedAt: number, // timestamp
}