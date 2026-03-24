import type { UUID } from "@/types/UUID";
import type { AuthPacket } from "@/types/web-socket/client/auth-packet";
import { defineStore } from "pinia";
import { ref } from 'vue'

import { useWebSocketStore } from "./useWebSocketStore";

export const useAuthStore = defineStore('auth' , () => {
    // --- state
    let username = ref<string>('');
    let selfUUID = ref<UUID | null>(null);
    let authResolver: ((value: boolean) => void) | null = null;
    const socketStore = useWebSocketStore();

    // --- getters
    const getUUID = (): UUID | null => selfUUID.value;
    const getUsername = (): string => username.value;
    const isAuthenticated = (): boolean => !!selfUUID.value;

    // --- actions
    const setUsername = (newUsername: string) => { username.value = newUsername };
    const setUUID = (newUUID: UUID) => { selfUUID.value = newUUID };

    const authentificate = async () => {
        if (!username) return;
        if (!socketStore.isConnected()) return;

        const authObj: AuthPacket = {
            type: 'AUTH',
            username: username.value,
        };

        return new Promise((resolve) => {
            authResolver = resolve;
            socketStore.send(authObj);
        });
    };

    const confirmAuth = () => {
        if (authResolver){
            authResolver(true);
            authResolver = null;
        }
    }

    return { getUUID, getUsername, isAuthenticated, setUsername, setUUID, authentificate, confirmAuth };
});