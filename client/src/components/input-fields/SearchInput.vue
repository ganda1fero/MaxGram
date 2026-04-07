<script setup lang="ts">
    
    import { ref, watch, useId, computed } from 'vue';
    import { Search } from 'lucide-vue-next';
    import { RotateCw } from 'lucide-vue-next';
    import ExitButton from '../buttons/ExitButton.vue';

    const input = defineModel<string>('input', { required: true });
    const props = defineProps<{
        placeholder?: string,
        isReconnect?: boolean,
    }>();
    const emit = defineEmits<{
        (e: 'submit'): void,
        (e: 'focus'): void,
        (e: 'blur'): void,
    }>();

    const isFocus = ref<boolean>(false);
    const inputId = useId();

    const clearInput = () => {
        input.value = '';
    }

    const placeholderValue = computed(() => {
        if (props.isReconnect) return "Reconnecting...";
        if (props.placeholder) return props.placeholder;
        return "Search";
    });

    watch(isFocus, () => {
        if (isFocus.value) {
            emit('focus');
            return;
        }
        emit('blur');
    });

</script>
<template>
    <label :for="inputId" style="display: contents;">
        <div class="input-wrapper" :class="{ 'input-focus': isFocus }">
            <div class="icon-wrapper" v-if="!isReconnect">
                <Search class="icon" :class="{ 'icon-focus': isFocus }" :size="24"/>
            </div>
            <div class="icon-wrapper" v-else>
                <RotateCw class="icon spin" :class="{ 'icon-focus': isFocus }" :size="24"/>
            </div>
            <input
                v-model="input"
                @focus="($event.target as HTMLInputElement).readOnly = false; isFocus = true"
                @blur="isFocus = false"
                @keydown.enter="$emit('submit')"
                autocomplete="off"
                readonly 
                class="input"
                :id="inputId"
            />
            <Transition name="placeholder">
                <div class="placeholder" v-show="!input">
                    {{ placeholderValue }}
                </div>
            </Transition>
            <Transition name="exit-button">
                <ExitButton 
                    v-if="!!input"    
                    class="exit-button"
                    :is-focus="isFocus"
                    @click="clearInput()"
                />
            </Transition>
        </div>
    </label>
</template>
<style scoped>
    .input-wrapper{
        display: flex;
        box-sizing: border-box;
        flex-direction: row;
        align-items: center;
        position: relative;
        
        width: 100%;
        max-width: 340px;
        height: 100%;
        max-height: 44px;
        margin: 0 10px 0 0;

        background-color: rgb(28, 28, 28);

        outline: 3px solid transparent;
        border-radius: 20px;

        transition: all 0.3s ease;

        & .placeholder{
            position: absolute;
            left: 55px;
            line-height: 20px;
            font-size: 15px;
            color: rgba(255, 255, 255, 0.65);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
                'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
            user-select: none;
        }

        &.input-focus{
            background-color: rgba(22, 86, 115, 0.05);
            outline-color: rgba(39, 150, 203, 0.5);
            &:hover{
                outline-color: rgba(39, 150, 203, 0.5);
            }
        }
        &:hover{
            outline-color: rgba(255, 255, 255, 0.3);
        }
    }
    .input{
        box-sizing: border-box;

        width: 100%;
        max-width: 230px;
        height: 20px;

        line-height: 20px;
        font-size: 15px;
        color: rgba(255, 255, 255, 1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
               'Helvetica Neue', Arial, 'Noto Sans', sans-serif;

        border: none;
        outline: none;
        background-color: transparent;
    }
    .icon-wrapper{
        display: flex;
        box-sizing: border-box;

        width: 24px;
        height: auto;
        margin: 0 15px;

        transition: 0.3s ease-out;
    }
    .icon{
        box-sizing: border-box;

        color: rgb(160, 160, 160);

        &.icon-focus{
            color: rgba(39, 150, 203, 1);
        }
        &.spin{
            animation: spin 1.5s linear infinite;
        }
    }
    .exit-button{
        margin: 0 2px 0 10px;
    }
    .exit-button-enter-active,
    .exit-button-leave-active{
        transition: all 0.1s ease-in-out;
    }
    .exit-button-enter-from,
    .exit-button-leave-to{
        opacity: 0;
    }
    .placeholder-enter-active{
        transition: all 0.20s ease;
    }
    .placeholder-enter-from{
        opacity: 0;
        transform: scale(0.5);
        transform: translateX(10px);
    }
    @keyframes spin{
        from{
            transform: rotate(0deg);
        }
        to{
            transform: rotate(360deg);
        }
    }
</style>