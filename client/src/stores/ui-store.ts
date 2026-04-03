import { defineStore } from "pinia";
import { ref } from "vue";

export const useUiStore = defineStore('ui', () => {
    // --- state
    // sidebar
    const isSearchMode = ref<boolean>(false);

    //chat
    const chatInput = ref<string>('');
    const EmojiButtonState = ref<boolean>(false);
    const AddMediaButtonState = ref<boolean>(false);

    // --- getters
    const sidebar = { isSearchMode };
    const chat = { chatInput, EmojiButtonState, AddMediaButtonState };
    
    // --- actions
    

    return { sidebar, chat };
});