import type { Packet } from "@/types/web-socket/packet";
import type { UUID } from "@/types/UUID";
import type { Chat } from "@/types/chat";
import type { Message } from "@/types/message";
import type { AckAuth } from "@/types/web-socket/server/ack-auth";
import type { AckGetUser } from "@/types/web-socket/server/ack-get-user";
import type { AckSearchUsers } from "@/types/web-socket/server/ack-search-users";
import type { AckGetChatContent } from "@/types/web-socket/server/ack-get-chat-content";
import type { AckGetPrivateChatId } from "@/types/web-socket/server/ack-get-private-chat-id";
import type { AckGetChat } from "@/types/web-socket/server/ack-get-chat";
import type { AckGetAllChats } from "@/types/web-socket/server/ack-get-all-chats";
import type { AckSendMessage } from "@/types/web-socket/server/ack-send-message";
import type { PushNewMessage } from "@/types/web-socket/server/push-new-message";
import type { ConfirmGlobalId } from "@/types/web-socket/client/confirm-global-id";
import type { PushUpdateUser } from "@/types/web-socket/server/push-update-user";
import type { PushDeleteMessage } from "@/types/web-socket/server/push-delete-message";
import type { PushUpdateMessage } from "@/types/web-socket/server/push-update-message";
import type { AckGetParticipantsInfo } from "@/types/web-socket/server/ack-get-participants-info";

import { useAuthStore } from "@/stores/useAuthStore";
import { useUsersStore } from "@/stores/useUsersStore";
import { useSearchStore } from "@/stores/useSearchStore";
import { useChatContentStore } from "@/stores/chat-content-store";
import { useChatStore } from "@/stores/chat-store";
import { useUiStore } from "@/stores/ui-store";
import { useWebSocketStore } from "@/stores/useWebSocketStore";

export function handleIncomingPacket(data: Packet) {
    const { payLoad } = data;

    switch (payLoad.type) {
        case 'ACK_AUTH':
            ackAuth(payLoad);
            break;
        case 'ACK_GET_USER':
            ackGetUser(payLoad);
            break;
        case 'ACK_SEARCH_USERS':
            ackSearchUsers(payLoad);
            break;
        case 'INIT_CHAT_CONTENT':
            ackInitChatContent(payLoad);
            break;
        case 'LOADING_CHAT_CONTENT':
            ackLoadingChatContent(payLoad);
            break;
        case 'GET_PRIVATE_CHAT_ID':
            ackGetPrivateChatId(payLoad);
            break;
        case 'GET_CHAT':
            ackGetChat(payLoad);
            break;
        case 'GET_ALL_CHATS':
            ackGetAllChats(payLoad);
            break;
        case 'ACK_SEND_MESSAGE':
        case 'DENIEN_SEND_MESSAGE':
            ackSendMessage(payLoad);
            break;
        case 'PUSH_NEW_MESSAGE':
            pushNewMessage(payLoad);
            break;
        case 'PUSH_UPDATE_USER':
            pushUpdateUser(payLoad);
            break;
        case 'PUSH_DELETE_MESSAGE':
            pushDeleteMessage(payLoad);
            break;
        case 'PUSH_UPDATE_MESSAGE':
            pushUpdateMessage(payLoad);
            break;
        case 'GET_PARTICIPANTS_INFO':
            ackGetParticipantsInfo(payLoad);
            break;
        case undefined: // do nothing
            break;
        default:    // unknown type!
            console.warn("Unknown packet type!", payLoad.type);
            break;
    }
};

function ackAuth(payLoad: AckAuth): void {
    const authStore = useAuthStore();

    authStore.setUUID(payLoad.UUID);
    authStore.confirmAuth();

    const chatStore = useChatStore();
    chatStore.initChatsList();
}

function ackGetUser(payLoad: AckGetUser): void {
    const usersStore = useUsersStore();
    
    const { type, ...other } = payLoad;

    usersStore.upsertUser({
        ...other,
        isLoading: false,
    });
}

function ackSearchUsers(payLoad: AckSearchUsers): void {
    const searchStore = useSearchStore();

    searchStore.setResults(payLoad.result);
}

function ackInitChatContent(payLoad: AckGetChatContent ): void {
    const chatContentStore = useChatContentStore();

    const { type, chatId, pivotMessageId, messages, hasMoreNewer, hasMoreOlder } = payLoad;
    messages.forEach(message => {
        message.technicalId = crypto.randomUUID();
    });

    chatContentStore.initMessages(chatId, messages, hasMoreNewer || false, hasMoreOlder || false);
}

function ackLoadingChatContent(payLoad: AckGetChatContent ): void {
    const chatContentStore = useChatContentStore();

    const { chatId, pivotMessageId, messages, hasMoreOlder, hasMoreNewer } = payLoad;
    messages.forEach(message => {
        message.technicalId = crypto.randomUUID();
    });

    const chatContent = chatContentStore.getChatContent(chatId);
    if (chatContent.messages[0]?.ID === pivotMessageId) { // prepend
        chatContentStore.prependMessages(chatId, messages, hasMoreOlder, hasMoreNewer);
    } else if (chatContent.messages[chatContent.messages.length - 1]?.ID === pivotMessageId) {    // append
        chatContentStore.appendMessages(chatId, messages, hasMoreOlder, hasMoreNewer);
    } else {
        console.warn('pivot message is not first or last elem in messages list');
    }
}

function ackGetPrivateChatId(payLoad: AckGetPrivateChatId): void {
    const chatStore = useChatStore();
    const uiStore = useUiStore();
    const searchStore = useSearchStore();

    const { chatId } = payLoad;

    chatStore.openChat(chatId);
    uiStore.sidebar.isSearchMode = false;
    searchStore.setResults([]);

    chatStore.chatIdsListAdd(chatId);
}

