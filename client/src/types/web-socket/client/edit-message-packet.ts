import type { UUID } from "@/types/UUID"

export type EditMessagePacket = {
    type: 'EDIT_MESSAGE',
    chatId: UUID,
    messageId: UUID,
    newText: string,
}