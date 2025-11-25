import { ref, computed } from 'vue'
import type { Editor } from '@tiptap/vue-3'

export function useWordCount() {
  const contentWordCount = ref(0)
  const contentPunctuationCount = ref(0)
  const contentLineCount = ref(1)

  const getWordCount = (text: string) => {
    const cleanText = text.replace(/[^\u4e00-\u9fa5a-zA-Z]/g, '')
    return cleanText.length
  }

  const getPunctuationCount = (text: string) => {
    const punctuationText = text.replace(/[\u4e00-\u9fa5a-zA-Z]/g, '')
    return punctuationText.length
  }

  const calculateVisibleLineCount = (editorInstance?: Editor) => {
    if (!editorInstance) {
      contentLineCount.value = 1
      return
    }

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
  }

  const updateWordCount = (text: string, isMarkdown: boolean = false, editorInstance?: Editor) => {
    contentWordCount.value = getWordCount(text)
    contentPunctuationCount.value = getPunctuationCount(text)
    
    if (!isMarkdown && editorInstance) {
      calculateVisibleLineCount(editorInstance)
    } else {
      // Markdown 模式：根据换行符计算行数
      const lines = text.split('\n').filter(line => line.trim().length > 0)
      contentLineCount.value = lines.length || 1
    }
  }

  return {
    contentWordCount,
    contentPunctuationCount,
    contentLineCount,
    updateWordCount
  }
}

