<template>
  <div class="search-box">
    <div class="search-input-wrapper">
      <input 
        type="text" 
        placeholder="搜索笔记..." 
        :value="modelValue"
        @input="handleInput"
        @keyup.enter="handleSearch"
        ref="searchInput"
      >
      <div class="search-buttons">
        <button 
          v-if="modelValue" 
          class="clear-btn" 
          @click="handleClear"
          @mouseleave="handleMouseLeave"
          type="button"
        >
          <i class="fas fa-times"></i>
        </button>
        <button 
          class="search-btn" 
          @click="handleSearchClick"
          @mouseleave="handleMouseLeave"
          type="button"
        >
          <i class="fas fa-search"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'search': []
  'clear': []
}>()

const searchInput = ref<HTMLInputElement | null>(null)

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleSearch = () => {
  emit('search')
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
  
  // 添加涟漪效果
  const clearBtn = document.querySelector('.clear-btn') as HTMLButtonElement
  if (clearBtn) {
    clearBtn.classList.add('ripple')
    setTimeout(() => {
      clearBtn.classList.remove('ripple')
    }, 120)
  }
  
  nextTick(() => {
    if (clearBtn) {
      clearBtn.blur()
    }
  })
}

const handleSearchClick = () => {
  handleSearch()
  
  // 添加涟漪效果
  const searchBtn = document.querySelector('.search-btn') as HTMLButtonElement
  if (searchBtn) {
    searchBtn.classList.add('ripple')
    setTimeout(() => {
      searchBtn.classList.remove('ripple')
    }, 120)
  }
  
  nextTick(() => {
    if (searchBtn) {
      searchBtn.blur()
    }
  })
}

const handleMouseLeave = () => {
  const clearBtn = document.querySelector('.clear-btn') as HTMLButtonElement
  const searchBtn = document.querySelector('.search-btn') as HTMLButtonElement
  
  if (clearBtn) clearBtn.blur()
  if (searchBtn) searchBtn.blur()
}

defineExpose({
  searchInput
})
</script>

<style scoped>
.search-box {
  padding: 12px 15px 10px;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 12px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.search-input-wrapper:focus-within {
  background: rgba(255, 255, 255, 0.15);
}

.search-input-wrapper input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: white;
  font-size: 14px;
  padding: 0;
  width: 100%;
}

.search-input-wrapper input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.search-buttons {
  display: flex;
  gap: 8px;
  margin-left: 8px;
}

.search-buttons button {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
  width: 24px;
  height: 24px;
}

.search-buttons button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.search-buttons button:active {
  transform: scale(0.9);
}

.search-buttons button.ripple {
  animation: ripple 0.3s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* 浅色模式 - 只在没有主题色时应用 */
body:not(.dark) .sidebar:not([data-theme-color]) .search-input-wrapper {
  background: #f5f5f5;
}

body:not(.dark) .sidebar:not([data-theme-color]) .search-input-wrapper:focus-within {
  background: #e8e8e8;
}

body:not(.dark) .sidebar:not([data-theme-color]) .search-input-wrapper input {
  color: #000000;
}

body:not(.dark) .sidebar:not([data-theme-color]) .search-input-wrapper input::placeholder {
  color: #666666;
}

body:not(.dark) .sidebar:not([data-theme-color]) .search-buttons button {
  color: #666666;
}

body:not(.dark) .sidebar:not([data-theme-color]) .search-buttons button:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #000000;
}

/* 有主题色时的搜索框样式 */
.sidebar[data-theme-color] .search-input-wrapper {
  background: var(--sidebar-text-hover, rgba(255, 255, 255, 0.1));
}

.sidebar[data-theme-color] .search-input-wrapper:focus-within {
  background: var(--sidebar-text-active, rgba(255, 255, 255, 0.15));
}

.sidebar[data-theme-color] .search-input-wrapper input {
  color: var(--sidebar-text-color, rgba(255, 255, 255, 0.9));
}

.sidebar[data-theme-color] .search-input-wrapper input::placeholder {
  color: var(--sidebar-text-secondary, rgba(255, 255, 255, 0.6));
}

.sidebar[data-theme-color] .search-buttons button {
  color: var(--sidebar-text-secondary, rgba(255, 255, 255, 0.8));
}

.sidebar[data-theme-color] .search-buttons button:hover {
  background: var(--sidebar-text-active, rgba(255, 255, 255, 0.1));
  color: var(--sidebar-text-color, #ffffff);
}

/* 折叠状态 */
.sidebar.collapsed .search-box {
  display: none;
}
</style>

