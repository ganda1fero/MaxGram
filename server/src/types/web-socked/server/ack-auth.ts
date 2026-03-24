import type { UUID } from "node:crypto"

export type AckAuth = {
    type: 'ACK_AUTH',
    UUID: UUID,
    username: string,
}