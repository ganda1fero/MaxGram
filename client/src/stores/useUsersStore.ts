import type { UUID } from "@/types/UUID";
import type { User, GradientPair } from "@/types/user";
import type { GetUserPacket } from "@/types/web-socket/client/get-user-packet";

import { defineStore } from "pinia";
import { ref } from "vue";
import { LRUcache } from "@/utils/lru-cache";
import { useWebSocketStore } from "./useWebSocketStore";

export const useUsersStore = defineStore('users', () => {
    // --- state
    const users = new LRUcache<UUID, User>(100);    // max size = 100

    const socketStore = useWebSocketStore();

    // --- getters
    const getUser = (uuid: UUID): User => {
        const existing = users.get(uuid);

        if (existing) return existing;
        
        const newUser = addUser( {ID: uuid } );
        userRequest(uuid);
        return newUser;
    };

    // --- actions
    const addUser = (userData: Partial<User> & { readonly ID: UUID }): User => {
        const gradientPair = calculateGradientPairByUUID(userData.ID);

        const newUser: User = {
            isLoading: true,
            username: 'Unknown',
            status: 'offline',
            ...userData,
            gradientPair,
        };

        users.put(newUser.ID, newUser);
        return newUser;
    };

    const upsertUser = (userData: Partial<User> & { readonly ID: UUID }): void => {
        const existing = getUser(userData.ID);
        
        Object.assign(existing, userData);
    };

    const calculateGradientPairByUUID = (uuid: UUID): GradientPair => {
        let hash = 0;
        for (let i = 0; i < uuid.length; ++i) {
            const char = uuid.charCodeAt(i);
            hash = char + ((hash << 5) - hash);
            hash = hash & hash; // bits operations in 32 bits
        }

        const hue = Math.abs(hash) % 360;
        
        const topHsl = `hsl(${(hue + 15) % 360}, 70%, 60%)`;
        const bottomHsl = `hsl(${hue}, 65%, 45%)`;

        return { topHsl, bottomHsl };
    }

    const userRequest = (uuid: UUID) => {
        const requestObj = {
            type: "GET_USER",
            ID: uuid,
        } as GetUserPacket;

        socketStore.send(requestObj);
    }

    return { getUser, upsertUser, userRequest };
});