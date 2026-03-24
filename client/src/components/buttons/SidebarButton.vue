<script setup lang="ts">
    import { Menu } from 'lucide-vue-next';
    import { ArrowLeft } from 'lucide-vue-next'; 

    const props = defineProps<{
        isMenu: boolean,
    }>();

    const emit = defineEmits<{
        (e: 'click'): void
    }>();

</script>
<template>
    <button class="sidebar-button" @click="$emit('click')">
        <Transition name="menu">
            <Menu class="button-icon" v-if="isMenu" />
        </Transition>
        <Transition name="back">
            <ArrowLeft class="button-icon" v-if="!isMenu" />
        </Transition>
    </button>
    
</template>
<style scoped>
    .sidebar-button{
        display: flex;
        justify-content: center;
        align-items: center;

        width: 40px;
        height: 40px;

        background-color: transparent;

        border: none;
        border-radius: 50%;

        transition: all 0.2s ease;

        &:hover{
            background-color: rgba(255, 255, 255, 0.1);
        }
        &:active{
            background-color: rgba(255, 255, 255, 0.2)
        }
    }

    .button-icon{
        position: absolute;

        width: 24px;
        height: 24px;

        color: rgb(160, 160, 160);
    }

    .menu-enter-active,
    .menu-leave-active,
    .back-enter-active,
    .back-leave-active {
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .menu-enter-from,
    .menu-leave-to {
        opacity: 0;
        transform: rotate(180deg) scale(0.8);
    }
    .back-enter-from,
    .back-leave-to {
        opacity: 0;
        transform: rotate(-180deg) scale(0.8);
    }
</style>