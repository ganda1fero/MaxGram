<script setup lang="ts">
    
    import { ref } from 'vue';

    import type { Message } from '@/types/message';

    import { useAuthStore } from '@/stores/useAuthStore';
    import { useWebSocketStore } from '@/stores/useWebSocketStore.ts';
    import { useUsersStore } from '@/stores/useUsersStore';
    import { computed } from 'vue';

    import { Clock } from 'lucide-vue-next';
    import { CheckCheck } from 'lucide-vue-next';
    import { CircleAlert } from 'lucide-vue-next';

    import { default as ReactionButton } from '../../buttons/reaction-button.vue';
    import { default as UserAvatar } from '../../ui/UserAvatar.vue';

    import { ThumbsUp } from '@lucide/vue';
    
    const props = defineProps<{
        message: Message,
        isFinalForSender?: boolean,
    }>();

    const webSocketStore = useWebSocketStore();
    const authStore = useAuthStore();
    const usersStore = useUsersStore();

    const isReactionButtonVisible = ref(false);
    const isReactionButtonActive = ref(false);

    type Classes = {
        'its-mine'?: boolean,
        'its-someones'?: boolean,
    };
    const classObj = computed((): Classes => {
        const selfId = authStore.getUUID() ?? '_';

        const classes: Classes = {};

        if (selfId === props.message.SENDER_ID) classes["its-mine"] = true; 
        else classes['its-someones'] = true;

        return classes;
    });

    const isReply = computed((): boolean => props.message.repliedMessage !== undefined);

    const messageTime = computed(() => {
        const sendTime = new Date(props.message.timestamp);
        const timeStr = sendTime.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
        });

        return timeStr;
    });

    const addReaction = () => {
        if (props.message.reactions === undefined)
            props.message.reactions = [];

        let type: string;
        
        if (!!props.message.reactions.filter(reaction => reaction.ownerId === authStore.getUUID()).length)
            type = 'CLEAR_REACTION';
        else
            type = 'ADD_REACTION';

        webSocketStore.send({
            type,
            chatId: props.message.CHAT_ID,
            messageId: props.message.ID,
            reactionType: 'like',
        });

        if (type === 'ADD_REACTION') {
            props.message.reactions.push({
                id: crypto.randomUUID(),
                ownerId: authStore.getUUID()!,
                type: 'like',
                timestamp: Date.now(),
            });
        }
        else if (type === 'CLEAR_REACTION') {
            props.message.reactions = props.message.reactions.filter(reaction => reaction.ownerId !== authStore.getUUID());
        }
    }

</script>
<template>
    <div 
        class="message-bubble"
        :class="classObj"
        style="position: relative;"
    >
        <div v-if="isReply" class="replied-message">
            <span class="name no-copy">{{ usersStore.getUser(message.repliedMessage!.SENDER_ID).username }}</span>
            <span class="replied-text no-copy"> {{ message.repliedMessage!.text }}</span>
        </div>
        <div style="display:flex; flex-direction:row; justify-content: space-between; position: relative;">
            <div class="text">{{ message.text }}</div>
            <div class="message-meta no-copy">
                <Transition name="edited-label">
                    <div v-if="message.edited" class="edited-label">edited</div>
                </Transition>
                <div class="time">{{ messageTime }}</div>
                <TransitionGroup v-if="authStore.getUUID() === message.SENDER_ID" name="message-icons">
                    <div v-if="message.status === 'sending'" class="check-icon">
                        <Clock :size="14"/>
                    </div>
                    <div v-else-if="message.status === 'deniend'" class="denied-icon">
                        <CircleAlert :size="14"/>
                    </div>
                    <div v-else class="check-icon">
                        <CheckCheck :size="14"/>
                    </div>
                </TransitionGroup>
            </div>
        </div>
        <div
            v-if="!!message.reactions?.length"
            class="reactions-wrapper"
        >
            <div
                v-for="reaction in message.reactions" 
                class="reaction"
            >
                <ThumbsUp :size="20"/>
                <UserAvatar
                    :user="usersStore.getUser(reaction.ownerId)"
                    :width="20"
                />
            </div>
        </div>

        <div v-if="isFinalForSender" class="message-tail" :class="classObj" />

        <div
            class="reaction-button-wrapper"
            :class="{ 'self': authStore.getUUID() === message.SENDER_ID }"
            @mouseenter="isReactionButtonVisible = true"
            @mouseleave="isReactionButtonVisible = false"
        >   
            <div
                @mouseenter="isReactionButtonActive = true"
                @mouseleave="isReactionButtonActive = false"
            >
                <ReactionButton
                    :active="isReactionButtonActive"
                    :visible="isReactionButtonVisible"
                    :size="24"
                    @click="addReaction()"
                />
            </div>
        </div>
    </div>
