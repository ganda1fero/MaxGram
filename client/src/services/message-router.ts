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

import { useAuthStore } from "@/stores/useAuthStore";
import { useUsersStore } from "@/stores/useUsersStore";
import { useSearchStore } from "@/stores/useSearchStore";
import { useChatContentStore } from "@/stores/chat-content-store";
import { useChatStore } from "@/stores/chat-store";
import { useUiStore } from "@/stores/ui-store";

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
            ackSendMEssage(payLoad);
            break;
        case 'PUSH_NEW_MESSAGE':
            pushNewMessage(payLoad);
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

    const { type, chatId, ...other } = payLoad;
    other.messages.forEach(message => {
        message.technicalId = crypto.randomUUID();
    });

    const chatContent = chatContentStore.getChatContent(payLoad.chatId);

    Object.assign(chatContent, other);
    chatContent.isLoading = false;
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
    } else if (chatContent.messages[-1]?.ID === pivotMessageId) {    // append
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

function ackSendMEssage(payLoad: AckSendMessage): void {
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

    //TODO: sort the messages by timestamp (local message can move up) 
    
    return;
}

function pushNewMessage(payLoad: PushNewMessage): void {
    const { id, chatId, senderId, text, timestamp } = payLoad;

    const chatStore = useChatStore();
    const chatContentStore = useChatContentStore();

    const newMessage: Message = {
        ID: id,
        technicalId: crypto.randomUUID(),
        CHAT_ID: chatId,
        SENDER_ID: senderId,
        text,
        timestamp,
    };

    const chat = chatStore.getChat(chatId);
    chat.lastMessage = newMessage;
    chat.updatedAt = newMessage.timestamp;

    const chatContent = chatContentStore.getChatContent(chatId);
    if (!chatContent.hasMoreNewer) 
        chatContent.messages.push(newMessage);

    return;
}