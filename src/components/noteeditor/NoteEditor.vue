<template>
  <div class="note-editor">
    <EditorHeader
      v-model="noteTitle"
      @focus="isTitleFocused = true"
      @blur="isTitleFocused = false"
    />
    
    <EditorToolbar
      :editor="getEditor()"
      :is-title-focused="isTitleFocused"
      :is-markdown-mode="isMarkdownMode"
      :word-count="contentWordCount"
      :punctuation-count="contentPunctuationCount"
      :line-count="contentLineCount"
    />
    
    <EditorContent
      v-if="(isEditorInitialized && getEditor()) || isMarkdownMode"
      :editor="getEditor()"
      :is-markdown-mode="isMarkdownMode"
      :markdown-source="markdownSource"
      @update:markdown-source="markdownSource = $event"
      @markdown-change="handleMarkdownChange"
      @markdown-blur="handleMarkdownBlur"
      @context-menu="handleContextMenu"
    />
    
    <ContextMenu
      :items="contextMenuItems"
      :visible="showContextMenu"
      :x="contextMenuX"
      :y="contextMenuY"
      @update:visible="showContextMenu = $event"
      @item-click="handleContextMenuItemClick"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick, onMounted, onBeforeUnmount, unref, toRef } from 'vue'
import type { Ref } from 'vue'
import Message from '../../utils/message'
import type { Editor } from '@tiptap/vue-3'
import ContextMenu from '../ui/ContextMenu.vue'
import EditorHeader from './EditorHeader.vue'
import EditorToolbar from './EditorToolbar.vue'
import EditorContent from './EditorContent.vue'
import { useEditorSetup } from './composables/useEditorSetup'
import { useWordCount } from './composables/useWordCount'
import { useColorPicker } from './composables/useColorPicker'
import { useToolbar } from './composables/useToolbar'
import { useKeyboard } from './composables/useKeyboard'
import { useMarkdown } from './composables/useMarkdown'
import { useContextMenu } from './composables/useContextMenu'

const props = defineProps<{
  note: any
}>()

// 统一处理 note 可能是 ref 的情况
// 使用 toRef 创建响应式引用，确保 noteProp 是响应式的
// toRef接收一个对象和属性名，返回一个响应式引用
const noteProp = toRef(props, 'note')
// 使用 computed 计算 resolvedNote，确保 resolvedNote 是响应式的
// unref 是 Vue 提供的一个小工具函数，用来“解包”一个 ref：
// 1.noteProp 是 toRef(props, 'note') 得到的 ref，但它的 value 可能还是另一个 ref（因为父组件传进来的 note 就是 store 的 ref）。
// 2.unref(noteProp.value) 会自动解包，如果 noteProp.value 是 ref，则返回它的 value；如果不是 ref，则直接返回原值。
const resolvedNote = computed(() => unref(noteProp.value))

// 定义 emit 事件
const emit = defineEmits<{
  // 保存笔记
  'save': [note: any]
  // 更新笔记
  'update': [note: any]
}>()

// 响应式状态
const noteTitle = ref('')
const noteContent = ref('')
const isMarkdownMode = ref(false)
const isTitleFocused = ref(false)
const isEditorInitialized = ref(false)

// 使用 composables
const { markdownSource, markdownTextareaRef, convertMarkdownToHTML, syncMarkdownToEditor, turndownService } = useMarkdown()
const { contentWordCount, contentPunctuationCount, contentLineCount, updateWordCount } = useWordCount()

// 编辑器实例
const editorRef = ref<Editor | null>(null)
const editorRefProxy = editorRef as unknown as Ref<Editor | null>
const colorPicker = useColorPicker(editorRefProxy, isTitleFocused)
const toolbar = useToolbar(editorRefProxy, isTitleFocused)
const keyboard = useKeyboard(editorRefProxy, isTitleFocused)
const contextMenu = useContextMenu(editorRefProxy, isMarkdownMode, markdownSource)
// 供模板安全获取 Editor 实例
const getEditor = () => {
  if(!isEditorInitialized.value || !editorRef.value){
    return undefined
  }
  return editorRef.value as Editor
}

