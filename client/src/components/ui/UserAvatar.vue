<script setup lang="ts">

    import type { User } from '@/types/user';

    const props = defineProps<{
        user: User,
        width: number,
    }>(); 

    const { topHsl, bottomHsl } = props.user.gradientPair;

</script>
<template>
    <div v-if="!user.isLoading" class="skeleton avatar-wrapper" :style="`width:${props.width}ps; height:${props.width}px;`"></div>
    <div v-else class="avatar-wrapper" :style="`background: linear-gradient(180deg, ${topHsl} 0%, ${bottomHsl} 100%); width:${props.width}px; height:${props.width}px;`">
        <span v-if="!user.avatarUrl">{{ user.username[0]?.toUpperCase() }}</span>
        <img v-else :src="`http://localhost:8080${user.avatarUrl}`" loading="lazy">
        <Transition name="online-status">
            <div v-if="user.status==='online'" class="online-status" />
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

        width: 42px;
        height: 42px;
        border: none;
        border-radius: 50%;

        background-color: transparent;

        user-select: none;

        & span{
            font-weight: bold;
            font-size: 18px;
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

        width: 9px;
        height: 9px;

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

    .skeleton{
        position: relative;
        overflow: hidden;
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
        50%, 100% {
            transform: translateX(100%);
        }
    }
</style>