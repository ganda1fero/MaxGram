import type { UUID } from "node:crypto";
import type { Message } from "../../types/message.js";
import type { PushNewMessage } from "../../types/web-socked/server/push-new-message.js";
import type { Packet } from "../../types/web-socked/packet.js";
import type { WebSocket } from "ws";

import { chatsStorage } from "../../stores/chats-store.js";
import { connectionsStore } from "../../stores/connections-store.js";

export const newMessagePush = (message: Message, senderWebSocket: WebSocket): void => {
    // unpacking massage
    const { ID: id, CHAT_ID: chatId, SENDER_ID: senderId, text, repliedMessage, timestamp } = message;

    // get chat
    const chat = chatsStorage.getChat(chatId);
    if (chat === undefined) {
        console.warn("can't find the chat by id");
        return;
    }

    // create push message
    const pushNewMessage: PushNewMessage = {
        type: 'PUSH_NEW_MESSAGE',
        id,
        chatId,
        senderId,
        text,
        repliedMessage,
        timestamp,
    };
    const pushNewMessagePacket: Packet<PushNewMessage> = {
        msgId: '_' as UUID, // no msgID (push message)
        payLoad: pushNewMessage,
    };
    const stringifiedMessage = JSON.stringify(pushNewMessagePacket);

    // sending push message to every participants active sockets (avoiding the sender socket (self))
    for (const userId of chat.participants.keys()) {
        const socketsSet = connectionsStore.getUserSockets(userId);
        if (!socketsSet) continue;  // no active sockets => skip user

        for (const socket of socketsSet) {
            if (socket === senderWebSocket) continue;    // self socket => skip socket

            socket.send(stringifiedMessage);
        }
    }
};