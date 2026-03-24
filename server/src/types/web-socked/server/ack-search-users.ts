import type { UUID } from "node:crypto"

export type AckSearchUsers = {
    type: 'ACK_SEARCH_USERS',
    result: UUID[],
} 