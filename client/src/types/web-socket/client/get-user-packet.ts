import type { UUID } from "@/types/UUID";

export type GetUserPacket = {
    type: 'GET_USER',
    ID: UUID,
}