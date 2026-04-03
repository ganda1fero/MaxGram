<script setup lang="ts">
    import { ref, watch } from 'vue';
    import { useSearchStore } from '@/stores/useSearchStore';
    import { useWebSocketStore } from '@/stores/useWebSocketStore';
    import { useUiStore } from '@/stores/ui-store';
    import SidebarButton from '../buttons/SidebarButton.vue';
    import SearchInput from '../input-fields/SearchInput.vue';
    import ChatList from './SidebarChatList.vue';
    import SearchList from './SidebarSearchList.vue';

    const searchStore = useSearchStore();
    const socketStore = useWebSocketStore();
    const uiStore = useUiStore();

    const input = ref<string>('');
    
    const menuButtonLogic = () => {
        if (!uiStore.isSearchMode) {
            
            // open modal menu

        } else {
            uiStore.isSearchMode = false;
            searchStore.setResults([]);
        }
    }

    watch(() => uiStore.isSearchMode, (newSearchState) => {
        if (!newSearchState) input.value = '';
    });

</script>
<template>
    <div class="sidebar-container">
        <div class="sidebar-header">
            <div class="menu-button-wrapper">
                <SidebarButton 
                    @click="menuButtonLogic()"
                />
            </div>
            <SearchInput 
                @focus="uiStore.isSearchMode = true"
                v-model:input="input"
                :is-reconnect="!socketStore.isConnected()"
            />
        </div>
        <Transition name="chat-list">
            <ChatList v-if="!uiStore.isSearchMode" />
        </Transition>
        <Transition name="search-list">
            <SearchList v-if="uiStore.isSearchMode" :input="input" />
        </Transition>
    </div>
</template>
<style scoped>
    .sidebar-container{
        display: flex;
        flex-direction: column;
        position: relative;

        width: 100%;
        height: 100%;
        overflow: hidden;

        background-color: rgb(40, 40, 40);
        border: solid white 1px;

        & .menu-button-wrapper{
            display: flex;
            align-items: center;

            margin: 0 10px 0 0;

            width: 40px;
            height: 100%;
        }
    }
    .sidebar-header{
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;

        width: 100%;
        height: 100%;
        max-height: 56px;
    }

    .chat-list-enter-active,
    .chat-list-leave-active,
    .search-list-enter-active,
    .search-list-leave-active{
        transition: all 0.15s ease;
        position: absolute;
        top: 56px;
    }   
    .search-list-enter-from,
    .search-list-leave-to{
        opacity: 0;
        transform: scale(1.02);
    }
    .chat-list-enter-from,
    .chat-list-leave-to{
        opacity: 0;
        transform: scale(0.98);
    }
</style>