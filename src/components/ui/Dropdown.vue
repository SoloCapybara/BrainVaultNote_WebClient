<template>
  <div class="dropdown-wrapper" :class="{ 'is-open': isOpen }" ref="wrapperRef">
    <div class="dropdown-trigger" @click="toggle" ref="triggerRef">
      <slot name="trigger">
        <button class="dropdown-btn">
          <span>点击</span>
          <i class="fas fa-chevron-down" :class="{ rotated: isOpen }"></i>
        </button>
      </slot>
    </div>
    <Teleport to="body">
      <Transition name="dropdown">
        <div 
          v-if="isOpen" 
          class="dropdown-menu" 
          :style="menuStyle"
          @click.stop
          ref="menuRef"
        >
          <slot></slot>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

interface Props {
  modelValue?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isOpen = ref(props.modelValue)
const wrapperRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const menuStyle = ref<{ top: string; right: string; maxHeight?: string }>({ top: '0px', right: '0px' })

// 计算菜单位置
const updateMenuPosition = () => {
  if (!isOpen.value || !triggerRef.value) return
  
  nextTick(() => {
    if (!triggerRef.value) return
    
    const triggerRect = triggerRef.value.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth
    
    // 计算菜单应该出现的位置
    const menuTop = triggerRect.bottom + 8
    const menuRight = viewportWidth - triggerRect.right
    
    // 计算最大高度（确保不超出视口）
    const maxHeight = Math.min(400, viewportHeight - menuTop - 16)
    
    menuStyle.value = {
      top: `${menuTop}px`,
      right: `${menuRight}px`,
      maxHeight: `${maxHeight}px`,
    }
  })
}

// 监听外部点击
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.dropdown-wrapper') && !target.closest('.dropdown-menu')) {
    isOpen.value = false
    emit('update:modelValue', false)
  }
}

const toggle = () => {
  isOpen.value = !isOpen.value
  emit('update:modelValue', isOpen.value)
  if (isOpen.value) {
    updateMenuPosition()
  }
}

// 监听 props 变化
watch(() => props.modelValue, (newValue) => {
  isOpen.value = newValue
  if (newValue) {
    updateMenuPosition()
  }
})

// 监听 isOpen 变化并触发事件
watch(isOpen, (newValue) => {
  emit('update:modelValue', newValue)
  if (newValue) {
    updateMenuPosition()
  }
})

// 监听窗口大小变化和滚动
const handleResize = () => {
  if (isOpen.value) {
    updateMenuPosition()
  }
}

const handleScroll = () => {
  if (isOpen.value) {
    updateMenuPosition()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleScroll, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleScroll, true)
})
</script>

<style scoped>
.dropdown-wrapper {
  position: relative;
  display: inline-block;
}

.dropdown-trigger {
  cursor: pointer;
}

.dropdown-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  margin: 0;
  background: none;
  border: none;
  cursor: pointer;
}

.dropdown-btn .fa-chevron-down {
  font-size: 10px;
  transition: transform 0.2s ease;
}

.dropdown-btn .fa-chevron-down.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: fixed;
  background: #ffffff;
  border: 1px solid var(--color-border);
  border-radius: 0;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.12),
    0 0 0 1px rgba(91, 107, 240, 0.1),
    0 4px 12px rgba(91, 107, 240, 0.08);
  z-index: 10000;
  min-width: 120px;
  max-width: 150px;
  overflow-y: auto;
  overflow-x: hidden;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* 自定义滚动条样式 */
.dropdown-menu::-webkit-scrollbar {
  width: 6px;
}

.dropdown-menu::-webkit-scrollbar-track {
  background: transparent;
}

.dropdown-menu::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.dropdown-menu::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

body.dark .dropdown-menu::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

body.dark .dropdown-menu::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

body.dark .dropdown-menu {
  background: #000000;
  border-color: rgba(91, 107, 240, 0.3);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(91, 107, 240, 0.2),
    0 0 20px rgba(91, 107, 240, 0.15),
    0 4px 16px rgba(91, 107, 240, 0.1);
}

/* 苹果风格动画 - 从触发位置缩放淡入 */
.dropdown-enter-active {
  transition: opacity 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), 
              transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: opacity, transform;
  transform-origin: top right;
}

.dropdown-leave-active {
  transition: opacity 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), 
              transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: opacity, transform;
  transform-origin: top right;
}

.dropdown-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(-8px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-4px);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}
</style>