</template>
<style scoped>
    .no-copy {
        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
    .message-bubble{
        display: flex;
        flex-direction: column;
        position: relative;
        gap: 3px;

        width: fit-content;
        max-width: 500px;

        padding: 6px 8px;
        margin: 0 8px;
        border: none;

        transition: all 0.2s ease;
        
        & .replied-message{
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start;
            box-sizing: border-box;

            width: 100%;
            height: auto;
            padding: 2px 5px;

            white-space: nowrap;
            overflow: hidden;

            border: none;
            border-radius: 3px;
            border-left: solid rgb(255, 255, 255) 3px;

            background-color: rgba(255, 255, 255, 0.2);

            & .name, & .replied-text{
                line-height: 18px;
                font-size: 16px;
                font-weight: 500;
                color: rgba(255, 255, 255, 1);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
                    'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
            }
            & .replied-text{
                font-size: 12px;
                font-weight: 400;
                color: rgba(255, 255, 255, 0.85);
            }
        }

        &.its-mine{
            margin-left: auto;
            background-color: rgba(39, 150, 203, 1);
            border-radius: 12px 12px 6px 12px;
        }
        &.its-someones{
            background-color: rgb(60, 60, 60);
            border-radius: 12px 12px 12px 6px;
        }

        
        & .text{
            word-break: break-word;
            line-height: 1.4;

            font-size: 16px;
            color: rgba(255, 255, 255, 1);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
                'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
        }
        & .message-meta{
            display: flex;
            position: relative;
            align-items: flex-end;
            margin: 0 -6px 0 7px;
            bottom: -3px;

            & .time, & .edited-label{
                font-size: 11px;
                margin-right: 4px;
                color: rgba(255, 255, 255, 0.6);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
                    'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
            }
            & .edited-label{
                margin-right: 2px;
            }

            & .check-icon{
                position: relative;
                color: rgba(255, 255, 255, 1);
                bottom: -5px;
                margin-right: 2px;
                z-index: 2;
            }
            & .denied-icon{
                position: relative;
                color: rgb(255, 0, 0);
                bottom: -5px;
                margin-right: 2px;
                z-index: 2;
            }
        }

        & .message-tail{
            position: absolute;
            z-index: 1;

            width: 10px;
            height: 20px;

            &.its-mine{
                right: -4px;
                bottom: 0;
                background-color: rgba(39, 150, 203, 1);
                clip-path: polygon(0 0, 100% 100%, 0 100%);
                border-bottom-left-radius: 15px; 
            }
            &.its-someones{
                left: -4px;
                bottom: 0;
                background-color: rgb(60, 60, 60);
                clip-path: polygon(100% 0, 100% 100%, 0 100%);
                border-bottom-right-radius: 15px; 
            }
        }
    }

    .reaction-button-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100;
        box-sizing: border-box;
        width: 29px;
        height: 29px;
        border-radius: 50%;
        position: absolute;

        right: -15px;
        bottom: -12px;

        &.self{
            right: auto;
            left: -15px;
        }
    }

    .reactions-wrapper {
        display: flex;
        flex-direction: row;
        box-sizing: border-box;
        align-items: center;

        padding: 4px;

        & .reaction {
            display: flex;
            flex-direction: row;
            gap: 6px;

            padding: 4px 10px;
            border-radius: 15px;
            background-color: rgb(110, 110, 110);
        }
    }

    .message-icons-enter-active
    .message-icons-leave-active{
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .message-icons-leave-active{
        position: absolute;
    }
    .message-icons-enter-from,
    .message-icons-leave-to{
        opacity: 0;
        transform: scale(0.3);
    }
</style>