<script setup lang="ts">

    import type { User } from '@/types/user';

    import { computed } from 'vue';
    import { useNow } from '@/services/use-now';
    import { formatLastSeen } from '@/services/format-last-seen';
    import { useChatStore } from '@/stores/chat-store';
    import { useAuthStore } from '@/stores/useAuthStore';
    import { useUsersStore } from '@/stores/useUsersStore';

    import UserAvatar from '@/components/ui/UserAvatar.vue';

    const chatsStore = useChatStore();
    const authStore = useAuthStore();
    const usersStore = useUsersStore();

    const skeletonUsernameWidth = Math.floor(Math.random() * 101) + 50;

    const privateChatPartner = computed((): User => {
        const FAKE_USER = { isLoading: true } as User;

        const chat = chatsStore.getActiveChat();
        if (!chat) return FAKE_USER;  // have no active chat (error)
        if (chat.type !== 'private') return FAKE_USER; // not a private chat (need the avatar of the group, not the user.)
        
        const selfId = authStore.getUUID();
        if (!selfId) return FAKE_USER; // have no active auth (error)

        const userId = Array.from(chat.participants)
            .filter((id) => id !== selfId)
            [0];
        if (!userId) return FAKE_USER; // only 1 member (self)

        return usersStore.getUser(userId);
    });

    const refTimer = useNow(60000); // updates every minut
    const getStatus = (): string => {
        if (privateChatPartner.value.status === 'online') return 'online';

        return formatLastSeen(privateChatPartner.value.lastSeen ?? 0, refTimer.value);
    }

</script>
<template>
    <div class="chat-header">
        <UserAvatar :user="privateChatPartner" :width="40"/>
        <div class="user-info-wrapper" :style="!privateChatPartner.isLoading ? `margin-bottom:4px;`:``">
            <div v-if="!privateChatPartner.isLoading" class="username">
                {{ privateChatPartner.username }}
            </div>
            <div v-else class="username info-skeleton" :style="`width:${skeletonUsernameWidth}px;`" />

            <div v-if="!privateChatPartner.isLoading" class="last-active">
                {{ getStatus() }}
            </div>
            <div v-else class="last-active info-skeleton" />
        </div>

        
    </div>
</template>
<style scoped>
    .chat-header{
        display: flex;
        box-sizing: border-box;
        align-items: center;

        width: 100%;
        height: 56px;
        padding: 4px 13px 4px 23px;
        border: none;
        background-color: rgb(40, 40, 40);

        font-size: 15px;
        color: rgba(255, 255, 255, 1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
            'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
    }
    .user-info-wrapper{
        display: flex;
        flex-direction: column;
        justify-content: center;
        margin: 0 0 0 15px;

        & .username{
            font-size: 17px;
        }
        & .last-active{
            font-size: 13px;
            user-select: none;
            color: rgba(255, 255, 255, 0.6);
        }
    }
    .info-skeleton{
        position: relative;
        box-sizing: border-box;
        overflow: hidden;
        background-color: rgb(100, 100, 100);
        border: none;
        border-radius: 5px;

        &::after{
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(
                110deg,
                transparent,
                transparent 30%,
                rgba(255, 255, 255, 0.4) 50%,
                transparent 70%,
                transparent
            );
            transform: translateX(-100%);
            animation: shimmer 4s infinite;
        }

        &.username{
            height: 17px;
        }
        &.last-active{
            width: 120px;
            height: 11px;
            margin-top: 5px;
        }
    }
    @keyframes shimmer{
        70%, 100% {
            transform: translateX(100%);
        }
    }
</style>