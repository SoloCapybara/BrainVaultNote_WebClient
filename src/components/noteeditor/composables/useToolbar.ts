import { ref, computed, watch } from 'vue'
import type { Editor } from '@tiptap/vue-3'

export function useToolbar(editor: { value: Editor | null }, isTitleFocused: { value: boolean }) {
  // 字体大小工具
  const fontSizeDropdownOpen = ref(false)
  const currentFontSize = ref<string>('16px')
  const defaultFontSize = ref<string>('16px')
  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px']

  // 标题工具
  const headingDropdownOpen = ref(false)
  const currentHeading = ref<string>('正文')
  const headings = [
    { label: '正文', value: 'paragraph' },
    { label: '标题 1', value: 1 },
    { label: '标题 2', value: 2 },
    { label: '标题 3', value: 3 },
    { label: '标题 4', value: 4 },
    { label: '标题 5', value: 5 },
    { label: '标题 6', value: 6 },
  ]

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

  // 下拉菜单互斥逻辑
  const handleFontSizeDropdownChange = (value: boolean) => {
    if (value) {
      headingDropdownOpen.value = false
      textAlignDropdownOpen.value = false
      moreToolsDropdownOpen.value = false
    }
  }

  const handleHeadingDropdownChange = (value: boolean) => {
    if (value) {
      fontSizeDropdownOpen.value = false
      textAlignDropdownOpen.value = false
      moreToolsDropdownOpen.value = false
    }
  }

  const handleTextAlignDropdownChange = (value: boolean) => {
    if (value) {
      fontSizeDropdownOpen.value = false
      headingDropdownOpen.value = false
      moreToolsDropdownOpen.value = false
    }
  }

  watch(moreToolsDropdownOpen, (value) => {
    if (value) {
      fontSizeDropdownOpen.value = false
      headingDropdownOpen.value = false
      textAlignDropdownOpen.value = false
    }
  })

  // 设置字体大小
  const setFontSize = (size: string) => {
    if (!editor.value || isTitleFocused.value) return
    fontSizeDropdownOpen.value = false
    
    const fontSize = size.replace('px', '')
    const { from, to } = editor.value.state.selection
    
    if (from === to) {
      defaultFontSize.value = size
      currentFontSize.value = size
    } else {
      editor.value.chain().focus().setFontSize(fontSize).run()
      currentFontSize.value = size
      defaultFontSize.value = size
    }
  }

  // 从选中文本更新字体大小显示
  const updateFontSizeFromSelection = (editorInstance: Editor) => {
    if (!editorInstance) return
    
    const { selection } = editorInstance.state
    const { from, to } = selection
    
    if (from === to) {
      currentFontSize.value = defaultFontSize.value
      return
    }
    
    const textStyle = editorInstance.getAttributes('textStyle')
    if (textStyle && textStyle.fontSize) {
      currentFontSize.value = `${textStyle.fontSize}px`
    } else {
      currentFontSize.value = defaultFontSize.value
    }
  }

  // 当输入新文字时，应用当前选择的字体大小
  const applyFontSizeToNewText = (editorInstance: Editor) => {
    if (!editorInstance || isTitleFocused.value) return
    
    const textStyle = editorInstance.getAttributes('textStyle')
    const hasFontSize = textStyle && textStyle.fontSize
    
    if (!hasFontSize && defaultFontSize.value !== '16px') {
      const fontSize = defaultFontSize.value.replace('px', '')
      editorInstance.chain().focus().setFontSize(fontSize).run()
    }
  }

  // 设置标题
  const setHeading = (value: string | number) => {
    if (!editor.value || isTitleFocused.value) return
    headingDropdownOpen.value = false
    fontSizeDropdownOpen.value = false
    
    if (value === 'paragraph') {
      editor.value.chain().focus().setParagraph().run()
      currentHeading.value = '正文'
    } else {
      const level = typeof value === 'number' ? value : parseInt(value as string)
      editor.value.chain().focus().setHeading({ level }).run()
      currentHeading.value = `标题 ${level}`
    }
    
    updateHeadingFromSelection(editor.value)
  }

  // 从选中文本更新标题显示
  const updateHeadingFromSelection = (editorInstance: Editor) => {
    if (!editorInstance) return
    
    const { selection } = editorInstance.state
    const { from } = selection
    const $from = editorInstance.state.doc.resolve(from)
    const node = $from.parent
    
    if (node.type.name === 'collapsibleHeading') {
      const level = node.attrs.level
      currentHeading.value = `标题 ${level}`
    } else {
      currentHeading.value = '正文'
    }
  }

  // 设置文本对齐
  const setTextAlign = (align: string) => {
    if (!editor.value || isTitleFocused.value) return
    textAlignDropdownOpen.value = false
    currentTextAlign.value = align
    editor.value.chain().focus().setTextAlign(align).run()
  }

  // 从选中文本更新文本对齐显示
  const updateTextAlignFromSelection = (editorInstance: Editor) => {
    if (!editorInstance) return
    const { state } = editorInstance
    const { selection } = state
    const { $from } = selection
    const node = $from.parent
    const align = node.attrs.textAlign || 'left'
    currentTextAlign.value = align
  }

  // 处理更多工具点击
  const handleMoreToolClick = (tool: 'image' | 'code' | 'table') => {
    moreToolsDropdownOpen.value = false
    if (tool === 'image') {
      const url = window.prompt('请输入图片地址:')
      if (url && editor.value) {
        editor.value.chain().focus().setImage({ src: url }).run()
      }
    } else if (tool === 'code') {
      editor.value?.chain().focus().toggleCodeBlock().run()
    } else if (tool === 'table') {
      editor.value?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
    }
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

  return {
    // 字体大小
    fontSizeDropdownOpen,
    currentFontSize,
    defaultFontSize,
    fontSizes,
    setFontSize,
    updateFontSizeFromSelection,
    applyFontSizeToNewText,
    handleFontSizeDropdownChange,
    
    // 标题
    headingDropdownOpen,
    currentHeading,
    headings,
    setHeading,
    updateHeadingFromSelection,
    handleHeadingDropdownChange,
    
    // 文本对齐
    textAlignDropdownOpen,
    currentTextAlign,
    textAlignOptions,
    currentTextAlignIcon,
    setTextAlign,
    updateTextAlignFromSelection,
    handleTextAlignDropdownChange,
    
    // 更多工具
    moreToolsDropdownOpen,
    handleMoreToolClick,
    
    // 其他工具
    setLink,
    insertHorizontalRule
  }
}

