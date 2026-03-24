<script setup lang="ts">

    const prop = defineProps<{
        canSend: boolean,
    }>();

    const emit = defineEmits<{
        (e: 'submit'): void,
    }>();

</script>
<template>
    <button class="send-button" @click="$emit('submit')">
        <Transition name="logo">
            <svg 
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="send-icon"
                v-if="canSend === true"
            >
                <path 
                    d="M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z"
                />
                <path 
                    d="M6 12h16"
                />
            </svg>
        </Transition>
    </button>
</template>
<style scoped>
    .send-button{
        display: flex;
        box-sizing: border-box;
        position: relative;

        justify-content: center;
        align-items: center;

        width: 46px;
        height: 46px;
        padding: 0;
        margin: 0;

        border-width: 0; 
        border-radius: 50%;

        background-color: rgb(160, 160, 160);

        cursor: pointer;
        transition: background-color 0.2s ease, transform 0.1s ease;

        &:hover{
            background-color: rgb(120, 120, 120);
        }
        &:active{
            transform: scale(0.95);
        }
    }
    .send-icon{
        position: absolute;
        display: block;
        box-sizing: border-box;
        width: 27px;
        height: 27px;
        
        background-color: transparent;
        color: rgb(20, 20, 20);
    }

    .logo-enter-active,
    .logo-leave-active{
        transition: all 0.2s ease;
    }
    .logo-enter-from,
    .logo-leave-to {
        opacity: 0;
        transform: scale(0);
    }
</style>