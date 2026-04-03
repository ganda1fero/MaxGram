import type { Ref } from "vue";
import { ref } from "vue";

export class LRUcache<Tkey, Tvalue>{
    private dataMap: Ref<Map<Tkey, Tvalue>> = ref(new Map());
    private queueSet: Set<Tkey> = new Set();
    private readonly maxSize: number;
    
    constructor(maxSize: number = 10) {
        if (maxSize < 1) throw Error("size can't be less than 1");
        
        this.maxSize = maxSize;
    }

    put(key: Tkey, value: Tvalue): void {
        this.dataMap.value.set(key, value);
        this.queueSet.add(key);

        if (this.queueSet.size > this.maxSize) {
            const firstKey = this.queueSet.keys().next().value;
            if (firstKey) {
                this.dataMap.value.delete(firstKey);
                this.queueSet.delete(firstKey);
            }
        }
    }

    get(key: Tkey): Tvalue | undefined {
        const existing = this.dataMap.value.get(key);
        if (existing === undefined) return;

        this.queueSet.delete(key);
        this.queueSet.add(key);
        return existing;
    }

    has(key: Tkey): boolean {
        return this.queueSet.has(key);
    }

    delete(key: Tkey): boolean {
        const existing = this.dataMap.value.get(key);
        if (existing === undefined) return false;

        this.dataMap.value.delete(key);
        this.queueSet.delete(key);
        return true;
    }
}