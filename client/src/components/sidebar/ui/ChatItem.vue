<script setup lang="ts">

    import type { Chat } from '@/types/chat';
    import type { UUID } from '@/types/UUID';
    import type { User } from '@/types/user';

    import { computed } from 'vue';
    import { useAuthStore } from '@/stores/useAuthStore';
    import { useUsersStore } from '@/stores/useUsersStore';
    import { useChatStore } from '@/stores/chat-store';    

    import UserAvatar from '@/components/ui/UserAvatar.vue';

    const authStore = useAuthStore();
    const usersStore = useUsersStore();
    const chatsStore = useChatStore();

    const props = defineProps<{
        chat: Chat,
    }>();

    const user = computed((): User => {
        const selfUserId = authStore.getUUID();
        const userId: UUID | undefined = Array.from(props.chat.participants)
            .filter(userId => userId !== selfUserId)
            [0];

        if (!userId) {
            const fakeUser: User = {
                isLoading: true,
                ID: '',
                username: 'unknown',
                status: 'offline',
                gradientPair: { topHsl: '', bottomHsl: '' },
            }
            console.warn(`can't find the other participant in ${props.chat.ID} chat`);
            return fakeUser;
        }

        return usersStore.getUser(userId);
    });

    const formattedLastMessageTime = computed((): string | undefined => {
        if (!props.chat.lastMessage) return; 

        const date = new Date(props.chat.lastMessage.timestamp);
        const now = new Date();

        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        
        if (date >= startOfToday && diffInDays === 0) { // same day => print time: `--:--`
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            });
        }
        if (diffInDays < 7) {   // less than 7 days => print day of the week
            return date.toLocaleDateString('en-US', { weekday: 'short' }); 
        }

        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }); // a long time => print date like: '8 Mar'
    });

    const lastMessagePreview = computed((): string | undefined => {
        if (!props.chat.lastMessage) return;

        const lastMessage = props.chat.lastMessage;
        return lastMessage.text.substr(0, 25)
            + (lastMessage.text.length > 25 ? '...' : '');

    });

    const isSelected = computed((): boolean => {
        return chatsStore.getActiveChatId() === props.chat.ID;
    });

</script>
<template>
    <div class="chat-item-container" :class="{ 'chat-selected': isSelected }">
        <UserAvatar :width="54" :user="user" style="margin: 0 8px 0 0;"/>
        <div class="chat-info-wrapper">
            <div class="info-row"> <!-- name | las message time -->
                <span class="username">{{ user.username }}</span>
                <span class="last-message-time" :style="isSelected ? `color: rgba(255, 255, 255, 1);` : ``"> {{ formattedLastMessageTime ?? '--:--' }}</span>
            </div>
            <div class="info-row"> <!-- last message preview | unreaded count -->
                <span class="last-message" :style="isSelected ? `color: rgba(255, 255, 255, 1);` : ``">{{ lastMessagePreview ?? '---' }}</span>
                <!--TODO: add an unread message counter-->
            </div>
        </div>
    </div>
</template>
<style scoped>
    .chat-item-container{
        display: flex;
        box-sizing: border-box;
        align-items: center;

        width: 100%;
        height: 100%;
        max-height: 72px;
        padding: 9px;

        border-radius: 15px;
        background-color: transparent;

        transition: background-color 0.1s ease;
        &:not(.chat-selected):hover{
            background-color: rgba(255, 255, 255, 0.05);
        }
    }
    .chat-info-wrapper{
        display: flex;
        flex-direction: column;
        box-sizing: border-box;

        margin-top: 3px;

        width: 100%;
        height: 100%;
    }
    .info-row{
        display: flex;
        box-sizing: border-box;
        justify-content: space-between;
        align-items: center;

        width: 100%;
        height: 24px;

        font-weight: 600;
        color: rgba(255, 255, 255, 1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
            'Helvetica Neue', Arial, 'Noto Sans', sans-serif;

        & .username{
            font-size: 17px;
        }
        & .last-message{
            font-size: 15px;
            font-weight: 400;
            color: rgba(255, 255, 255, 0.6);
            transition: color 0.3s ease;
        }
        & .last-message-time{
            font-size: 13px;
            font-weight: 300;
            color: rgba(255, 255, 255, 0.6);
            transition: color 0.3s ease;
        }
    }
    .chat-selected{
        background-color: rgba(39, 150, 203, 0.8);
    }
    
</style>