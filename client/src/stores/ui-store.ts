import { defineStore } from "pinia";
import { ref } from "vue";

export const useUiStore = defineStore('ui', () => {
    // --- state
    // sidebar
    const isSearchMode = ref<boolean>(false);

    //chat
    const chatInput = ref<string>('');
    const emojiButtonState = ref<boolean>(false);
    const addMediaButtonState = ref<boolean>(false);

    // --- getters
    const sidebar = { isSearchMode };
    const chat = { chatInput, emojiButtonState, addMediaButtonState };
    
    // --- actions
    

    return { sidebar, chat };
});