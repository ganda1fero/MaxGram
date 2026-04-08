import type { Message } from "../../types/message.js";
import type { WebSocket } from "ws";
import type { PushUpdateMessage } from "../../types/web-socked/server/push-update-message.js";
import type { Packet } from "../../types/web-socked/packet.js";
import type { UUID } from "node:crypto";

import { chatsStorage } from "../../stores/chats-store.js";
import { connectionsStore } from "../../stores/connections-store.js";

export const updateMessagePush = (message: Message, editorWebSocket: WebSocket): void => {
    // get chat
    const { CHAT_ID: chatId } = message;
    const chat = chatsStorage.getChat(chatId);
    if (chat === undefined) return;

    //create push message
    const pushUpdateMessage: PushUpdateMessage = {
        type: 'PUSH_UPDATE_MESSAGE',
        messageData: message,
    };
    const pushUpdateMessagePacket: Packet<PushUpdateMessage> = {
        msgId: '_' as UUID, // push have no msgid
        payLoad: pushUpdateMessage,
    };
    const stringifiedMessage = JSON.stringify(pushUpdateMessagePacket);

    // push all active participants sockets
    for (const userId of chat.participants.keys()) {
        const userSocketsSet = connectionsStore.getUserSockets(userId);
        if (userSocketsSet === undefined) continue; // no active sockets => skip

        for (const socket of userSocketsSet.keys()) {
            if (socket === editorWebSocket) continue; // socket is editor's => skip

            socket.send(stringifiedMessage);
        }
    }
}