<script setup lang="ts">

    import { useUiStore } from '@/stores/ui-store';
    import { useChatStore } from '@/stores/chat-store';

    import ChatHeader from '@/components/chat/ChatHeader.vue';
    import ChatInput from '@/components/chat/ChatInput.vue';

    const uiStore = useUiStore();
    const chatStore = useChatStore();

    const sendLogic = () => {
        const input = uiStore.chat.chatInput;
        if (input.length === 0) return;

        chatStore.sendMessage();
    }

    /// удалить
    import { useChatContentStore } from '@/stores/chat-content-store';
    const chatContentStore = useChatContentStore();

</script>
<template>
    <div class="chat-field">
        <ChatHeader />
        <div class="messages-field">
            <div v-for="message in chatContentStore.getChatContent(chatStore.getActiveChatId()!).messages">
                {{ message.text }}
            </div>
        </div>
        <div class="input-area">
            <ChatInput @send-button="sendLogic()"/>
        </div>
    </div>
</template>
<style scoped>
    .chat-field{
        display: flex;
        flex-direction: column;
        align-items: center;

        width: 100%;
        height: 100%;
        padding: 0;

        border: solid red 1px;
    }

    .messages-field{
        display: flex;
        flex-direction: column;
        flex-grow: 1;

        overflow-y: auto;

        width: 100%;
        max-width: 750px;

        border: solid blueviolet 1px;
    }

    .input-area{
        display: inline-flex;
        flex-shrink: 0;

        width: 100%;
        max-width: 705px;

        border:solid yellow 1px;
    }
</style>