// 初始化编辑器
const initializeEditor = () => {
  const { editor: editorInstance } = useEditorSetup(
    noteContent,
    isMarkdownMode,
    markdownSource,
    turndownService,
    {
      onUpdate: (editorInstance) => {
        const html = editorInstance.getHTML()
        noteContent.value = html
        
        if (!isMarkdownMode.value) {
          markdownSource.value = turndownService.turndown(html)
        }
        
        const text = editorInstance.getText()
        updateWordCount(text, false, editorInstance)
        handleContentChange()
        
        // 应用字体大小和颜色到新文本
        toolbar.applyFontSizeToNewText(editorInstance)
        colorPicker.applyTextColorToNewText(editorInstance)
      },
      onSelectionUpdate: (editorInstance) => {
        colorPicker.updateTextColorFromSelection(editorInstance)
        toolbar.updateFontSizeFromSelection(editorInstance)
        toolbar.updateHeadingFromSelection(editorInstance)
        toolbar.updateTextAlignFromSelection(editorInstance)
      },
      onCreate: (editorInstance) => {
        isEditorInitialized.value = true
        editorRef.value = editorInstance
        console.log('编辑器初始化完成', editorInstance)
        loadNoteToEditor(unref(resolvedNote.value))
      },
      handleKeyDown: keyboard.createHandleKeyDown(),
      handleDOMEvents: keyboard.createHandleDOMEvents()
    }
  )
  
  editorRef.value = editorInstance
}

//直接调用初始化
initializeEditor()

// 计算属性
const currentNote = computed(() => {
  const sourceNote = resolvedNote.value || {}
  const noteType = sourceNote.noteType || 'richText'
  const baseNote = {
    ...sourceNote,
    title: noteTitle.value,
    wordCount: contentWordCount.value
  }
  
  if (noteType === 'markdown') {
    return {
      ...baseNote,
      content: markdownSource.value,
      noteType: 'markdown'
    }
  } else {
    return {
      ...baseNote,
      content: noteContent.value,
      noteType: 'richText'
    }
  }
})

// 方法
const handleSave = () => {
  emit('save', currentNote.value)
  try {
    Message.success('保存成功', 2000)
  } catch (error) {
    console.error('Failed to show message:', error)
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && (event.key === 's' || event.key === 'S')) {
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
    handleSave()
    return false
  }
}

const handleContentChange = () => {
  emit('update', currentNote.value)
}

const handleMarkdownChange = () => {
  const text = markdownSource.value
  updateWordCount(text, true)
}

const handleMarkdownBlur = () => {
  const editor = getEditor()
  if (editor) {
    syncMarkdownToEditor(editor)
  }
}

const handleContextMenu = (event: MouseEvent) => {
  contextMenu.handleContextMenu(event)
}

// handleContextMenuItemClick 从 contextMenu composable 中获取

// 处理编辑器点击事件（用于标题折叠）
const handleEditorClick = (event: MouseEvent) => {
  const editor = getEditor()
  if (!editor) return

  const target = event.target as HTMLElement
  const heading = target.closest('.collapsible-heading') as HTMLElement
  
  if (!heading || !editorRef.value) return
  
  const collapseIcon = target.closest('.heading-collapse-icon')
  if (!collapseIcon) return
  
  event.preventDefault()
  event.stopPropagation()
  
  const level = parseInt(heading.getAttribute('data-level') || '1')
  const isCollapsed = heading.getAttribute('data-collapsed') === 'true'
  
  let found = false
  editorRef.value.state.doc.descendants((node, pos) => {
    if (found) return false
    if (node.type.name === 'collapsibleHeading' && node.attrs.level === level) {
      const nodeStart = pos
      const nodeEnd = pos + node.nodeSize
      const clickPos = editorRef.value?.state.selection.from || 0
      
      if (clickPos >= nodeStart && clickPos <= nodeEnd) {
        found = true
        editorRef.value?.chain().focus().command(({ tr }) => {
          const attrs = { ...node.attrs, collapsed: !isCollapsed }
          tr.setNodeMarkup(pos, undefined, attrs)
          return true
        }).run()
        return false
      }
    }
  })
}

// 计算可见行数
const calculateVisibleLineCount = () => {
  if (isMarkdownMode.value && markdownTextareaRef.value) {
    const textarea = markdownTextareaRef.value
    const styles = window.getComputedStyle(textarea)
    const lineHeight = parseFloat(styles.lineHeight) || parseFloat(styles.fontSize) * 1.5
    const paddingTop = parseFloat(styles.paddingTop) || 0
    const paddingBottom = parseFloat(styles.paddingBottom) || 0
    const contentHeight = textarea.scrollHeight - paddingTop - paddingBottom
    
    if (contentHeight <= 0) {
      contentLineCount.value = 1
      return
    }
    
    const lines = Math.max(1, Math.round(contentHeight / lineHeight))
    contentLineCount.value = lines
  } else {
    const editor = getEditor()
      if(editor && editor.view && editor.view.dom){
        const editorElement = document.querySelector('.tiptap-editor .ProseMirror') as HTMLElement
        if (!editorElement) {
        contentLineCount.value = 1
        return
      }
      const styles = window.getComputedStyle(editorElement)
      const lineHeight = parseFloat(styles.lineHeight) || parseFloat(styles.fontSize) * 1.5
      const paddingTop = parseFloat(styles.paddingTop) || 0
      const paddingBottom = parseFloat(styles.paddingBottom) || 0
      const contentHeight = editorElement.scrollHeight - paddingTop - paddingBottom
      if (contentHeight <= 0) {
        contentLineCount.value = 1
        return
      }
    
      const lines = Math.max(1, Math.round(contentHeight / lineHeight))
      contentLineCount.value = lines
    }else {
      contentLineCount.value = 1
    }
  } 
}

