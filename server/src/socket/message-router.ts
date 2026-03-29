import type { WebSocketWithIp } from '../types/web-socket-with-ip.js';
import type { UUID } from 'node:crypto';
import type { Packet } from "../types/web-socked/packet.js";
import type { AckAuth } from '../types/web-socked/server/ack-auth.js';
import type { AckGetUser } from '../types/web-socked/server/ack-get-user.js';
import type { AckSearchUsers } from '../types/web-socked/server/ack-search-users.js';
import type { AckGetChatContent } from '../types/web-socked/server/ack-get-chat-content.js';
import type { AckGetChat } from '../types/web-socked/server/ack-get-chat.js';
import type { AckGetAllChats } from '../types/web-socked/server/ack-get-all-chats.js';
import type { AckGetPrivateChatId } from '../types/web-socked/server/ack-get-private-chat-id.js';

import type { User } from '../types/user.js';
import type { Chat } from '../types/chat.js';
import { connectionsStore } from '../stores/connections-store.js';
import { usersStore } from "../stores/users-store.js";
import { randomUUID } from 'node:crypto';
import type { GetChatContentPacket } from '../types/web-socked/client/get-chat-content-packet.js';
import { chatsStorage } from '../stores/chats-store.js';
import { messagesStore } from '../stores/messages-store.js';


