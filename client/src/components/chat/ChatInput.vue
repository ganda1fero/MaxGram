<script setup lang="ts">

    import { watch } from 'vue';
    import { useUiStore } from '@/stores/ui-store';
    import { useChatStore } from '@/stores/chat-store';
    
    import EmojiButton from '@/components/buttons/EmojiButton.vue';
    import MultylineInput from '@/components/input-fields/MultylineInput.vue';
    import AddMediaButton from '@/components/buttons/AddMediaButton.vue';
    import SendButton from '@/components/buttons/SendButton.vue'; 

    const uiStore = useUiStore();
    const chat = uiStore.chat;

    const chatStore = useChatStore();

    watch(chatStore.getActiveChatId, () => {
        chat.chatInput = ''; // clear when switch chat
    });

</script>
<template>
    <div class="chat-input-container">
        <div class="new-message-wrapper">
            <EmojiButton :is-active="chat.emojiButtonState" @click="chat.emojiButtonState = !chat.emojiButtonState"/>
            <MultylineInput v-model:input="chat.chatInput"/>
            <AddMediaButton :is-active="chat.addMediaButtonState" @click="chat.addMediaButtonState = !chat.addMediaButtonState"/>
        </div>
        <div class="submit-button-wrapper">
            <Transition name="submit-button">
                <SendButton 
                    :can-send="chat.chatInput.length > 0"
                    v-if="chat.chatInput.length > 0"
                />
            </Transition>
        </div>
    </div>
</template>
<style scoped>
    .chat-input-container{
        display: flex;
        flex: 0 1 700px;

        padding: 0 13px 20px 13px;
        margin: 0;

        background-color: transparent;
        border: 0;
    }
    .new-message-wrapper{
        display: grid;
        grid-template-columns: 38px 1fr 34px;
        align-items: end;
        z-index: 1;

        width: 100%;
        max-width: 605px;

        padding: 5px 8px;
        margin: 0;

        background-color: rgb(45, 45, 45);
        border: 0;
        border-radius: 15px;
    }
    .emoji-button-wrapper{
        display: flex;
        
        justify-content: center;
        align-items: flex-start;

        padding: 0;
        margin: 0 0 1.5px 0;
    }
    .submit-button-wrapper{
        display: flex;
        position: relative;
        align-items: end;

        margin: 0 0 0 10px;

        width: 100%;
        max-width: 46px;

        background-color: transparent;
    }

    .submit-button-enter-active,
    .submit-button-leave-active{
        position: absolute;
        z-index: 0;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .submit-button-leave-active{
        transition: all 0.15s ease-in;
    }
    .submit-button-enter-from,
    .submit-button-leave-to{
        transform: translateX(-60px);
        opacity: 0;
    }
</style>