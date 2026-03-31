<script setup lang="ts">

    import Chat from '@/components/chat/Chat.vue'
    import Sidebar from './components/sidebar/Sidebar.vue';

    import { useChatStore } from './stores/chat-store';

    const chatStore = useChatStore();

</script>
<template>
    <div class="app-container">
        <Sidebar class="sidebar"/>
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
        grid-template-columns: minmax(80px, 420px) 1fr;
        height: 100vh;
        width: 100vw;
        overflow: hidden;
    }
    @media (max-width: 924px) {
        .app-container {
            grid-template-columns: 1fr;
        }

        .sidebar {
            display: none;
        }
    }

</style>