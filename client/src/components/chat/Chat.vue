<script setup lang="ts">

    import ChatHeader from '@/components/chat/ChatHeader.vue';
    import ChatInput from '@/components/chat/ChatInput.vue';

</script>
<template>
    <div class="chat-field">
        <ChatHeader />
        <div class="messages-field">
            
        </div>
        <div class="input-area">
            <ChatInput />
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