<template>
  <div class="note-editor">
    <div class="editor-header">
      <div class="title-wrapper">
        <input 
          type="text" 
          class="editor-title" 
          v-model="noteTitle"
          placeholder="笔记标题"
          @input="handleTitleChange"
        >
        <div class="title-word-count">
          标题字数: {{ titleWordCount }}
        </div>
      </div>
    </div>
    
    <div class="editor-toolbar">
      <div class="toolbar-left">
        <button class="toolbar-btn" @click="formatText('bold')" title="粗体">
          <i class="fas fa-bold"></i>
        </button>
        <button class="toolbar-btn" @click="formatText('italic')" title="斜体">
          <i class="fas fa-italic"></i>
        </button>
        <button class="toolbar-btn" @click="formatText('underline')" title="下划线">
          <i class="fas fa-underline"></i>
        </button>
        <button class="toolbar-btn" @click="formatText('list')" title="无序列表">
          <i class="fas fa-list-ul"></i>
        </button>
        <button class="toolbar-btn" @click="formatText('orderedList')" title="有序列表">
          <i class="fas fa-list-ol"></i>
        </button>
        <button class="toolbar-btn" @click="formatText('link')" title="链接">
          <i class="fas fa-link"></i>
        </button>
        <button class="toolbar-btn" @click="formatText('image')" title="图片">
          <i class="fas fa-image"></i>
        </button>
        <button class="toolbar-btn" @click="formatText('code')" title="代码">
          <i class="fas fa-code"></i>
        </button>
        <button class="toolbar-btn" @click="formatText('table')" title="表格">
          <i class="fas fa-table"></i>
        </button>
      </div>
      <div class="content-word-count">
        <div class="word-count-item">
          内容字数: {{ contentWordCount }}
        </div>
        <div class="word-count-item">
          标点: {{ contentPunctuationCount }}
        </div>
        <div class="word-count-item">
          共{{ contentLineCount }}行
        </div>
      </div>
    </div>
    
    <div class="editor-content-wrapper">
      <textarea 
        class="editor-content" 
        v-model="noteContent"
        placeholder="开始输入笔记内容..."
        @input="handleContentChange"
        @keydown="handleKeyDown"
        ref="editorTextarea"
      ></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick, onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps<{
  note: any
}>()

// Emits
const emit = defineEmits<{
  'save': [note: any]
  'update': [note: any]
}>()

// 响应式状态
const noteTitle = ref('')
const noteContent = ref('')
const editorTextarea = ref<HTMLTextAreaElement>()

// 计算属性
const currentNote = computed(() => ({
  ...props.note,
  title: noteTitle.value,
  content: noteContent.value,
  wordCount: noteContent.value.length
}))

// 字数统计
const titleWordCount = computed(() => {
  return getWordCount(noteTitle.value)
})

// 计算纯文字数量（不包括标点符号和空格）
const getWordCount = (text: string) => {
  // 移除所有标点符号、数字、空格，只保留中英文字符
  const cleanText = text.replace(/[^\u4e00-\u9fa5a-zA-Z]/g, '')
  return cleanText.length
}

// 计算标点符号数量
const getPunctuationCount = (text: string) => {
  // 只保留标点符号、数字、空格等非中英文字符
  const punctuationText = text.replace(/[\u4e00-\u9fa5a-zA-Z]/g, '')
  return punctuationText.length
}

const contentWordCount = computed(() => {
  return getWordCount(noteContent.value)
})

const contentPunctuationCount = computed(() => {
  return getPunctuationCount(noteContent.value)
})

// 总字符数（包括标点符号）
const contentCharCount = computed(() => {
  return noteContent.value.length
})

const contentLineCount = ref(1)

// 防抖函数
const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

