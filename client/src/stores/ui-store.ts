import { defineStore } from "pinia";
import { ref } from "vue";

export const useUiStore = defineStore('ui', () => {
    // --- state
    const isSearchMode = ref(false);

    // --- getters
    

    // --- actions
    

    return { isSearchMode };
});