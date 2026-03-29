import type { Chat } from "@/types/chat";
import type { UUID } from "@/types/UUID";
import type { GetChatPacket } from "@/types/web-socket/client/get-chat-packet";
import type { GetAllChatsPacket } from "@/types/web-socket/client/get-all-chats-packet";
import type { GetPrivateChatIdPacket } from "@/types/web-socket/client/get-private-chat-id-packet";

import { defineStore } from "pinia";
import { ref, computed } from 'vue'
import { useWebSocketStore } from "./useWebSocketStore";


export const useChatStore = defineStore('chat', () => {
    // --- state
    const chats = ref(new Map<UUID, Chat>(new Map()));
    const activeChat = ref<UUID | null>(null);
    const chatIdsSet = ref<Set<UUID>>(new Set());

    const LRUcache = new Set<UUID>();
    const MAX_CHATS_COUNT = 50;

    const socketStore = useWebSocketStore();
    
    // --- getters
    const getChat = (chatId: UUID): Chat => {
        const existing = chats.value.get(chatId);
        if (!existing) {
            const newChat: Chat = {
                ID: chatId,
                type: 'private',
                isLoading: true,
                participants: new Set(),
                updatedAt: 0,
            };

            addChat(newChat);

            fetchGetChat(chatId);

            return newChat;
        }

        LRUcache.delete(existing.ID);
        LRUcache.add(existing.ID);
        
        return existing; 
    }

    const getActiveChatId = (): UUID | null => {
        return activeChat.value;
    }

    const getActiveChat = (): Chat | undefined => {
        const chatId = getActiveChatId();
        if (!chatId) return;

        return getChat(chatId);
    }

    const getSortedChatIds = computed(() => {
        const sortedChatsList = Array.from(chatIdsSet.value)
            .sort((chatAId, chatBId) => {
                const chatA = getChat(chatAId);
                const chatB = getChat(chatBId);
                return chatB.updatedAt - chatA.updatedAt;
            });
        return sortedChatsList;
    });

    // --- actions
    const addChat = (chat: Chat): boolean => {
        const existing = chats.value.get(chat.ID);
        if (existing) {
            console.log("This chat already exists");
            return false;
        }

        chats.value.set(chat.ID, chat);
        
        LRUcache.add(chat.ID);
        if (LRUcache.size > MAX_CHATS_COUNT) {
            const firstKey = LRUcache.keys().next().value;
            if (firstKey) {
                LRUcache.delete(firstKey);
                chats.value.delete(firstKey);
            }
        }

        return true;
    }

    const upsertChat = (chatData: Partial<Chat> & { readonly ID: UUID }): void => {
        const chat = getChat(chatData.ID);

        Object.assign(chat, chatData);
    }

    const openChat = (chatId: UUID) => {
        activeChat.value = chatId;
    }

    const closeChat = () => {
        activeChat.value = null;
    }

    const initChatsList = (): void => {
        const getAllChatsPacketObj: GetAllChatsPacket = {
            type: 'GET_ALL_CHATS',
        };

        socketStore.sendUnreliable(getAllChatsPacketObj);
    }
    const setChatIdsList = (newChatIdsList: UUID[]): void => {
        chatIdsSet.value = new Set(newChatIdsList);
    }

    const fetchGetChat = (chatId: UUID): void => {
        const getChatPacketObj: GetChatPacket = {
            type: 'GET_CHAT',
            chatId,
        };

        socketStore.send(getChatPacketObj);
    }

    const fetchGetPrivateChatId = (otherUserId: UUID) => {
        const getPrivateChatIdPacketObj: GetPrivateChatIdPacket = {
            type: 'GET_PRIVATE_CHAT_ID',
            otherUserId,
        }

        socketStore.send(getPrivateChatIdPacketObj);
    }

    return { getChat, getSortedChatIds, upsertChat, getActiveChat, getActiveChatId, openChat, closeChat, fetchGetPrivateChatId, initChatsList, setChatIdsList };
});