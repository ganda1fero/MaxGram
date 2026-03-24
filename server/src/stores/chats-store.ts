import { type Chat } from "../types/chat.js"
import { type ChatToJSON } from "../types/chat.js";
import type { UUID } from "node:crypto";
import fs from 'node:fs/promises';

class ChatsStorage {
    private _chatsList: Chat[] = [];
    private _chatsMap: Map<UUID, Chat> = new Map();
    private _userToChatsMap: Map<UUID, Set<Chat>> = new Map();  // user UUID
    private readonly SAVE_PATH = './saves/chats.json';

    async save() {
        try {
            const dataToSave: ChatToJSON[] = this._chatsList.map(chat => ({
                ...chat,
                participants: Array.from(chat.participants),
            }));
            await fs.writeFile(this.SAVE_PATH, JSON.stringify(dataToSave, null, 2));
        }
        catch(error) {
            console.error("chats save is failed!", error);
        }
    }

    async init(): Promise<void> {
        try {
            const fileData = await fs.readFile(this.SAVE_PATH, 'utf-8');
            const rawChats: ChatToJSON[] = JSON.parse(fileData);
            const chats: Chat[] = rawChats.map(rawChat => ({
                ...rawChat,
                participants: new Set(rawChat.participants),
            }));

            chats.forEach(chat => {
                if (!this.addChat(chat)) throw new Error("error in chats.forEach()");
            });

            console.log("chats successfully loaded");
        }
        catch (error) { 
            console.error("chats load is failed, or missing save file", error);
            this._chatsList = [];
            this._chatsMap = new Map();
            this._userToChatsMap = new Map();
        }
    }
    
    addChat(chat: Chat): boolean {
        if (this._chatsMap.has(chat.ID)) {
            console.warn('try to recreate existing chat');
            return false;
        }

        this._chatsList.push(chat);
        this._chatsMap.set(chat.ID, chat);
        for (const userID of chat.participants) {
            if (!this._userToChatsMap.has(userID)) this._userToChatsMap.set(userID, new Set());

            this._userToChatsMap.get(userID)!.add(chat);
        }

        return true;
    }

    getChat(chatID: UUID): Chat | undefined {
        return this._chatsMap.get(chatID);
    }
    getUserChatsSet(userID: UUID): Set<Chat> | undefined {
        return this._userToChatsMap.get(userID);
    }
}

export const chatsStorage = new ChatsStorage();