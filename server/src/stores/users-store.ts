import { type User } from '../types/user.js'
import type { UUID } from 'node:crypto';
import fs from 'node:fs/promises';

class UsersStore {
    private _usersList: User[] = [];
    private _usersMap: Map<UUID, User> = new Map();
    private _usernamesMap: Map<string, User> = new Map();
    private readonly SAVE_PATH = './saves/users.json';

    async save(): Promise<void> {
        try {
            await fs.writeFile(this.SAVE_PATH, JSON.stringify(this._usersList, null, 2));
        }
        catch (error) {
            console.error("users save is failed!", error);
        }
    }

    async init() {
        try {
            const fileData = await fs.readFile(this.SAVE_PATH, 'utf-8');
            const users: User[] = JSON.parse(fileData);

            users.forEach(user => {
                if (!this.add(user)) throw new Error("Error in users.forEach()");
            });

            console.log("users successfully loaded");
        }
        catch (error) {
            console.error("users load is failed, or missing save file", error);
            this._usersList = [];
            this._usersMap = new Map();
            this._usernamesMap = new Map();
        }
    }

    add(user: User): boolean {
        if (this._usersMap.has(user.ID) || this._usernamesMap.has(user.username)) return false;

        this._usersList.push(user);
        this._usersMap.set(user.ID, user);
        this._usernamesMap.set(user.username, user);

        return true;
    }
    
    getByID(id: UUID): User | undefined {
        return this._usersMap.get(id);
    }
    getByUsername(username: string): User | undefined {
        return this._usernamesMap.get(username);
    }

    search(query: string, exceptUUID: UUID): UUID[] {
        if (!query) return [];
        const lowerQuery = query.toLowerCase(); 

        return this._usersList
            .filter((item) => item.username.toLowerCase().startsWith(lowerQuery) && item.ID !== exceptUUID)
            .map((item) => item.ID);
    }
}

export const usersStore = new UsersStore();