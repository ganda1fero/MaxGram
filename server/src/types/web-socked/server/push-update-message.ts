import type { Message } from "../../message.js"

export type PushUpdateMessage = {
    type: 'PUSH_UPDATE_MESSAGE',
    messageData: Message
}
