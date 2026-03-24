<script setup lang="ts">
    
    const props = defineProps<{
        name: string,
        isFocus: boolean,
    }>();

</script>
<template>
    <div class="picklist-item" :class="isFocus ? 'focus-item' : ''">
        {{ name }}
        <Transition name="focus-line">
            <div v-if="isFocus" class="focus-line"/>
        </Transition>
    </div>
</template>
<style>
    .picklist-item{
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        position: relative;
        
        width: auto;
        height: 100%;

        padding: 0 15px;

        background-color: transparent;

        border: none;
        border-radius: 15px 15px 0 0;
        
        user-select: none;

        color: rgba(255, 255, 255, 0.6);
        font-size: 17px;
        line-height: 18px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
               'Helvetica Neue', Arial, 'Noto Sans', sans-serif;

        transition: 0.15s ease;

        &:hover{
            background-color: rgba(255, 255, 255, 0.1);
        }
        &:active{
            background-color: rgba(255, 255, 255, 0.2);
        }
    }
    .focus-item{
        color: rgba(39, 150, 203, 1);
        &:hover{
            background-color: rgba(39, 150, 203, 0.1);
        }
        &:active{
            background-color: rgba(39, 150, 203, 0.2);
        }
    }
    .focus-line{
        position: absolute;

        bottom: 0;

        width: 60%;
        height: 3px;
        border: none;
        border-radius: 50% 50% 0 0;
        
        background-color: rgba(39, 150, 203, 1);
    }

    .focus-line-enter-active,
    .focus-line-leave-active{
        transition: all 0.2s ease-out;
    }
    .focus-line-enter-from,
    .focus-line-leave-to{
        opacity: 0;
        transform: scale(0.8);
        transform: translateY(4px);
    }
</style>