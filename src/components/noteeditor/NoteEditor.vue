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
const hasUserInteracted = ref(false) // 跟踪用户是否已经与编辑器交互过

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
        const previousContent = noteContent.value
        
        // 检查内容是否真的改变了（而不是只是选择变化）
        const contentChanged = html !== previousContent
        
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
        
        // 如果内容真的改变了，标记为用户已交互，并清除历史记录
        // 如果只是选择变化（比如点击文本），不应该标记为交互
        if (contentChanged && !hasUserInteracted.value) {
          hasUserInteracted.value = true
          // 用户真正编辑了内容，清除历史记录（包括初始加载）
          nextTick(() => {
            if (editorInstance.commands) {
              ;(editorInstance.commands as any).clearHistory?.()
            }
          })
        }
      },
      onSelectionUpdate: (editorInstance) => {
        colorPicker.updateTextColorFromSelection(editorInstance)
        toolbar.updateFontSizeFromSelection(editorInstance)
        toolbar.updateHeadingFromSelection(editorInstance)
        toolbar.updateTextAlignFromSelection(editorInstance)
        
        // 注意：onSelectionUpdate 不应该清除历史记录
        // 因为点击文本只是选择变化，不应该被记录为可撤销操作
        // 只有在 onUpdate 中检测到内容真正改变时，才标记为用户交互
      },
      onCreate: (editorInstance) => {
        isEditorInitialized.value = true
        editorRef.value = editorInstance
        console.log('编辑器初始化完成', editorInstance)
        
        // 先清除历史记录，确保初始状态是干净的
        nextTick(() => {
          if (editorInstance.commands) {
            ;(editorInstance.commands as any).clearHistory?.()
          }
        })
        
        loadNoteToEditor(unref(resolvedNote.value))
        
        // 设置Tab区域选择事件监听器
        nextTick(() => {
          if (editorInstance.view) {
            const cleanup = keyboard.setupSelectionHandlers(editorInstance.view)
            if (cleanup) {
              selectionHandlersCleanup = cleanup
            }
          }
        })
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
let windowResizeHandler: (() => void) | null = null
let mutationObserver: MutationObserver | null = null
// Tab区域选择事件清理函数
let selectionHandlersCleanup: (() => void) | null = null

const handleResize = () => {
  calculateVisibleLineCount()
}

const setupResizeObserver = () => {
  // 清理旧的观察器
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  
  nextTick(() => {
    resizeObserver = new ResizeObserver(() => {
      // 使用防抖，避免频繁计算
      clearTimeout((resizeObserver as any).timeoutId)
      ;(resizeObserver as any).timeoutId = setTimeout(() => {
        calculateVisibleLineCount()
      }, 100)
    })
    
    if (isMarkdownMode.value && markdownTextareaRef.value) {
      // Markdown 模式：监听 textarea
      resizeObserver.observe(markdownTextareaRef.value)
    } else {
      const editor = getEditor()
      if(editor && editor.view && editor.view.dom){
        const editorElement = editor.view.dom as HTMLElement
        if (editorElement) {
          const proseMirror = editorElement.querySelector('.ProseMirror') as HTMLElement
          const targetElement = proseMirror || editorElement
          if (targetElement) {
            resizeObserver.observe(targetElement)
          }
        }
      }
    }
    
    // 监听编辑器容器，当侧边栏或AI栏展开/收缩时，容器宽度会改变
    const editorContainer = document.querySelector('.note-editor') as HTMLElement
    if (editorContainer) {
      resizeObserver.observe(editorContainer)
    }
    
    // 监听 content-area 容器，当侧边栏或AI栏展开/收缩时会改变尺寸
    const contentArea = document.querySelector('.content-area') as HTMLElement
    if (contentArea) {
      resizeObserver.observe(contentArea)
    }
  })
}

// 设置窗口大小变化监听
const setupWindowResizeListener = () => {
  // 清理旧的监听器
  if (windowResizeHandler) {
    window.removeEventListener('resize', windowResizeHandler)
    windowResizeHandler = null
  }
  
  windowResizeHandler = () => {
    // 使用防抖，避免频繁计算
    clearTimeout((windowResizeHandler as any).timeoutId)
    ;(windowResizeHandler as any).timeoutId = setTimeout(() => {
      calculateVisibleLineCount()
    }, 150)
  }
  
  window.addEventListener('resize', windowResizeHandler)
}

// 清理窗口监听器
const cleanupWindowResizeListener = () => {
  if (windowResizeHandler) {
    window.removeEventListener('resize', windowResizeHandler)
    windowResizeHandler = null
  }
}

// 加载笔记内容到编辑器
const resetEditorState = () => {
  noteTitle.value = ''
  noteContent.value = ''
  markdownSource.value = ''
  const editor = getEditor()
  if (editor && editor.commands) {
    editor.commands.setContent('')
    // 清除历史记录，避免重置被记录为可撤销操作
    // clearHistory命令存在但类型定义可能不完整
    ;(editor.commands as any).clearHistory?.()
  }
}

//加载笔记到编辑器
//形参赋值给targetNote，如果targetNote为空，则使用resolvedNote.value作为默认值
const loadNoteToEditor = (targetNote = resolvedNote.value) => {
  console.log("加载笔记到编辑器", targetNote)
  // 重置用户交互标志，因为加载新笔记后，用户交互状态应该重置
  hasUserInteracted.value = false
  
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
      // 设置内容
      editor.commands.setContent(htmlContent)
      // 清除历史记录，避免初始加载被记录为可撤销操作
      // 使用 nextTick 确保在内容设置完成后再清除历史记录
      nextTick(() => {
        if (editor.commands) {
          ;(editor.commands as any).clearHistory?.()
        }
      })
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
      // 设置内容
      editor.commands.setContent(html)
      // 清除历史记录，避免初始加载被记录为可撤销操作
      // 使用 nextTick 确保在内容设置完成后再清除历史记录
      nextTick(() => {
        if (editor.commands) {
          ;(editor.commands as any).clearHistory?.()
        }
      })
      markdownSource.value = content
    } else {
      noteContent.value = ''
      markdownSource.value = ''
      // 设置内容
      editor.commands.setContent('')
      // 清除历史记录，避免初始加载被记录为可撤销操作
      // 使用 nextTick 确保在内容设置完成后再清除历史记录
      nextTick(() => {
        if (editor.commands) {
          ;(editor.commands as any).clearHistory?.()
        }
      })
    }
  }

  applyContent()
}

