<script setup lang="ts">
    import { useAuthStore } from './stores/useAuthStore';
    import Messanger from './Messanger.vue';
    import Auth from './components/auth/Auth.vue';

    const authStore = useAuthStore();
</script>
<template>
    <Messanger />
    <Transition name="auth">
        <Auth v-if="!authStore.isAuthenticated()"/>
    </Transition>
</template>
<style>
    *{
        padding: 0;
        margin: 0;
    }

    .auth-enter-action,
    .auth-leave-action{
        transition: all 0.5s ease;
    }
    .auth-enter-from,
    .auth-leave-to{
        opacity: 0;
    }
</style>