<script setup lang="ts">

    import { nextTick, ref } from 'vue';

    import { CopyCheck, CornerUpLeft, MehIcon } from 'lucide-vue-next';
    import { Pencil } from 'lucide-vue-next';
    import { Copy } from 'lucide-vue-next';
    import { Trash } from 'lucide-vue-next';

    const emit = defineEmits<{
        (e: 'reply'): void,
        (e: 'edit'): void,
        (e: 'copy'): void,
        (e: 'delete'): void,
        (e: 'close-menu'): void,
    }>();

    const menuCoord = ref({ x: 0, y: 0 });
    const showMenu = ref(false);
    const menuElement = ref<HTMLElement | null>(null);
    const mineMessage = ref(false);

    const openMenu = async (e: MouseEvent, isMineMessage: boolean ) => {
        e.preventDefault();

        let x = e.clientX - 2;
        let y = e.clientY - 2;

        showMenu.value = true;
        await nextTick();

        if (menuElement.value) {
            const { offsetWidth, offsetHeight } = menuElement.value;
            const winWidth = window.innerWidth;
            const winHeight = window.innerHeight;

            // if went outside the window
            if (x + offsetWidth > winWidth) x = winWidth - offsetWidth - 10;
            if (y + offsetHeight > winHeight) y = winHeight - offsetHeight - 10;

            menuCoord.value = { x, y };
        }
        else console.warn('menuElement not found');

        mineMessage.value = isMineMessage;
    }

    const closeMenu = () => {
        showMenu.value = false;
        emit('close-menu');
    }

    defineExpose({
        openMenu
    });

</script>
<template>
    <Teleport to="body">
        <Transition name="message-menu">
            <div 
                class="message-menu-wrapper"
                v-if="showMenu"
                :style="{ 
                    top: (menuCoord.y - 50) + 'px',
                    left: (menuCoord.x - 50) + 'px',
                }"
                @mouseleave="closeMenu()"
                @click="closeMenu()"
            >
                <div class="message-menu" ref="menuElement">
                    <div 
                        class="message-menu-item"
                        @click="$emit('reply'); closeMenu();"
                    > <!-- reply -->
                        <CornerUpLeft class="choise-icon" :stroke-width="3"/>
                        <span>Reply</span>
                    </div>
                    <div 
                        class="message-menu-item" v-if="mineMessage"
                        @click="$emit('edit'); closeMenu();"
                    >  <!-- edit (only self messages) -->
                        <Pencil class="choise-icon" :stroke-width="3"/>
                        <span>Edit</span>
                    </div>
                    <div 
                        class="message-menu-item"
                        @click="$emit('copy'); closeMenu();"    
                    > <!-- copy -->
                        <Copy class="choise-icon" :stroke-width="3"/>
                        <span>CopyText</span>
                    </div>
                    <div 
                        class="message-menu-item delete-icon"
                        @click="$emit('delete'); closeMenu();"    
                    > <!-- delete -->
                        <Trash class="choise-icon" :stroke-width="3"/>
                        <span>Delete</span>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
<style scoped>
    .message-menu-wrapper{
        position: fixed;
        padding: 50px;
        z-index: 9999;
        background: transparent;
    }
    .message-menu{
        display: flex;
        flex-direction: column;
        
        gap: 4px;
        padding: 8px 6px;

        border-radius: 15px;
        background-color: rgba(50, 50, 50, 0.90);
        backdrop-filter: blur(2px);
        
        & .message-menu-item{
            display: flex;
            flex-direction: row;
            position: relative;

            align-items: center;
            color: rgba(170, 170, 170, 0.9);
            
            width: 150px;
            height: 32px;

            border-radius: 6px;
            background: transparent;

            -webkit-user-select: none;
            -ms-user-select: none;
            user-select: none;

            transition: all 0.2s ease;

            &:hover{
                background-color: rgba(0, 0, 0, 0.3);
            }

            & span{
                position: relative;
                bottom: 1px;
                font-size: 16px;
                font-weight: 400;
                color: rgba(255, 255, 255, 1);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
                    'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
            }

            & .choise-icon{
                margin: 0 20px 0 8px;
                width: 20px;
                height: 20px;

                transition: all 0.2s ease;
            }

            &.delete-icon{
                color: rgb(205, 54, 51);
                &:hover{
                    color: rgb(255, 255,255);
                    & span{
                        color: rgb(255, 255, 255);
                    }
                }

                & span{
                    color: rgb(205, 54, 51);
                    font-size: 16px;
                    font-weight: 500;
                }
            }
        }
    }

    .message-menu-enter-active,
    .message-menu-leave-active{
        transition: all 0.2s;
    }
    .message-menu-enter-from,
    .message-menu-leave-to{
        transform: scale(0.3);
        opacity: 0;
    }
</style>