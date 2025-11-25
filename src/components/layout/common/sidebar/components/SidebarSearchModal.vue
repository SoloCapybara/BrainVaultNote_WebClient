<template>
  <Teleport to="body">
    <div 
      class="search-modal" 
      :class="{ active: modelValue }"
      @click="$emit('close')"
    >
      <div 
        class="search-modal-content" 
        @click.stop
      >
        <div class="search-modal-header">
          <h3>搜索笔记</h3>
          <button class="close-btn" @click="$emit('close')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="search-modal-body">
          <div class="search-input-wrapper-modal">
            <input 
              type="text" 
              placeholder="搜索笔记..." 
              :value="searchQuery"
              @input="handleInput"
              @keyup.enter="handleSearch"
              @keyup.esc="$emit('close')"
              ref="searchModalInput"
              autofocus
            >
            <div class="search-buttons-modal">
              <button 
                v-if="searchQuery" 
                class="clear-btn-modal" 
                @click="handleClear"
                type="button"
              >
                <i class="fas fa-times"></i>
              </button>
              <button 
                class="search-btn-modal" 
                @click="handleSearch"
                type="button"
              >
                <i class="fas fa-search"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const props = defineProps<{
  modelValue: boolean
  searchQuery: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:searchQuery': [value: string]
  'search': []
  'close': []
}>()

const searchModalInput = ref<HTMLInputElement | null>(null)

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:searchQuery', target.value)
}

const handleSearch = () => {
  emit('search')
}

const handleClear = () => {
  emit('update:searchQuery', '')
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    nextTick(() => {
      searchModalInput.value?.focus()
    })
  }
})

defineExpose({
  searchModalInput
})
</script>

<style scoped>
.search-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1),
              visibility 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: opacity;
}

.search-modal.active {
  opacity: 1;
  visibility: visible;
}

.search-modal-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3),
              0 0 0 0.5px rgba(255, 255, 255, 0.1) inset;
  transform: scale(0.85) translateY(-20px);
  opacity: 0;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1),
              opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
}

.search-modal.active .search-modal-content {
  transform: scale(1) translateY(0);
  opacity: 1;
}

.search-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.search-modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.search-modal-body {
  padding: 20px;
}

.search-input-wrapper-modal {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 12px 16px;
  gap: 12px;
}

.search-input-wrapper-modal:focus-within {
  background: #e8e8e8;
}

.search-input-wrapper-modal input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 16px;
  color: #333;
}

.search-input-wrapper-modal input::placeholder {
  color: #999;
}

.search-buttons-modal {
  display: flex;
  gap: 8px;
}

.search-buttons-modal button {
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s;
}

.search-buttons-modal button:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #333;
}

body.dark .search-modal {
  background: rgba(0, 0, 0, 0.6);
}

body.dark .search-modal-content {
  background: rgba(26, 26, 26, 0.95);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5),
              0 0 0 0.5px rgba(255, 255, 255, 0.05) inset;
}

body.dark .search-modal-header {
  border-bottom-color: #333;
}

body.dark .search-modal-header h3 {
  color: #fff;
}

body.dark .close-btn {
  color: #ccc;
}

body.dark .close-btn:hover {
  background: #333;
  color: #fff;
}

body.dark .search-input-wrapper-modal {
  background: #2a2a2a;
}

body.dark .search-input-wrapper-modal:focus-within {
  background: #333;
}

body.dark .search-input-wrapper-modal input {
  color: #fff;
}

body.dark .search-input-wrapper-modal input::placeholder {
  color: #999;
}

body.dark .search-buttons-modal button {
  color: #ccc;
}

body.dark .search-buttons-modal button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}
</style>

