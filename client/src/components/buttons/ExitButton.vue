<script setup lang="ts">

    import { X } from 'lucide-vue-next';

    const props = defineProps<{
        isFocus: boolean,
    }>();
    const emit = defineEmits<{
        (e: 'click'): void,
    }>();

</script>
<template>
    <button @click="$emit('click')" class="exit-button" :class="{ 'button-focus': isFocus }">
        <X class="exit-icon" :class="{ 'icon-focus': isFocus }"/>
    </button>
</template>
<style>
    .exit-button{
        display: flex;
        justify-content: center;
        align-items: center;

        aspect-ratio: 1/1;
        height: 90%;

        border: none;
        border-radius: 50%;

        background-color: transparent;

        transition: 0.2s ease-out;

        &:hover{
            background-color: rgba(255, 255, 255, 0.1);
        }
        &:active{
            background-color: rgba(255, 255, 255, 0.2);
        }

        &.button-focus:hover{
            background-color: rgba(39, 150, 203, 0.15);
        }
        &.button-focus:active{
            background-color: rgba(39, 150, 203, 0.3);
        }
    }
    .exit-icon{
        width: 24px;
        height: 24px;
        color: rgb(160, 160, 160);

        transition: 0.2s ease-out;

        &.icon-focus{
            color: rgba(39, 150, 203, 1);
        }
    }
</style>