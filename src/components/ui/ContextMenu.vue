<template>
  <Transition name="context-menu">
    <div 
      v-if="visible"
      ref="menuRef"
      class="context-menu"
      :style="menuStyle"
      @click.stop
    >
      <div 
        v-for="(item, index) in items" 
        :key="index"
        class="context-menu-item"
        :class="{ 
          'disabled': item.disabled,
          'divider': item.divider 
        }"
        @click="handleItemClick(item)"
      >
        <i v-if="item.icon" :class="item.icon"></i>
        <span v-if="item.label" class="context-menu-item-text">{{ item.label }}</span>
        <span v-if="item.shortcut" class="context-menu-item-shortcut">{{ item.shortcut }}</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

export interface ContextMenuItem {
  label?: string
  icon?: string
  shortcut?: string
  disabled?: boolean
  divider?: boolean
  action?: () => void
}

interface Props {
  items: ContextMenuItem[]
  visible: boolean
  x: number
  y: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'item-click': [item: ContextMenuItem]
}>()

const menuRef = ref<HTMLElement | null>(null)
const menuStyle = ref<Record<string, string>>({})

const updatePosition = () => {
  if (!menuRef.value) return
  
  const rect = menuRef.value.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  let left = props.x
  let top = props.y
  
  // 如果超出右边界，调整到左边
  if (left + rect.width > viewportWidth) {
    left = viewportWidth - rect.width - 8
  }
  
  // 如果超出下边界，调整到上面
  if (top + rect.height > viewportHeight) {
    top = viewportHeight - rect.height - 8
  }
  
  // 确保不超出左边界和上边界
  if (left < 8) left = 8
  if (top < 8) top = 8
  
  menuStyle.value = {
    left: `${left}px`,
    top: `${top}px`,
    position: 'fixed'
  }
}

const handleItemClick = (item: ContextMenuItem) => {
  if (item.disabled || item.divider) return
  
  if (item.action) {
    item.action()
  }
  
  emit('item-click', item)
  emit('update:visible', false)
}

let clickOutsideTimeout: ReturnType<typeof setTimeout> | null = null

const handleClickOutside = (event: MouseEvent) => {
  // 延迟关闭，避免右键事件立即触发关闭
  if (clickOutsideTimeout) {
    clearTimeout(clickOutsideTimeout)
  }
  
  clickOutsideTimeout = setTimeout(() => {
    if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
      emit('update:visible', false)
    }
  }, 100)
}

watch(() => props.visible, (newVal) => {
  if (newVal) {
    nextTick(() => {
      updatePosition()
      // 延迟添加事件监听，避免右键事件立即触发关闭
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside)
        document.addEventListener('contextmenu', handleClickOutside)
      }, 200)
    })
  } else {
    if (clickOutsideTimeout) {
      clearTimeout(clickOutsideTimeout)
      clickOutsideTimeout = null
    }
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('contextmenu', handleClickOutside)
  }
})

onMounted(() => {
  if (props.visible) {
    nextTick(() => {
      updatePosition()
    })
  }
})

onUnmounted(() => {
  if (clickOutsideTimeout) {
    clearTimeout(clickOutsideTimeout)
    clickOutsideTimeout = null
  }
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('contextmenu', handleClickOutside)
})
</script>


<style scoped>
.context-menu {
  position: fixed;
  z-index: 10001;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.12),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  min-width: 180px;
  padding: 4px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

body.dark .context-menu {
  background: #000000;
  border-color: rgba(91, 107, 240, 0.4);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.8),
    0 0 0 1px rgba(91, 107, 240, 0.3),
    0 0 20px rgba(91, 107, 240, 0.2),
    0 0 40px rgba(91, 107, 240, 0.1);
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--color-text-primary);
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.15s ease;
  user-select: none;
}

.context-menu-item:hover:not(.disabled):not(.divider) {
  background: rgba(91, 107, 240, 0.1);
  color: var(--primary-color);
}

body.dark .context-menu-item:hover:not(.disabled):not(.divider) {
  background: rgba(91, 107, 240, 0.2);
}

.context-menu-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.context-menu-item.divider {
  height: 1px;
  padding: 0;
  margin: 4px 0;
  background: var(--color-border);
  cursor: default;
}

.context-menu-item.divider:hover {
  background: var(--color-border);
}

.context-menu-item i {
  width: 16px;
  text-align: center;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.context-menu-item:hover:not(.disabled):not(.divider) i {
  color: var(--primary-color);
}

.context-menu-item-text {
  flex: 1;
  font-weight: 500;
}

.context-menu-item-shortcut {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-family: 'Courier New', monospace;
  margin-left: 16px;
}

body.dark .context-menu-item-shortcut {
  color: rgba(255, 255, 255, 0.5);
}

/* 动画效果 */
.context-menu-enter-active {
  transition: opacity 0.15s cubic-bezier(0.34, 1.56, 0.64, 1),
              transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: opacity, transform;
}

.context-menu-leave-active {
  transition: opacity 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94),
              transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: opacity, transform;
}

.context-menu-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(-6px);
}

.context-menu-leave-to {
  opacity: 0;
  transform: scale(0.98) translateY(2px);
}

.context-menu-enter-to,
.context-menu-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}
</style>

