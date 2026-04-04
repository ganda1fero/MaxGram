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
            }

            addChatContent(newChatContent);
            fetchStartContent(chatId);
            return newChatContent;
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
        const chatContentPacket: GetChatContentPacket = {
            type: 'GET_CHAT_CONTENT',
            chatId,
        };

        socketStore.send(chatContentPacket);
    }

    const appendMessages = (chatId: UUID, messages: Message[], hasMoreOlder: boolean | undefined, hasMoreNewer: boolean | undefined): void => {
        const chatContent = getChatContent(chatId);
        const chatMessages = chatContent.messages;

        chatContent.hasMoreNewer = hasMoreNewer || false;
        if (chatMessages.length === 0) chatContent.hasMoreOlder = hasMoreOlder || false;

        chatMessages.push(...messages);
    }

    const prependMessages = (chatId: UUID, messages: Message[], hasMoreOlder: boolean | undefined, hasMoreNewer: boolean | undefined): void => {
        const chatContent = getChatContent(chatId);
        const chatMessages = chatContent.messages;

        chatContent.hasMoreOlder = hasMoreOlder || false;
        if (chatMessages.length === 0) chatContent.hasMoreNewer = hasMoreNewer || false;

        chatMessages.unshift(...messages);
    }

    // fetchOlder method

    // fetchNewer method

    return { getChatContent, appendMessages, prependMessages };
});