import { TextSelection } from '@tiptap/pm/state'
import type { Editor } from '@tiptap/vue-3'

export function useKeyboard(editor: { value: Editor | null }, isTitleFocused: { value: boolean }) {
  // 创建 handleKeyDown 函数
  const createHandleKeyDown = () => {
    return (view: any, event: KeyboardEvent) => {
      // Backspace 键：如果前面是行首的 8 个连续空格（Tab缩进），一次性删除整个 Tab 缩进
      if (event.key === 'Backspace' && !event.shiftKey) {
        if (!editor.value) return false
        
        const { state } = view
        const { selection } = state
        const { $from } = selection
        
        if (selection.from !== selection.to) {
          return false
        }
        
        const lineStart = $from.start($from.depth)
        const currentPos = $from.pos
        const textFromLineStart = state.doc.textBetween(lineStart, currentPos)
        
        if (textFromLineStart === '        ') {
          event.preventDefault()
          const deleteFrom = currentPos - 8
          if (deleteFrom >= 0 && deleteFrom < currentPos) {
            const { tr } = state
            tr.delete(deleteFrom, currentPos)
            view.dispatch(tr)
            return true
          }
        }
        
        const spaceMatch = textFromLineStart.match(/^([ ]+)$/)
        if (spaceMatch && spaceMatch[1]) {
          const spaceCount = spaceMatch[1].length
          if (spaceCount >= 8 && spaceCount % 8 === 0) {
            event.preventDefault()
            const deleteFrom = currentPos - 8
            if (deleteFrom >= 0 && deleteFrom < currentPos) {
              const { tr } = state
              tr.delete(deleteFrom, currentPos)
              view.dispatch(tr)
              return true
            }
          }
        }
        
        return false
      }
      
      // Tab 键：插入空格（缩进）
      if (event.key === 'Tab' && !event.shiftKey) {
        event.preventDefault()
        
        if (!editor.value) return false
        
        if (editor.value.isActive('listItem')) {
          editor.value.chain().focus().sinkListItem('listItem').run()
          return true
        }
        
        const tabSpaces = '        ' // 8 个空格
        editor.value.chain().focus().insertContent(tabSpaces).run()
        return true
      }
      
      // Shift+Tab：删除前面的空格（减少缩进）
      if (event.key === 'Tab' && event.shiftKey) {
        event.preventDefault()
        
        if (!editor.value) return false
        
        if (editor.value.isActive('listItem')) {
          editor.value.chain().focus().liftListItem('listItem').run()
          return true
        }
        
        const { state } = view
        const { selection } = state
        const { $from } = selection
        
        const lineStart = $from.start($from.depth)
        const currentPos = $from.pos
        const textBefore = state.doc.textBetween(lineStart, currentPos)
        const spaceMatch = textBefore.match(/([ \t]+)$/)
        
        if (spaceMatch && spaceMatch[1] && spaceMatch[1].length > 0) {
          const spacesToRemove = Math.min(8, spaceMatch[1].length)
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
      
      // 左箭头键：如果光标在Tab缩进后面，跳过整个Tab缩进
      if (event.key === 'ArrowLeft' && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
        if (!editor.value) return false
        
        const { state } = view
        const { selection } = state
        const { $from } = selection
        
        if (selection.from !== selection.to) {
          return false
        }
        
        const currentPos = $from.pos
        
        // 获取当前行的开始位置
        let lineStart = currentPos
        for (let i = currentPos - 1; i >= 0; i--) {
          const char = state.doc.textBetween(i, i + 1)
          if (char === '\n') {
            lineStart = i + 1
            break
          }
          if (i === 0) {
            lineStart = 0
            break
          }
        }
        
        const textFromLineStart = state.doc.textBetween(lineStart, currentPos)
        const textAfterCursor = state.doc.textBetween(currentPos, Math.min(currentPos + 10, state.doc.content.size))
        const hasTextAfter = textAfterCursor && textAfterCursor.trim().length > 0
        
        const tabMatch = textFromLineStart.match(/^([ ]{8,})/)
        const currentLineHasTab = tabMatch && tabMatch[1] && tabMatch[1].length % 8 === 0
        const isAtLineStart = textFromLineStart === '' || (textFromLineStart.trim() === '' && !currentLineHasTab)
        
        // 情况1：当前行没有Tab缩进，且光标不在行首
        if (!currentLineHasTab && !isAtLineStart) {
          return false
        }
        
        // 情况2：当前行有Tab缩进，光标在Tab缩进后面的第一个字符前面，且后面有文字
        if (currentLineHasTab && tabMatch && tabMatch[1]) {
          const tabLength = tabMatch[1].length
          const tabEndPos = lineStart + tabLength
          if (currentPos === tabEndPos && hasTextAfter) {
            event.preventDefault()
            return true
          }
          if (currentPos > tabEndPos) {
            event.preventDefault()
            const { tr } = state
            const resolvedPos = state.doc.resolve(tabEndPos)
            tr.setSelection(TextSelection.near(resolvedPos))
            view.dispatch(tr)
            return true
          }
        }
        
        // 情况3：当前行有Tab缩进，光标在Tab缩进中
        const spaceMatch = textFromLineStart.match(/^([ ]+)$/)
        if (spaceMatch && spaceMatch[1]) {
          const spaceCount = spaceMatch[1].length
          if (spaceCount > 0) {
            if (lineStart > 0) {
              const prevLineEnd = lineStart - 1
              event.preventDefault()
              const { tr } = state
              const resolvedPos = state.doc.resolve(prevLineEnd)
              tr.setSelection(TextSelection.near(resolvedPos))
              view.dispatch(tr)
              return true
            } else {
              event.preventDefault()
              return true
            }
          }
        }
        
        // 情况4：当前行没有Tab缩进，且光标在行首
        if (!currentLineHasTab && isAtLineStart) {
          if (lineStart > 0) {
            let prevLineStart = lineStart - 1
            for (let i = lineStart - 2; i >= 0; i--) {
              const char = state.doc.textBetween(i, i + 1)
              if (char === '\n' || i === 0) {
                prevLineStart = char === '\n' ? i + 1 : i
                break
              }
            }
            
            const prevLineText = state.doc.textBetween(prevLineStart, lineStart - 1)
            const prevTabMatch = prevLineText.match(/^([ ]{8,})/)
            
            if (prevTabMatch && prevTabMatch[1] && prevTabMatch[1].length % 8 === 0) {
              const prevTabLength = prevTabMatch[1].length
              const prevTabEndPos = prevLineStart + prevTabLength
              event.preventDefault()
              const { tr } = state
              const resolvedPos = state.doc.resolve(prevTabEndPos)
              tr.setSelection(TextSelection.near(resolvedPos))
              view.dispatch(tr)
              return true
            } else {
              const prevLineEnd = lineStart - 1
              event.preventDefault()
              const { tr } = state
              const resolvedPos = state.doc.resolve(prevLineEnd)
              tr.setSelection(TextSelection.near(resolvedPos))
              view.dispatch(tr)
              return true
            }
          }
        }
        
        return false
      }
      
      return false
    }
  }

  // 创建 handleDOMEvents 对象
  const createHandleDOMEvents = () => {
    return {
      mousedown: (view: any, event: MouseEvent) => {
        // 防止鼠标选中Tab缩进区域
        if (!editor.value || isTitleFocused.value) return false
        
        const target = event.target as HTMLElement
        const editorElement = view.dom
        
        if (!editorElement.contains(target)) return false
        
        const coords = { left: event.clientX, top: event.clientY }
        const pos = view.posAtCoords(coords)
        
        if (pos) {
          const { state } = view
          const lineStart = state.doc.resolve(pos.pos).start(state.doc.resolve(pos.pos).depth)
          const textFromLineStart = state.doc.textBetween(lineStart, pos.pos)
          
          const spaceMatch = textFromLineStart.match(/^([ ]+)$/)
          if (spaceMatch && spaceMatch[1]) {
            const spaceCount = spaceMatch[1].length
            if (spaceCount >= 8 && spaceCount % 8 === 0) {
              event.preventDefault()
              const { tr } = state
              const targetPos = lineStart + spaceCount
              const resolvedPos = state.doc.resolve(targetPos)
              tr.setSelection(TextSelection.near(resolvedPos))
              view.dispatch(tr)
              return true
            }
          }
        }
        
        return false
      },
      beforeinput: (view: any, event: InputEvent) => {
        // 在输入之前检查并应用颜色
        if (!editor.value || isTitleFocused.value) return false
        
        const { state } = view
        const { selection } = state
        const { $from } = selection
        
        const marks = $from.marks()
        const hasColor = marks.some((mark: any) => 
          (mark.type.name === 'textStyle' && mark.attrs.color) || 
          (mark.type.name === 'gradientText' && mark.attrs.gradient)
        )
        
        // 这里需要从外部传入 textColor 和 getDefaultTextColor
        // 暂时返回 false，让调用者处理
        return false
      }
    }
  }

  return {
    createHandleKeyDown,
    createHandleDOMEvents
  }
}

