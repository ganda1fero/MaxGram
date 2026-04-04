import type { User } from "@/types/user.js"
import type { UUID } from "@/types/UUID.js"

export type PushUpdateUser = {
    type: 'PUSH_UPDATE_USER',
} & (Partial<Omit<User, 'ID' | 'isLoading' | 'gradientPair'>> & { ID: UUID });