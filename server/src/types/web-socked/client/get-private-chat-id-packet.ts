import type { UUID } from "node:crypto";

export type GetPrivateChatIdPacket = {
    type: 'GET_PRIVATE_CHAT_ID',
    otherUserId: UUID,
}