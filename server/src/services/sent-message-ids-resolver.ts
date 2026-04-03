/* 
    This service is something like redis
    Temporary mapping of localId → globalId to prevent duplicate messages.
    Entries expire after MAX_STORE_TIME or are manually evicted once the client acknowledges the global ID transition.
*/

import type { UUID } from "node:crypto";
type DbNode = {
    globalId: UUID,
    expireAt: number, // create time + MAX_STORE_TIME (ms)
}

const MAX_STORE_TIME_MS = 30 * 60 * 1000; // 30 minutes (+ [0...5] minutes)
const CHEACK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

class SentMessageIdsResolver{
    private db: Map<UUID, DbNode> = new Map();  // localId -> DbNode
    private interavalPtr: NodeJS.Timeout | null = null;

    private deleteExpired(): void {
        const deleteKeys: UUID[] = [];
        const nowTime = Date.now();
        
        for (const [localId, dbNode] of this.db) {
            if (dbNode.expireAt < nowTime) deleteKeys.push(localId);
        }

        deleteKeys.forEach((key) => {
            this.db.delete(key);
        })
    }

    constructor() {
        // запус с .unref(), чтобы node мог закрыться
        const interval = setInterval(() => {
            this.deleteExpired();
        }, CHEACK_INTERVAL_MS);

        this.interavalPtr = interval;
        this.interavalPtr.unref();
    }

    has(localId: UUID): boolean {
        return this.db.has(localId);
    }
    get(localId: UUID): UUID | undefined {
        const dbNode = this.db.get(localId);
        if (!dbNode) return;

        return dbNode.globalId;
    }
    add(localId: UUID, globalId: UUID): void {
        const dbNode: DbNode = {
            globalId,
            expireAt: Date.now() + MAX_STORE_TIME_MS,
        };
        this.db.set(localId, dbNode);
    }
    resolve(localId: UUID): void {
        this.db.delete(localId);
    }
}

export const sentMessageIdsResolver = new SentMessageIdsResolver();