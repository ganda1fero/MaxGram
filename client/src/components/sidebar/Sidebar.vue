<script setup lang="ts">
    import { ref } from 'vue';
    import { useSearchStore } from '@/stores/useSearchStore';
    import SidebarButton from '../buttons/SidebarButton.vue';
    import SearchInput from '../input-fields/SearchInput.vue';
    import ChatList from './SidebarChatList.vue';
    import SearchList from './SidebarSearchList.vue';

    const searchStore = useSearchStore();

    const isMenu = ref<boolean>(true);
    const input = ref<string>('');
    
    const menuButtonLogic = () => {
        if (isMenu.value) {

        } else {
            isMenu.value = true;
            searchStore.setResults([]);
        }
    }

</script>
<template>
    <div class="sidebar-container">
        <div class="sidebar-header">
            <div class="menu-button-wrapper">
                <SidebarButton 
                    :is-menu="isMenu"
                    @click="menuButtonLogic()"
                />
            </div>
            <SearchInput @focus="isMenu = false" v-model:input="input"/>
        </div>
        <Transition name="chat-list">
            <ChatList v-if="isMenu" />
        </Transition>
        <Transition name="search-list">
            <SearchList v-if="!isMenu" :input="input" />
        </Transition>
    </div>
</template>
<style scoped>
    .sidebar-container{
        display: flex;
        flex-direction: column;

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