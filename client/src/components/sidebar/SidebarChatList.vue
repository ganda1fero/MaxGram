<script setup lang="ts">

    import { useChatStore } from '@/stores/chat-store';

    import ChatItem from '@/components/sidebar/ui/ChatItem.vue';


    const chatStore = useChatStore(); 

</script>
<template>
    <div class="chats-container">
        <TransitionGroup name="chat-list">
            <ChatItem
                v-for="chatId in chatStore.getSortedChatIds"
                :key="chatId"
                :chat="chatStore.getChat(chatId)"
                @click="chatStore.openChat(chatId)"
            />
        </TransitionGroup>
    </div>
</template>
<style scoped>
    .chats-container{
        display: flex;
        flex-direction: column;
        box-sizing: border-box;

        width: 100%;
        height: 100%;
        padding: 8px 0 8px 8px;

        overflow-x: hidden;
        overflow-y: auto;
        scrollbar-gutter: stable;
        scrollbar-color: transparent transparent;
        scrollbar-width: thin;
        transition: scrollbar-color 0.2s ease;
        white-space: nowrap;
        &::-webkit-scrollbar {
            width: 4px;
        }
        &::-webkit-scrollbar-thumb {
            background-color: transparent;
            border-radius: 10px;
            border: 2px solid transparent; 
            background-clip: content-box;
        }
        &::-webkit-scrollbar-button {
            display: none;
            width: 0;
            height: 0;
        }
        &::-webkit-scrollbar-corner {
            background: transparent;
        }
        &:hover::-webkit-scrollbar-thumb {
            background-color: rgba(255, 255, 255, 0.2);
        }
        &:hover::-webkit-scrollbar-thumb:hover {
            background-color: rgba(255, 255, 255, 0.3);
        }
        &:hover{
            scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }

    }

    .chat-list-move{
        transition: all 0.5s cubic-bezier(0.33, 1, 0.68, 1);
    }
</style>