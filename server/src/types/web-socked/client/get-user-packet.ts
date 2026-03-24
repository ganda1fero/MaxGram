import type { UUID } from "node:crypto";

export type GetUserPacket = {
    type: 'GET_USER',
    ID: UUID,
}