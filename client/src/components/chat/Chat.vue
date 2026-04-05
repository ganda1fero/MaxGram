<script setup lang="ts">

    import type { Message } from '@/types/message';

    import { computed } from 'vue';
    import { useUiStore } from '@/stores/ui-store';
    import { useChatStore } from '@/stores/chat-store';
    import { useChatContentStore } from '@/stores/chat-content-store';

    import ChatHeader from '@/components/chat/ChatHeader.vue';
    import ChatInput from '@/components/chat/ChatInput.vue';
    import ChatMessage from '@/components/chat/message/ChatMessage.vue';

    const uiStore = useUiStore();
    const chatStore = useChatStore();
    const chatContentStore = useChatContentStore();

    const messages = computed((): Message[] => chatContentStore.getChatContent(chatStore.getActiveChatId()!).messages);

    const sendLogic = () => {
        const input = uiStore.chat.chatInput;
        if (input.length === 0) return;

        chatStore.sendMessage();
    }

    type SemanticIndent = {
        'small-semantic-indent'?: true,
        'medium-semantic-indent'?: true,
        'large-semantic-indent'?: true,
    };
    const semanticIndent = (message: Message, nextMessage: Message | undefined): SemanticIndent => {
        if (nextMessage === undefined) return { 'medium-semantic-indent': true };

        if (message.SENDER_ID !== nextMessage.SENDER_ID)    // different senders
            return { 'medium-semantic-indent': true };
        
        // same sender => calculate time interval
        const timeInterval = nextMessage.timestamp - message.timestamp;
        if (timeInterval <= 1 * 60 * 1000) // [0...1] minut
            return { 'small-semantic-indent': true };
        if (timeInterval <= 15 * 60 * 1000) // (10s...15min]
            return { 'medium-semantic-indent': true };
        
        // means that time interval > 15 mins
        return { 'large-semantic-indent': true };
    }

</script>
<template>
    <div class="chat-field">
        <ChatHeader />
        <div class="messages-field">
            <div
                v-for="(message, index) in messages"
                :key="message.technicalId"
            >
                <div class="message-content" :class="semanticIndent(message, messages[index + 1])">
                    <ChatMessage
                        :message
                        :is-final-for-sender="message.SENDER_ID !== messages[index + 1]?.SENDER_ID"
                    />
                </div>
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
        box-sizing: border-box;

        overflow-x: hidden;
        overflow-y: auto;

        width: 100%;
        max-width: 750px;
        height: 0;
        min-height: 0;

        padding: 0 5px;

        border: solid blueviolet 1px;

        & .message-content{
            display: flex;
            box-sizing: border-box;

            width: 100%;
            height: auto;

            transition: margin-bottom 0.3s ease;

            &.small-semantic-indent{
                margin-bottom: 2px;
            }
            &.medium-semantic-indent{
                margin-bottom: 8px;
            }
            &.large-semantic-indent{
                margin-bottom: 16px;
            }
        }
    }

    .input-area{
        display: inline-flex;
        flex-shrink: 0;

        width: 100%;
        max-width: 705px;

        border:solid yellow 1px;
    }
</style>