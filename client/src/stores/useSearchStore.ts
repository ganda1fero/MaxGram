import type { UUID } from "@/types/UUID";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useSearchStore = defineStore('search', () => {
    // --- state
    const results = ref<UUID[]>([]);

    // --- getters
    const getResults = () => results.value;

    // --- actions
    const setResults = (newResults: UUID[]) => {
        results.value = newResults;
    }

    return { getResults, setResults };
})