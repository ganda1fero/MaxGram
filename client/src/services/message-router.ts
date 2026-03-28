import type { Packet } from "@/types/web-socket/packet";
import type { AckAuth } from "@/types/web-socket/server/ack-auth";
import type { AckGetUser } from "@/types/web-socket/server/ack-get-user";
import type { AckSearchUsers } from "@/types/web-socket/server/ack-search-users";
import type { AckGetChatContent } from "@/types/web-socket/server/ack-get-chat-content";
import type { AckGetPrivateChatId } from "@/types/web-socket/server/ack-get-private-chat-id";

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
        isLoad: false,
        ...other,
    });
}

function ackSearchUsers(payLoad: AckSearchUsers): void {
    const searchStore = useSearchStore();

    searchStore.setResults(payLoad.result);
}

function ackInitChatContent(payLoad: AckGetChatContent ): void {
    const chatContentStore = useChatContentStore();

    const { type, chatId, ...other } = payLoad;

    const chatContent = chatContentStore.getChatContent(payLoad.chatId);

    Object.assign(chatContent, other);
    chatContent.isLoading = false;
}

function ackLoadingChatContent(payLoad: AckGetChatContent ): void {
    const chatContentStore = useChatContentStore();

    const { chatId, pivotMessageId, messages, hasMoreOlder, hasMoreNewer } = payLoad;

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
    uiStore.isSearchMode = false;
    searchStore.setResults([]);
}