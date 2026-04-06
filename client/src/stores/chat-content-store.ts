import type { UUID } from "@/types/UUID";
import type { ChatContent } from "@/types/chatContent";
import type { GetChatContentPacket } from "@/types/web-socket/client/get-chat-content-packet";
import type { Message } from "@/types/message";

import { defineStore } from "pinia";
import { LRUcache } from "@/utils/lru-cache";
import { useWebSocketStore } from "./useWebSocketStore";


export const useChatContentStore = defineStore('chatContent', () => {
    // --- state
    const chatContents = new LRUcache<UUID, ChatContent>(10); // max size = 10

    let resolveFetchMessagesPromise: ((value: void | PromiseLike<void>) => void) | null = null;
    const MAX_MESSAGES_COUNT = 60;

    const socketStore = useWebSocketStore();

    // --- getters
    const getChatContent = (chatId: UUID): ChatContent => {
        const existing = chatContents.get(chatId);
        if (!existing) {
            const newChatContent: ChatContent = {
                messages: [],
                chatId,
                isLoading: true,
                hasMoreOlder: false,
                hasMoreNewer: false,
            };

            addChatContent(newChatContent);
            fetchStartContent(chatId);
            return chatContents.get(chatId)!;
        }
        
        return existing;
    }

    // --- actions
    const addChatContent = (chatContent: ChatContent): boolean => {
        if (chatContents.has(chatContent.chatId)) return false;

        chatContents.put(chatContent.chatId, chatContent);
        return true;
    }

    const fetchStartContent = (chatId: UUID): void => {
        const chatContent = getChatContent(chatId);
        chatContent.isLoading = true;

        const chatContentPacket: GetChatContentPacket = {
            type: 'GET_CHAT_CONTENT',
            chatId,
        };

        socketStore.send(chatContentPacket);
    }

    const fetchOlderMessages = async (chatId: UUID): Promise<void> => {
        const chatContent = getChatContent(chatId);
        if (chatContent.isLoading) return;
        if (!chatContent.hasMoreOlder) return;

        const anchorMessage: Message | undefined = chatContent.messages[0];
        if (anchorMessage === undefined) {
            console.warn("trying to fetch older without anchor message");
            return;
        }

        const chatContentPacket: GetChatContentPacket = {
            type: 'GET_CHAT_CONTENT',
            chatId,
            anchorMessageId: anchorMessage.ID,
            loadOlder: true,
        };

        socketStore.send(chatContentPacket);
        chatContent.isLoading = true;
        
        // create promise
        if (resolveFetchMessagesPromise !== null) {
            resolveFetchMessagesPromise();
            resolveFetchMessagesPromise = null;
        }
        
        return new Promise((resolve) => {
            resolveFetchMessagesPromise = resolve;
        });
    }

    const fetchNewerMessages = async (chatId: UUID): Promise<void> => {
        const chatContent = getChatContent(chatId);
        if (chatContent.isLoading) return;
        if (!chatContent.hasMoreNewer) return;

        const anchorMessage: Message | undefined = chatContent.messages[chatContent.messages.length - 1];
        if (anchorMessage === undefined) {
            console.warn("trying to fetch older without anchor message");
            return;
        }

        const chatContentPacket: GetChatContentPacket = {
            type: 'GET_CHAT_CONTENT',
            chatId,
            anchorMessageId: anchorMessage.ID,
            loadNewer: true,
        };

        socketStore.send(chatContentPacket);
        chatContent.isLoading = true;

        // create promise
        if (resolveFetchMessagesPromise !== null) {
            resolveFetchMessagesPromise();
            resolveFetchMessagesPromise = null;
        }

        return new Promise((resolve) => {
            resolveFetchMessagesPromise = resolve;
        });
    }

    const appendMessages = (chatId: UUID, messages: Message[], hasMoreOlder: boolean | undefined, hasMoreNewer: boolean | undefined): void => {
        const chatContent = getChatContent(chatId);
        const chatMessages = chatContent.messages;

        chatContent.hasMoreNewer = hasMoreNewer || false;
        if (chatMessages.length === 0) chatContent.hasMoreOlder = hasMoreOlder || false;

        chatMessages.push(...messages);
        
        chatContent.isLoading = false;
        if (resolveFetchMessagesPromise !== null) {
            resolveFetchMessagesPromise();
            resolveFetchMessagesPromise = null;
        }
    }

    const prependMessages = (chatId: UUID, messages: Message[], hasMoreOlder: boolean | undefined, hasMoreNewer: boolean | undefined): void => {
        const chatContent = getChatContent(chatId);
        const chatMessages = chatContent.messages;

        chatContent.hasMoreOlder = hasMoreOlder || false;
        if (chatMessages.length === 0) chatContent.hasMoreNewer = hasMoreNewer || false;

        chatMessages.unshift(...messages);

        chatContent.isLoading = false;
        if (resolveFetchMessagesPromise !== null) {
            resolveFetchMessagesPromise();
            resolveFetchMessagesPromise = null;
        }
    }

    const removefirstsExtraMessages = (chatId: UUID) => {
        const chatContent = getChatContent(chatId);
        const chatMessages = chatContent.messages; 

        const extraMessagesCount = chatMessages.length - MAX_MESSAGES_COUNT;
        if (extraMessagesCount > 0) { 
            chatMessages.splice(0, extraMessagesCount);
            chatContent.hasMoreOlder = true; 
        }
    }
    const removelastsExtraMessages = (chatId: UUID) => {
        const chatContent = getChatContent(chatId);
        const chatMessages = chatContent.messages; 

        const extraMessagesCount = chatMessages.length - MAX_MESSAGES_COUNT;
        if (extraMessagesCount > 0) {
            chatMessages.splice(chatMessages.length - extraMessagesCount + 1, extraMessagesCount);
            chatContent.hasMoreNewer = true;
        }
    }

    return { getChatContent, appendMessages, prependMessages, fetchNewerMessages, fetchOlderMessages, fetchStartContent, removefirstsExtraMessages, removelastsExtraMessages };
});