// 计算实际行数的函数 - 使用实际文本换行方法
const calculateLineCount = () => {
  if (!editorTextarea.value) return
  
  const textarea = editorTextarea.value
  const text = noteContent.value
  
  if (!text.trim()) {
    contentLineCount.value = 1
    return
  }
  
  try {
    // 创建一个临时的textarea来精确模拟换行行为
    const tempTextarea = document.createElement('textarea')
    const computedStyle = getComputedStyle(textarea)
    
    // 复制所有影响文本布局的样式
    const styleProps = [
      'fontSize', 'fontFamily', 'fontWeight', 'lineHeight', 'letterSpacing',
      'wordSpacing', 'textIndent', 'padding', 'border', 'boxSizing',
      'whiteSpace', 'wordWrap', 'wordBreak', 'overflowWrap', 'width',
      'resize', 'overflow', 'textAlign', 'direction'
    ]
    
    styleProps.forEach(prop => {
      tempTextarea.style[prop as any] = computedStyle[prop as any]
    })
    
    // 设置位置和可见性
    tempTextarea.style.position = 'absolute'
    tempTextarea.style.visibility = 'hidden'
    tempTextarea.style.height = 'auto'
    tempTextarea.style.top = '-9999px'
    tempTextarea.style.left = '-9999px'
    tempTextarea.style.overflow = 'hidden'
    tempTextarea.style.resize = 'none'
    
    // 设置文本内容
    tempTextarea.value = text
    
    // 添加到DOM中
    document.body.appendChild(tempTextarea)
    
    // 获取行高
    const lineHeight = parseFloat(computedStyle.lineHeight) || parseFloat(computedStyle.fontSize) * 1.2
    
    // 计算实际行数 - 使用scrollHeight更准确
    const scrollHeight = tempTextarea.scrollHeight
    const paddingTop = parseFloat(computedStyle.paddingTop) || 0
    const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0
    const borderTop = parseFloat(computedStyle.borderTopWidth) || 0
    const borderBottom = parseFloat(computedStyle.borderBottomWidth) || 0
    
    const contentHeight = scrollHeight - paddingTop - paddingBottom - borderTop - borderBottom
    const calculatedLines = Math.max(1, Math.round(contentHeight / lineHeight))
    
    console.log('实际文本换行方法计算行数:', {
      textLength: text.length,
      textPreview: text.substring(0, 50) + '...',
      lineHeight: lineHeight,
      scrollHeight: scrollHeight,
      contentHeight: contentHeight,
      calculatedLines: calculatedLines,
      textareaWidth: textarea.clientWidth,
      tempTextareaWidth: tempTextarea.clientWidth
    })
    
    contentLineCount.value = calculatedLines
    
    // 清理临时元素
    document.body.removeChild(tempTextarea)
    
  } catch (error) {
    console.error('行数计算错误:', error)
    // 如果计算失败，使用简单的换行符计算
    contentLineCount.value = Math.max(1, text.split('\n').length)
  }
}

// 创建防抖版本的计算函数
const debouncedCalculateLineCount = debounce(calculateLineCount, 100)

// 监听props变化
watch(() => props.note, (newNote) => {
  if (newNote) {
    noteTitle.value = newNote.title || ''
    noteContent.value = newNote.content || ''
  }
}, { immediate: true })

// 监听内容变化，重新计算行数
watch(() => noteContent.value, () => {
  nextTick(() => {
    debouncedCalculateLineCount()
  })
})

// 监听窗口大小变化，重新计算行数
const handleResize = () => {
  debouncedCalculateLineCount()
}

// 使用 ResizeObserver 监听编辑区域宽度变化
let resizeObserver: ResizeObserver | null = null

// 组件挂载后添加监听器
onMounted(() => {
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
  
  // 使用 ResizeObserver 监听编辑区域宽度变化
  if (editorTextarea.value) {
    resizeObserver = new ResizeObserver(() => {
      debouncedCalculateLineCount()
    })
    resizeObserver.observe(editorTextarea.value)
  }
  
  nextTick(() => {
    calculateLineCount()
  })
})

// 组件卸载前移除监听器
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

// 方法
const handleTitleChange = () => {
  emit('update', currentNote.value)
}

const handleContentChange = () => {
  emit('update', currentNote.value)
}

// 处理键盘事件，支持Tab键输入
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Tab') {
    event.preventDefault() // 阻止默认的Tab行为（切换焦点）
    
    if (!editorTextarea.value) return
    
    const textarea = editorTextarea.value
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    
    // 插入Tab字符
    const tabChar = '  ' // 使用两个空格作为Tab
    const newText = noteContent.value.substring(0, start) + tabChar + noteContent.value.substring(end)
    
    // 更新内容
    noteContent.value = newText
    
    // 设置新的光标位置
    setTimeout(() => {
      const newCursorPos = start + tabChar.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
      textarea.focus()
    }, 0)
    
    // 触发更新
    emit('update', currentNote.value)
  }
}