// 生命周期
onMounted(() => {
  window.addEventListener('resize', handleResize)
  document.addEventListener('keydown', handleKeyDown, true)
  
  setupResizeObserver()
  setupWindowResizeListener()
  
  // 使用 MutationObserver 监听 DOM 变化（侧边栏/AI栏展开/收缩时，容器的 class 会改变）
  mutationObserver = new MutationObserver((mutations) => {
    // 检查是否有 class 或 style 变化
    const hasRelevantChange = mutations.some(mutation => {
      if (mutation.type === 'attributes') {
        const attrName = mutation.attributeName
        return attrName === 'class' || attrName === 'style'
      }
      return false
    })
    
    if (hasRelevantChange) {
      // 当 DOM 变化时，延迟计算行数（等待 CSS transition 完成，通常是 300ms）
      setTimeout(() => {
        calculateVisibleLineCount()
      }, 350)
    }
  })
  
  // 监听 container 容器的 class 变化（侧边栏折叠时，container 的 class 会改变）
  nextTick(() => {
    if (!mutationObserver) return
    
    const observer = mutationObserver // 保存引用，避免 TypeScript 类型检查问题
    
    const container = document.querySelector('.container')
    if (container && observer) {
      observer.observe(container, {
        attributes: true,
        attributeFilter: ['class'],
        subtree: false
      })
    }
    
    // 监听 content-area 容器的 class 和 style 变化
    const contentArea = document.querySelector('.content-area')
    if (contentArea && observer) {
      observer.observe(contentArea, {
        attributes: true,
        attributeFilter: ['class', 'style'],
        subtree: false
      })
    }
    
    // 监听笔记列表和AI助手的 class 变化（collapsed 状态）
    const notesList = document.querySelector('.notes-list')
    if (notesList && observer) {
      observer.observe(notesList, {
        attributes: true,
        attributeFilter: ['class'],
        subtree: false
      })
    }
    
    const aiAssistant = document.querySelector('.ai-assistant')
    if (aiAssistant && observer) {
      observer.observe(aiAssistant, {
        attributes: true,
        attributeFilter: ['class'],
        subtree: false
      })
    }
  })
  
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
  
  cleanupWindowResizeListener()
  
  // 清理 MutationObserver
  if (mutationObserver) {
    mutationObserver.disconnect()
    mutationObserver = null
  }
  
  // 清理Tab区域选择事件监听器
  if (selectionHandlersCleanup) {
    selectionHandlersCleanup()
    selectionHandlersCleanup = null
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
