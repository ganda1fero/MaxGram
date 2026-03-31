<script setup lang="ts">
    
    import type { User } from '@/types/user';

    import { computed } from 'vue';
    import { useNow } from '@/services/use-now';
    import { formatLastSeen } from '@/services/format-last-seen';

    import UserAvatar from '@/components/ui/UserAvatar.vue';

    const props = defineProps<{
        user: User,
    }>();

    const skeletonUsernameWidth = Math.floor(Math.random() * 101) + 50; // [50 ... 150]px

    const refNow = useNow();
    const status = computed(() => {
        if (props.user.status === 'online') return 'online';

        return formatLastSeen(props.user.lastSeen ?? 0, refNow.value);
    });

</script>
<template>
    <div class="user-container">
        <UserAvatar class="avatar" :user="props.user" :width="42" />
        <div class="info-wrapper" :style="!user.isLoading ? `margin-bottom:4px;`:``">
            <div v-if="!user.isLoading" class="username">
                {{ user.username }}
            </div>
            <div v-else class="username info-skeleton" :style="`width:${skeletonUsernameWidth}px;`" />

            <div v-if="!user.isLoading" class="last-active">
                {{ status }}
            </div>
            <div v-else class="last-active info-skeleton" />
        </div>
    </div>
</template>
<style scoped>
    .user-container{
        display: flex;
        align-items: center;

        width: 100%;
        flex-shrink: 0;
        height: 100%;
        max-height: 56px;

        border: none;
        border-radius: 12px;

        font-size: 15px;
        color: rgba(255, 255, 255, 1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
            'Helvetica Neue', Arial, 'Noto Sans', sans-serif;

        & .avatar{
            margin: 0 15px 0 15px;
        }
        transition: all 0.15s ease-out;
        &:hover{
            background-color: rgba(255,255,255,0.05);
        }
    }
    .info-wrapper{
        display: flex;
        flex-direction: column;
        justify-content: center;

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