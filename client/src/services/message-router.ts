import type { Packet } from "@/types/web-socket/packet";
import type { AckAuth } from "@/types/web-socket/server/ack-auth";
import type { AckGetUser } from "@/types/web-socket/server/ack-get-user";
import type { AckSearchUsers } from "@/types/web-socket/server/ack-search-users";

import { useAuthStore } from "@/stores/useAuthStore";
import { useUsersStore } from "@/stores/useUsersStore";
import { useSearchStore } from "@/stores/useSearchStore";

export function handleIncomingPacket(data: Packet) {
    const { payLoad } = data;

    switch (payLoad.type) {
        case 'ACK_AUTH':
            ackAuth(payLoad);
            break;
        case 'ACK_GET_USER':
            ackGetUser(payLoad);
            break;
        case 'ACK_SEARCH_USERS':
            ackSearchUsers(payLoad);
            break;
        default:    // unknown type!
            console.warn("Unknown packet type!", payLoad.type);
            break;
    }
};

function ackAuth(payLoad: AckAuth): void {
    const authStore = useAuthStore();

    authStore.setUUID(payLoad.UUID);
    authStore.confirmAuth();
}

function ackGetUser(payLoad: AckGetUser): void {
    const usersStore = useUsersStore();
    
    const { type, ...other } = payLoad;

    usersStore.upsertUser({
        isLoad: false,
        ...other,
    });
}

function ackSearchUsers(payLoad: AckSearchUsers): void {
    const searchStore = useSearchStore();

    searchStore.setResults(payLoad.result);
}