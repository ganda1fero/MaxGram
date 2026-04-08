<script setup lang="ts">
    
    import type { Message } from '@/types/message';

    import { useAuthStore } from '@/stores/useAuthStore';
    import { computed } from 'vue';

    import { Clock } from 'lucide-vue-next';
    import { CheckCheck } from 'lucide-vue-next';
    import { CircleAlert } from 'lucide-vue-next';

    
    const props = defineProps<{
        message: Message,
        isFinalForSender?: boolean,
    }>();

    const authStore = useAuthStore();

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

    const messageTime = computed(() => {
        const sendTime = new Date(props.message.timestamp);
        const timeStr = sendTime.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
        });

        return timeStr;
    });

</script>
<template>
    <div 
        class="message-bubble"
        :class="classObj"
    >
        <div class="text">{{ message.text }}</div>
        <div class="message-meta">
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
        <div v-if="isFinalForSender" class="message-tail" :class="classObj" />
    </div>
</template>
<style scoped>
    .message-bubble{
        display: flex;
        flex-direction: row;
        position: relative;
        gap: 2px;

        width: fit-content;
        max-width: 500px;

        padding: 6px 8px;
        margin: 0 8px;
        border: none;

        transition: all 0.2s ease;
        
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