import type { Message } from "@/types/message";
import type { UUID } from "@/types/UUID";
import type { DeleteMessagePacket } from "@/types/web-socket/client/delete-message-packet";

import { defineStore } from "pinia";
import { ref } from "vue";

import { useWebSocketStore } from "./useWebSocketStore";
import { useChatStore } from "./chat-store";
import { useChatContentStore } from "./chat-content-store"; 

export const useUiStore = defineStore('ui', () => {
    // --- state
    const socketStore = useWebSocketStore();
    const chatsStore = useChatStore();
    const chatContentStore = useChatContentStore();

    // sidebar
    const isSearchMode = ref<boolean>(false);

    // chat
    const inputModifier = ref<'edit' | 'reply' | null>(null);
    const modifyingMessage = ref<Message | null>(null);

    const chatInput = ref<string>('');
    const emojiButtonState = ref<boolean>(false);
    const addMediaButtonState = ref<boolean>(false);

    const lastSelectedMessage = ref<Message | null>(null);
    const highlightedMessageId = ref<UUID | null>(null);

    // --- actions
    const copyLastSelectedMessage = (): boolean => {
        if (lastSelectedMessage.value === null) return false;

        navigator.clipboard.writeText(lastSelectedMessage.value.text);

        lastSelectedMessage.value = null;
        return true;
    }
    const deleteLastSelectedMessage = (): void => {
        if (lastSelectedMessage.value == null) return;

        const { ID: messageId, CHAT_ID: chatId } = lastSelectedMessage.value;

        const deleteMessagePacket: DeleteMessagePacket = {
            type: 'DELETE_MESSAGE_PACKET',
            messageId,
            chatId,
        };

        socketStore.send(deleteMessagePacket);
        lastSelectedMessage.value = null;

        // local delete the message
        const chat = chatsStore.getChat(chatId);
        const chatContent = chatContentStore.getChatContent(chatId);

        const messagesList = chatContent.messages;
        const messageIndex = messagesList.findIndex(mes => mes.ID === messageId)!;

        chatContent.messages.splice(messageIndex, 1);

        if (messageIndex === messagesList.length) {
            const prevMessage = messagesList[messageIndex - 1];
            if (prevMessage === undefined){
                chat.updatedAt = 0;
                chat.lastMessage = undefined;
            }
            else {
                chat.updatedAt = prevMessage.timestamp;
                chat.lastMessage = prevMessage;
            }
        }

        // clear modifier states if deleted message
        if (modifyingMessage.value === lastSelectedMessage.value)
            stopModifier();
    }
    const editLastSelectedMessage = (): void => {
        inputModifier.value = 'edit';
        modifyingMessage.value = lastSelectedMessage.value;
        chatInput.value = modifyingMessage.value?.text || '';
    }
    const replyLastSelectedMessage = (): void => {
        inputModifier.value = 'reply';
        modifyingMessage.value = lastSelectedMessage.value;
    }

    const stopModifier = (): void => {
        if (inputModifier.value !== null)
            chatInput.value = '';   // clear input

        inputModifier.value = null;
        modifyingMessage.value = null;
    }
    
    // --- getters
    const sidebar = { isSearchMode };
    const chat = { 
        chatInput, 
        inputModifier,
        modifyingMessage,
        stopModifier,
        emojiButtonState,
        addMediaButtonState,
        highlightedMessageId, 
        'lastSelectedMessage': { 
            value: lastSelectedMessage,
            'copyToClipboard': copyLastSelectedMessage,
            'delete': deleteLastSelectedMessage,
            'edit': editLastSelectedMessage,
            'reply': replyLastSelectedMessage,
        },
    };
    

    return { sidebar, chat, };
});