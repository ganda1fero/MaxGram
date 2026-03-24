<script setup lang="ts">
    import { ref, useId } from 'vue'

    const model = defineModel<string>('input', {required: true });
    const props = defineProps<{
        isError?: boolean,
        isAuthentificated?: boolean,
        disabled?: boolean,
    }>();
    const emits = defineEmits<{
        (e: 'submit'): void,
    }>();
    
    const isFocus = ref<boolean>(false);
    const inputId = useId();

</script>
<template>
    <div style="margin: 15px 0 10px 0; display: flex;">
        <label :for="inputId" class="label-wrapper">
            <div class="input-wrapper" :class="{ 'focused': isFocus, 'error': isError, 'confirm': isAuthentificated }">
                <Transition name="placeholder">
                    <div class="placeholder" v-if="!model">
                        username
                    </div>
                </Transition>
                <input
                    v-model="model"
                    :disabled="props.disabled"
                    @focus="isFocus = true"
                    @blur="isFocus = false"
                    @keydown.enter="$emit('submit')"
                    autocomplete="off"
                    class="input"
                    :id="inputId"
                />
            </div>
        </label>
    </div>
</template>
<style scoped>
    .label-wrapper{
        display: contents;
    }
    .input-wrapper{
        display: flex;
        position: relative;
        
        width: 100%;
        padding: 8px 8px;
        margin: 0;

        border: solid rgba(255, 255, 255, 0.4) 2px;
        border-radius: 15px;

        transition: all 0.3s ease;

        &.focused{
            border-color: rgba(39, 150, 203, 0.8);
        }
        &.error{
            border-color: rgba(197, 22, 34, 0.8);
        }
        &.confirm{
            border-color: rgba(0, 202, 51, 0.8);
        }
    }
    .placeholder{
        position: absolute;

        left: 8px;
        top: 11px;

        user-select: none;
        
        line-height: 20px;
        font-size: 20px;
        color: rgba(255, 255, 255, 0.3);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
               'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
    }
    .input{
        box-sizing: border-box;

        width: 100%;

        line-height: 20px;
        font-size: 20px;
        color: rgba(255, 255, 255, 1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
               'Helvetica Neue', Arial, 'Noto Sans', sans-serif;

        border: none;
        outline: none;

        background-color: transparent;

        transition: all 0.3s ease;
        
        &:disabled{
            cursor: not-allowed;
            opacity: 0.6;
        }
    }

    .placeholder-enter-active{
        transition: all 0.3s ease;
    }
    .placeholder-leave-active{
        transition: all 0.2s ease;
    }
    .placeholder-enter-from{
        opacity: 0;
        transform: translateX(10px);
    }
    .placeholder-leave-to{
        opacity: 0;
    }
</style>