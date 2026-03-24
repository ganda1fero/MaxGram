<script setup lang="ts">

    const prop = defineProps<{
        isActive: boolean,
    }>();

    const emit = defineEmits<{
        (e: 'click'): void,
    }>();

</script>
<template>
    <button class="paperclip-button-wrapper" type="button" @click="$emit('click')">
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
            class="paperclip-icon"
            :class="isActive? 'selected' : 'not-selected'"
        >
            <path 
                d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551"
            />
        </svg>
    </button>
</template>
<style scoped>
    .paperclip-button-wrapper{
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
    .paperclip-icon{
        position: absolute;
        width: 27px;
        right: 2px;
        bottom: 2px;
        aspect-ratio: 1/1;
        background-color: transparent;

        transition: background-color 0.2s ease;
    }

    .not-selected{
        color: rgb(120, 120, 120);
    }
    .paperclip-button-wrapper:hover .not-selected{
        color: rgb(160, 160, 160);
    }
    .selected{
        color: rgb(135, 116, 214);
        filter: drop-shadow(0 0 4px rgba(135, 116, 214, 0.6));
    }
</style>