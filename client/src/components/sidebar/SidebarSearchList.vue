<script setup lang="ts">

    import type { SearchUsersPacket } from '@/types/web-socket/client/search-users-packet';
    import type { GetParticipantsInfoPacket } from '@/types/web-socket/client/get-participants-info-packet';
    import type { User } from '@/types/user';
    import type { Chat } from '@/types/chat';
    import type { UUID } from '@/types/UUID';
    
    import { ref, watch, computed, type ComputedRef } from 'vue'
    import { picklist } from '@/components/sidebar/searchPicklist';
    import { debounce } from '@/services/debounce';
    import { throttle } from '@/services/throttle';

    import { useSearchStore } from '@/stores/useSearchStore';
    import { useWebSocketStore } from '@/stores/useWebSocketStore';
    import { useUsersStore } from '@/stores/useUsersStore';
    import { useChatStore } from '@/stores/chat-store';
    import { useAuthStore } from '@/stores/useAuthStore';
    import { useUiStore } from '@/stores/ui-store';

    import TypeItem from '@/components/sidebar/ui/TypeItem.vue';
    import UserItem from '@/components/sidebar/ui/UserItem.vue';
    import ChatItem from '@/components/sidebar/ui/ChatItem.vue';

    const props = defineProps<{
        input: string,
    }>();

    const searchStore = useSearchStore();
    const socketStore = useWebSocketStore();
    const usersStore = useUsersStore();
    const chatStore = useChatStore();
    const uiStore = useUiStore();

    const selectedSearchTypeId = ref<number>(picklist[0]!.id);

    const foundUsers: ComputedRef<User[]> = computed(() => {
        if (selectedSearchTypeId.value !== 2) return [];

        const idList = searchStore.getResults();
        return idList.map(id => usersStore.getUser(id));
    });
    const foundChats = computed((): Chat[] => {
        if (selectedSearchTypeId.value === 2) return [];

        const idList = searchStore.getResults();
        return idList.map(chatId => chatStore.getChat(chatId));
    });
    watch(() => searchStore.getResults(), (newIds) => { // updates all users in new result 
        newIds.forEach(id => {
            const user = usersStore.getUser(id);
            if (!user.isLoading) usersStore.userRequest(user.ID);
        });
    });

    const {debouncedFn: searchChats } = debounce((query: string) => {
        const selfId = useAuthStore().getUUID();
        if (selfId === undefined) return [];
        const lowerCaseQuery = query.toLocaleLowerCase();

        const chatsList = chatStore.getChatIdsList
            .filter(chatId => {
                const chat = chatStore.getChat(chatId);
                if (chat.type !== 'private' || chat.participants.size > 2) return false;
                if ('saved'.startsWith(lowerCaseQuery) && chat.participants.size === 1) return true;

                for (const userId of chat.participants.keys()) {
                    if (userId === selfId) continue; // skip self id

                    const user = usersStore.getUser(userId);
                    return user.username.toLocaleLowerCase().startsWith(lowerCaseQuery);
                }
            });

        searchStore.setResults(chatsList);
    }, 200);
    const { debouncedFn: searchGroups } = debounce((query: string) => {
        const selfId = useAuthStore().getUUID();
        if (selfId === undefined) return [];
        const lowerCaseQuery = query.toLocaleLowerCase();

        const chatsList = chatStore.getChatIdsList
            .filter(chatId => {
                const chat = chatStore.getChat(chatId);
                if (chat.type !== 'group') return false;
                
                const lowerCaseChatName = chat.title?.toLocaleLowerCase(); 
                if (lowerCaseChatName === undefined) return false;
                
                if (lowerCaseChatName.startsWith(lowerCaseQuery)) return true;
            });
    }, 200);
    const { debouncedFn: searchRequest, cancelTimeout } = debounce((query: string) => {
        const request: SearchUsersPacket | any = {  // del `any` when the other types will be ready
            type: 'SEARCH_USERS',
            query,
        };

        socketStore.send(request);
    }, 500);
    
    const openPrivateChatRequest = throttle((userId: UUID) => {
        chatStore.fetchGetPrivateChatId(userId);
    }, 500);
    const fetchParticipantsInfo = throttle(() => {
        const message: GetParticipantsInfoPacket = {
            type: 'GET_PARTICIPANTS_INFO',
        }
        socketStore.send(message);
    }, 1000);

    const openChat = (chatId: UUID) => {
        uiStore.sidebar.isSearchMode = false;
        chatStore.openChat(chatId);
    }


    watch(() => props.input, () => {    // changed input text
        if (!!props.input){
            switch (selectedSearchTypeId.value) {
                case 0: // chats
                fetchParticipantsInfo();
                searchChats(props.input);
                break;
                case 1: // groups
                searchGroups(props.input);
                break;
                case 2: // users
                searchRequest(props.input);
                break;
            } 
        }
        else { 
            searchStore.setResults([]); // clear results
            cancelTimeout(); // clear timeout (if it exist)
        }
    });
    watch(selectedSearchTypeId, () => { // changed type of search
        searchStore.setResults([]);
        if (!!props.input) {
            switch (selectedSearchTypeId.value) {
                case 0: // chats
                fetchParticipantsInfo();
                searchChats(props.input);
                break;
                case 1: // groups
                searchGroups(props.input);
                break;
                case 2: // users
                searchRequest(props.input);
                break;
            } 
        }
    });

