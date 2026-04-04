import type { User } from "../../user.js"
import type { UUID } from "node:crypto"

export type PushUpdateUser = {
    type: 'PUSH_UPDATE_USER',
} & (Partial<Omit<User, 'createdAt' | 'ID'>> & { ID: UUID })