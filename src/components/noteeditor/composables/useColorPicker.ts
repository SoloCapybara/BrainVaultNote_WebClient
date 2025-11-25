import { ref, computed } from 'vue'
import type { Editor } from '@tiptap/vue-3'

export function useColorPicker(editor: { value: Editor | null }, isTitleFocused: { value: boolean }) {
  // 初始化时根据模式设置默认颜色
  const getInitialTextColor = () => {
    return document.body.classList.contains('dark') ? '#ffffff' : '#000000'
  }
  
  const textColor = ref(getInitialTextColor())
  const highlightColor = ref('#ffff00')
  const textColorPickerRef = ref<any>(null)
  const highlightColorPickerRef = ref<any>(null)

  // 检测是否为深色模式
  const isDarkMode = computed(() => {
    return document.body.classList.contains('dark')
  })

  // 获取默认文本颜色（根据模式）
  const getDefaultTextColor = () => {
    return isDarkMode.value ? '#ffffff' : '#000000'
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

  // 设置文本颜色
  const setTextColor = (color: string) => {
    if (!editor.value || isTitleFocused.value) return
    
    textColor.value = color
    
    const { from, to } = editor.value.state.selection
    
    // 如果没有选中文本，也要应用颜色（用于后续输入）
    if (from === to) {
      // 检查当前光标位置是否有颜色标记
      const { $from } = editor.value.state.selection
      const marks = $from.marks()
      const hasColor = marks.some((mark: any) => 
        (mark.type.name === 'textStyle' && mark.attrs.color) || 
        (mark.type.name === 'gradientText' && mark.attrs.gradient)
      )
      
      // 如果当前没有颜色标记，立即应用选择的颜色
      if (!hasColor) {
        const isGradientColor = color.startsWith('linear-gradient') || color.startsWith('radial-gradient')
        if (isGradientColor) {
          editor.value.chain().focus().setGradientText(color).run()
        } else {
          editor.value.chain().focus().setColor(color).run()
        }
      }
      return
    }
    
    // 有选中文本，应用颜色
    const isGradientColor = color.startsWith('linear-gradient') || color.startsWith('radial-gradient')
    if (isGradientColor) {
      editor.value.chain().focus().setGradientText(color).run()
    } else {
      editor.value.chain().focus().setColor(color).run()
    }
  }

  // 设置背景颜色
  const setHighlightColor = (color: string) => {
    if (!editor.value || isTitleFocused.value) return
    
    highlightColor.value = color
    
    const { from, to } = editor.value.state.selection
    if (from === to) return
    
    editor.value.chain().focus().setHighlight({ color }).run()
  }

  // 应用文本颜色到选中文本
  const applyTextColor = () => {
    if (!editor.value || isTitleFocused.value) return
    
    const { from, to } = editor.value.state.selection
    if (from === to) return
    
    const isGradientColor = textColor.value.startsWith('linear-gradient') || textColor.value.startsWith('radial-gradient')
    if (isGradientColor) {
      editor.value.chain().focus().setGradientText(textColor.value).run()
    } else {
      editor.value.chain().focus().setColor(textColor.value).run()
    }
  }

  // 应用背景颜色到选中文本
  const applyHighlightColor = () => {
    if (!editor.value || isTitleFocused.value) return
    
    const { from, to } = editor.value.state.selection
    if (from === to) return
    
    editor.value.chain().focus().unsetHighlight().setHighlight({ color: highlightColor.value }).run()
  }

  // 清除文本颜色（恢复默认）
  const clearTextColor = () => {
    if (!editor.value || isTitleFocused.value) return
    
    const defaultColor = getDefaultTextColor()
    const { from, to } = editor.value.state.selection
    
    if (from === to) {
      textColor.value = defaultColor
      return
    }
    
    editor.value.chain()
      .focus()
      .unsetMark('textStyle')
      .unsetGradientText()
      .setColor(defaultColor)
      .run()
    
    textColor.value = defaultColor
  }

  // 清除背景颜色
  const clearHighlightColor = () => {
    if (!editor.value || isTitleFocused.value) return
    
    const { from, to } = editor.value.state.selection
    if (from === to) {
      highlightColor.value = 'transparent'
      return
    }
    
    editor.value.chain()
      .focus()
      .unsetHighlight()
      .run()
    
    highlightColor.value = 'transparent'
  }

  // 从选中文本更新文本颜色
  const updateTextColorFromSelection = (editorInstance: Editor) => {
    if (!editorInstance) return
    
    const { selection } = editorInstance.state
    const { from, to } = selection
    
    let checkFrom = from
    let checkTo = to
    
    if (from === to) {
      const { $from } = selection
      const node = $from.nodeAfter || $from.nodeBefore
      
      if (node && node.isText) {
        checkFrom = from
        checkTo = Math.min(from + 1, editorInstance.state.doc.content.size)
      } else {
        return
      }
    }
    
    const resolvedPos = editorInstance.state.doc.resolve(checkFrom)
    const marks = resolvedPos.marks()
    
    const gradientMark = marks.find((mark: any) => mark.type.name === 'gradientText')
    if (gradientMark && gradientMark.attrs.gradient) {
      textColor.value = gradientMark.attrs.gradient
      return
    }
    
    const colorMark = marks.find((mark: any) => mark.type.name === 'textStyle')
    if (colorMark && colorMark.attrs.color) {
      textColor.value = colorMark.attrs.color
      return
    }
    
    if (from !== to) {
      const gradientAttrs = editorInstance.getAttributes('gradientText')
      if (gradientAttrs && gradientAttrs.gradient) {
        textColor.value = gradientAttrs.gradient
        return
      }
      
      const colorAttrs = editorInstance.getAttributes('textStyle')
      if (colorAttrs && colorAttrs.color) {
        textColor.value = colorAttrs.color
        return
      }
    }
  }

  // 应用文本颜色到新输入的文字
  const applyTextColorToNewText = (editorInstance: Editor) => {
    if (!editorInstance) return
    
    const { selection } = editorInstance.state
    const { $from } = selection
    
    const marks = $from.marks()
    const hasColor = marks.some((mark: any) => 
      (mark.type.name === 'textStyle' && mark.attrs.color) || 
      (mark.type.name === 'gradientText' && mark.attrs.gradient)
    )
    
    const defaultColor = getDefaultTextColor()
    const isGradientColor = textColor.value.startsWith('linear-gradient') || textColor.value.startsWith('radial-gradient')
    
    if (!hasColor && textColor.value !== defaultColor) {
      if (isGradientColor) {
        editorInstance.chain().focus().setGradientText(textColor.value).run()
      } else {
        editorInstance.chain().focus().setColor(textColor.value).run()
      }
    }
  }

  return {
    textColor,
    highlightColor,
    textColorPickerRef,
    highlightColorPickerRef,
    isDarkMode,
    getDefaultTextColor,
    closeTextColorPicker,
    closeHighlightColorPicker,
    setTextColor,
    setHighlightColor,
    applyTextColor,
    applyHighlightColor,
    clearTextColor,
    clearHighlightColor,
    updateTextColorFromSelection,
    applyTextColorToNewText
  }
}

