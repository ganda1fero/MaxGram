<script setup lang="ts">

    const prop = defineProps<{
        isActive: boolean,
    }>();

    const emit = defineEmits<{
        (e: 'click'): void,
    }>();

</script>
<template>
    <button class="emoji-button-wrapper" type="button" @click="$emit('click')">
        <svg 
            xmlns="http://www.w3.org/2000/svg"
            width="27"
            height="27"
            viewBox="0 0 27 27"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round" 
            class="emoji-icon"
            :class="isActive? 'selected' : 'not-selected'"
        >
            <circle 
                cx="12" 
                cy="12"
                r="10"
            />
            <path 
                d="M8 14s1.5 2 4 2 4-2 4-2"
            />
            <line 
                x1="9"
                x2="9.01"
                y1="9"
                y2="9"
            />
            <line 
                x1="15" 
                x2="15.01" 
                y1="9" 
                y2="9"
            />
        </svg>
    </button>
</template>
<style scoped>
    .emoji-button-wrapper{
        display: flex;
        box-sizing: border-box;
        position: relative;
        justify-content: center;
        align-items: center;
        
        width: 34px;
        height: 34px;
        padding: 0;
        margin: 0;

        border: 0;
        border-radius: 50%;
        background-color: transparent;

        transition: background-color 0.2s ease;
        
        &:hover{
            background-color: rgba(80, 80, 80, 0.8);
        }
    }
    .emoji-icon{
        position: absolute;
        width: 27px;
        right: 2px;
        bottom: 2px;
        background-color: transparent;

        transition: background-color 0.2s ease;
    }

    .not-selected{
        color: rgb(120, 120, 120);
    }
    .emoji-button-wrapper:hover .not-selected{
        color: rgb(160, 160, 160);
    }
    .selected{
        color: rgb(135, 116, 214);
        filter: drop-shadow(0 0 4px rgba(135, 116, 214, 0.6));
    }
</style>