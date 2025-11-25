<template>
  <div 
    class="editor-content-wrapper"
    @contextmenu.prevent="handleContextMenu"
  >
    <!-- 富文本编辑器模式 -->
    <EditorContent 
      v-if="!isMarkdownMode && editor" 
      :editor="editor"
      class="tiptap-editor"
    />
    
    <!-- Markdown 源代码模式 -->
    <textarea 
      v-else-if="isMarkdownMode"
      ref="markdownTextareaRef"
      class="editor-content markdown-source" 
      :value="markdownSource"
      placeholder="Markdown 源代码..."
      @input="handleMarkdownChange"
      @blur="handleMarkdownBlur"
      @contextmenu.prevent="handleContextMenu"
    ></textarea>
    
    <!-- 编辑器加载中 -->
    <div 
      v-else
      class="editor-loading"
    >
      编辑器加载中...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { EditorContent } from '@tiptap/vue-3'
import type { Editor } from '@tiptap/vue-3'

const props = defineProps<{
  editor?: Editor
  isMarkdownMode: boolean
  markdownSource: string
}>()

const emit = defineEmits<{
  'update:markdownSource': [value: string]
  'markdown-change': []
  'markdown-blur': []
  'context-menu': [event: MouseEvent]
}>()

const markdownTextareaRef = ref<HTMLTextAreaElement | null>(null)

const handleMarkdownChange = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:markdownSource', target.value)
  emit('markdown-change')
}

const handleMarkdownBlur = () => {
  emit('markdown-blur')
}

const handleContextMenu = (event: MouseEvent) => {
  emit('context-menu', event)
}

defineExpose({
  markdownTextareaRef
})
</script>

<style scoped>
.editor-content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.tiptap-editor {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
  min-height: 0;
}

.editor-content {
  flex: 1;
  width: 100%;
  padding: 20px;
  border: none;
  outline: none;
  resize: none;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  background: transparent;
  color: var(--color-text-primary);
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
}

.editor-content::placeholder {
  color: var(--color-text-secondary);
  opacity: 0.5;
}

.markdown-source {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.editor-loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  font-size: 14px;
}
</style>

