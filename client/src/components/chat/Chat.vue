<script setup lang="ts">

    import type { Message } from '@/types/message';
    import type { ChatContent } from '@/types/chatContent';
    import type { UUID } from '@/types/UUID';

    import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
    import { useUiStore } from '@/stores/ui-store';
    import { useChatStore } from '@/stores/chat-store';
    import { useChatContentStore } from '@/stores/chat-content-store';
    import { useAuthStore } from '@/stores/useAuthStore';

    import ChatHeader from '@/components/chat/ChatHeader.vue';
    import ChatInput from '@/components/chat/ChatInput.vue';
    import ChatMessage from '@/components/chat/message/ChatMessage.vue';
    import MessageMenu from './message/MessageMenu.vue';


    const uiStore = useUiStore();
    const chatStore = useChatStore();
    const chatContentStore = useChatContentStore();
    const authstore = useAuthStore();

    const chatContent = computed((): ChatContent => chatContentStore.getChatContent(chatStore.getActiveChatId()!));
    const chatId = computed((): UUID => chatContent.value.chatId);
    const messagesLength = computed((): number => chatContent.value.messages.length);
    const messages = computed((): Message[] => chatContent.value.messages);
    const selfId = computed((): UUID | null => authstore.getUUID());

    const sendLogic = () => {
        const input = uiStore.chat.chatInput;
        if (input.length === 0) return;

        chatStore.sendMessage();

        scrollToBottom();
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

    const menuRef = ref<InstanceType<typeof MessageMenu> | null>();
    const openContextMenu = (e: MouseEvent, message: Message) => {
        uiStore.chat.lastSelectedMessage.value = message;
        uiStore.chat.highlightedMessageId = message.ID;
        
        if (menuRef.value === null) console.warn("message menu is not found");
        else menuRef.value?.openMenu(e, message.SENDER_ID === selfId.value);
    }

    // observer
    let observer: IntersectionObserver | null = null;
    const prependTrigger = ref<HTMLElement | null>(null);
    const appendTrigger = ref<HTMLElement | null>(null);
    const messagesField = ref<HTMLElement | null>(null);

    const scrollToBottom = async (): Promise<void> => {
        if (messagesField.value === null) {
            console.warn("messages field not found");
            return;
        }

        await nextTick();   // waiting for the end of any loadings

        if (chatContent.value.hasMoreNewer) {
            // load init
            await chatContentStore.fetchStartContent(chatContent.value.chatId);
            await nextTick(); // wait while vue rendering new messages
        }

        // the end of messages is loaded
        messagesField.value.scrollTo({
            top: messagesField.value.scrollHeight,
            behavior: 'auto',
        });
        return;
    }

    watch(messagesLength, () => {
        scrollToBottom();
    }, { once: true });
    watch(chatId, () => {
        scrollToBottom();
    });

    onMounted(() => {
        // observer options
        const ObserverOptions = {
            rootMargin: '200px 0px',
            threshold: 0,
        };
        const observerCallback = async (entries: IntersectionObserverEntry[]) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    if (messagesField.value === null) {
                        console.warn("'messages field' not found");
                        return;
                    }

                    // execute an event
                    if (entry.target === prependTrigger.value && !chatContent.value.isLoading && chatContent.value.hasMoreOlder) {    // trying to load older
                        // memorize scroll position
                        const scrollOffsetFromBottom = messagesField.value.scrollHeight 
                            - messagesField.value.scrollTop;

                        console.warn('try to load older');
                        await chatContentStore.fetchOlderMessages(chatContent.value.chatId);

                        // recover scroll position
                        await nextTick();
                        messagesField.value.scrollTop = messagesField.value.scrollHeight - scrollOffsetFromBottom;

                        if (chatContent.value.messages.length > 60) {
                            const scrollOffsetFromTop = messagesField.value.scrollTop;
                            chatContentStore.removelastsExtraMessages(chatContent.value.chatId);
                            messagesField.value.scrollTop = scrollOffsetFromTop;
                        }
                    }
                    else if (entry.target === appendTrigger.value && !chatContent.value.isLoading && chatContent.value.hasMoreNewer) {    // trying to load newer
                        // memorize scroll position 
                        const scrollOffsetFromTop = messagesField.value.scrollTop;

                        console.warn('try to load newer');
                        await chatContentStore.fetchNewerMessages(chatContent.value.chatId);

                        // recover scroll position
                        await nextTick();
                        messagesField.value.scrollTop = scrollOffsetFromTop;

                        if (chatContent.value.messages.length > 60) {
                            const scrollOffsetFromBottom = messagesField.value.scrollHeight 
                                - messagesField.value.scrollTop;
                            chatContentStore.removefirstsExtraMessages(chatContent.value.chatId);
                            messagesField.value.scrollTop = messagesField.value.scrollHeight - scrollOffsetFromBottom;
                        }
                    }
                    else return;
                }
            }
        };

        // init observer
        observer = new IntersectionObserver(observerCallback, ObserverOptions);

        if (prependTrigger.value === null) console.warn("prepend trigger not found");
        else observer.observe(prependTrigger.value);

        if (appendTrigger.value === null) console.warn("append trigger not found");
        else observer.observe(appendTrigger.value);
    });

    onUnmounted(() => {
        if (observer) observer.disconnect();  
    });

