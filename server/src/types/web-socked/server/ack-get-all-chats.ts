import type { UUID } from "node:crypto";

export type AckGetAllChats = {
    type: 'GET_ALL_CHATS',
    chats: UUID[],
};