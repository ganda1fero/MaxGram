import type { UUID } from "@/types/UUID";

export type AckGetAllChats = {
    type: 'GET_ALL_CHATS',
    chats: UUID[],
};