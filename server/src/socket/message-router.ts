import type { WebSocketWithIp } from '../types/web-socket-with-ip.js';
import type { UUID } from 'node:crypto';
import type { Packet } from "../types/web-socked/packet.js";
import type { Message } from '../types/message.js';
import type { AckAuth } from '../types/web-socked/server/ack-auth.js';
import type { AckGetUser } from '../types/web-socked/server/ack-get-user.js';
import type { AckSearchUsers } from '../types/web-socked/server/ack-search-users.js';
import type { AckGetChatContent } from '../types/web-socked/server/ack-get-chat-content.js';
import type { AckGetChat } from '../types/web-socked/server/ack-get-chat.js';
import type { AckGetAllChats } from '../types/web-socked/server/ack-get-all-chats.js';
import type { AckGetPrivateChatId } from '../types/web-socked/server/ack-get-private-chat-id.js';
import type { GetChatContentPacket } from '../types/web-socked/client/get-chat-content-packet.js';
import type { AckSendMessage } from '../types/web-socked/server/ack-send-message.js';

import type { User } from '../types/user.js';
import type { Chat } from '../types/chat.js';
import { sentMessageIdsResolver } from '../services/sent-message-ids-resolver.js';
import { connectionsStore } from '../stores/connections-store.js';
import { usersStore } from "../stores/users-store.js";
import { randomUUID } from 'node:crypto';
import { chatsStorage } from '../stores/chats-store.js';
import { messagesStore } from '../stores/messages-store.js';
import { newMessagePush } from '../services/push-messages/new-message-push.js';
import { deleteMessagePush } from '../services/push-messages/delete-message-push.js';
import { updateMessagePush } from '../services/push-messages/update-message-push.js';