function ackGetChat(payLoad: AckGetChat): void {
    const { payLoad: rawChat } = payLoad;
    const chatData: Partial<Chat> & { ID: UUID } = {
        ...rawChat,
        isLoading: false,
        participants: new Set(rawChat.participants)
    };

    const chatStore = useChatStore();
    chatStore.upsertChat(chatData);
}

function ackGetAllChats(payLoad: AckGetAllChats): void {
    const { chats: chatIds } = payLoad;

    const chatStore = useChatStore();
    chatStore.setChatIdsList(chatIds);
}

function ackSendMessage(payLoad: AckSendMessage): void {
    const { type, localId, globalId, chatId, timestamp } = payLoad;

    const chatContentStore = useChatContentStore();
    const chatContent = chatContentStore.getChatContent(chatId);
    const message = chatContent.messages.find(msg => msg.ID === localId);
    if (!message) {
        console.warn("local message not found");
        return;
    }

    if (type === 'DENIEN_SEND_MESSAGE') {
        message.status = 'deniend';
        return;
    }

    // type = ACK_SEND_MESSAGE
    message.ID = globalId!,
    delete message.status;
    message.timestamp = timestamp!;

    //HACK: need to make it easier
    chatContent.messages.sort((messageA, messageB) => messageA.timestamp - messageB.timestamp);

    // create confirm message
    const socketStore = useWebSocketStore(); 
    const confirmGlobalId: ConfirmGlobalId = {
        type: 'CONFIRM_GLOBAL_ID',
        localId,
    };
    socketStore.send(confirmGlobalId);
    
    return;
}

function pushNewMessage(payLoad: PushNewMessage): void {
    const { id, chatId, senderId, text, repliedMessage, timestamp } = payLoad;

    const chatStore = useChatStore();
    const chatContentStore = useChatContentStore();

    const newMessage: Message = {
        ID: id,
        technicalId: crypto.randomUUID(),
        CHAT_ID: chatId,
        SENDER_ID: senderId,
        text,
        edited: false,
        repliedMessage,
        timestamp,
    };

    const chat = chatStore.getChat(chatId);
    chat.lastMessage = newMessage;
    chat.updatedAt = newMessage.timestamp;

    chatStore.chatIdsListAdd(chatId);

    const chatContent = chatContentStore.getChatContent(chatId);
    if (!chatContent.hasMoreNewer) 
        chatContent.messages.push(newMessage);

    return;
}

function pushUpdateUser(payLoad: PushUpdateUser): void {
    // unpacking message
    const { type, ...rawUserUpdate } = payLoad;
    const cleanedUserUpdate = Object.fromEntries(
        Object.entries(rawUserUpdate).filter(([_, value]) => value !== undefined)
    ) as PushUpdateUser;

    // update user data
    const usersStore = useUsersStore();
    usersStore.upsertUser(cleanedUserUpdate);

    //
    if (cleanedUserUpdate.status === undefined) return;
    const uiStore = useUiStore();
    uiStore.sidebar.onlineCount! += (cleanedUserUpdate.status === 'online') ? 1 : -1;
}

function pushDeleteMessage(payLoad: PushDeleteMessage): void {
    // unpacking message
    const { chatId, messageId } = payLoad;

    // init stores
    const chatsStore = useChatStore();
    const chatContentStore = useChatContentStore();

    // load chat and chatContent
    const chat = chatsStore.getChat(chatId);
    const chatContent = chatContentStore.getChatContent(chatId);

    // delete message
    const messagesList = chatContent.messages;
    const messageIndex = messagesList.findIndex(mes => mes.ID === messageId);
    if (messageIndex !== -1) { // delete only if exists
        messagesList.splice(messageIndex, 1);
    }

    if (messageIndex === messagesList.length) { // was deleted 'newest' message 
        const prevMessage = messagesList[messageIndex - 1];
        if (prevMessage === undefined) { // local delete the chat (it's empty)
            chatsStore.chatIdsListDelete(chatId);
        }
        else {
            chat.updatedAt = prevMessage.timestamp;
            chat.lastMessage = prevMessage;
        }
    }
    
    // clear modifier if deleted modifyered message
    const uiStore = useUiStore();
    const modifyingdMessage = uiStore.chat.modifyingMessage;
    if (modifyingdMessage === null) return;

    if (modifyingdMessage.ID === messageId && modifyingdMessage.CHAT_ID === chatId)
        uiStore.chat.stopModifier();
}

function pushUpdateMessage(payLoad: PushUpdateMessage): void {
    // unpacking message
    const { messageData } = payLoad;
    const { ID: messageId, CHAT_ID: chatId } = messageData

    // init stores
    const chatsStore = useChatStore();
    const chatContentStore = useChatContentStore();

    // get chat, chatContent, messageIndex
    const chat = chatsStore.getChat(chatId);
    const chatContent = chatContentStore.getChatContent(chatId);
    if (chat.lastMessage !== undefined && chat.lastMessage.ID === messageId) // edit lastMesasge in chat if editing message was last in the chat
        Object.assign(chat.lastMessage, messageData);

    const messageIndex = chatContent.messages.findIndex(mes => mes.ID === messageId);
    if (messageIndex === -1) return;

    // edit message
    Object.assign(chatContent.messages[messageIndex]!, messageData); //NOTE: do not refactor it (needs to ref)
}

function ackGetParticipantsInfo(payLoad: AckGetParticipantsInfo): void {
    // unpacking message
    const { participantsCount, onlineCount } = payLoad;

    const uiStore = useUiStore();

    uiStore.sidebar.participantsCount = participantsCount;
    uiStore.sidebar.onlineCount = onlineCount;
}