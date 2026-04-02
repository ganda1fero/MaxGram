<script setup lang="ts">

    import type { User } from '@/types/user';

    import { computed } from 'vue';

    const props = defineProps<{
        user: User,
        width: number,
    }>(); 

    const topHsl = computed(() => props.user.gradientPair.topHsl);
    const bottomHsl = computed(() => props.user.gradientPair.bottomHsl);

    const avatarSkeletonStyle = computed(() => ({
        width: props.width + 'px',
        height: props.width + 'px',
        fontSize: (props.width / 2 - 3) +'px',
    }));
    const avatarStyle = computed(() => ({
        ...avatarSkeletonStyle.value,
        background: `linear-gradient(180deg, ${topHsl.value} 0%, ${bottomHsl.value} 100%)`,
    }));
    const onlineStatusStyle = computed(() => ({
        width: (props.width / 6 + 2) + 'px',
        height: (props.width / 6 + 2) + 'px',
    }));

</script>
<template>
    <div v-if="user.isLoading" class="avatar-skeleton avatar-wrapper" :style="avatarSkeletonStyle"></div>
    <div v-else class="avatar-wrapper" :style="avatarStyle">
        <span v-if="!user.avatarUrl">{{ user.username[0]?.toUpperCase() }}</span>
        <img v-else :src="`http://localhost:8080${user.avatarUrl}`" loading="lazy">
        <Transition name="online-status">
            <div v-if="user.status==='online'" class="online-status" :style="onlineStatusStyle" />
        </Transition>
    </div>
</template>
<style scoped>
    .avatar-wrapper{
        display: flex;
        position: relative;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        flex-shrink: 0;

        border: none;
        border-radius: 50%;

        background-color: transparent;

        user-select: none;

        & span{
            font-weight: bold;
            color: rgba(255, 255, 255, 1);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
                'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
        }
        & img{
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
    }
    .online-status{
        display: flex;
        position: absolute;

        bottom: 0;
        right: 0;

        background-color: rgb(0, 247, 66);

        border: solid rgb(40, 40, 40) 2px;
        border-radius: 50%;
    }

    @keyframes bubble-bounce {
        0% { transform: scale(0); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
    }
    .online-status-enter-active{
        animation: bubble-bounce 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes bubble-pop {
        0% { 
            transform: scale(1); 
            opacity: 1; 
        }
        40% { 
            transform: scale(1.2); /* Резкий замах перед разрывом */
            opacity: 0.8;
            border-width: 1px; /* Стенка становится тоньше */
        }
        100% { 
            transform: scale(1.6); /* Взрывной рост */
            opacity: 0; 
        }
    }
    .online-status-leave-active{
        animation: bubble-pop 0.2s ease-out;
    }

    .avatar-skeleton{
        position: relative;
        overflow: hidden;
        border-radius: 50%;
        background-color: rgb(100, 100, 100);

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
    }
    @keyframes shimmer{
        70%, 100% {
            transform: translateX(100%);
        }
    }
</style>