// ResizeObserver
let resizeObserver: ResizeObserver | null = null

const handleResize = () => {
  calculateVisibleLineCount()
}

const setupResizeObserver = () => {
  nextTick(() => {
    if (isMarkdownMode.value && markdownTextareaRef.value) {
      resizeObserver = new ResizeObserver(() => {
        calculateVisibleLineCount()
      })
      resizeObserver.observe(markdownTextareaRef.value)
    } else {
      const editor = getEditor()
      if(editor && editor.view && markdownTextareaRef.value){
        const editorElement = editor.view.dom as HTMLElement
        if (editorElement) {
            const proseMirror = editorElement.querySelector('.ProseMirror') as HTMLElement
            const targetElement = proseMirror || editorElement
            if (targetElement) {
              resizeObserver = new ResizeObserver(() => {
              calculateVisibleLineCount()
            })
            resizeObserver.observe(targetElement)
          }
        }
      }
    }
  })
}

// 加载笔记内容到编辑器
const resetEditorState = () => {
  noteTitle.value = ''
  noteContent.value = ''
  markdownSource.value = ''
  const editor = getEditor()
  if (editor && editor.commands) {
    editor.commands.setContent('')
  }
}

//加载笔记到编辑器
//形参赋值给targetNote，如果targetNote为空，则使用resolvedNote.value作为默认值
const loadNoteToEditor = (targetNote = resolvedNote.value) => {
  console.log("加载笔记到编辑器", targetNote)
  // 如果笔记对象为空，则重置编辑器状态
  if (!targetNote) {
    resetEditorState()
    return
  }

  // 设置笔记标题
  noteTitle.value = targetNote.title || ''
  // 设置笔记内容
  const content = targetNote.content || ''
  // 设置笔记类型(默认富文本)
  const noteType = targetNote.noteType || 'richText'
  // 设置Markdown模式
  isMarkdownMode.value = noteType === 'markdown'

  // 如果笔记类型为Markdown，则设置Markdown源
  if (noteType === 'markdown') {
    markdownSource.value = content || ''
    return
  }

  // 设置富文本内容
  const setRichTextContent = (htmlContent: string) => {
    noteContent.value = htmlContent
    const editor = getEditor()
    if(editor && editor.commands){
      editor.commands.setContent(htmlContent)
    }
    markdownSource.value = turndownService.turndown(htmlContent)
  }

  // 应用内容到编辑器
  const applyContent = () => {
    const editor = getEditor()
    if(!editor || !editor.commands){
      setTimeout(applyContent,50)
      return
    }

    if (content.startsWith('<') || content.includes('<p>') || content.includes('<div>')) {
      setRichTextContent(content)
    } else if (content.trim().length > 0) {
      const html = convertMarkdownToHTML(content)
      noteContent.value = html
      editor.commands.setContent(html)
      markdownSource.value = content
    } else {
      noteContent.value = ''
      markdownSource.value = ''
      editor.commands.setContent('')
    }
  }

  applyContent()
}

