<template>
  <div class="note-editor">
    <div class="editor-header">
      <div class="title-wrapper">
        <input 
          ref="titleInputRef"
          type="text" 
          class="editor-title" 
          v-model="noteTitle"
          placeholder="笔记标题"
          @input="handleTitleChange"
          @focus="isTitleFocused = true"
          @blur="isTitleFocused = false"
        >
        <div class="title-word-count">
          标题字数: {{ titleWordCount }}
        </div>
      </div>
    </div>
    
    <!-- 文档类型：显示工具栏 -->
    <div v-if="!isMarkdownMode" class="editor-toolbar" :class="{ disabled: isTitleFocused }">
      <div class="toolbar-left">
        <!-- 第一组：撤销、重做 -->
        <Tooltip text="撤销" placement="top">
          <button 
            class="toolbar-btn" 
            :disabled="isTitleFocused || !editor?.can().undo()"
            @click="editor?.chain().focus().undo().run()"
          >
            <i class="fas fa-undo"></i>
          </button>
        </Tooltip>
        <Tooltip text="重做" placement="top">
          <button 
            class="toolbar-btn" 
            :disabled="isTitleFocused || !editor?.can().redo()"
            @click="editor?.chain().focus().redo().run()"
          >
            <i class="fas fa-redo"></i>
          </button>
        </Tooltip>
        <!-- 分割线 -->
        <div class="toolbar-divider"></div>
        
        <!-- 第二组：字体大小、大纲工具 -->
        <Dropdown v-model="fontSizeDropdownOpen" @update:modelValue="handleFontSizeDropdownChange">
          <template #trigger>
            <button 
              class="toolbar-btn toolbar-btn-group"
              :disabled="isTitleFocused"
            >
              <span>{{ currentFontSize }}</span>
              <i class="fas fa-chevron-down"></i>
            </button>
          </template>
          <DropdownItem 
            v-for="size in fontSizes" 
            :key="size"
            :class="{ 'font-size-item': true, 'active': currentFontSize === size }"
            @click="setFontSize(size)"
          >
            {{ size }}
          </DropdownItem>
        </Dropdown>
        <Dropdown v-model="headingDropdownOpen" @update:modelValue="handleHeadingDropdownChange">
          <template #trigger>
            <button 
              class="toolbar-btn toolbar-btn-group"
              :disabled="isTitleFocused"
            >
              <span>{{ currentHeading || '正文' }}</span>
              <i class="fas fa-chevron-down"></i>
            </button>
          </template>
          <DropdownItem 
            v-for="heading in headings" 
            :key="heading.value"
            :class="{ 'heading-item': true, 'active': currentHeading === heading.label }"
            @click="setHeading(heading.value)"
          >
            {{ heading.label }}
          </DropdownItem>
        </Dropdown>
        <!-- 分割线 -->
        <div class="toolbar-divider"></div>
        
        <!-- 第三组：加粗、斜体、下划线、删除线 -->
        <Tooltip text="粗体" placement="top">
          <button 
            class="toolbar-btn" 
            :class="{ active: editor?.isActive('bold') }"
            :disabled="isTitleFocused"
            @click="editor?.chain().focus().toggleBold().run()"
          >
          <i class="fas fa-bold"></i>
        </button>
        </Tooltip>
        <Tooltip text="斜体" placement="top">
          <button 
            class="toolbar-btn" 
            :class="{ active: editor?.isActive('italic') }"
            :disabled="isTitleFocused"
            @click="editor?.chain().focus().toggleItalic().run()"
          >
          <i class="fas fa-italic"></i>
        </button>
        </Tooltip>
        <Tooltip text="下划线" placement="top">
          <button 
            class="toolbar-btn" 
            :class="{ active: editor?.isActive('underline') }"
            :disabled="isTitleFocused"
            @click="editor?.chain().focus().toggleUnderline().run()"
          >
          <i class="fas fa-underline"></i>
        </button>
        </Tooltip>
        <Tooltip text="删除线" placement="top">
          <button 
            class="toolbar-btn" 
            :class="{ active: editor?.isActive('strike') }"
            :disabled="isTitleFocused"
            @click="editor?.chain().focus().toggleStrike().run()"
          >
            <i class="fas fa-strikethrough"></i>
          </button>
        </Tooltip>
        <!-- 分割线 -->
        <div class="toolbar-divider"></div>
        
        <!-- 第四组：文字颜色、背景颜色 -->
        <ColorPicker
          ref="textColorPickerRef"
          v-model="textColor"
          tooltip-text="文本颜色"
          icon="fas fa-font"
          type="text"
          :disabled="isTitleFocused"
          :is-active="editor?.isActive('textStyle', { color: textColor }) || editor?.isActive('gradientText', { gradient: textColor }) || false"
          :close-other-picker="closeHighlightColorPicker"
          :on-apply-color="applyTextColor"
          @update:modelValue="setTextColor"
          @open="closeHighlightColorPicker"
          @apply="applyTextColor"
        />
        <ColorPicker
          ref="highlightColorPickerRef"
          v-model="highlightColor"
          tooltip-text="背景颜色"
          icon="fas fa-highlighter"
          type="background"
          :disabled="isTitleFocused"
          :is-active="editor?.isActive('highlight') || false"
          :close-other-picker="closeTextColorPicker"
          :on-apply-color="applyHighlightColor"
          @update:modelValue="setHighlightColor"
          @open="closeTextColorPicker"
          @apply="applyHighlightColor"
        />
        <!-- 分割线 -->
        <div class="toolbar-divider"></div>
        
        <!-- 第五组：有序列表、无序列表、对齐工具 -->
        <Tooltip text="无序列表" placement="top">
          <button 
            class="toolbar-btn" 
            :class="{ active: editor?.isActive('bulletList') }"
            :disabled="isTitleFocused"
            @click="editor?.chain().focus().toggleBulletList().run()"
          >
            <i class="fas fa-list-ul"></i>
          </button>
        </Tooltip>
        <Tooltip text="有序列表" placement="top">
          <button 
            class="toolbar-btn" 
            :class="{ active: editor?.isActive('orderedList') }"
            :disabled="isTitleFocused"
            @click="editor?.chain().focus().toggleOrderedList().run()"
          >
            <i class="fas fa-list-ol"></i>
          </button>
        </Tooltip>
        <Dropdown v-model="textAlignDropdownOpen" @update:modelValue="handleTextAlignDropdownChange">
          <template #trigger>
            <button 
              class="toolbar-btn toolbar-btn-group"
              :disabled="isTitleFocused"
            >
              <i :class="currentTextAlignIcon"></i>
              <i class="fas fa-chevron-down"></i>
            </button>
          </template>
          <DropdownItem 
            v-for="align in textAlignOptions" 
            :key="align.value"
            :class="{ 'active': currentTextAlign === align.value }"
            @click="setTextAlign(align.value)"
          >
            <i :class="align.icon"></i>
            <span>{{ align.label }}</span>
          </DropdownItem>
        </Dropdown>
        <!-- 分割线 -->
        <div class="toolbar-divider"></div>
        
        <!-- 第六组：链接、分割线 -->
        <Tooltip text="链接" placement="top">
          <button 
            class="toolbar-btn" 
            :class="{ active: editor?.isActive('link') }"
            :disabled="isTitleFocused"
            @click="setLink"
          >
          <i class="fas fa-link"></i>
        </button>
        </Tooltip>
        <Tooltip text="分割线" placement="top">
          <button 
            class="toolbar-btn"
            :disabled="isTitleFocused"
            @click="insertHorizontalRule"
          >
            <i class="fas fa-minus"></i>
        </button>
        </Tooltip>
        <!-- 分割线 -->
        <div class="toolbar-divider"></div>
        
        <!-- 第七组：更多工具（图片、代码块、表格） -->
        <Dropdown v-model="moreToolsDropdownOpen">
          <template #trigger>
            <Tooltip text="更多工具" placement="top">
              <button 
                class="toolbar-btn"
                :disabled="isTitleFocused"
              >
                <i class="fas fa-plus"></i>
        </button>
            </Tooltip>
          </template>
          <DropdownItem @click="handleMoreToolClick('image')">
            <i class="fas fa-image"></i>
            <span>图片</span>
          </DropdownItem>
          <DropdownItem 
            :class="{ active: editor?.isActive('codeBlock') }"
            @click="handleMoreToolClick('code')"
          >
          <i class="fas fa-code"></i>
            <span>代码块</span>
          </DropdownItem>
          <DropdownItem @click="handleMoreToolClick('table')">
          <i class="fas fa-table"></i>
            <span>表格</span>
          </DropdownItem>
        </Dropdown>
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
    
    <!-- Markdown 类型：只显示统计 -->
    <div v-else class="editor-toolbar markdown-toolbar">
      <div class="toolbar-left"></div>
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
    
    <div 
      class="editor-content-wrapper"
      @contextmenu.prevent="handleContextMenu"
    >
      <!-- 富文本编辑器模式 -->
      <EditorContent 
        v-if="!isMarkdownMode" 
        :editor="editor"
        class="tiptap-editor"
      />
      
      <!-- Markdown 源代码模式 -->
      <textarea 
        v-else
        ref="markdownTextareaRef"
        class="editor-content markdown-source" 
        v-model="markdownSource"
        placeholder="Markdown 源代码..."
        @input="handleMarkdownChange"
        @blur="syncMarkdownToEditor"
        @contextmenu.prevent="handleContextMenu"
      ></textarea>
    </div>
    
    <!-- 自定义右键菜单 -->
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
import { ref, watch, computed, nextTick, onMounted, onUnmounted, onBeforeUnmount } from 'vue'
import Message from '../../utils/message'
import { useEditor, EditorContent, type Editor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import { GradientText } from '../../extensions/GradientText'
import { FontSize } from '../../extensions/FontSize'
import { CollapsibleHeading } from '../../extensions/CollapsibleHeading'
import TurndownService from 'turndown'
import { marked } from 'marked'
import Tooltip from '../ui/Tooltip.vue'
import ContextMenu, { type ContextMenuItem } from '../ui/ContextMenu.vue'
import ColorPicker from '../ui/ColorPicker.vue'
import Dropdown from '../ui/Dropdown.vue'
import DropdownItem from '../ui/DropdownItem.vue'

// Props
const props = defineProps<{
  note: any
}>()

// Emits
const emit = defineEmits<{
  'save': [note: any]
  'update': [note: any]
}>()

// 保存笔记
const handleSave = () => {
  // 触发保存事件
  emit('save', currentNote.value)
  // 显示保存成功提示（2秒后自动关闭）
  try {
    Message.success('保存成功', 2000)
  } catch (error) {
    console.error('Failed to show message:', error)
  }
}

// 键盘快捷键处理
const handleKeyDown = (event: KeyboardEvent) => {
  // Ctrl+S 或 Cmd+S (Mac)
  if ((event.ctrlKey || event.metaKey) && (event.key === 's' || event.key === 'S')) {
    console.log('Ctrl+S detected, preventing default save')
    // 先阻止默认行为和传播
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
    
    // 执行保存
    handleSave()
    
    // 返回 false 作为额外保险
    return false
  }
}

// 响应式状态
const noteTitle = ref('')
const noteContent = ref('')
const isMarkdownMode = ref(false)
const markdownSource = ref('')

// DOM引用
const markdownTextareaRef = ref<HTMLTextAreaElement | null>(null)
const editorContentRef = ref<HTMLElement | null>(null)
const titleInputRef = ref<HTMLInputElement | null>(null)
const textColorPickerRef = ref<any>(null)
const highlightColorPickerRef = ref<any>(null)

// 标题输入框焦点状态
const isTitleFocused = ref(false)

// 右键菜单相关
const showContextMenu = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const hasSelection = ref(false)

// 文本颜色和背景颜色
const textColor = ref('#000000')
const highlightColor = ref('#ffff00')

// 字体大小工具
const fontSizeDropdownOpen = ref(false)
const currentFontSize = ref<string>('16px') // 默认字体大小
const defaultFontSize = ref<string>('16px') // 默认字体大小，用于新输入的文字
const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px']

// 标题工具
const headingDropdownOpen = ref(false)
const currentHeading = ref<string>('正文')

// 更多工具下拉菜单
const moreToolsDropdownOpen = ref(false)

// 文本对齐工具
const textAlignDropdownOpen = ref(false)
const currentTextAlign = ref<string>('left')
const textAlignOptions = [
  { label: '左对齐', value: 'left', icon: 'fas fa-align-left' },
  { label: '居中', value: 'center', icon: 'fas fa-align-center' },
  { label: '右对齐', value: 'right', icon: 'fas fa-align-right' },
  { label: '两端对齐', value: 'justify', icon: 'fas fa-align-justify' },
]
const currentTextAlignIcon = computed(() => {
  const option = textAlignOptions.find(opt => opt.value === currentTextAlign.value)
  return option ? option.icon : 'fas fa-align-left'
})

const headings = [
  { label: '正文', value: 'paragraph' },
  { label: '标题 1', value: 1 },
  { label: '标题 2', value: 2 },
  { label: '标题 3', value: 3 },
  { label: '标题 4', value: 4 },
  { label: '标题 5', value: 5 },
  { label: '标题 6', value: 6 },
]

// 渐变色应用状态
const pendingGradientColor = ref<string | null>(null)
const gradientObserver = ref<MutationObserver | null>(null)
const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
    }),
    Underline,
    TextStyle,
    Color,
    Highlight.configure({
      multicolor: true,
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    GradientText,
    FontSize,
    Image.configure({
      inline: true,
      allowBase64: true,
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    }),
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
  ],
  content: '',
  onUpdate: ({ editor: editorInstance }) => {
    const html = editorInstance.getHTML()
    noteContent.value = html
    // 同步更新 Markdown 源代码
    if (!isMarkdownMode.value) {
      markdownSource.value = turndownService.turndown(html)
    }
    const text = editorInstance.getText()
    // 富文本模式下，需要传入编辑器实例来统计行数
    updateWordCount(text, false, editorInstance) // false 表示富文本模式
    handleContentChange()
    // 当输入新文字时，应用当前选择的字体大小
    applyFontSizeToNewText(editorInstance)
  },
  editorProps: {
    attributes: {
      class: 'tiptap-content',
      'data-placeholder': '开始输入笔记内容...',
      style: '--selection-background: rgba(138, 43, 226, 0.2); --selection-color: inherit;',
    },
    handleKeyDown: (view, event) => {
      // Tab 键：插入空格（缩进）
      if (event.key === 'Tab' && !event.shiftKey) {
        // 阻止默认行为（切换焦点）
        event.preventDefault()
        
        if (!editor.value) return false
        
        // 如果是在列表中，使用 Tiptap 的内置缩进功能
        if (editor.value.isActive('listItem')) {
          editor.value.chain().focus().sinkListItem('listItem').run()
          return true
        }
        
        // 对于普通段落和标题，插入空格（默认 2 个空格，相当于 Tab）
        const tabSpaces = '  ' // 2 个空格，可以根据需要调整（如 4 个空格）
        editor.value.chain().focus().insertContent(tabSpaces).run()
        return true
      }
      
      // Shift+Tab：删除前面的空格（减少缩进）
      if (event.key === 'Tab' && event.shiftKey) {
        event.preventDefault()
        
        if (!editor.value) return false
        
        // 如果是在列表中，使用 Tiptap 的内置缩进功能
        if (editor.value.isActive('listItem')) {
          editor.value.chain().focus().liftListItem('listItem').run()
          return true
        }
        
        // 对于普通段落和标题，删除前面的空格
        const { state } = view
        const { selection } = state
        const { $from } = selection
        
        // 获取当前行的开始位置
        const lineStart = $from.start($from.depth)
        const currentPos = $from.pos
        
        // 检查前面是否有空格
        const textBefore = state.doc.textBetween(lineStart, currentPos)
        const spaceMatch = textBefore.match(/([ \t]+)$/)
        
        if (spaceMatch && spaceMatch[1] && spaceMatch[1].length > 0) {
          // 删除最后一个空格或制表符
          const spacesToRemove = Math.min(2, spaceMatch[1].length) // 最多删除 2 个空格
          const deleteFrom = currentPos - spacesToRemove
          
          if (deleteFrom >= 0 && deleteFrom < currentPos) {
            const { tr } = state
            tr.delete(deleteFrom, currentPos)
            view.dispatch(tr)
            return true
          }
        }
        
        return false
      }
      
      return false
    },
  },
  onSelectionUpdate: ({ editor: editorInstance }) => {
    // 检测选中文本的颜色
    updateTextColorFromSelection(editorInstance)
    // 检测选中文本的字体大小
    updateFontSizeFromSelection(editorInstance)
    // 检测当前标题
    updateHeadingFromSelection(editorInstance)
    // 检测当前文本对齐
    updateTextAlignFromSelection(editorInstance)
  },
})