</script>
<template>
    <div class="chat-field">
        <ChatHeader />
        <div class="messages-field" ref="messagesField">
            <div ref="prependTrigger" class="load-trigger"/>
            <TransitionGroup name="messages" tag="div">
                <div
                    v-for="(message, index) in messages"
                    :key="message.technicalId"
                >
                    <div 
                        class="message-content" 
                        :class="semanticIndent(message, messages[index + 1])"
                        :style="message.ID === uiStore.chat.highlightedMessageId ? `background-color:rgba(0, 0, 0, 0.2);` : ``"
                        @contextmenu.prevent="openContextMenu($event, message)"
                    >
                        <ChatMessage
                            :message
                            :is-final-for-sender="message.SENDER_ID !== messages[index + 1]?.SENDER_ID
                                || (messages[index + 1]?.timestamp ?? 0) - message.timestamp >= 1 * 60 * 1000"
                        />
                    </div>
                </div>
            </TransitionGroup>
            <div ref="appendTrigger" class="load-trigger"/>
        </div>
        <div class="input-area">
            <ChatInput @send-button="sendLogic()"/>
        </div>

        <MessageMenu 
            ref="menuRef"
            @reply="uiStore.chat.lastSelectedMessage.reply()"
            @edit="uiStore.chat.lastSelectedMessage.edit()"
            @copy="uiStore.chat.lastSelectedMessage.copyToClipboard()"
            @delete="uiStore.chat.lastSelectedMessage.delete()"
            @close-menu="uiStore.chat.highlightedMessageId = null"
        />
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
    }

    .messages-field{
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        box-sizing: border-box;

        overflow-x: hidden;
        overflow-y: auto;
        overflow-anchor: auto;

        width: 100%;
        max-width: 750px;
        height: 0;
        min-height: 0;

        padding: 0 5px;

        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        &::-webkit-scrollbar{
            width: 6px;
        }
        &::-webkit-scrollbar-thumb{
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
        }


        & .message-content{
            display: flex;
            box-sizing: border-box;

            width: 100%;
            height: auto;
            border-radius: 10px;

            overflow-anchor: auto;

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

        & .load-trigger{
            box-sizing: border-box;
            width: 100%;
            height: 1px;
            overflow-anchor: none;
        }
    }

    .input-area{
        display: inline-flex;
        flex-shrink: 0;

        overflow-anchor: none;
        margin-top: 5px;

        width: 100%;
        max-width: 705px;
    }

    header {
        overflow-anchor: none;
    }
</style>