<template>
  <div class="editor-header">
    <div class="title-wrapper">
      <input 
        ref="titleInputRef"
        type="text" 
        class="editor-title" 
        v-model="title"
        placeholder="笔记标题"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      >
      <div class="title-word-count">
        标题字数: {{ wordCount }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'focus': []
  'blur': []
}>()

const titleInputRef = ref<HTMLInputElement | null>(null)

const title = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const wordCount = computed(() => {
  return props.modelValue.length
})

const handleInput = () => {
  emit('update:modelValue', title.value)
}

const handleFocus = () => {
  emit('focus')
}

const handleBlur = () => {
  emit('blur')
}

defineExpose({
  titleInputRef
})
</script>

<style scoped>
.editor-header {
  margin-bottom: 20px;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.editor-title {
  flex: 1;
  min-width: 200px;
  font-size: 24px;
  font-weight: 600;
  padding: 12px 16px;
  border: none;
  border-bottom: 2px solid var(--color-border);
  background: transparent;
  color: var(--color-text);
  outline: none;
  transition: border-color 0.2s ease;
}

.editor-title:focus {
  border-bottom-color: var(--primary-color);
}

.editor-title::placeholder {
  color: var(--color-text-secondary);
  opacity: 0.6;
}

.title-word-count {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

@media (max-width: 1400px) {
  .title-wrapper {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .editor-title {
    width: 100%;
    margin-bottom: 0;
  }

  .title-word-count {
    align-self: flex-start;
  }
}

@media (max-width: 768px) {
  .title-wrapper {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .editor-title {
    width: 100%;
    margin-bottom: 0;
    font-size: 20px;
  }

  .title-word-count {
    align-self: flex-start;
  }
}
</style>

