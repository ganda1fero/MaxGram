<script setup lang="ts">
    import { ref, watch } from 'vue'
    import { Maximize } from 'lucide-vue-next';
    import { useAuthStore } from '@/stores/useAuthStore';
    import LoginInput from '../input-fields/LoginInput.vue';

    const authStore = useAuthStore();
    const input = ref<string>('');
    const isInputCorrect = ref<boolean>(true);
    const deniedEffect = ref<boolean>(false);

    let isSnakeAction = false;

    watch(input, (newInput, oldInput) => {
        if (isInputCorrect.value && newInput.length < oldInput.length) return;

        const forbiddenChars = /[!@#$%^&*()=+\\|{}[\]<>,?\/]/; // регулярка
        isInputCorrect.value = true;
        if (forbiddenChars.test(input.value)) {
            isInputCorrect.value = false;
        } 
    });

    const loginLogic = () => {
        if (!!authStore.getUsername()) return;

        if (!input.value || !isInputCorrect.value) {
            if (!isSnakeAction){
                isSnakeAction = true;
                deniedEffect.value = true;
                setTimeout(() => {
                    deniedEffect.value = false;
                    isSnakeAction = false;
                }, 1500);
            }
            return;
        }

        // auth logic
        authStore.setUsername(input.value);
        authStore.authentificate();
    };
</script>
<template>
    <div class="blur-wrapper">
        <div class="login-field">
            <div class="logo-wrapper">
                <Maximize class="logo" />
            </div>
            <h1>Maxgram</h1>
            <h2>Введите <span>username</span> аккаунта</h2>
            <div class="input-wrapper">
                <LoginInput 
                    v-model:input="input"
                    :is-error="!isInputCorrect"
                    :is-authentificated="!!authStore.getUsername()"
                    :disabled="!!authStore.getUsername()"
                    @submit="loginLogic()"
                />
            </div>
            <button 
                class="submit-button"
                @click="loginLogic()"
                :class="
                    { 'denied': deniedEffect, 
                        'authentificated': !!authStore.getUsername()
                    }
                "
                :disabled="!!authStore.getUsername()"
            >
                Вход
            </button>
        </div>
    </div>
</template>
<style scoped>
    .blur-wrapper{
        display: flex;
        justify-content: center;
        align-items: center;
        position: fixed;

        inset: 0;
        width: 100dvw;
        height: 100vh;

        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
               'Helvetica Neue', Arial, 'Noto Sans', sans-serif;

        backdrop-filter: blur(30px);
        background-color: rgba(0, 0, 0, 0.3);

        z-index: 999;
    }
    
    .login-field{
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        padding: 50px 70px 30px 70px;

        background-color: rgb(40, 40, 40);

        border-radius: 30px;

        & h1{
            margin: 15px 0 5px 0;
            text-align: center;
            font-size: 30px;
            color: rgba(255, 255, 255, 0.9);
        }
        
        & h2{
            text-align: center;
            font-size: 15px;
            color: rgba(255, 255, 255, 0.5);
        }
    }

    .logo-wrapper{
        display: flex;
        justify-content: center;

        & .logo{
            width: 100px;
            height: 100px;

            color: rgba(39, 150, 203, 1);
        }
    }

    .input-wrapper{
        display: flex;
        justify-content: center;
        
        width: 100%;
        margin: 15px 0 10px 0;
    }

    .submit-button{
        width: 100%;
        max-width: 100px;

        padding: 10px 20px;

        line-height: 20px;
        font-size: 20px;
        text-align: center;
        color: rgba(39, 150, 203, 1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
               'Helvetica Neue', Arial, 'Noto Sans', sans-serif;

        border: none;
        border-radius: 10px;

        background-color: transparent;

        transition: all 0.3s ease;

        &:hover{
            background-color: rgba(255, 255, 255, 0.1);
        }
    }

    .denied {
        background-color: rgba(255, 0, 17, 0.2);

        animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        transform: translate3d(0, 0, 0);

        &:hover{
            background-color: rgba(255, 0, 17, 0.2);
        }
    }

    .authentificated{
        background-color: rgba(0, 202, 51, 0.3);

        &:hover{
            background-color: rgba(0, 202, 51, 0.3);
        }
    }

    @keyframes shake {
        10%,
        90% {
            transform: translate3d(-1px, 0, 0);
        }

        20%,
        80% {
            transform: translate3d(2px, 0, 0);
        }

        30%,
        50%,
        70% {
            transform: translate3d(-4px, 0, 0);
        }

        40%,
        60% {
            transform: translate3d(4px, 0, 0);
        }
    }
</style>