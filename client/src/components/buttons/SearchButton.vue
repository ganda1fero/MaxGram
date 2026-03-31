<script setup lang="ts">

    import { Search } from 'lucide-vue-next';

    const props = defineProps<{
        buttonWidth: number,
        logoWidth: number,
    }>();

</script>
<template>
    <div class="search-button-wrapper" :style="`width:${buttonWidth}px;height:${buttonWidth}px;`">
        <Search :width="props.logoWidth"/>
    </div>
</template>
<style scoped>
    .search-button-wrapper{
        display: flex;
        justify-content: center;
        align-items: center;

        border: none;
        border-radius: 50%;
        background-color: transparent;

        color: rgb(160, 160, 160);

        &:hover{
            background-color: rgba(255, 255, 255, 0.1);
        }
        &:active{
            background-color: rgba(255, 255, 255, 0.2)
        }
    }
</style>