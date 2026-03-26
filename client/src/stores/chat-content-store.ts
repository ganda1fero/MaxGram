import type { UUID } from "@/types/UUID";
import type { ChatContent } from "@/types/chatContent";
import type { Ref } from 'vue'
import type { GetChatContentPacket } from "@/types/web-socket/client/get-chat-content-packet";
import type { Message } from "@/types/message";

import { ref } from "vue";
import { defineStore } from "pinia";
import { useWebSocketStore } from "./useWebSocketStore";


export const useChatContentStore = defineStore('chatContent', () => {
    // --- state
    const chatContents = new Map<UUID, Ref<ChatContent>>(); // UUID = chat uuid

    const LRUcache = new Set<UUID>();   // UUID = chat uuid
    const MAX_LRU_COUNT = 10;

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

        LRUcache.delete(existing.value.chatId);
        LRUcache.add(existing.value.chatId);
        return existing.value;
    }

    // --- actions
    const addChatContent = (chatContent: ChatContent): boolean => {
        if (chatContents.has(chatContent.chatId)) return false;

        LRUcache.add(chatContent.chatId);
        if (LRUcache.size >= MAX_LRU_COUNT) {
            const firstKey = LRUcache.keys().next().value;
            if (firstKey) {
                LRUcache.delete(firstKey);
                chatContents.delete(firstKey);
            }
        }

        const refChatContent: Ref<ChatContent> = ref(chatContent);
        chatContents.set(chatContent.chatId, refChatContent);
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