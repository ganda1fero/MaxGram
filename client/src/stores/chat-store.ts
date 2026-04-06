import type { Chat } from "@/types/chat";
import type { UUID } from "@/types/UUID";
import type { Message } from "@/types/message";
import type { GetChatPacket } from "@/types/web-socket/client/get-chat-packet";
import type { GetAllChatsPacket } from "@/types/web-socket/client/get-all-chats-packet";
import type { GetPrivateChatIdPacket } from "@/types/web-socket/client/get-private-chat-id-packet";
import type { SendMessagePacket } from "@/types/web-socket/client/send-message-packet";

import { defineStore } from "pinia";
import { ref, computed } from 'vue'
import { LRUcache } from "@/utils/lru-cache";
import { useAuthStore } from "./useAuthStore";
import { useWebSocketStore } from "./useWebSocketStore";
import { useUiStore } from "./ui-store";
import { useChatContentStore } from "./chat-content-store";


export const useChatStore = defineStore('chat', () => {
    // --- state
    const chats = new LRUcache<UUID, Chat>(50); // max size = 50
    const activeChat = ref<UUID | null>(null);
    const chatIdsSet = ref<Set<UUID>>(new Set());

    const socketStore = useWebSocketStore();
    const authStore = useAuthStore();
    const uiStore = useUiStore();
    const chatContentStore = useChatContentStore();
    
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
                /*  NOTE: if chat is loading, chat.updatedAt gonna be = 0
                    So if only one of chats is loading, second wiil be upper
                    if both of them are loading, sorting is not performed
                    and it will be updated after the download is completed  
                */   
                return chatB.updatedAt - chatA.updatedAt;
            });
        return sortedChatsList;
    });

    // --- actions
    const addChat = (chat: Chat): boolean => {
        const isExisting = chats.has(chat.ID);
        if (isExisting) {
            console.log("This chat already exists");
            return false;
        }

        chats.put(chat.ID, chat);

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
    const chatIdsListAdd = (chatId: UUID): void => {
        chatIdsSet.value.add(chatId);
    }
    const chatIdsListDelete = (chatId: UUID): boolean => {
        return chatIdsSet.value.delete(chatId);
    }

    const sendMessage = (): boolean => {
        const chatId = activeChat.value;
        const selfId = authStore.getUUID();
        const input = uiStore.chat.chatInput;
        
        if (chatId === null) return false;
        if (selfId === null) return false;
        if (input.length === 0) return false;

        const localId = crypto.randomUUID();
        const sendMessagePacket: SendMessagePacket = {
            type: 'SEND_MESSAGE',
            localId,
            chatId: chatId,
            text: input,
        };
        socketStore.send(sendMessagePacket);

        const localMessage: Message = { 
            ID: localId,
            technicalId: crypto.randomUUID(),
            CHAT_ID: chatId,
            SENDER_ID: selfId,
            text: input,
            status: 'sending',
            timestamp: Date.now(),
        };

        const chatContent = chatContentStore.getChatContent(chatId);
        if (!chatContent.hasMoreNewer) {

            chatContent.messages.push(localMessage);
        }

        const chat = getChat(chatId);
        chat.lastMessage = localMessage;
        chat.updatedAt = localMessage.timestamp;

        uiStore.chat.chatInput = ''; // clear chat input 

        return true;
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

    return { getChat, getSortedChatIds, upsertChat, getActiveChat, getActiveChatId, openChat, closeChat, fetchGetPrivateChatId, initChatsList, setChatIdsList, chatIdsListAdd, chatIdsListDelete, sendMessage };
});