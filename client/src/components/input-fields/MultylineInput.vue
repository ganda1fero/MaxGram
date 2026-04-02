<script setup lang="ts">
    // need: | v-model<string> - inputText | prop<string> - placeholder | 
    // return|       v-on<> - submit       |

    import { ref, watch, onMounted, nextTick, useId } from 'vue'

    const props = defineProps<{
        placeholder?: string,
    }>();
    const input = defineModel<string>('input', { required: true });
    const emit = defineEmits<{
        (e: 'submit'): void,
    }>();

    const textareaRef = ref<HTMLTextAreaElement>();
    const MAX_HEIGHT = 430;
    const inputId = useId();

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (input.value.trim()) {

                emit('submit');
                
                nextTick(() => adjustHeight());
            }
        }
    };

    const adjustHeight = () => {
        const el = textareaRef.value;
        if (!el) return;
        
        el.style.height = 'auto';
        const newHeight = Math.min(el.scrollHeight, MAX_HEIGHT);
        requestAnimationFrame(() => {
            el.style.height = `${newHeight}px`;
        });
    };

    watch(input, () => {
        nextTick(adjustHeight);
    }, { flush: 'post' });

    onMounted(() => {
        adjustHeight();
    });
</script>
<template>
    <div class="wrapper">
        <Transition name="placeholder-transition">
            <label 
                :for="inputId"
                class="placeholder"
                v-if="!input"
            >
                {{ placeholder || 'Message' }}
            </label>
        </Transition>
        <textarea
            ref="textareaRef"
            v-model="input"
            @keydown="handleKeyDown"
            :id="inputId"
            class="input-field"
            rows="1"
        />
    </div>
</template>
<style scoped>
    textarea{
        field-sizing: content;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .input-field {
        box-sizing: border-box;
        
        flex: 0 1 530px;
        width: 100%;
        min-width: 0;
        padding: 8px 0px;
        
        min-height: 36px; /* ~1 строка: line-height 20px + padding 16px */
        max-height: 400px;
        
        overflow-y: auto;
        overflow-x: hidden;
        
        outline: none;
        
        background: rgb(45, 45, 45);
        border: 0;
        color: white;
        font-size: 15px;
        line-height: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
               'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
        
        resize: none;
    }
    .input-field::-webkit-scrollbar {
        width: 0;
    }
    .input-field::-webkit-scrollbar-track {
        background: transparent;
    }

    .wrapper{
        display: flex;
        position: relative;
        width: 100%; 
        max-width: 530px;
        margin: 0;
        background-color: transparent;
    }

    .placeholder{
        position: absolute;
        top: 10px;
        left: 0px;
        color: rgba(255, 255, 255, 0.65);
        background-color: transparent;
        font-family: inherit;
        pointer-events: none;
        user-select: none;
    }

    .placeholder-transition-enter-active,
    .placeholder-transition-leave-active {
        transition: all 0.20s ease;
    }
    .placeholder-transition-enter-from,
    .placeholder-transition-leave-to {
        opacity: 0;
        transform: translateX(10px);
    }
</style> 