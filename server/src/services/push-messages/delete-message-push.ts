import type { Message } from "../../types/message.js";
import type { WebSocket } from "ws";
import type { PushDeleteMessage } from "../../types/web-socked/server/push-delete-message.js";
import type { Packet } from "../../types/web-socked/packet.js";
import type { UUID } from "node:crypto";

import { chatsStorage } from "../../stores/chats-store.js";
import { connectionsStore } from "../../stores/connections-store.js";

export const deleteMessagePush = (message: Message, senderWebSocket: WebSocket): void => {
    const { ID: messageId, CHAT_ID: chatId, timestamp } = message;

    const chat = chatsStorage.getChat(chatId);
    if (chat == undefined) {
        console.warn('chat not found');
        return;
    }

    // create push message
    const pushDeleteMessage: PushDeleteMessage = {
        type: 'PUSH_DELETE_MESSAGE',
        chatId,
        messageId,
        timestamp,
    };
    const pushDeleteMessagePacket: Packet<PushDeleteMessage> = {
        msgId: '_' as UUID,
        payLoad: pushDeleteMessage,
    };
    const stringifiedMessage = JSON.stringify(pushDeleteMessagePacket);

    // send push message
    for (const userId of chat.participants.keys()) {
        const userSocketsSet = connectionsStore.getUserSockets(userId);
        if (userSocketsSet === undefined) continue; // no active sockets => skip

        for (const socket of userSocketsSet) {
            if (socket === senderWebSocket) continue; // skip sender

            socket.send(stringifiedMessage);
        }
    }
}