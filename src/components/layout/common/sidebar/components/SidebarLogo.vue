<template>
  <div class="logo">
    <div class="logo-content">
      <i class="fas fa-brain"></i>
      <h1>脑洞库</h1>
    </div>
    <button 
      class="toggle-sidebar" 
      @click="$emit('toggle')"
      @mouseleave="$emit('mouse-leave')"
      ref="toggleButton"
    >
      <i class="fas" :class="collapsed ? 'fa-chevron-right' : 'fa-chevron-left'"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  collapsed: boolean
}>()

defineEmits<{
  toggle: []
  'mouse-leave': []
}>()

const toggleButton = ref<HTMLButtonElement | null>(null)

defineExpose({
  toggleButton
})
</script>

<style scoped>
.logo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 0;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  min-height: 60px;
  max-height: 60px;
  height: 60px;
  flex-shrink: 0;
  box-sizing: border-box;
}

.logo-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-content i {
  font-size: 24px;
  color: white;
}

.logo-content h1 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: white;
  white-space: nowrap;
}

.toggle-sidebar {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  flex-shrink: 0;
}

.toggle-sidebar:hover {
  background: rgba(255, 255, 255, 0.2);
}

.toggle-sidebar:active {
  transform: scale(0.95);
}

/* 浅色模式 - 只在没有主题色时应用 */
body:not(.dark) .sidebar:not([data-theme-color]) .logo {
  border-bottom-color: rgba(0, 0, 0, 0.1);
}

body:not(.dark) .sidebar:not([data-theme-color]) .logo-content i,
body:not(.dark) .sidebar:not([data-theme-color]) .logo-content h1 {
  color: #333333;
}

body:not(.dark) .sidebar:not([data-theme-color]) .toggle-sidebar {
  background: rgba(0, 0, 0, 0.05);
  color: #333333;
}

body:not(.dark) .sidebar:not([data-theme-color]) .toggle-sidebar:hover {
  background: rgba(0, 0, 0, 0.1);
}

/* 有主题色时的样式 */
.sidebar[data-theme-color] .logo {
  border-bottom-color: var(--sidebar-border-color, rgba(255, 255, 255, 0.1));
}

.sidebar[data-theme-color] .logo-content i,
.sidebar[data-theme-color] .logo-content h1 {
  color: var(--sidebar-text-color, #ffffff);
}

.sidebar[data-theme-color] .toggle-sidebar {
  background: var(--sidebar-text-hover, rgba(255, 255, 255, 0.1));
  color: var(--sidebar-text-color, #ffffff);
}

.sidebar[data-theme-color] .toggle-sidebar:hover {
  background: var(--sidebar-text-active, rgba(255, 255, 255, 0.2));
}

/* 折叠状态 */
.sidebar.collapsed .logo {
  justify-content: center;
  padding: 0;
  min-height: 60px;
  max-height: 60px;
}

.sidebar.collapsed .logo-content {
  display: none;
}

.sidebar.collapsed .logo-content h1 {
  display: none;
}
</style>