// 生命周期
onMounted(() => {
  window.addEventListener('resize', handleResize)
  document.addEventListener('keydown', handleKeyDown, true)
  
  setupResizeObserver()
  
  nextTick(() => {
    // 确保编辑器初始化完成后，如果有笔记数据，就加载到编辑器
    if (resolvedNote.value) {
      const loadInterval = setInterval(()=>{
        if(isEditorInitialized.value){
          clearInterval(loadInterval)
          if (!noteTitle.value && resolvedNote.value.title) {
            noteTitle.value = resolvedNote.value.title
          }
          const content = resolvedNote.value.content || ''
          if ((content || resolvedNote.value.noteType === 'markdown') && !noteContent.value) {
            loadNoteToEditor(resolvedNote.value)
          }
        }
      },100)
    }
    
    const editorElement = document.querySelector('.tiptap-editor .ProseMirror') as HTMLElement
    if (editorElement) {
      editorElement.addEventListener('click', handleEditorClick)
    }
    
    // 添加选中文本样式
    const style = document.createElement('style')
    style.id = 'tiptap-selection-override'
    style.textContent = `
      .tiptap-editor *::selection,
      .tiptap-editor::selection,
      .tiptap-content *::selection,
      .tiptap-content::selection,
      .tiptap-content .ProseMirror *::selection,
      .tiptap-content .ProseMirror::selection,
      .tiptap-editor .ProseMirror *::selection,
      .tiptap-editor .ProseMirror::selection,
      .ProseMirror *::selection,
      .ProseMirror::selection {
        background-color: rgba(138, 43, 226, 0.2) !important;
        color: inherit !important;
        -webkit-text-fill-color: inherit !important;
      }
      
      body.dark .tiptap-editor *::selection,
      body.dark .tiptap-editor::selection,
      body.dark .tiptap-content *::selection,
      body.dark .tiptap-content::selection,
      body.dark .tiptap-content .ProseMirror *::selection,
      body.dark .tiptap-content .ProseMirror::selection,
      body.dark .tiptap-editor .ProseMirror *::selection,
      body.dark .tiptap-editor .ProseMirror::selection,
      body.dark .ProseMirror *::selection,
      body.dark .ProseMirror::selection {
        background-color: rgba(147, 112, 219, 0.3) !important;
        color: #ffffff !important;
        -webkit-text-fill-color: #ffffff !important;
      }
    `
    document.head.appendChild(style)
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('keydown', handleKeyDown, { capture: true } as EventListenerOptions)
  
  const editorElement = document.querySelector('.tiptap-editor .ProseMirror') as HTMLElement
  if (editorElement) {
    editorElement.removeEventListener('click', handleEditorClick)
  }
  
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  
  const style = document.getElementById('tiptap-selection-override')
  if (style) {
    style.remove()
  }
  
  if (editorRef.value) {
    editorRef.value.destroy()
  }

  isEditorInitialized.value = false
})

// 监听笔记对象变化并加载
watch(noteProp, (note) => {
  console.log("检测到传入新笔记，准备调用loadNoteToEditor函数加载笔记内容到编辑器，传入笔记对象：" + note)
  // 如果笔记对象为空，则重置编辑器状态
  if (!note) {
    resetEditorState()
    return
  }
  // 创建一个匿名函数 load，用于加载笔记内容到编辑器
  const load = () => loadNoteToEditor(unref(note))

  // 如果编辑器未初始化，则设置一个检查间隔，直到编辑器初始化完成后再加载笔记内容
  if (!isEditorInitialized.value) {
    const checkInterval = setInterval(() => {
      if (isEditorInitialized.value) {
        clearInterval(checkInterval)
        load()
      }
    }, 100)
  } else {
    load()
  }
}, { immediate: true })

// 监听编辑器内容变化
watch(() => {
  const editor = getEditor()
  if (!editor || isMarkdownMode.value) return null
  // 确保编辑器实例已经完全初始化，并且有 getJSON 方法
  if (typeof editor.getJSON !== 'function') {
    return null
  }
  try {
    return editor.getJSON()
  } catch (error) {
    console.warn('获取编辑器 JSON 失败:', error)
    return null
  }
}, () => {
  const editor = getEditor()
  if (editor && !isMarkdownMode.value) {
    try {
      // 确保 getText 方法存在
      if (typeof editor.getText === 'function') {
        const text = editor.getText()
        updateWordCount(text, false, editor)
      }
    } catch (error) {
      console.warn('更新字数统计失败:', error)
    }
  }
}, { immediate: false, deep: true })

// 监听 Markdown 模式下的内容变化
watch(() => markdownSource.value, (text) => {
  if (isMarkdownMode.value) {
    updateWordCount(text || '', true)
  }
}, { immediate: true })

// 监听编辑器模式切换
watch(() => isMarkdownMode.value, () => {
  nextTick(() => {
    calculateVisibleLineCount()
    setupResizeObserver()
  })
})

// 从 contextMenu composable 获取状态和方法
const { showContextMenu, contextMenuX, contextMenuY, contextMenuItems, handleContextMenuItemClick } = contextMenu
</script>

<style scoped>
/* 样式从原文件复制 */
.note-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  padding: 30px;
  padding-right: 30px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  min-width: 0;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

body.dark .note-editor {
  background-color: var(--color-bg-primary);
}

@media (max-width: 1400px) {
  .note-editor {
    padding: 20px;
  }
}

@media (max-width: 768px) {
  .note-editor {
    padding: 15px;
  }
}


</style>
