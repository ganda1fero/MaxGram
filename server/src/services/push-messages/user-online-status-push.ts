import type { UUID } from "node:crypto"
import type { PushUpdateUser } from "../../types/web-socked/server/push-update-user.js";
import type { Packet } from "../../types/web-socked/packet.js";

import { chatsStorage } from "../../stores/chats-store.js"
import { usersStore } from "../../stores/users-store.js";
import { connectionsStore } from "../../stores/connections-store.js";

export const userOnlineStatusPush = (userId: UUID): void => {
    // cheak chats
    const chatsSet = chatsStorage.getUserChatsSet(userId);
    if (chatsSet === undefined) return; // user have no friends ;(

    // get user
    const user = usersStore.getByID(userId);
    if (user === undefined) {
        console.warn("can't find user by id");
        return;
    }

    // create push message
    const pushUpdateUser: PushUpdateUser = {
        type: 'PUSH_UPDATE_USER',
        ID: user.ID,
        status: user.status,
        lastSeen: user.lastSeen,
    };
    const pushUpdateUserPacket: Packet<PushUpdateUser> = {
        msgId: '_' as UUID, // empty msgId (push message)
        payLoad: pushUpdateUser,
    };
    const stringifiedMessage = JSON.stringify(pushUpdateUserPacket);

    // send push messages
    for (const chat of chatsSet.keys()) {
        for (const otherUserId of chat.participants.keys()) {
            if (otherUserId === userId) continue; // chatId === selfId => skip

            const activeSocketsSet = connectionsStore.getUserSockets(otherUserId);
            if (activeSocketsSet === undefined) continue; // user have no active sockets => skip

            for (const socket of activeSocketsSet) {
                socket.send(stringifiedMessage);
            }
        }
    }
}