</script>
<template>
    <div class="container">
        <div class="picklist-container">
            <TypeItem 
                v-for="item in picklist"
                :key="item.id"
                :name="item.name"
                @click="selectedSearchTypeId = item.id"
                :is-focus="selectedSearchTypeId === item.id"
            />
        </div>
        <div
            v-if="selectedSearchTypeId === 0"
            class="online-counter"
        >
            <div>Participants {{ uiStore.sidebar.participantsCount }}</div>
            <div>Online {{ uiStore.sidebar.onlineCount }}</div>
        </div>
        <div class="found-list">
            <UserItem 
                v-if="selectedSearchTypeId === 2"
                v-for="user in foundUsers"
                :id="user.ID"
                :user="user" 
                @click="openPrivateChatRequest(user.ID)"
            />
            <ChatItem
                v-else
                v-for="chat in foundChats"
                :chat="chat"
                :id="chat.ID"
                @click="openChat(chat.ID)"
            />
        </div>
    </div>
</template>
<style scoped>
    .container{
        display: flex;
        flex-direction: column;
        position: relative;

        width: 100%;
        height: 100%;
    }
    .picklist-container{
        display: flex;
        flex-direction: row;
        
        width: 100%;
        height: 100%;
        max-height: 48px;

        overflow-x: auto;
        overflow-y: hidden;
        white-space: nowrap;
        scrollbar-width: none;
        -ms-overflow-style: none;
        &::-webkit-scrollbar{
            display: none;
        }

        border: none;
        border-bottom: solid rgb(140,140,140) 1px;
    }
    .online-counter{
        display: flex;
        flex-direction: row;
        box-sizing: border-box;
        justify-content: center;
        align-items: center;

        width: 100%;
        height: 30px;

        padding: 0;
        gap: 10px;

        color: rgba(255, 255, 255, 0.6);
        font-size: 13px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
            'Helvetica Neue', Arial, 'Noto Sans', sans-serif;

        border: none;
        border-bottom: solid rgb(140,140,140) 1px;
    }
    .found-list{
        display: flex;
        flex-direction: column;
        align-items: center;
        box-sizing: border-box;

        width: 100%;
        height: 100%;

        padding: 0 8px;

        overflow-x: hidden;
        overflow-y: auto;
        scrollbar-gutter: stable;
        scrollbar-color: transparent transparent;
        scrollbar-width: thin;
        transition: scrollbar-color 0.2s ease;
        white-space: nowrap;
        &::-webkit-scrollbar {
            width: 4px;
        }
        &::-webkit-scrollbar-thumb {
            background-color: transparent;
            border-radius: 10px;
            border: 2px solid transparent; 
            background-clip: content-box;
        }
        &::-webkit-scrollbar-button {
            display: none;
            width: 0;
            height: 0;
        }
        &::-webkit-scrollbar-corner {
            background: transparent;
        }
        &:hover::-webkit-scrollbar-thumb {
            background-color: rgba(255, 255, 255, 0.2);
        }
        &:hover::-webkit-scrollbar-thumb:hover {
            background-color: rgba(255, 255, 255, 0.3);
        }
        &:hover{
            scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }
    }
</style>