import type { UUID } from "@/types/UUID";
import type { User } from "@/types/user";
import type { GetUserPacket } from "@/types/web-socket/client/get-user-packet";

import { defineStore } from "pinia";
import { ref } from "vue";
import { useWebSocketStore } from "./useWebSocketStore";

export const useUsersStore = defineStore('users', () => {
    // --- state
    const users = ref(new Map<UUID, User>());
    let usersCount = 0;   // for LRU chache
    const MAX_USERS_COUNT = 100;
    const socketStore = useWebSocketStore();

    // --- getters
    const getUser = (uuid: UUID): User => {
        const existing = users.value.get(uuid);

        if (existing) {
            users.value.delete(existing.ID);
            users.value.set(existing.ID, existing);

            return existing;
        } else {
            const newUser = addUser( {ID: uuid } );
            
            userRequest(uuid);

            return newUser;
        }
    };

    // --- actions
    const addUser = (userData: Partial<User> & { readonly ID: UUID }): User => {
        if (usersCount >= MAX_USERS_COUNT) {
            const firstKey = users.value.keys().next().value;
            if (firstKey) users.value.delete(firstKey);
        } else usersCount++;
        
        const newUser: User = {
            isLoad: true,
            username: 'Unknown',
            status: 'offline',
            ...userData,
        };

        users.value.set(newUser.ID, newUser);
        return newUser;
    };

    const upsertUser = (userData: Partial<User> & { readonly ID: UUID }): void => {
        const existing = getUser(userData.ID);
        
        Object.assign(existing, userData);
    };

    const userRequest = (uuid: UUID) => {
        const requestObj = {
            type: "GET_USER",
            ID: uuid,
        } as GetUserPacket;

        socketStore.send(requestObj);
    }

    return { getUser, upsertUser, userRequest };
});