<script setup lang="ts">

    import Chat from '@/components/chat/Chat.vue'
    import Sidebar from './components/sidebar/Sidebar.vue';

    import { ref } from 'vue';
    import { useChatStore } from './stores/chat-store';

    const chatStore = useChatStore();

    // sidebar
    const sidebarWidth = ref<number>(260);
    const isResing = ref<boolean>(false);
    
    const handleMouseMove = (e: MouseEvent) => {
        if (!isResing.value) return;

        const newWidth = e.clientX;
        if (newWidth < 80) sidebarWidth.value = 80;
        else if (newWidth < 140) sidebarWidth.value = 80;
        else if (newWidth < 200) sidebarWidth.value = 200;
        else if (newWidth > 420) sidebarWidth.value = 420;
        else sidebarWidth.value = newWidth; // [200...420]px
    }

    const stopResizing = () => {
        isResing.value = false;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', stopResizing);
    }

    const startResizing = () => {
        isResing.value = true;
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', stopResizing);
    }

</script>
<template>
    <div class="app-container" :style="{ '--sidebar-width': sidebarWidth + 'px'}">
        <Sidebar class="sidebar" />
        <div class="resizer" @mousedown="startResizing"/>
        <Chat v-if="!!chatStore.getActiveChat()" /> 
    </div>
</template>
<style scoped>
    *{
        background-color: rgb(24, 24, 24);
        margin: 0px;
        padding: 0px;
    }

    .app-container {
        display: grid;
        grid-template-columns: var(--sidebar-width) auto 1fr;
        height: 100vh;
        width: 100vw;
        overflow: hidden;
    }
    .resizer{
        width: 5px;
        cursor: col-resize;
        background: rgba(255, 255, 255, 0.05);
        transition: background 0.2s ease;

        &:hover{
            background: #4a90e2;
        }
    }
    /*
    @media (max-width: 924px) {
        .app-container {
            grid-template-columns: 1fr;
        }

        .sidebar {
            display: none;
        }
    }
    */

</style>