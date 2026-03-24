import type { WebSocketWithIp } from '../types/web-socket-with-ip.js';
import type { UUID } from 'node:crypto';
import type { Packet } from "../types/web-socked/packet.js";
import type { AckAuth } from '../types/web-socked/server/ack-auth.js';
import type { AckGetUser } from '../types/web-socked/server/ack-get-user.js';
import type { AckSearchUsers } from '../types/web-socked/server/ack-search-users.js';

import type { User } from '../types/user.js';
import { connectionsStore } from '../stores/connections-store.js';
import { usersStore } from "../stores/users-store.js";
import { randomUUID } from 'node:crypto';


export function handleIncomingPacket(data: Packet, ws: WebSocketWithIp) {
    if (!connectionsStore.getUserUUID(ws) && data?.payLoad?.type !== 'AUTH') {
        // ws (user) = undefined AND type != 'AUTH'
        wrapResponse(data, ws, () => ({}));
        console.warn("access denien (anonymous)");
        return;
    }

    switch (data?.payLoad?.type) {
        case 'AUTH':
            wrapResponse<AckAuth>(data, ws, auth)
            break;
        case 'GET_USER':
            wrapResponse<AckGetUser>(data, ws, sendUser);
            break;
        case 'SEARCH_USERS':
            wrapResponse<AckSearchUsers>(data, ws, searchUsers);
            break;
        default:    // unknown type!
            wrapResponse(data, ws, () => ({}));
            console.warn("Unknown packet type!", data?.payLoad?.type);
            break;
    }
};

function wrapResponse<T>(data: Packet, ws: WebSocketWithIp, callback: (payLoad: any, ws: WebSocketWithIp) => T | undefined) {
    const { msgId, payLoad } = data;

    const payLoadData = callback(payLoad, ws);
    if (!payLoadData) return;

    const sendPacket: Packet<T> = {
        msgId,
        payLoad: payLoadData,
    };

    ws.send(JSON.stringify(sendPacket));
}

function sendUser(payLoad: any): AckGetUser | undefined {
    const user = usersStore.getByID(payLoad?.ID);
    if (!user) {
        console.warn(`User ${payLoad?.ID} not found`);
        return;
    }

    const { createdAt, ...props } = user;
    const userObj: AckGetUser = { 
        type: 'ACK_GET_USER',
        ...props,
    };
    return userObj;
}

function auth(payLoad: any, ws: WebSocketWithIp): AckAuth {
    const { username } = payLoad;

    let user: User | undefined = usersStore.getByUsername(username);
    if (!user) { // create a new user
        user = {
            ID: randomUUID(),
            username,
            status: 'online',
            lastSeen: Date.now(),
            createdAt: Date.now(),
        }

        usersStore.add(user);
    }
    connectionsStore.bindSocketToUser(ws, user);

    // build responce
    const authObj: AckAuth = {
        type: 'ACK_AUTH',
        UUID: user.ID,
        username: user.username,
    }
    return authObj;
}

function searchUsers(payLoad: any, ws: WebSocketWithIp): AckSearchUsers {
    const { query } = payLoad;

    const searchUsersObj: AckSearchUsers = {
        type: 'ACK_SEARCH_USERS',
        result: usersStore.search(query, connectionsStore.getUserUUID(ws) as UUID),
    };
    return searchUsersObj;
}