export function handleIncomingPacket(data: Packet, ws: WebSocketWithIp) {
    if (!connectionsStore.getUserUUID(ws) && data?.payLoad?.type !== 'AUTH') {
        // ws (user) = undefined AND type != 'AUTH'
        wrapResponse(data, ws, () => ({}));
        console.warn("access denien (anonymous)");
        return;
    }

    const type = data.payLoad.type as 'AUTH' | 'GET_USER' | 'SEARCH_USERS' | 'GET_CHAT_CONTENT' | 'GET_CHAT' | 'GET_ALL_CHATS' | 'GET_PRIVATE_CHAT_ID'; 
    switch (type) {
        case 'AUTH':
            wrapResponse<AckAuth>(data, ws, auth)
            break;
        case 'GET_USER':
            wrapResponse<AckGetUser>(data, ws, sendUser);
            break;
        case 'SEARCH_USERS':
            wrapResponse<AckSearchUsers>(data, ws, searchUsers);
            break;
        case 'GET_CHAT_CONTENT':
            wrapResponse<AckGetChatContent>(data, ws, getChatContent);
            break;
        case 'GET_CHAT':
            wrapResponse<AckGetChat>(data, ws, getChat);
            break;
        case 'GET_ALL_CHATS':
            wrapResponse<AckGetAllChats>(data, ws, getAllChats);
            break;
        case 'GET_PRIVATE_CHAT_ID':
            wrapResponse<AckGetPrivateChatId>(data, ws, getPrivateChatId);
            break;
        default:    // unknown type!
            wrapResponse(data, ws, () => ({}));
            console.warn("Unknown packet type!", data?.payLoad?.type);

            return type satisfies never;
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

function getChatContent(payLoad: any, ws: WebSocketWithIp): AckGetChatContent {
    const { chatId, anchorMessageId, loadOlder, loadNewer } = payLoad as GetChatContentPacket;
    const userId = connectionsStore.getUserUUID(ws)!;

    const chat = chatsStorage.getChat(chatId);
    if (!chat) {
        console.warn("trying to get a non-existent chat");
        return {} as AckGetChatContent;
    } 

    const parcipiant = chat.participants.get(userId);
    if (!parcipiant) {
        console.warn("access denied, there is no user in partipiants");
        return {} as AckGetChatContent;
    }

    const allMessages = messagesStore.getMessagesList(chatId);
    const messagesLength = allMessages.length;
    let startIndex: number;
    let lastIndex: number;

    if (!anchorMessageId) {
        if (!parcipiant.lastReadedMessageId) {
            startIndex = 0;
            lastIndex = Math.min(20, messagesLength);
        } else {
            const pivotIndex = allMessages.findIndex(m => m.ID === parcipiant.lastReadedMessageId);
            const safePivot = pivotIndex === -1 ? messagesLength : pivotIndex;
            startIndex = Math.max(0, safePivot - 20);
            lastIndex = Math.min(messagesLength, safePivot + 20);
        }

        return {
            type: 'INIT_CHAT_CONTENT',
            chatId,
            messages: allMessages.slice(startIndex, lastIndex),
            pivotMessageId: allMessages[startIndex]?.ID,
            hasMoreOlder: startIndex > 0,
            hasMoreNewer: lastIndex < messagesLength,
        };
    }

    const pivotIndex = allMessages.findIndex(m => m.ID === anchorMessageId);
    if (pivotIndex === -1) {
        console.warn("anchor message Id is not existing in chat");
        return {} as AckGetChatContent;
    }

    if (loadOlder) {
        lastIndex = pivotIndex;
        startIndex = Math.max(0, lastIndex - 20);
        
        return {
            type: 'LOADING_CHAT_CONTENT',
            chatId,
            messages: allMessages.slice(startIndex, lastIndex),
            pivotMessageId: anchorMessageId,
            hasMoreOlder: startIndex > 0,
            hasMoreNewer: true,
        };
    }

    if (loadNewer) {
        startIndex = pivotIndex + 1;
        lastIndex = Math.min(messagesLength, startIndex + 20);

        return {
            type: 'LOADING_CHAT_CONTENT',
            chatId,
            messages: allMessages.slice(startIndex, lastIndex),
            pivotMessageId: anchorMessageId,
            hasMoreOlder: true,
            hasMoreNewer: lastIndex < messagesLength,
        };
    }

    console.warn("loadOlder and loadNewer are empty");
    return {} as AckGetChatContent;
}

function getChat(payLoad: any, ws: WebSocketWithIp): AckGetChat {
    const { chatId } = payLoad;

    const chat = chatsStorage.getChat(chatId);
    if (!chat) {
        console.warn("chat is not exists");
        return {} as AckGetChat;
    }

    const { ID, type, title, lastMessage, updatedAt } = chat;
    const selfUserId = connectionsStore.getUserUUID(ws)!;

    const getChatObj: AckGetChat = {
        type: 'GET_CHAT',
        payLoad: {
            ID,
            type,
            title,
            participants: [...chat.participants.keys()].filter(userId => userId !== selfUserId),
            lastMessage,
            updatedAt,
        },
    }
    
    return getChatObj;
}

function getAllChats(payLoad: any, ws: WebSocketWithIp): AckGetAllChats {
    payLoad.type; // dummy acces to unused variable 
    const selfUserId = connectionsStore.getUserUUID(ws)!;

    const chatsSet = chatsStorage.getUserChatsSet(selfUserId);

    const ackGetAllChatsObj: AckGetAllChats = {
        type: 'GET_ALL_CHATS',
        chats: !!chatsSet ? Array.from(chatsSet, chat => chat.ID) : [],
    }
    return ackGetAllChatsObj;
}

function getPrivateChatId(payLoad: any, ws: WebSocketWithIp): AckGetPrivateChatId {
    const selfUserId = connectionsStore.getUserUUID(ws)!;
    const { otherUserId } = payLoad;

    let existChat = chatsStorage.getDirectChat(selfUserId, otherUserId);
    if (!existChat) { // reacte new direct chat
        const newChat: Chat = {
            ID: crypto.randomUUID(),
            type: 'private',
            participants: new Map([ [selfUserId, {}], [otherUserId, {}] ]),
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        chatsStorage.addChat(newChat);
        existChat = newChat;
        
        // push all the active participants
    }

    const AckGetPrivateChatIdObj: AckGetPrivateChatId = {
        type: 'GET_PRIVATE_CHAT_ID',
        chatId: existChat.ID,
    };

    return AckGetPrivateChatIdObj;
}