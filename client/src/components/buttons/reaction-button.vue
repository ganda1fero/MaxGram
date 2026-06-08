<script setup lang="ts">

    import { ThumbsUp } from '@lucide/vue';


    const prop = withDefaults(defineProps<{
        size?: number,
        active: boolean,
        visible: boolean,
    }>(), {
        size: 24,
    });

</script>
<template>

    <Transition name="fade">
        <div
            v-if="visible"
            class="reaction-button-container"
            :class="{ 'active': active }"
            :style="{
                width: `${size}px`,
                height: `${size}px`,
            }"
        >
            <ThumbsUp
                :size="size - 4"
                stroke-width="3px"
            />
        </div>
    </Transition>

</template>
<style scoped>
    .reaction-button-container {
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: color background-color 0.3s ease;
        color: rgba(255, 255, 255, 0.8);
        background-color: transparent;

        &.active {
            color: rgba(61, 201, 26, 0.8);
            background-color: rgba(0, 0, 0, 0.5);
        }
    }

    .fade-enter-active,
    .fade-leave-active{
        transition: all 0.3s ease;
    }
    .fade-enter-from,
    .fade-leave-to{
        opacity: 0;
        transform: scale(0);
    }
</style>