// Turndown 实例（用于将 HTML 转换为 Markdown）
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '*',
  strongDelimiter: '**',
  linkStyle: 'inlined',
  linkReferenceStyle: 'full',
})

// 添加自定义规则以更好地处理各种 HTML 标签
turndownService.addRule('underline', {
  filter: 'u',
  replacement: function (content) {
    return '<u>' + content + '</u>' // 下划线保留为 HTML，因为 Markdown 不支持
  }
})

turndownService.addRule('strikethrough', {
  filter: ['del', 's'],
  replacement: function (content) {
    return '~~' + content + '~~'
  }
})

// turndown 默认支持表格，但我们需要确保正确处理
// 注意：turndown 默认已经有表格规则，我们只需要确保下划线等特殊标签被正确处理

// 计算属性
const currentNote = computed(() => {
  const noteType = props.note?.noteType || 'richText'
  const baseNote = {
  ...props.note,
  title: noteTitle.value,
    wordCount: contentWordCount.value
  }
  
  // 根据笔记类型决定保存的内容格式
  if (noteType === 'markdown') {
    // 原生 Markdown：保存 Markdown 源代码
    return {
      ...baseNote,
      content: markdownSource.value,
      noteType: 'markdown'
    }
  } else {
    // 文档类型：保存 HTML
    return {
      ...baseNote,
  content: noteContent.value,
      noteType: 'richText'
    }
  }
})

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