const formatText = (format: string) => {
  if (!editorTextarea.value) return
  
  const textarea = editorTextarea.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = noteContent.value.substring(start, end)
  
  let formattedText = ''
  
  switch (format) {
    case 'bold':
      formattedText = `**${selectedText}**`
      break
    case 'italic':
      formattedText = `*${selectedText}*`
      break
    case 'underline':
      formattedText = `<u>${selectedText}</u>`
      break
    case 'list':
      formattedText = `- ${selectedText}`
      break
    case 'orderedList':
      formattedText = `1. ${selectedText}`
      break
    case 'link':
      formattedText = `[${selectedText}](url)`
      break
    case 'image':
      formattedText = `![${selectedText}](image-url)`
      break
    case 'code':
      formattedText = `\`${selectedText}\``
      break
    case 'table':
      formattedText = `| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| ${selectedText} | 数据 | 数据 |`
      break
  }
  
  // 替换选中的文本
  const newContent = noteContent.value.substring(0, start) + formattedText + noteContent.value.substring(end)
  noteContent.value = newContent
  
  // 更新光标位置
  setTimeout(() => {
    const newCursorPos = start + formattedText.length
    textarea.setSelectionRange(newCursorPos, newCursorPos)
    textarea.focus()
  }, 0)
  
  emit('update', currentNote.value)
}
</script>

<style scoped>
.note-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  padding: 30px;
  padding-right: 30px; /* 确保右侧padding一致 */
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  min-width: 0;
  box-sizing: border-box; /* 确保padding包含在宽度内 */
}

body.dark .note-editor {
  background-color: var(--color-bg-primary);
}

body.dark .editor-title {
  color: #e9ecef;
}

body.dark .editor-meta {
  color: #a0a7b5;
}

body.dark .toolbar-btn {
  color: #a0a7b5;
}

body.dark .toolbar-btn:hover {
  background-color: #1a1a1a;
  color: var(--color-text-primary);
}

body.dark .editor-content {
  color: #e9ecef;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 15px;
  flex-wrap: wrap;
}

.title-word-count {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  background-color: var(--color-bg-secondary);
  border-radius: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  user-select: none;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

body.dark .title-word-count {
  background-color: #2a2a2a;
  color: var(--color-text-secondary);
}

.editor-title {
  flex: 1;
  border: none;
  font-size: 24px;
  font-weight: 700;
  padding: 10px 0;
  margin-bottom: 10px;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--dark-color);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

body.dark .editor-title {
  color: #ffffff;
}

.editor-title:focus {
  outline: none;
  border-bottom-color: var(--primary-color);
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--color-border);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  flex-wrap: wrap;
}

.toolbar-left {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
}

.content-word-count {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.word-count-item {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  background-color: var(--color-bg-secondary);
  border-radius: 8px;
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  user-select: none;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.word-count-item:hover {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-1px);
}

body.dark .word-count-item {
  background-color: #2a2a2a;
  color: var(--color-text-secondary);
}

body.dark .word-count-item:hover {
  background-color: var(--primary-color);
  color: white;
}

body.dark .editor-toolbar {
  border-bottom-color: #3a4152;
}

.toolbar-btn {
  background: none;
  border: none;
  font-size: 16px;
  color: #6c757d;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

body.dark .toolbar-btn {
  color: #6c757d;
}

.toolbar-btn:hover {
  background-color: #f0f4f8;
  color: var(--dark-color);
  transform: scale(1.05);
}

body.dark .toolbar-btn:hover {
  background-color: #333333;
  color: #ffffff;
}

.editor-content-wrapper {
  flex: 1;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  padding-right: 0; /* 确保右侧没有额外padding */
}

.editor-content {
  width: 100%;
  height: 100%;
  border: none;
  font-size: 16px;
  line-height: 1.7;
  padding: 10px 0;
  padding-right: 0; /* 确保右侧padding为0，避免对齐问题 */
  resize: none;
  background: transparent;
  color: var(--dark-color);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow: visible;
  display: block;
  box-sizing: border-box;
  text-align: left; /* 明确左对齐 */
}

body.dark .editor-content {
  color: #ffffff;
}

.editor-content:focus {
  outline: none;
}

.editor-content::placeholder {
  color: #6c757d;
  font-style: italic;
}

body.dark .editor-content::placeholder {
  color: #cccccc;
}

/* 响应式设计 */
/* 中等屏幕适配 - 当宽度变小时 */
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

  .editor-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .content-word-count {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    width: 100%;
    order: 1;
  }

  .word-count-item {
    width: 100%;
    justify-content: flex-start;
  }

  .toolbar-left {
    order: 2;
    width: 100%;
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .note-editor {
    padding: 20px;
  }
  
  .editor-title {
    font-size: 20px;
  }
  
  .editor-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .toolbar-left {
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .toolbar-btn {
    padding: 6px 10px;
    font-size: 14px;
  }
  
  .content-word-count {
    justify-content: center;
    gap: 8px;
    flex-direction: row;
  }
  
  .word-count-item {
    padding: 4px 8px;
    font-size: 11px;
    width: auto;
    justify-content: center;
  }
  
  .title-wrapper {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .editor-title {
    width: 100%;
    margin-bottom: 0;
  }

  .title-word-count {
    align-self: flex-start;
  }
}
</style>
