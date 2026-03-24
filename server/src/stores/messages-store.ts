import { type Message } from "../types/message.js";
import type { UUID } from "node:crypto";
import fs from 'node:fs/promises';

class MessagesStore {
    private _messagesByChat: Map<UUID, Message[]> = new Map(); // chat UUID
    private readonly SAVE_PATH = './saves/messages.json';

    private addToMap(msg: Message): void {
        if (!this._messagesByChat.has(msg.CHAT_ID))
            this._messagesByChat.set(msg.CHAT_ID, []);

        this._messagesByChat.get(msg.CHAT_ID)!.push(msg);
    }

    async save(): Promise<void> {
        try {
            const messagesList: { CHAT_ID: UUID, messages: Message[] }[] 
                = Array.from(this._messagesByChat, ([CHAT_ID, messages]) => ({
                    CHAT_ID,
                    messages,
                }));

            await fs.writeFile(this.SAVE_PATH, JSON.stringify(messagesList, null, 2));
        }
        catch (error) {
            console.error("messages save is failed!", error);
        }
    }

    async init(): Promise<void> {
        try {
            const saveData = await fs.readFile(this.SAVE_PATH, 'utf-8');
            const messagesList: { CHAT_ID: UUID, messages: Message[] }[] = JSON.parse(saveData);

            for (const {CHAT_ID, messages} of messagesList) {
                this._messagesByChat.set(CHAT_ID, messages);
            }

            console.log("messages successfully loaded");
        }
        catch (error) {
            console.error("messages load is failed, or missing save file", error);
            this._messagesByChat = new Map();
        }
    }

    addMessage(msg: Message): void {
        this.addToMap(msg);
        // тут логика обновления чата (lastMessage, updatedAt)
    }

    getMessagesList(chatId: UUID): Message[] {
        return this._messagesByChat.get(chatId) || [];
    }
}

export const messagesStore = new MessagesStore();