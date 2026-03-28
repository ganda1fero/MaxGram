<script setup lang="ts">

    import type { SearchUsersPacket } from '@/types/web-socket/client/search-users-packet';
    import type { User } from '@/types/user';
    import type { UUID } from '@/types/UUID';
    
    import { ref, watch, computed, type ComputedRef } from 'vue'
    import { picklist } from '@/components/sidebar/searchPicklist';
    import { debounce } from '@/services/debounce';
    import { throttle } from '@/services/throttle';

    import { useSearchStore } from '@/stores/useSearchStore';
    import { useWebSocketStore } from '@/stores/useWebSocketStore';
    import { useUsersStore } from '@/stores/useUsersStore';
    import { useChatStore } from '@/stores/chat-store';

    import TypeItem from '@/components/sidebar/ui/TypeItem.vue';
    import UserItem from '@/components/sidebar/ui/UserItem.vue';

    const props = defineProps<{
        input: string,
    }>();

    const searchStore = useSearchStore();
    const socketStore = useWebSocketStore();
    const usersStore = useUsersStore();
    const chatStore = useChatStore();

    const selectedSearchTypeId = ref<number>(picklist[0]!.id);
    
    const getSearchType = computed(() => {
        switch (selectedSearchTypeId.value){
            case 0:
                return '';
            case 1:
                return '';
            case 2:
                return 'SEARCH_USERS';
            default:
                return '';
        }
    });

    const foundUsers: ComputedRef<User[]> = computed(() => {
        const idList = searchStore.getResults();
        return idList.map(id => usersStore.getUser(id));
    });
    watch(() => searchStore.getResults(), (newIds) => { // updates all users in new result 
        newIds.forEach(id => {
            const user = usersStore.getUser(id);
            if (!user.isLoad) usersStore.userRequest(user.ID);
        });
    });

    const { debouncedFn: searchRequest, cancelTimeout } = debounce((query: string) => {
        const request: SearchUsersPacket | any = {  // del `any` when the other types will be ready
            type: getSearchType.value,
            query,
        };

        socketStore.send(request);
    }, 500);
    
    const openPrivateChatRequest = throttle((userId: UUID) => {
        chatStore.fetchGetPrivateChatId(userId);
    }, 200);


    watch(() => props.input, () => {    // changed input text
        if (!!props.input) searchRequest(props.input);
        else { 
            searchStore.setResults([]); // clear results
            cancelTimeout(); // clear timeout (if it exist)
        }
    });
    watch(selectedSearchTypeId, () => { // changed type of search
        searchStore.setResults([]);
        if (!!props.input) searchRequest(props.input);
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
        <div class="found-list">
            <UserItem 
                v-for="user in foundUsers"
                :id="user.ID"
                :user="user" 
                @click="openPrivateChatRequest(user.ID)"
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

        border: solid green 1px;
    }
</style>