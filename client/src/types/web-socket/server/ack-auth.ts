import type { UUID } from "@/types/UUID"

export type AckAuth = {
    type: 'ACK_AUTH',
    UUID: UUID,
    username: string,
}