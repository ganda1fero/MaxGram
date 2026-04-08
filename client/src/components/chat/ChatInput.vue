<script setup lang="ts">

    import { watch, computed } from 'vue';
    import { useUiStore } from '@/stores/ui-store';
    import { useChatStore } from '@/stores/chat-store';
    
    import { Pencil } from 'lucide-vue-next';
    import { CornerUpLeft } from 'lucide-vue-next';

    import EmojiButton from '@/components/buttons/EmojiButton.vue';
    import MultylineInput from '@/components/input-fields/MultylineInput.vue';
    import AddMediaButton from '@/components/buttons/AddMediaButton.vue';
    import SendButton from '@/components/buttons/SendButton.vue'; 
    import ExitButton from '@/components/buttons/ExitButton.vue';

    const emit = defineEmits<{
        (e: 'sendButton'): void,
    }>();

    const uiStore = useUiStore();
    const chat = uiStore.chat;

    const chatStore = useChatStore();

    const modifierText = computed((): string => {
        const modifier = uiStore.chat.inputModifier;
        if (modifier === null) return '';
        else if (modifier === 'edit') return 'Edit Message';
        else if (modifier === 'reply') return 'Reply Message';
        
        return 'unknown';
    });
    const clearInputModifier = (): void => {
        uiStore.chat.inputModifier = null;
        uiStore.chat.modifyingMessage = null;
    }

    watch(chatStore.getActiveChatId, () => {
        // clear when switch chat
        chat.chatInput = '';
        chat.inputModifier = null;
        chat.modifyingMessage = null;
        chat.lastSelectedMessage.value = null;
    });

</script>
<template>
    <div class="chat-input-container">
        <div class="new-message-wrapper" :style="uiStore.chat.inputModifier !== null ? `margin-top:50px` : ``">
            <Transition name="input-modifier">
                <div v-if="uiStore.chat.inputModifier !== null" class="input-modifier">
                    <div class="modifier-icon">
                        <Pencil v-if="uiStore.chat.inputModifier === 'edit'" :size="24"/>
                        <CornerUpLeft v-else-if="uiStore.chat.inputModifier === 'reply'" :size="24"/>
                    </div>
                    <div class="info-container">
                        <span class="modifier-name no-copy">{{ modifierText }}</span>
                        <span class="modifying-message no-copy">{{ uiStore.chat.modifyingMessage?.text }}</span>
                    </div>
                    <div class="modifier-close-icon">
                        <ExitButton 
                            :is-focus="true"
                            @click="clearInputModifier()"
                        />
                    </div>

                    <div class="modifier-fake-border" />
                </div>
            </Transition>
            <div class="input-field-wrapper"">
                <EmojiButton :is-active="chat.emojiButtonState" @click="chat.emojiButtonState = !chat.emojiButtonState"/>
                <MultylineInput v-model:input="chat.chatInput" @submit="$emit('sendButton')"/>
                <AddMediaButton :is-active="chat.addMediaButtonState" @click="chat.addMediaButtonState = !chat.addMediaButtonState"/>
            </div>
        </div>
        <div class="submit-button-wrapper">
            <Transition name="submit-button">
                <SendButton 
                    :can-send="chat.chatInput.length > 0"
                    v-if="chat.chatInput.length > 0"
                    @click="$emit('sendButton')"
                />
            </Transition>
        </div>
    </div>
</template>
<style scoped>
    .no-copy {
        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
    .chat-input-container{
        display: flex;
        flex: 0 1 700px;

        padding: 0 13px 20px 13px;
        margin: 0;

        background-color: transparent;
        border: 0;
    }
    .new-message-wrapper{
        display: flex;
        flex-direction: column;
        position: relative;

        width: 100%;
        max-width: 605px;

        padding: 5px 8px;
        margin: 0;

        background-color: rgb(45, 45, 45);
        border: 0;
        border-radius: 15px;

        & .input-modifier{
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            position: absolute;
            
            top: -50px;
            left: 0;
            right: 0;

            padding: 5px 8px 15px 5px;

            border: none;
            border-radius: 15px 15px 0 0;
            background-color: rgb(45, 45, 45);

            transition: all 0.3s ease;

            & .modifier-icon, & .modifier-close-icon{
                display: flex;
                padding: 9px 12px 9px 5px;
                color: rgb(39, 150, 203);
            }
            & .modifier-close-icon{
                padding: 9px 5px 9px 12px;
            }

            & .info-container{
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: flex-start;
                
                width: 100%;
                height: 42px;
                padding: 2px 4px;

                border-left: solid rgba(39, 150, 203, 0.9) 3px;
                border-radius: 3px;
                background-color: rgba(39, 150, 203, 0.1);

                white-space: nowrap;
                overflow: hidden;

                & span{
                    line-height: 18px;
                    font-size: 14px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
                        'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
                    &.modifier-name{
                        font-weight: 500;
                        color: rgba(39, 150, 203, 0.7);
                    }
                    &.modifying-message{
                        color: rgba(255, 255, 255, 1);
                    }
                }
            }
        }

        & .input-field-wrapper{
            display: grid;
            grid-template-columns: 38px 1fr 34px;
            align-items: end;
            z-index: 1;

            width: 100%;
        }
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

    .input-modifier-enter-active,
    .input-modifier-leave-active{
        position: absolute;
        transition: all 0.3s ease;
    }
    .input-modifier-enter-from,
    .input-modifier-leave-to{
        position: absolute;
        transform: translateY(35px);
        opacity: 0;
    }
</style>