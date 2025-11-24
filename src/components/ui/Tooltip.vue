<template>
  <div 
    ref="wrapperRef"
    class="tooltip-wrapper"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
  >
    <slot></slot>
    <Transition name="tooltip">
      <div 
        v-if="visible" 
        ref="tooltipRef"
        class="tooltip"
        :class="[`tooltip-${placement}`]"
        :style="tooltipStyle"
      >
        <div class="tooltip-content">
          {{ text }}
        </div>
        <div class="tooltip-arrow" :class="`tooltip-arrow-${placement}`"></div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'

interface Props {
  text: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'top',
  delay: 100
})

const visible = ref(false)
const tooltipRef = ref<HTMLElement | null>(null)
const wrapperRef = ref<HTMLElement | null>(null)
const tooltipStyle = ref<Record<string, string>>({})
let showTimeout: ReturnType<typeof setTimeout> | null = null
let hideTimeout: ReturnType<typeof setTimeout> | null = null

const showTooltip = () => {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
  
  showTimeout = setTimeout(() => {
    visible.value = true
    nextTick(() => {
      updatePosition()
    })
  }, props.delay)
}

const hideTooltip = () => {
  if (showTimeout) {
    clearTimeout(showTimeout)
    showTimeout = null
  }
  
  hideTimeout = setTimeout(() => {
    visible.value = false
  }, 50)
}

const updatePosition = () => {
  if (!tooltipRef.value || !wrapperRef.value) return
  
  const wrapper = wrapperRef.value
  
  const wrapperRect = wrapper.getBoundingClientRect()
  const tooltipRect = tooltipRef.value.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  let top = 0
  let left = 0
  
  switch (props.placement) {
    case 'top':
      top = wrapperRect.top - tooltipRect.height - 8
      left = wrapperRect.left + (wrapperRect.width - tooltipRect.width) / 2
      // 如果超出顶部，改为底部显示
      if (top < 0) {
        top = wrapperRect.bottom + 8
      }
      // 如果超出左边，调整位置
      if (left < 0) {
        left = 8
      }
      // 如果超出右边，调整位置
      if (left + tooltipRect.width > viewportWidth) {
        left = viewportWidth - tooltipRect.width - 8
      }
      break
    case 'bottom':
      top = wrapperRect.bottom + 8
      left = wrapperRect.left + (wrapperRect.width - tooltipRect.width) / 2
      // 如果超出底部，改为顶部显示
      if (top + tooltipRect.height > viewportHeight) {
        top = wrapperRect.top - tooltipRect.height - 8
      }
      // 如果超出左边，调整位置
      if (left < 0) {
        left = 8
      }
      // 如果超出右边，调整位置
      if (left + tooltipRect.width > viewportWidth) {
        left = viewportWidth - tooltipRect.width - 8
      }
      break
    case 'left':
      top = wrapperRect.top + (wrapperRect.height - tooltipRect.height) / 2
      left = wrapperRect.left - tooltipRect.width - 8
      // 如果超出左边，改为右边显示
      if (left < 0) {
        left = wrapperRect.right + 8
      }
      // 如果超出顶部，调整位置
      if (top < 0) {
        top = 8
      }
      // 如果超出底部，调整位置
      if (top + tooltipRect.height > viewportHeight) {
        top = viewportHeight - tooltipRect.height - 8
      }
      break
    case 'right':
      top = wrapperRect.top + (wrapperRect.height - tooltipRect.height) / 2
      left = wrapperRect.right + 8
      // 如果超出右边，改为左边显示
      if (left + tooltipRect.width > viewportWidth) {
        left = wrapperRect.left - tooltipRect.width - 8
      }
      // 如果超出顶部，调整位置
      if (top < 0) {
        top = 8
      }
      // 如果超出底部，调整位置
      if (top + tooltipRect.height > viewportHeight) {
        top = viewportHeight - tooltipRect.height - 8
      }
      break
  }
  
  tooltipStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
    position: 'fixed'
  }
}

onMounted(() => {
  window.addEventListener('scroll', updatePosition, true)
  window.addEventListener('resize', updatePosition)
})

onUnmounted(() => {
  window.removeEventListener('scroll', updatePosition, true)
  window.removeEventListener('resize', updatePosition)
  if (showTimeout) clearTimeout(showTimeout)
  if (hideTimeout) clearTimeout(hideTimeout)
})
</script>

<style scoped>
.tooltip-wrapper {
  display: inline-block;
  position: relative;
}

.tooltip {
  position: fixed;
  z-index: 10000;
  pointer-events: none;
  max-width: 200px;
}

.tooltip-content {
  background: rgba(0, 0, 0, 0.9);
  color: #ffffff !important;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
  white-space: nowrap;
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.2),
    0 0 0 0.5px rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  letter-spacing: 0.2px;
  position: relative;
  z-index: 1;
}

body.dark .tooltip-content {
  background: rgba(255, 255, 255, 0.98);
  color: #000000 !important;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.4),
    0 0 0 0.5px rgba(0, 0, 0, 0.1);
}

.tooltip-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
}

.tooltip-arrow-top {
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px 6px 0 6px;
  border-color: rgba(0, 0, 0, 0.9) transparent transparent transparent;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

body.dark .tooltip-arrow-top {
  border-color: rgba(255, 255, 255, 0.98) transparent transparent transparent;
}

.tooltip-arrow-bottom {
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 0 6px 6px 6px;
  border-color: transparent transparent rgba(0, 0, 0, 0.9) transparent;
  filter: drop-shadow(0 -2px 4px rgba(0, 0, 0, 0.1));
}

body.dark .tooltip-arrow-bottom {
  border-color: transparent transparent rgba(255, 255, 255, 0.98) transparent;
}

.tooltip-arrow-left {
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  border-width: 6px 0 6px 6px;
  border-color: transparent transparent transparent rgba(0, 0, 0, 0.9);
  filter: drop-shadow(2px 0 4px rgba(0, 0, 0, 0.1));
}

body.dark .tooltip-arrow-left {
  border-color: transparent transparent transparent rgba(255, 255, 255, 0.98);
}

.tooltip-arrow-right {
  left: -6px;
  top: 50%;
  transform: translateY(-50%);
  border-width: 6px 6px 6px 0;
  border-color: transparent rgba(0, 0, 0, 0.9) transparent transparent;
  filter: drop-shadow(-2px 0 4px rgba(0, 0, 0, 0.1));
}

body.dark .tooltip-arrow-right {
  border-color: transparent rgba(255, 255, 255, 0.98) transparent transparent;
}

/* 动画效果 */
.tooltip-enter-active {
  transition: opacity 0.12s cubic-bezier(0.34, 1.56, 0.64, 1),
              transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.tooltip-leave-active {
  transition: opacity 0.1s cubic-bezier(0.7, 0, 0.84, 0),
              transform 0.1s cubic-bezier(0.7, 0, 0.84, 0);
}

.tooltip-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(4px);
}

.tooltip-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(4px);
}

.tooltip-enter-to,
.tooltip-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}
</style>