const contentWordCount = ref(0)
const contentPunctuationCount = ref(0)

// 总字符数（包括标点符号）
const contentCharCount = computed(() => {
  return noteContent.value.length
})

const contentLineCount = ref(1)

// 防抖函数
const debounce = (func: Function, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

// 使用 marked 库将 Markdown 转换为 HTML
const convertMarkdownToHTML = (markdown: string): string => {
  if (!markdown || markdown.trim().length === 0) {
    return '<p></p>'
  }
  
  try {
    // 配置 marked 选项
    marked.setOptions({
      breaks: true, // 支持换行
      gfm: true, // 启用 GitHub Flavored Markdown
    })
    
    // 转换为 HTML
    const html = marked.parse(markdown) as string
    
    // 如果结果为空，返回空段落
    if (!html || html.trim().length === 0) {
      return '<p></p>'
    }
    
    return html
  } catch (error) {
    console.error('Markdown 转换错误:', error)
    // 如果转换失败，返回包装后的原始文本
    return '<p>' + markdown + '</p>'
  }
}

// 计算实际可见行数（基于屏幕宽度和自动换行）
const calculateVisibleLineCount = () => {
  nextTick(() => {
    if (isMarkdownMode.value) {
      // Markdown 模式：从 textarea 计算
      if (markdownTextareaRef.value) {
        const textarea = markdownTextareaRef.value
        const styles = window.getComputedStyle(textarea)
        const lineHeight = parseFloat(styles.lineHeight) || parseFloat(styles.fontSize) * 1.5
        const paddingTop = parseFloat(styles.paddingTop) || 0
        const paddingBottom = parseFloat(styles.paddingBottom) || 0
        
        // 创建一个临时的测量元素来获取实际内容高度
        const measureDiv = document.createElement('div')
        measureDiv.style.position = 'absolute'
        measureDiv.style.visibility = 'hidden'
        measureDiv.style.width = textarea.offsetWidth + 'px'
        measureDiv.style.fontSize = styles.fontSize
        measureDiv.style.fontFamily = styles.fontFamily
        measureDiv.style.lineHeight = styles.lineHeight
        measureDiv.style.padding = styles.padding
        measureDiv.style.whiteSpace = 'pre-wrap'
        measureDiv.style.wordWrap = 'break-word'
        measureDiv.textContent = markdownSource.value || ''
        document.body.appendChild(measureDiv)
        
        const contentHeight = measureDiv.offsetHeight
        const lineCount = Math.max(1, Math.round((contentHeight - paddingTop - paddingBottom) / lineHeight))
        
        document.body.removeChild(measureDiv)
        contentLineCount.value = lineCount
      } else {
        // 回退到按换行符统计
        const text = markdownSource.value || ''
        const lines = text.split('\n')
        contentLineCount.value = Math.max(1, lines.length)
      }
    } else {
      // 富文本模式：从 Tiptap 编辑器 DOM 计算
      if (editor.value) {
        const editorElement = editor.value.view.dom as HTMLElement
        if (editorElement) {
          // 查找 .ProseMirror 元素（实际的内容容器）
          const proseMirror = editorElement.querySelector('.ProseMirror') as HTMLElement
          const targetElement = proseMirror || editorElement
          
          if (targetElement) {
            const styles = window.getComputedStyle(targetElement)
            const lineHeight = parseFloat(styles.lineHeight) || parseFloat(styles.fontSize) * 1.5
            const paddingTop = parseFloat(styles.paddingTop) || 0
            const paddingBottom = parseFloat(styles.paddingBottom) || 0
            
            // 获取实际内容高度（scrollHeight 包含所有内容）
            const contentHeight = targetElement.scrollHeight
            const lineCount = Math.max(1, Math.round((contentHeight - paddingTop - paddingBottom) / lineHeight))
            
            contentLineCount.value = lineCount
          } else {
            contentLineCount.value = 1
          }
        } else {
          contentLineCount.value = 1
        }
      } else {
        contentLineCount.value = 1
      }
    }
  })
}

// 更新字数统计
const updateWordCount = (text: string, isMarkdown: boolean = false, editorInstance?: any) => {
  contentWordCount.value = getWordCount(text)
  contentPunctuationCount.value = getPunctuationCount(text)
  
  // 计算实际可见行数（基于屏幕宽度）
  calculateVisibleLineCount()
}

// 移除切换模式的功能，根据笔记类型自动决定

// Markdown 源代码变化处理
const handleMarkdownChange = () => {
  // Markdown 模式下，内容存储在 markdownSource 中
  const text = markdownSource.value
  updateWordCount(text, true) // true 表示 Markdown 模式
  // 延迟同步到编辑器，避免频繁转换
}

// 同步 Markdown 到编辑器
const syncMarkdownToEditor = () => {
  if (!editor.value || !isMarkdownMode.value) return
  
  const html = convertMarkdownToHTML(markdownSource.value)
  editor.value.commands.setContent(html)
  noteContent.value = html
}


// 初始化编辑器内容
onMounted(() => {
  if (editor.value && noteContent.value) {
    editor.value.commands.setContent(noteContent.value)
  }
  
  // 动态添加选中文本样式，确保覆盖 Tiptap 的默认样式
  nextTick(() => {
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
      
      .tiptap-editor *::-moz-selection,
      .tiptap-editor::-moz-selection,
      .tiptap-content *::-moz-selection,
      .tiptap-content::-moz-selection,
      .tiptap-content .ProseMirror *::-moz-selection,
      .tiptap-content .ProseMirror::-moz-selection,
      .tiptap-editor .ProseMirror *::-moz-selection,
      .tiptap-editor .ProseMirror::-moz-selection,
      .ProseMirror *::-moz-selection,
      .ProseMirror::-moz-selection {
        background-color: rgba(138, 43, 226, 0.2) !important;
        color: inherit !important;
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
      
      body.dark .tiptap-editor *::-moz-selection,
      body.dark .tiptap-editor::-moz-selection,
      body.dark .tiptap-content *::-moz-selection,
      body.dark .tiptap-content::-moz-selection,
      body.dark .tiptap-content .ProseMirror *::-moz-selection,
      body.dark .tiptap-content .ProseMirror::-moz-selection,
      body.dark .tiptap-editor .ProseMirror *::-moz-selection,
      body.dark .tiptap-editor .ProseMirror::-moz-selection,
      body.dark .ProseMirror *::-moz-selection,
      body.dark .ProseMirror::-moz-selection {
        background-color: rgba(147, 112, 219, 0.3) !important;
        color: #ffffff !important;
      }
    `
    document.head.appendChild(style)
  })
})

// 组件卸载时移除动态样式
onBeforeUnmount(() => {
  const style = document.getElementById('tiptap-selection-override')
  if (style) {
    style.remove()
  }
})

// 组件卸载前销毁编辑器
onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})

// 监听props变化
watch(() => props.note, (newNote) => {
  if (newNote) {
    noteTitle.value = newNote.title || ''
    const content = newNote.content || ''
    
    // 根据笔记类型决定编辑模式
    const noteType = newNote.noteType || 'richText' // 默认为文档类型
    isMarkdownMode.value = noteType === 'markdown'
    
    if (noteType === 'markdown') {
      // 原生 Markdown 类型：直接显示 Markdown 源代码
      markdownSource.value = content || ''
    } else {
      // 文档类型：显示富文本编辑器
      // 判断内容是 HTML 还是 Markdown（兼容旧数据）
      if (content.startsWith('<') || content.includes('<p>') || content.includes('<div>')) {
        // HTML 内容
        noteContent.value = content
        if (editor.value) {
          editor.value.commands.setContent(content)
        }
        markdownSource.value = turndownService.turndown(content)
      } else if (content.trim().length > 0) {
        // 可能是 Markdown 内容（兼容旧数据）
        const html = convertMarkdownToHTML(content)
        noteContent.value = html
        if (editor.value) {
          editor.value.commands.setContent(html)
        }
        markdownSource.value = content
      } else {
        // 空内容
        noteContent.value = ''
        markdownSource.value = ''
        if (editor.value) {
          editor.value.commands.setContent('')
        }
      }
    }
  }
}, { immediate: true })

// 监听编辑器内容变化，更新字数统计
watch(() => {
  if (!editor.value || isMarkdownMode.value) return null
  // 返回编辑器文档的 JSON 字符串，用于监听变化
  return editor.value.getJSON()
}, () => {
  if (editor.value && !isMarkdownMode.value) {
    const text = editor.value.getText()
    updateWordCount(text, false) // false 表示富文本模式
  }
}, { immediate: true, deep: true })

// 监听 Markdown 模式下的内容变化
watch(() => markdownSource.value, (text) => {
  if (isMarkdownMode.value) {
    updateWordCount(text || '', true) // true 表示 Markdown 模式
  }
}, { immediate: true })

// ResizeObserver 用于监听编辑器大小变化
let resizeObserver: ResizeObserver | null = null

  // 监听窗口大小变化
const handleResize = () => {
  calculateVisibleLineCount()
}

// 监听编辑器模式切换
watch(() => isMarkdownMode.value, () => {
  nextTick(() => {
    calculateVisibleLineCount()
    // 重新设置 ResizeObserver
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
    setupResizeObserver()
  })
})

// 设置 ResizeObserver
const setupResizeObserver = () => {
  nextTick(() => {
    if (isMarkdownMode.value && markdownTextareaRef.value) {
    resizeObserver = new ResizeObserver(() => {
        calculateVisibleLineCount()
      })
      resizeObserver.observe(markdownTextareaRef.value)
    } else if (editor.value) {
      const editorElement = editor.value.view.dom as HTMLElement
      if (editorElement) {
        // 查找 .ProseMirror 元素（实际的内容容器）
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
  })
}

// 组件挂载后设置 ResizeObserver
onMounted(() => {
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
  
  // 监听键盘事件（Ctrl+S 保存）
  // 使用 document 和 capture 模式确保优先捕获事件
  document.addEventListener('keydown', handleKeyDown, true)
  
  // 设置 ResizeObserver
  setupResizeObserver()
  
  // 添加标题折叠功能的点击事件监听
  nextTick(() => {
    const editorElement = document.querySelector('.tiptap-editor .ProseMirror') as HTMLElement
    if (editorElement) {
      editorElement.addEventListener('click', handleEditorClick)
    }
  })
})

// 组件卸载前清理
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
})

// 方法
const handleTitleChange = () => {
  emit('update', currentNote.value)
}

const handleContentChange = () => {
  emit('update', currentNote.value)
}

// 设置链接
const setLink = () => {
  if (!editor.value) return
  
  const url = window.prompt('请输入链接地址:')
  if (url) {
    editor.value.chain().focus().setLink({ href: url }).run()
  }
}

// 插入分割线
const insertHorizontalRule = () => {
  if (!editor.value || isTitleFocused.value) return
  editor.value.chain().focus().setHorizontalRule().run()
}

// 设置文本对齐
const setTextAlign = (align: string) => {
  if (!editor.value || isTitleFocused.value) return
  textAlignDropdownOpen.value = false
  currentTextAlign.value = align
  editor.value.chain().focus().setTextAlign(align).run()
}

// 添加图片
const addImage = () => {
  if (!editor.value) return
  
  const url = window.prompt('请输入图片地址:')
  if (url) {
    editor.value.chain().focus().setImage({ src: url }).run()
  }
}

// 关闭文本颜色选择器
const closeTextColorPicker = () => {
  if (textColorPickerRef.value) {
    textColorPickerRef.value.showPicker = false
  }
}

// 关闭背景颜色选择器
const closeHighlightColorPicker = () => {
  if (highlightColorPickerRef.value) {
    highlightColorPickerRef.value.showPicker = false
  }
}

// 从选中文本更新文本颜色（识别渐变色和纯色）
const updateTextColorFromSelection = (editorInstance: any) => {
  if (!editorInstance) return
  
  const { selection } = editorInstance.state
  const { from, to } = selection
  
  if (from === to) {
    // 没有选中文本，重置为默认颜色
    textColor.value = '#000000'
    return
  }
  
  // 检查是否有渐变 mark
  const gradientMark = editorInstance.getAttributes('gradientText')
  if (gradientMark && gradientMark.gradient) {
    // 选中文本有渐变色
    textColor.value = gradientMark.gradient
    return
  }
  
  // 检查是否有纯色 mark
  const colorMark = editorInstance.getAttributes('textStyle')
  if (colorMark && colorMark.color) {
    // 选中文本有纯色
    textColor.value = colorMark.color
    return
  }
  
  // 没有颜色标记，使用默认颜色
  textColor.value = '#000000'
}

// 应用渐变色到选中的文本
const applyGradientToSelection = (gradientValue: string) => {
  const view = editor.value?.view
  if (!view) return
  
  const editorElement = view.dom.querySelector('.ProseMirror') as HTMLElement
  if (!editorElement) return
  
  // 获取当前选中的范围
  const { from, to } = view.state.selection
  
  // 方法1: 查找所有 span 元素，特别是颜色为透明的
  const allSpans = editorElement.querySelectorAll('span')
  let applied = false
  
  allSpans.forEach((span) => {
    const htmlSpan = span as HTMLElement
    const computedStyle = window.getComputedStyle(htmlSpan)
    const spanColor = computedStyle.color || htmlSpan.style.color
    
    // 检查是否是透明色或接近透明（rgb(0, 0, 0) 在黑色背景下可能显示为黑色）
    if (spanColor === 'transparent' || 
        spanColor === 'rgba(0, 0, 0, 0)' ||
        htmlSpan.style.color === 'transparent' ||
        htmlSpan.getAttribute('data-color') === 'transparent') {
      // 应用渐变样式
      htmlSpan.style.backgroundImage = gradientValue
      htmlSpan.style.webkitBackgroundClip = 'text'
      htmlSpan.style.backgroundClip = 'text'
      htmlSpan.style.webkitTextFillColor = 'transparent'
      htmlSpan.style.color = 'transparent'
      applied = true
    }
  })
  
  // 方法2: 如果没找到，尝试通过位置查找
  if (!applied) {
    try {
      const startPos = view.domAtPos(from)
      const endPos = view.domAtPos(to)
      
      if (startPos.node && endPos.node) {
        // 创建一个范围来查找元素
        const range = document.createRange()
        if (startPos.node.nodeType === Node.TEXT_NODE) {
          range.setStart(startPos.node, Math.min(startPos.offset, startPos.node.textContent?.length || 0))
        } else {
          range.setStartBefore(startPos.node)
        }
        
        if (endPos.node.nodeType === Node.TEXT_NODE) {
          range.setEnd(endPos.node, Math.min(endPos.offset, endPos.node.textContent?.length || 0))
        } else {
          range.setEndAfter(endPos.node)
        }
        
        // 查找范围内的所有 span 元素
        const contents = range.cloneContents()
        const walker = document.createTreeWalker(
          contents,
          NodeFilter.SHOW_ELEMENT,
          null
        )
        
        let node: Node | null
        while (node = walker.nextNode()) {
          if (node.nodeName === 'SPAN') {
            const htmlSpan = node as HTMLElement
            htmlSpan.style.backgroundImage = gradientValue
            htmlSpan.style.webkitBackgroundClip = 'text'
            htmlSpan.style.backgroundClip = 'text'
            htmlSpan.style.webkitTextFillColor = 'transparent'
            htmlSpan.style.color = 'transparent'
          }
        }
        
        // 在原始 DOM 中查找对应的元素
        const commonAncestor = range.commonAncestorContainer
        if (commonAncestor.nodeType === Node.ELEMENT_NODE) {
          const ancestor = commonAncestor as HTMLElement
          const spans = ancestor.querySelectorAll('span')
          spans.forEach((span) => {
            const htmlSpan = span as HTMLElement
            if (range.intersectsNode(htmlSpan)) {
              htmlSpan.style.backgroundImage = gradientValue
              htmlSpan.style.webkitBackgroundClip = 'text'
              htmlSpan.style.backgroundClip = 'text'
              htmlSpan.style.webkitTextFillColor = 'transparent'
              htmlSpan.style.color = 'transparent'
            }
          })
        }
      }
    } catch (e) {
      console.error('Error applying gradient:', e)
    }
  }
  
  // 方法3: 如果还是没找到，直接查找所有没有背景图片的 span
  if (!applied) {
    allSpans.forEach((span) => {
      const htmlSpan = span as HTMLElement
      if (!htmlSpan.style.backgroundImage || htmlSpan.style.backgroundImage === 'none') {
        // 检查是否在选中范围内
        const range = document.createRange()
        try {
          range.selectNodeContents(htmlSpan)
          const selection = window.getSelection()
          if (selection && selection.rangeCount > 0) {
            const selRange = selection.getRangeAt(0)
            if (selRange.intersectsNode(htmlSpan)) {
              htmlSpan.style.backgroundImage = gradientValue
              htmlSpan.style.webkitBackgroundClip = 'text'
              htmlSpan.style.backgroundClip = 'text'
              htmlSpan.style.webkitTextFillColor = 'transparent'
              htmlSpan.style.color = 'transparent'
            }
          }
        } catch (e) {
          // 忽略错误
        }
      }
    })
  }
}

// 应用文本颜色（点击主按钮时）
const applyTextColor = () => {
  if (!editor.value || isTitleFocused.value) return
  
  // 检查是否有选中文本
  const { from, to } = editor.value.state.selection
  if (from === to) {
    // 没有选中文本，不执行操作
    return
  }
  
  // 判断是否为渐变色
  const isGradientColor = textColor.value.startsWith('linear-gradient') || textColor.value.startsWith('radial-gradient')
  
  if (isGradientColor) {
    // 渐变色：先清除之前的颜色和渐变 mark，然后应用渐变
    editor.value.chain()
      .focus()
      .unsetMark('textStyle')  // 清除纯色 textStyle
      .unsetGradientText()  // 清除之前的渐变
      .setGradientText(textColor.value)  // 应用渐变色
      .run()
  } else {
    // 纯色：先清除渐变 mark，然后应用纯色
    editor.value.chain()
      .focus()
      .unsetGradientText()  // 清除渐变色
      .setColor(textColor.value)  // 应用纯色
      .run()
  }
}

// 应用背景颜色（点击主按钮时）
const applyHighlightColor = () => {
  if (!editor.value || isTitleFocused.value) return
  // 检查是否有选中文本
  const { from, to } = editor.value.state.selection
  if (from === to) {
    // 没有选中文本，不执行操作
    return
  }
  // 使用 toggleHighlight，如果已有相同颜色则移除，否则应用
  editor.value.chain().focus().toggleHighlight({ color: highlightColor.value }).run()
}

// 设置文本颜色（从颜色选择器选择时）
const setTextColor = (color: string) => {
  if (!editor.value || isTitleFocused.value) return
  textColor.value = color
  
  // 检查是否有选中文本
  const { from, to } = editor.value.state.selection
  if (from === to) {
    // 没有选中文本，只更新颜色值，不应用
    return
  }
  
  // 判断是否为渐变色
  const isGradientColor = color.startsWith('linear-gradient') || color.startsWith('radial-gradient')
  
  if (isGradientColor) {
    // 渐变色：先清除之前的颜色和渐变 mark，然后应用渐变
    editor.value.chain()
      .focus()
      .unsetMark('textStyle')  // 清除纯色 textStyle
      .unsetGradientText()  // 清除之前的渐变
      .setGradientText(color)  // 应用渐变色
      .run()
  } else {
    // 纯色：先清除渐变 mark，然后应用纯色
    editor.value.chain()
      .focus()
      .unsetGradientText()  // 清除渐变色
      .setColor(color)  // 应用纯色
      .run()
  }
}

// 设置背景颜色（从颜色选择器选择时）
const setHighlightColor = (color: string) => {
  if (!editor.value || isTitleFocused.value) return
  highlightColor.value = color
  // 检查是否有选中文本
  const { from, to } = editor.value.state.selection
  if (from === to) {
    // 没有选中文本，只更新颜色值，不应用
    return
  }
  // 使用 toggleHighlight 应用颜色
  editor.value.chain().focus().toggleHighlight({ color: color }).run()
}

// 处理字体大小下拉菜单变化（互斥逻辑）
const handleFontSizeDropdownChange = (value: boolean) => {
  if (value && headingDropdownOpen.value) {
    headingDropdownOpen.value = false
  }
  // 关闭其他下拉菜单
  if (value && moreToolsDropdownOpen.value) {
    moreToolsDropdownOpen.value = false
  }
  if (value && textAlignDropdownOpen.value) {
    textAlignDropdownOpen.value = false
  }
}

// 处理标题下拉菜单变化（互斥逻辑）
const handleHeadingDropdownChange = (value: boolean) => {
  if (value && fontSizeDropdownOpen.value) {
    fontSizeDropdownOpen.value = false
  }
  // 关闭其他下拉菜单
  if (value && moreToolsDropdownOpen.value) {
    moreToolsDropdownOpen.value = false
  }
  if (value && textAlignDropdownOpen.value) {
    textAlignDropdownOpen.value = false
  }
}

// 处理文本对齐下拉菜单变化（互斥逻辑）
const handleTextAlignDropdownChange = (value: boolean) => {
  if (value && fontSizeDropdownOpen.value) {
    fontSizeDropdownOpen.value = false
  }
  if (value && headingDropdownOpen.value) {
    headingDropdownOpen.value = false
  }
  if (value && moreToolsDropdownOpen.value) {
    moreToolsDropdownOpen.value = false
  }
}

// 处理更多工具下拉菜单变化（互斥逻辑）
watch(moreToolsDropdownOpen, (value) => {
  if (value) {
    // 关闭其他下拉菜单
    if (fontSizeDropdownOpen.value) {
      fontSizeDropdownOpen.value = false
    }
    if (headingDropdownOpen.value) {
      headingDropdownOpen.value = false
    }
    if (textAlignDropdownOpen.value) {
      textAlignDropdownOpen.value = false
    }
  }
})

// 处理更多工具点击
const handleMoreToolClick = (tool: 'image' | 'code' | 'table') => {
  moreToolsDropdownOpen.value = false
  if (tool === 'image') {
    addImage()
  } else if (tool === 'code') {
    editor?.value?.chain().focus().toggleCodeBlock().run()
  } else if (tool === 'table') {
    editor?.value?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }
}

// 设置字体大小
const setFontSize = (size: string) => {
  if (!editor.value || isTitleFocused.value) return
  fontSizeDropdownOpen.value = false
  
  // 移除 px 后缀，只保留数字
  const fontSize = size.replace('px', '')
  
  // 检查是否有选中文本
  const { from, to } = editor.value.state.selection
  if (from === to) {
    // 没有选中文本，只更新默认字体大小，下次输入时会应用
    defaultFontSize.value = size
    currentFontSize.value = size
  } else {
    // 有选中文本，直接应用字体大小
    editor.value.chain().focus().setFontSize(fontSize).run()
    currentFontSize.value = size
    defaultFontSize.value = size
  }
}

// 从选中文本更新字体大小显示
const updateFontSizeFromSelection = (editorInstance: any) => {
  if (!editorInstance) return
  
  const { selection } = editorInstance.state
  const { from, to } = selection
  
  if (from === to) {
    // 没有选中文本，显示默认字体大小
    currentFontSize.value = defaultFontSize.value
    return
  }
  
  // 检查选中文本的字体大小
  const textStyle = editorInstance.getAttributes('textStyle')
  if (textStyle && textStyle.fontSize) {
    // 选中文本有字体大小，显示该大小
    currentFontSize.value = `${textStyle.fontSize}px`
  } else {
    // 选中文本没有字体大小，显示默认大小
    currentFontSize.value = defaultFontSize.value
  }
}

// 当输入新文字时，应用当前选择的字体大小
const applyFontSizeToNewText = (editorInstance: any) => {
  if (!editorInstance || isTitleFocused.value) return
  
  // 检查当前光标位置是否有字体大小标记
  const textStyle = editorInstance.getAttributes('textStyle')
  const hasFontSize = textStyle && textStyle.fontSize
  
  // 如果当前没有字体大小标记，且默认字体大小不是16px（默认值），则应用默认字体大小
  // 使用 nextTick 确保在 DOM 更新后应用
  if (!hasFontSize && defaultFontSize.value !== '16px') {
    nextTick(() => {
      const fontSize = defaultFontSize.value.replace('px', '')
      editorInstance.chain().focus().setFontSize(fontSize).run()
    })
  }
}

// 设置标题
const setHeading = (value: string | number) => {
  if (!editor.value || isTitleFocused.value) return
  headingDropdownOpen.value = false
  fontSizeDropdownOpen.value = false
  
  if (value === 'paragraph') {
    // 设置为正文
    editor.value.chain().focus().setParagraph().run()
    currentHeading.value = '正文'
  } else {
    // 设置为标题
    const level = typeof value === 'number' ? value : parseInt(value as string)
    editor.value.chain().focus().setHeading({ level }).run()
    currentHeading.value = `标题 ${level}`
  }
  
  // 更新标题显示
  updateHeadingFromSelection(editor.value)
}

// 从选中文本更新文本对齐显示
const updateTextAlignFromSelection = (editorInstance: any) => {
  if (!editorInstance) return
  const { state } = editorInstance
  const { selection } = state
  const { $from } = selection
  
  // 检查当前节点的对齐方式
  const node = $from.parent
  const align = node.attrs.textAlign || 'left'
  currentTextAlign.value = align
}

// 从选中文本更新标题显示
const updateHeadingFromSelection = (editorInstance: any) => {
  if (!editorInstance) return
  
  const { selection } = editorInstance.state
  const { from } = selection
  
  // 获取当前节点
  const $from = editorInstance.state.doc.resolve(from)
  const node = $from.parent
  
  // 检查是否是标题节点
  if (node.type.name === 'collapsibleHeading') {
    const level = node.attrs.level
    currentHeading.value = `标题 ${level}`
  } else {
    currentHeading.value = '正文'
  }
}

// 处理编辑器点击事件（用于标题折叠）
const handleEditorClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const heading = target.closest('.collapsible-heading') as HTMLElement
  
  if (!heading || !editor.value) return
  
  // 检查是否点击了折叠图标区域
  const collapseIcon = target.closest('.heading-collapse-icon')
  if (!collapseIcon) return
  
  event.preventDefault()
  event.stopPropagation()
  
  const level = parseInt(heading.getAttribute('data-level') || '1')
  const isCollapsed = heading.getAttribute('data-collapsed') === 'true'
  
  // 找到对应的节点并更新 collapsed 属性
  let found = false
  editor.value.state.doc.descendants((node, pos) => {
    if (found) return false
    if (node.type.name === 'collapsibleHeading' && node.attrs.level === level) {
      // 检查这个节点是否对应点击的标题
      const nodeStart = pos
      const nodeEnd = pos + node.nodeSize
      
      // 获取点击位置在文档中的位置
      const clickPos = editor.value?.state.selection.from || 0
      
      if (clickPos >= nodeStart && clickPos <= nodeEnd) {
        found = true
        editor.value?.chain().focus().command(({ tr }) => {
          const attrs = { ...node.attrs, collapsed: !isCollapsed }
          tr.setNodeMarkup(pos, undefined, attrs)
          return true
        }).run()
        return false
      }
    }
  })
}

// 右键菜单处理
const handleContextMenu = (event: MouseEvent) => {
  event.preventDefault()
  
  // 检查是否有选中文本
  const selection = window.getSelection()
  hasSelection.value = selection !== null && selection.toString().trim().length > 0
  
  contextMenuX.value = event.clientX
  contextMenuY.value = event.clientY
  showContextMenu.value = true
}

// 右键菜单项
const contextMenuItems = computed<ContextMenuItem[]>(() => {
  const items: ContextMenuItem[] = []
  
  if (hasSelection.value) {
    // 有选中文本时的菜单
    items.push(
      {
        label: '复制',
        icon: 'fas fa-copy',
        shortcut: 'Ctrl+C',
        action: () => {
          document.execCommand('copy')
        }
      },
      {
        label: '剪切',
        icon: 'fas fa-cut',
        shortcut: 'Ctrl+X',
        action: () => {
          document.execCommand('cut')
        }
      },
      {
        label: '粘贴',
        icon: 'fas fa-paste',
        shortcut: 'Ctrl+V',
        action: async () => {
          try {
            const text = await navigator.clipboard.readText()
            if (editor.value && !isMarkdownMode.value) {
              editor.value.chain().focus().insertContent(text).run()
            } else if (isMarkdownMode.value) {
              const textarea = document.querySelector('.markdown-source') as HTMLTextAreaElement
              if (textarea) {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
                markdownSource.value = 
                  markdownSource.value.substring(0, start) + 
                  text + 
                  markdownSource.value.substring(end)
              }
            }
          } catch (err) {
            document.execCommand('paste')
          }
        }
      },
      { divider: true },
      {
        label: '加粗',
        icon: 'fas fa-bold',
        shortcut: 'Ctrl+B',
        disabled: isMarkdownMode.value,
        action: () => {
          if (editor.value && !isMarkdownMode.value) {
            editor.value.chain().focus().toggleBold().run()
          }
        }
      },
      {
        label: '斜体',
        icon: 'fas fa-italic',
        shortcut: 'Ctrl+I',
        disabled: isMarkdownMode.value,
        action: () => {
          if (editor.value && !isMarkdownMode.value) {
            editor.value.chain().focus().toggleItalic().run()
          }
        }
      },
      {
        label: '下划线',
        icon: 'fas fa-underline',
        shortcut: 'Ctrl+U',
        disabled: isMarkdownMode.value,
        action: () => {
          if (editor.value && !isMarkdownMode.value) {
            editor.value.chain().focus().toggleUnderline().run()
          }
        }
      }
    )
  } else {
    // 没有选中文本时的菜单
    items.push(
      {
        label: '粘贴',
        icon: 'fas fa-paste',
        shortcut: 'Ctrl+V',
        action: async () => {
          try {
            const text = await navigator.clipboard.readText()
            if (editor.value && !isMarkdownMode.value) {
              editor.value.chain().focus().insertContent(text).run()
            } else if (isMarkdownMode.value) {
              const textarea = document.querySelector('.markdown-source') as HTMLTextAreaElement
              if (textarea) {
                const start = textarea.selectionStart
                markdownSource.value = 
                  markdownSource.value.substring(0, start) + 
                  text + 
                  markdownSource.value.substring(start)
              }
            }
          } catch (err) {
            document.execCommand('paste')
          }
        }
      },
      { divider: true },
      {
        label: '全选',
        icon: 'fas fa-check-square',
        shortcut: 'Ctrl+A',
        action: () => {
          if (editor.value && !isMarkdownMode.value) {
            editor.value.chain().focus().selectAll().run()
          } else if (isMarkdownMode.value) {
            const textarea = document.querySelector('.markdown-source') as HTMLTextAreaElement
            if (textarea) {
              textarea.select()
            }
          }
        }
      }
    )
  }
  
  return items
})

// 处理右键菜单项点击
const handleContextMenuItemClick = (item: ContextMenuItem) => {
  // action 已经在 item.action 中执行了
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
  background-color: rgba(91, 107, 240, 0.08);
  border: 1px solid rgba(91, 107, 240, 0.15);
  border-radius: 8px;
  font-size: 12px;
  color: var(--primary-color);
  font-weight: 500;
  white-space: nowrap;
  user-select: none;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

body.dark .title-word-count {
  background-color: rgba(91, 107, 240, 0.15);
  border-color: rgba(91, 107, 240, 0.25);
  color: rgba(255, 255, 255, 0.9);
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

/* 标题选中文本样式 */
.editor-title::selection {
  background-color: rgba(138, 43, 226, 0.2); /* 柔和的紫色 */
  color: inherit;
}

.editor-title::-moz-selection {
  background-color: rgba(138, 43, 226, 0.2);
  color: inherit;
}

body.dark .editor-title {
  color: #ffffff;
}

/* 深色模式下的标题选中文本样式 */
body.dark .editor-title::selection {
  background-color: rgba(147, 112, 219, 0.3);
  color: #ffffff;
}

body.dark .editor-title::-moz-selection {
  background-color: rgba(147, 112, 219, 0.3);
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
  padding: 8px 14px;
  background-color: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  font-size: 12px;
  color: #4a5568;
  font-weight: 500;
  white-space: nowrap;
  user-select: none;
  transition: all 0.3s cubic-bezier(0.28, 0.11, 0.32, 1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.word-count-item:hover {
  background-color: rgba(91, 107, 240, 0.1);
  border-color: rgba(91, 107, 240, 0.3);
  color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(91, 107, 240, 0.15);
}

body.dark .word-count-item {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

body.dark .word-count-item:hover {
  background-color: rgba(91, 107, 240, 0.2);
  border-color: rgba(91, 107, 240, 0.4);
  color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 12px rgba(91, 107, 240, 0.25);
}

body.dark .editor-toolbar {
  border-bottom-color: #3a4152;
}

/* Markdown 模式下的工具栏样式 - 更简洁 */
.markdown-toolbar {
  border-bottom: 1px solid var(--color-border);
  padding: 8px 16px;
  min-height: 48px;
}

body.dark .markdown-toolbar {
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
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-btn.active {
  background-color: var(--primary-color);
  color: white;
}

.toolbar-btn-group {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.toolbar-btn-group i.fa-chevron-down {
  font-size: 10px;
  opacity: 0.7;
}

.editor-toolbar.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background-color: var(--color-border);
  margin: 0 8px;
  flex-shrink: 0;
}

body.dark .toolbar-divider {
  background-color: #3a4152;
}

.toolbar-btn.mode-toggle {
  font-size: 14px;
  padding: 6px 10px;
}

.toolbar-btn.mode-toggle span {
  font-size: 12px;
  margin-left: 4px;
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
  height: 0; /* 确保 flex 布局正确 */
  flex-basis: 0;
}

/* 自定义滚动条样式 */
.editor-content-wrapper::-webkit-scrollbar {
  width: 8px;
}

.editor-content-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.editor-content-wrapper::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.editor-content-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

body.dark .editor-content-wrapper::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

body.dark .editor-content-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.editor-content {
  width: 100%;
  height: 100%;
  border: none;
  font-size: 16px;
  line-height: 1.7;
  padding: 10px 0;
  padding-right: 0; /* 确保右侧padding为0，避免对齐问题 */
  padding-left: 0;
  margin: 0;
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

/* Tiptap Highlight 扩展样式 */
.tiptap-content mark,
.tiptap-content .ProseMirror mark,
.tiptap-editor mark,
.tiptap-editor .ProseMirror mark {
  background-color: var(--highlight-color, #ffff00) !important;
  color: inherit !important;
  padding: 2px 0;
  border-radius: 2px;
}

/* 确保 highlight 颜色正确应用 */
.tiptap-content mark[data-color],
.tiptap-content .ProseMirror mark[data-color],
.tiptap-editor mark[data-color],
.tiptap-editor .ProseMirror mark[data-color] {
  background-color: var(--highlight-color) !important;
}

/* Markdown 源代码模式样式 - 确保与富文本模式对齐 */
.editor-content.markdown-source {
  padding: 10px 0;
  padding-right: 0;
  padding-left: 0;
  margin: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 选中文本样式 - 使用柔和的紫色调 */
.editor-content::selection {
  background-color: rgba(138, 43, 226, 0.2); /* 柔和的紫色 */
  color: inherit;
}

.editor-content::-moz-selection {
  background-color: rgba(138, 43, 226, 0.2); /* Firefox 支持 */
  color: inherit;
}

body.dark .editor-content {
  color: #ffffff;
}

/* 深色模式下的选中文本样式 */
body.dark .editor-content::selection {
  background-color: rgba(147, 112, 219, 0.3); /* 深色模式下稍亮一点的紫色 */
  color: #ffffff;
}

body.dark .editor-content::-moz-selection {
  background-color: rgba(147, 112, 219, 0.3);
  color: #ffffff;
}

.editor-content:focus {
  outline: none;
}

/* Tiptap 编辑器样式 */
.tiptap-editor {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0;
  margin: 0;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

.tiptap-editor:focus,
.tiptap-editor:focus-within {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

/* 确保 Tiptap 编辑器容器没有边框和轮廓 */
.tiptap-editor .ProseMirror {
  border: none !important;
  border-top: none !important;
  border-bottom: none !important;
  border-left: none !important;
  border-right: none !important;
  outline: none !important;
  padding: 0;
  margin: 0;
  box-shadow: none !important;
  background: transparent !important;
}

.tiptap-editor .ProseMirror:focus,
.tiptap-editor .ProseMirror:focus-within,
.tiptap-editor .ProseMirror:active {
  border: none !important;
  border-top: none !important;
  border-bottom: none !important;
  border-left: none !important;
  border-right: none !important;
  outline: none !important;
  box-shadow: none !important;
}

.tiptap-editor .ProseMirror > *:last-child {
  border-bottom: none !important;
  margin-bottom: 0 !important;
}

.tiptap-content {
  width: 100%;
  min-height: 100%;
  padding: 10px 0;
  padding-right: 0;
  padding-left: 0;
  margin: 0;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  font-size: 16px;
  line-height: 1.7;
  background: transparent;
  color: var(--dark-color);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  box-sizing: border-box;
}

.tiptap-content:focus,
.tiptap-content:focus-within {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

.tiptap-content p {
  margin: 0 0 0.5em 0;
  border-bottom: none !important;
}

.tiptap-content p:first-child {
  margin-top: 0 !important;
}

.tiptap-content p:last-child {
  margin-bottom: 0 !important;
  border-bottom: none !important;
}

/* 去除所有可能的最后一行下划线 */
.tiptap-content > *:last-child {
  border-bottom: none !important;
  margin-bottom: 0 !important;
}

.tiptap-content > p:last-child {
  border-bottom: none !important;
  margin-bottom: 0 !important;
}

/* Tiptap 选中文本样式 - 使用柔和的紫色调 */
.tiptap-content::selection {
  background-color: rgba(138, 43, 226, 0.2) !important; /* 柔和的紫色 */
  color: inherit;
}

.tiptap-content::-moz-selection {
  background-color: rgba(138, 43, 226, 0.2) !important; /* Firefox 支持 */
  color: inherit;
}

/* 深色模式下的选中文本样式 */
body.dark .tiptap-content {
  color: #ffffff;
}

body.dark .tiptap-content::selection {
  background-color: rgba(147, 112, 219, 0.3) !important; /* 深色模式下稍亮一点的紫色 */
  color: #ffffff;
}

body.dark .tiptap-content::-moz-selection {
  background-color: rgba(147, 112, 219, 0.3) !important;
  color: #ffffff;
}

/* Tiptap ProseMirror 选中文本样式 - 使用更强的选择器优先级 */
.tiptap-content .ProseMirror-selectednode {
  outline: none;
}

/* 覆盖所有可能的选中样式 - 使用最高优先级 */
.tiptap-editor *::selection,
.tiptap-editor::selection,
.tiptap-content *::selection,
.tiptap-content::selection,
.tiptap-content .ProseMirror *::selection,
.tiptap-content .ProseMirror::selection,
.tiptap-editor .ProseMirror *::selection,
.tiptap-editor .ProseMirror::selection {
  background-color: rgba(138, 43, 226, 0.2) !important;
  color: inherit !important;
  -webkit-text-fill-color: inherit !important;
}

.tiptap-editor *::-moz-selection,
.tiptap-editor::-moz-selection,
.tiptap-content *::-moz-selection,
.tiptap-content::-moz-selection,
.tiptap-content .ProseMirror *::-moz-selection,
.tiptap-content .ProseMirror::-moz-selection,
.tiptap-editor .ProseMirror *::-moz-selection,
.tiptap-editor .ProseMirror::-moz-selection {
  background-color: rgba(138, 43, 226, 0.2) !important;
  color: inherit !important;
}

body.dark .tiptap-editor *::selection,
body.dark .tiptap-editor::selection,
body.dark .tiptap-content *::selection,
body.dark .tiptap-content::selection,
body.dark .tiptap-content .ProseMirror *::selection,
body.dark .tiptap-content .ProseMirror::selection,
body.dark .tiptap-editor .ProseMirror *::selection,
body.dark .tiptap-editor .ProseMirror::selection {
  background-color: rgba(147, 112, 219, 0.3) !important;
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
}

body.dark .tiptap-editor *::-moz-selection,
body.dark .tiptap-editor::-moz-selection,
body.dark .tiptap-content *::-moz-selection,
body.dark .tiptap-content::-moz-selection,
body.dark .tiptap-content .ProseMirror *::-moz-selection,
body.dark .tiptap-content .ProseMirror::-moz-selection,
body.dark .tiptap-editor .ProseMirror *::-moz-selection,
body.dark .tiptap-editor .ProseMirror::-moz-selection {
  background-color: rgba(147, 112, 219, 0.3) !important;
  color: #ffffff !important;
}

.tiptap-content h1,
.tiptap-content h2,
.tiptap-content h3,
.tiptap-content h4,
.tiptap-content h5,
.tiptap-content h6 {
  margin: 1em 0 0.5em 0;
  font-weight: 700;
  line-height: 1.2;
}

.tiptap-content h1 { font-size: 2em; }
.tiptap-content h2 { font-size: 1.5em; }
.tiptap-content h3 { font-size: 1.25em; }

/* 可折叠标题样式 */
.collapsible-heading {
  position: relative;
  cursor: pointer;
  user-select: none;
}

.collapsible-heading .heading-collapse-icon {
  display: inline-block;
  margin-right: 8px;
  width: 16px;
  text-align: center;
  font-size: 12px;
  color: var(--primary-color);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.collapsible-heading.collapsed .heading-collapse-icon {
  transform: rotate(-90deg);
}

.collapsible-heading.collapsed + * {
  display: none;
}

/* 标题折叠后隐藏后续内容直到下一个同级或更高级标题 */
.collapsible-heading.collapsed ~ * {
  display: none;
}

.collapsible-heading.collapsed ~ .collapsible-heading[data-level] {
  display: block;
}

/* 确保标题本身始终可见 */
.collapsible-heading {
  display: block !important;
}

/* 标题项样式 */
.dropdown-item.heading-item {
  padding: 6px 12px;
  gap: 8px;
  font-size: 14px;
}

.dropdown-item.heading-item.active {
  background: rgba(91, 107, 240, 0.1);
  color: var(--primary-color);
}

body.dark .dropdown-item.heading-item.active {
  background: rgba(91, 107, 240, 0.2);
}

.tiptap-content ul,
.tiptap-content ol {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.tiptap-content li {
  margin: 0.25em 0;
}

.tiptap-content code {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.tiptap-content pre {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0.5em 0;
}

.tiptap-content pre code {
  background: none;
  padding: 0;
}

.tiptap-content a {
  color: var(--primary-color);
  text-decoration: underline;
  cursor: pointer;
}

.tiptap-content a:hover {
  color: var(--secondary-color);
}

.tiptap-content img {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  margin: 0.5em 0;
}

.tiptap-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 0.5em 0;
}

.tiptap-content table td,
.tiptap-content table th {
  border: 1px solid var(--color-border);
  padding: 8px;
  text-align: left;
}

.tiptap-content table th {
  background-color: var(--color-bg-secondary);
  font-weight: 600;
}

.tiptap-content blockquote {
  border-left: 4px solid var(--primary-color);
  padding-left: 1em;
  margin: 0.5em 0;
  color: var(--color-text-secondary);
  font-style: italic;
}

.tiptap-content hr {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 1em 0;
}

body.dark .tiptap-content code {
  background-color: rgba(255, 255, 255, 0.1);
}

body.dark .tiptap-content pre {
  background-color: rgba(255, 255, 255, 0.05);
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
