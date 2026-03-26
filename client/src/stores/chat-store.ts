import type { Chat } from "@/types/chat";
import type { UUID } from "@/types/UUID";
import type { Ref } from 'vue'
import type { GetChatPacket } from "@/types/web-socket/client/get-chat-packet";

import { defineStore } from "pinia";
import { ref } from 'vue'
import { useWebSocketStore } from "./useWebSocketStore";


export const useChatStore = defineStore('chat', () => {
    // --- state
    const chats = new Map<UUID, Ref<Chat>>();

    const LRUcache = new Set<UUID>();
    const MAX_CHATS_COUNT = 50;

    const socketStore = useWebSocketStore();
    
    // --- getters
    const getChat = (chatId: UUID): Chat => {
        const existing = chats.get(chatId);
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

        LRUcache.delete(existing.value.ID);
        LRUcache.add(existing.value.ID);
        
        return existing.value; 
    }

    // --- actions
    const addChat = (chat: Chat): boolean => {
        const existing = chats.get(chat.ID);
        if (existing) {
            console.log("This chat already exists");
            return false;
        }

        chats.set(chat.ID, ref(chat));
        
        LRUcache.add(chat.ID);
        if (LRUcache.size > MAX_CHATS_COUNT) {
            const firstKey = LRUcache.keys().next().value;
            if (firstKey) {
                LRUcache.delete(firstKey);
                chats.delete(firstKey);
            }
        }

        return true;
    }

    const fetchGetChat = (chatId: UUID): void => {
        const getChatPacketObj: GetChatPacket = {
            type: 'GET_CHAT',
            chatId,
        };

        socketStore.send(getChatPacketObj);
    }

    return { getChat };
});