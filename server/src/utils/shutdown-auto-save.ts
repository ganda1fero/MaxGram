import { connectionsStore } from "../stores/connections-store.js";
import { usersStore } from "../stores/users-store.js";
import { chatsStorage } from "../stores/chats-store.js";
import { messagesStore } from "../stores/messages-store.js";

export async function shutdownAutoSave(signal: string): Promise<void> {
    console.log(`\nserver is closing by signal: ${signal}`);

    connectionsStore._setAllUsersOffline();

    try {
        await Promise.all([
            chatsStorage.save(),
            messagesStore.save(),
            usersStore.save(),
        ]);
        console.log("save done");
        process.exit(0);
    }
    catch (error) {
        console.error("close with an error", error);
        process.exit(1);
    }
} 