import type { Message } from "@/types/message"

export type PushUpdateMessage = {
    type: 'PUSH_UPDATE_MESSAGE',
    messageData: Message
}
