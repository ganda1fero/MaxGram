import type { Chat } from "@/types/chat";
import type { UUID } from "@/types/UUID";
import type { Ref } from 'vue'
import type { GetChatPacket } from "@/types/web-socket/client/get-chat-packet";

import { defineStore } from "pinia";
import { ref, computed } from 'vue'
import { useWebSocketStore } from "./useWebSocketStore";


export const useChatStore = defineStore('chat', () => {
    // --- state
    const chats = ref(new Map<UUID, Chat>());

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

    const getSortedChatsId = computed(() => {
        const chatList = Array.from(chats.value.entries())
            .sort(([, chatA], [, chatB]) => {
                return chatB.updatedAt - chatA.updatedAt;
            })
            .map(([id]) => id);
        
        return chatList;
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

    const fetchGetChat = (chatId: UUID): void => {
        const getChatPacketObj: GetChatPacket = {
            type: 'GET_CHAT',
            chatId,
        };

        socketStore.send(getChatPacketObj);
    }

    return { getChat, getSortedChatsId };
});