export function handleIncomingPacket(data: Packet, ws: WebSocketWithIp) {
    if (!connectionsStore.getUserUUID(ws) && data?.payLoad?.type !== 'AUTH') {
        // ws (user) = undefined AND type != 'AUTH'
        wrapResponse(data, ws, () => ({}));
        console.warn("access denien (anonymous)");
        return;
    }

    const type = data.payLoad.type as 'AUTH' | 'GET_USER' | 'SEARCH_USERS' | 'GET_CHAT_CONTENT' | 'GET_CHAT' | 'GET_ALL_CHATS' | 'GET_PRIVATE_CHAT_ID' | 'SEND_MESSAGE' | 'CONFIRM_GLOBAL_ID' | 'DELETE_MESSAGE_PACKET' | 'EDIT_MESSAGE' | 'REPLY_MESSAGE'; 
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
        case 'SEND_MESSAGE':
            wrapResponse<AckSendMessage>(data, ws, sendMessage);
            break;
        case 'CONFIRM_GLOBAL_ID':
            wrapResponse<{}>(data, ws, confirmGlobalID);
            break;
        case 'DELETE_MESSAGE_PACKET':
            wrapResponse<{}>(data, ws, deleteMessage);
            break;
        case 'EDIT_MESSAGE':
            wrapResponse<{}>(data, ws, editMessage);
            break;
        case 'REPLY_MESSAGE':
            wrapResponse<AckSendMessage>(data, ws, replyMessage);
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

    if (anchorMessageId === undefined) {
        if (parcipiant.lastReadedMessageId === undefined) {
            startIndex = Math.max(0, messagesLength - 20 - 1);
            lastIndex = messagesLength;
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
            pivotMessageId: allMessages[lastIndex]?.ID,
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
    const chatsList = !!chatsSet ? Array.from(chatsSet, chat => chat.ID) : [];

    const ackGetAllChatsObj: AckGetAllChats = {
        type: 'GET_ALL_CHATS',
        chats: chatsList,
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

function sendMessage(payLoad: any, ws: WebSocketWithIp): AckSendMessage {
    // data unpacking
    const { localId, chatId, text } = payLoad;  

    const chat = chatsStorage.getChat(chatId);
    const messagesList = messagesStore.getMessagesList(chatId);
    const selfId = connectionsStore.getUserUUID(ws)!;

    // checking for duplicates
    if (sentMessageIdsResolver.has(localId)) {
        const globalId = sentMessageIdsResolver.get(localId)!;
        const ackSendMessage: AckSendMessage = {
            type: 'ACK_SEND_MESSAGE',
            localId,
            globalId,
            chatId,
            timestamp: messagesList.find(message => message.ID === globalId)?.timestamp ?? Date.now(),
        };
        return ackSendMessage;  // send ready data
    }

    // checking for availability in the participants
    if (!chat?.participants?.has(selfId)) {
        const ackSendMessage: AckSendMessage = {
            type: 'DENIEN_SEND_MESSAGE',
            localId,
            chatId,
        };
        return ackSendMessage;  // acces denied (message cant'b be sent)
    }

    // create new message
    const globalId = randomUUID();
    const newMessage: Message = {
        ID: globalId,
        CHAT_ID: chatId,
        SENDER_ID: selfId,
        text,
        edited: false,
        timestamp: Date.now(),
    };
    messagesStore.addMessage(newMessage);
    // update chat lastMesage & updatedAt time
    chat.lastMessage = newMessage;
    chat.updatedAt = newMessage.timestamp;
    // add <local;global> id pair to "redix"
    sentMessageIdsResolver.add(localId, globalId);

    // push new message every other participant's sockets
    newMessagePush(newMessage, ws); 

    // create ack message
    const ackSendMessage: AckSendMessage = {
        type: 'ACK_SEND_MESSAGE',
        localId,
        globalId,
        chatId,
        timestamp: newMessage.timestamp,
    };
    return ackSendMessage;  // return the ack (to send)
}

function confirmGlobalID(payLoad: any, ws: WebSocketWithIp): {} {
    // data unpacking
    const { localId } = payLoad;
    ws; // useless hack

    sentMessageIdsResolver.resolve(localId);
    console.log(`essage, localId: ${localId} resolved!`);

    return {};
}

function deleteMessage(payLoad: any, ws: WebSocketWithIp): {} {
    const { chatId, messageId } = payLoad;
    const selfId = connectionsStore.getUserUUID(ws)!;

    const chat = chatsStorage.getChat(chatId);
    if (chat === undefined) {
        console.warn("unknown chat id");
        return {};
    }
    if (!chat.participants.has(selfId)) {
        console.warn("delete denied. User is not in chat participants");
        return {};
    }

    const messagesList = messagesStore.getMessagesList(chatId);
    const messageIndex = messagesList.findIndex(mes => mes.ID === messageId);
    if (messageIndex === -1) {
        console.warn("message not found");
        return {};
    }
    else if (messageIndex === messagesList.length - 1) { // delete last message => change chat { updatedAt, lastMessage }
        const prevMessage = messagesList[messageIndex - 1];
        if (prevMessage === undefined) {    // no more activity
            chat.updatedAt = chat.createdAt;
            delete chat.lastMessage;
        }
        else {
            chat.updatedAt = prevMessage.timestamp;
            chat.lastMessage = prevMessage;
        }
    }
    
    const deletingMessage = messagesList[messageIndex]!;

    // delete the message
    messagesList.splice(messageIndex, 1);

    // push all participants (avoid the delition initiator socket)
    deleteMessagePush(deletingMessage, ws);

    return {};
}

function editMessage(payLoad: any, ws: WebSocketWithIp): {} {
    const { chatId, messageId, newText } = payLoad;

    // get chat
    const chat = chatsStorage.getChat(chatId);
    if (chat === undefined) {
        console.warn("chat not found");
        return {};
    }

    // check editor role
    const editorId = connectionsStore.getUserUUID(ws)!;
    if (!chat.participants.has(editorId)) {
        console.warn("editor is not in participants");
        return {};
    }

    // get message
    const messagesList = messagesStore.getMessagesList(chatId);
    const message = messagesList.find(mes => mes.ID === messageId);
    if (message === undefined) {
        console.warn("message not found");
        return {};
    }

    if (!newText) {
        console.warn("edit newText is empty");
        return {};
    }

    // edit message
    message.text = newText;
    message.edited = true;

    // edit lastMessage in chat if last message
    if (chat.lastMessage !== undefined && chat.lastMessage?.ID === messageId) {
        chat.lastMessage.text = newText;
    }

    // push all participants
    updateMessagePush(message, ws);

    // return empty answer
    return {};
}

function replyMessage(payLoad: any, ws: WebSocketWithIp): AckSendMessage {
    // data unpacking
    const { localId, chatId, text, repliedMessageId } = payLoad;  

    const chat = chatsStorage.getChat(chatId);
    const messagesList = messagesStore.getMessagesList(chatId);
    const selfId = connectionsStore.getUserUUID(ws)!;

    // checking for duplicates
    if (sentMessageIdsResolver.has(localId)) {
        const globalId = sentMessageIdsResolver.get(localId)!;
        const ackSendMessage: AckSendMessage = {
            type: 'ACK_SEND_MESSAGE',
            localId,
            globalId,
            chatId,
            timestamp: messagesList.find(message => message.ID === globalId)?.timestamp ?? Date.now(),
        };
        return ackSendMessage;  // send ready data
    }

    // checking for availability in the participants
    if (!chat?.participants?.has(selfId)) {
        const ackSendMessage: AckSendMessage = {
            type: 'DENIEN_SEND_MESSAGE',
            localId,
            chatId,
        };
        return ackSendMessage;  // acces denied (message cant'b be sent)
    }

    // check replied message
    const rawRepliedMessage = messagesList.find(mes => mes.ID === repliedMessageId);
    if (rawRepliedMessage === undefined) {
        const ackSendMessage: AckSendMessage = {
            type: 'DENIEN_SEND_MESSAGE',
            localId,
            chatId,
        };
        return ackSendMessage;  // acces denied (no replied message in the chat)
    }
    const {...repliedMessage} = {...rawRepliedMessage};
    delete repliedMessage.repliedMessage; //HACK: delete replied message (if it's exists) in the replied to avoid unlimited chain of replied

    // create new message
    const globalId = randomUUID();
    const newMessage: Message = {
        ID: globalId,
        CHAT_ID: chatId,
        SENDER_ID: selfId,
        text,
        edited: false,
        repliedMessage,
        timestamp: Date.now(),
    };

    messagesStore.addMessage(newMessage);
    // update chat lastMesage & updatedAt time
    chat.lastMessage = newMessage;
    chat.updatedAt = newMessage.timestamp;
    // add <local;global> id pair to "redix"
    sentMessageIdsResolver.add(localId, globalId);

    // push new message every other participant's sockets
    newMessagePush(newMessage, ws); 

    // create ack message
    const ackSendMessage: AckSendMessage = {
        type: 'ACK_SEND_MESSAGE',
        localId,
        globalId,
        chatId,
        timestamp: newMessage.timestamp,
    };
    return ackSendMessage;  // return the ack (to send)
}