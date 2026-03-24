import type { UUID } from "@/types/UUID"

export type AckSearchUsers = {
    type: 'ACK_SEARCH_USERS',
    result: UUID[],
} 