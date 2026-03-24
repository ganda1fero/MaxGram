<script setup lang="ts">

    import ChatInput from './components/chat/ChatInput.vue';
    import Sidebar from './components/sidebar/Sidebar.vue';
    import { useWebSocketStore } from './stores/useWebSocketStore';

    const socket = useWebSocketStore();

</script>
<template>
    <div class="app-container">
        <Sidebar />
        <div class="chat-field">
            <div class="messages-field">
                
            </div>
            <div class="input-area">
                <ChatInput />
            </div>
        </div> 
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

    .chat-field{
        display: flex;
        flex-direction: column;
        align-items: center;

        width: 100%;
        height: 100%;
        padding: 0px;


        border: solid red 1px;
    }

    .messages-field{
        display: flex;
        flex-direction: column;
        flex-grow: 1;

        overflow-y: auto;

        width: 100%;
        max-width: 750px;

        border: solid blueviolet 1px;
    }

    .input-area{
        display: inline-flex;
        flex-shrink: 0;

        width: 100%;
        max-width: 705px;

        border:solid yellow 1px;
    }
</style>