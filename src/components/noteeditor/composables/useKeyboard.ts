import { TextSelection } from '@tiptap/pm/state'
import type { Editor } from '@tiptap/vue-3'

export function useKeyboard(editor: { value: Editor | null }, isTitleFocused: { value: boolean }) {
  // 创建 handleKeyDown 函数
  const createHandleKeyDown = () => {
    return (view: any, event: KeyboardEvent) => {
      // Backspace 键：如果前面是Tab节点，一次性删除整个Tab节点；如果在行首且有缩进，减少缩进
      if (event.key === 'Backspace' && !event.shiftKey) {
        if (!editor.value) return false
        
        const { state } = view
        const { selection } = state
        const { $from } = selection
        
        if (selection.from !== selection.to) {
          return false
        }
        
        const currentPos = $from.pos
        
        // 检查光标是否在行首第一个字符位置
        // 找到当前块节点（paragraph或heading）
        let depth = $from.depth
        let node = $from.node(depth)
        let blockNode = node
        let blockDepth = depth
        
        // 向上查找块级节点
        while (depth >= 0 && (node.isInline || node.type.name === 'doc')) {
          depth--
          if (depth < 0) break
          node = $from.node(depth)
          if (node && (node.type.name === 'paragraph' || node.type.name === 'heading' || node.type.name === 'collapsibleHeading')) {
            blockNode = node
            blockDepth = depth
            break
          }
        }
        
        // 获取块节点的开始位置
        const blockStart = $from.start(blockDepth)
        
        // 检查光标是否在行首第一个字符位置
        const isAtFirstChar = (() => {
          if (currentPos === blockStart) {
            return true // 光标正好在块开始位置
          }
          
          // 检查从块开始到光标位置之间的内容
          const textBeforeCursor = state.doc.textBetween(blockStart, currentPos)
          
          // 如果只有空白字符，说明在行首
          if (textBeforeCursor.trim().length === 0) {
            // 进一步检查是否有非空白节点（如Tab节点）
            let pos = blockStart
            while (pos < currentPos) {
              const resolvedPos = state.doc.resolve(pos)
              const node = resolvedPos.nodeAfter
              if (!node) break
              
              // 如果是Tab节点，允许（Tab节点不算文本）
              if (node.type.name === 'tab') {
                pos += node.nodeSize
                continue
              }
              
              // 如果是文本节点且有非空白内容，说明不在行首
              if (node.isText && node.text.trim().length > 0) {
                return false
              }
              
              pos += node.nodeSize
              if (pos >= currentPos) break
            }
            return true // 只有空白或Tab节点，在行首
          }
          
          return false // 有文本内容，不在行首
        })()
        
        // 如果在行首且有缩进，减少缩进
        if (isAtFirstChar && blockNode && (blockNode.type.name === 'paragraph' || blockNode.type.name === 'heading' || blockNode.type.name === 'collapsibleHeading')) {
          const currentIndent = (blockNode.attrs.indent !== undefined ? blockNode.attrs.indent : 0) as number
          if (currentIndent > 0) {
            event.preventDefault()
            try {
              const result = editor.value.chain().focus().decreaseIndent().run()
              if (result) {
                return true
              }
            } catch (error) {
              console.error('decreaseIndent 错误:', error)
            }
          }
        }
        
        // 检查光标前面的节点是否是Tab节点
        if (currentPos > 0) {
          const nodeBefore = $from.nodeBefore
          
          // 如果前面的节点是Tab节点，删除它
          if (nodeBefore && nodeBefore.type.name === 'tab') {
            event.preventDefault()
            const { tr } = state
            const tabStartPos = currentPos - 1
            tr.delete(tabStartPos, currentPos)
            view.dispatch(tr)
            return true
          }
          
          // 检查前面的位置是否是Tab节点（通过解析节点）
          const resolvedPos = state.doc.resolve(currentPos - 1)
          const nodeAtPos = resolvedPos.parent.child(resolvedPos.index())
          
          if (nodeAtPos && nodeAtPos.type.name === 'tab') {
            event.preventDefault()
            const { tr } = state
            const tabStartPos = resolvedPos.start(resolvedPos.depth) + resolvedPos.parentOffset
            const tabEndPos = tabStartPos + nodeAtPos.nodeSize
            tr.delete(tabStartPos, tabEndPos)
            view.dispatch(tr)
            return true
          }
        }
        
        // 不再处理空格Tab区域，只处理真正的Tab节点
        return false
      }
      
      // Tab 键：只有在行首第一个字符位置时才增加缩进，其他位置插入Tab字符
      if (event.key === 'Tab' && !event.shiftKey) {
        if (!editor.value) return false
        
        // 如果是在列表项中，使用默认行为
        if (editor.value.isActive('listItem')) {
          return false
        }
        
        const { state } = view
        const { selection } = state
        const { $from } = selection
        
        // 找到当前块节点（paragraph或heading）
        let depth = $from.depth
        let node = $from.node(depth)
        let blockNode = node
        let blockDepth = depth
        
        // 向上查找块级节点
        while (depth >= 0 && (node.isInline || node.type.name === 'doc')) {
          depth--
          if (depth < 0) break
          node = $from.node(depth)
          if (node && (node.type.name === 'paragraph' || node.type.name === 'heading' || node.type.name === 'collapsibleHeading')) {
            blockNode = node
            blockDepth = depth
            break
          }
        }
        
        // 获取块节点的开始位置
        const blockStart = $from.start(blockDepth)
        const currentPos = $from.pos
        
        // 检查光标是否在行首第一个字符位置
        // 从块开始到光标位置之间应该没有可见文本（只有空白字符或Tab节点）
        const isAtFirstChar = (() => {
          if (currentPos === blockStart) {
            return true // 光标正好在块开始位置
          }
          
          // 检查从块开始到光标位置之间的内容
          const textBeforeCursor = state.doc.textBetween(blockStart, currentPos)
          
          // 如果只有空白字符，说明在行首
          if (textBeforeCursor.trim().length === 0) {
            // 进一步检查是否有非空白节点（如Tab节点）
            let pos = blockStart
            while (pos < currentPos) {
              const resolvedPos = state.doc.resolve(pos)
              const node = resolvedPos.nodeAfter
              if (!node) break
              
              // 如果是Tab节点，允许（Tab节点不算文本）
              if (node.type.name === 'tab') {
                pos += node.nodeSize
                continue
              }
              
              // 如果是文本节点且有非空白内容，说明不在行首
              if (node.isText && node.text.trim().length > 0) {
                return false
              }
              
              pos += node.nodeSize
              if (pos >= currentPos) break
            }
            return true // 只有空白或Tab节点，在行首
          }
          
          return false // 有文本内容，不在行首
        })()
        
        // #region agent log - Tab键处理
        const currentIndent = blockNode && (blockNode.attrs.indent !== undefined ? blockNode.attrs.indent : 0) as number
        const textBeforeCursor = state.doc.textBetween(blockStart, currentPos)
        fetch('http://127.0.0.1:7243/ingest/e6e3f5de-0c96-472f-80c0-183c21f85628',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKeyboard.ts:TabKey:entry',message:'Tab键按下',data:{isAtFirstChar,currentPos,blockStart,currentIndent,blockNodeType:blockNode?.type.name,textBeforeCursor},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        // 如果光标不在行首第一个字符位置，插入Tab字符
        if (!isAtFirstChar) {
          // #region agent log - 插入普通Tab
          fetch('http://127.0.0.1:7243/ingest/e6e3f5de-0c96-472f-80c0-183c21f85628',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKeyboard.ts:TabKey:insertTab',message:'✅ 插入普通Tab字符（不在行首）',data:{currentPos,blockStart,textBeforeCursor},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          
          // 检查是否有Tab扩展可用
          if (editor.value.extensionManager.extensions.find((ext: any) => ext.name === 'tab')) {
            event.preventDefault()
            editor.value.chain().focus().insertTab().run()
            return true
          } else {
            // 如果没有Tab扩展，插入8个空格
            event.preventDefault()
            editor.value.chain().focus().insertContent('        ').run()
            return true
          }
        }
        
        // 光标在行首第一个字符位置，执行缩进
        // #region agent log - 增加缩进
        fetch('http://127.0.0.1:7243/ingest/e6e3f5de-0c96-472f-80c0-183c21f85628',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKeyboard.ts:TabKey:increaseIndent',message:'✅ 增加缩进（在行首）',data:{currentPos,blockStart,currentIndent,newIndent:currentIndent + 1,blockNodeType:blockNode?.type.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        event.preventDefault()
        try {
          const result = editor.value.chain().focus().increaseIndent().run()
          if (!result) {
            console.warn('increaseIndent 返回 false')
            // #region agent log - 缩进失败
            fetch('http://127.0.0.1:7243/ingest/e6e3f5de-0c96-472f-80c0-183c21f85628',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKeyboard.ts:TabKey:increaseIndent:failed',message:'❌ 增加缩进失败（返回false）',data:{currentIndent},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
          }
          return result
        } catch (error) {
          console.error('increaseIndent 错误:', error)
          // #region agent log - 缩进错误
          fetch('http://127.0.0.1:7243/ingest/e6e3f5de-0c96-472f-80c0-183c21f85628',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKeyboard.ts:TabKey:increaseIndent:error',message:'❌ 增加缩进异常',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          return false
        }
      }
      
      // Shift+Tab：减少缩进
      if (event.key === 'Tab' && event.shiftKey) {
        if (!editor.value) return false
        
        // 如果是在列表项中，使用默认行为
        if (editor.value.isActive('listItem')) {
          return false
        }
        
        // 直接调用减少缩进命令
        event.preventDefault()
        const result = editor.value.chain().focus().decreaseIndent().run()
        return result
      }
      
      // 左箭头键：处理Tab节点的跳过，以及修复跨块节点时光标位置不正确的问题
      if (event.key === 'ArrowLeft' && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
        if (!editor.value) return false
        
        const { state } = view
        const { selection } = state
        const { $from } = selection
        
        if (selection.from !== selection.to) {
          return false
        }
        
        const currentPos = $from.pos
        
        // 检查光标前面的节点是否是Tab节点，如果是则跳过
        if (currentPos > 0) {
          const nodeBefore = $from.nodeBefore
          
          // 如果前面的节点是Tab节点，跳过它
          if (nodeBefore && nodeBefore.type.name === 'tab') {
            event.preventDefault()
            const { tr } = state
            const tabStartPos = currentPos - nodeBefore.nodeSize
            tr.setSelection(TextSelection.create(state.doc, tabStartPos, tabStartPos))
            view.dispatch(tr)
            return true
          }
        }
        
        // 检查光标是否在块节点开始位置
        // 找到当前块节点
        let depth = $from.depth
        let node = $from.node(depth)
        let blockNode = node
        let blockDepth = depth
        
        // 向上查找块级节点
        while (depth >= 0 && (node.isInline || node.type.name === 'doc')) {
          depth--
          if (depth < 0) break
          node = $from.node(depth)
          if (node && (node.type.name === 'paragraph' || node.type.name === 'heading' || node.type.name === 'collapsibleHeading')) {
            blockNode = node
            blockDepth = depth
            break
          }
        }
        
        if (blockNode && (blockNode.type.name === 'paragraph' || blockNode.type.name === 'heading' || blockNode.type.name === 'collapsibleHeading')) {
          const blockStart = $from.start(blockDepth)
          
          // 检查光标是否在块节点开始位置（考虑空白字符）
          const textBeforeCursor = state.doc.textBetween(blockStart, currentPos)
          const isAtBlockStart = currentPos === blockStart || textBeforeCursor.trim().length === 0
          
          if (isAtBlockStart && blockStart > 0) {
            // 光标在块节点开始位置，让 ProseMirror 先执行默认行为，然后修正
            // 使用 requestAnimationFrame 在下一个渲染帧检查并修正光标位置
            requestAnimationFrame(() => {
              if (!editor.value) return
              const newState = editor.value.state
              const newSelection = newState.selection
              const newFrom = newSelection.$from
              const newPos = newFrom.pos
              
              // 检查光标是否还在块节点开始位置（说明跳到了上一个块节点）
              let newDepth = newFrom.depth
              let newNode = newFrom.node(newDepth)
              let newBlockNode = newNode
              let newBlockDepth = newDepth
              
              while (newDepth >= 0 && (newNode.isInline || newNode.type.name === 'doc')) {
                newDepth--
                if (newDepth < 0) break
                newNode = newFrom.node(newDepth)
                if (newNode && (newNode.type.name === 'paragraph' || newNode.type.name === 'heading' || newNode.type.name === 'collapsibleHeading')) {
                  newBlockNode = newNode
                  newBlockDepth = newDepth
                  break
                }
              }
              
              if (newBlockNode && (newBlockNode.type.name === 'paragraph' || newBlockNode.type.name === 'heading' || newBlockNode.type.name === 'collapsibleHeading')) {
                const newBlockStart = newFrom.start(newBlockDepth)
                const newBlockEnd = newBlockStart + newBlockNode.content.size
                
                // 检查光标位置是否在块节点内，且不是最后一个字符
                if (newPos >= newBlockStart && newPos < newBlockEnd) {
                  // 检查下一个位置是否还有字符
                  const nextChar = newState.doc.textBetween(newPos, newPos + 1)
                  if (nextChar && nextChar.trim().length > 0) {
                    // 光标停在倒数第二个字符，移动到最后一个字符
                    const { tr } = newState
                    const targetPos = newPos + 1
                    if (targetPos <= newBlockEnd) {
                      const resolvedTargetPos = newState.doc.resolve(targetPos)
                      tr.setSelection(TextSelection.near(resolvedTargetPos))
                      editor.value.view.dispatch(tr)
                    }
                  }
                }
              }
            })
            
            // 让默认行为执行
            return false
          }
        }
        
        // 其他情况使用ProseMirror的默认行为
        return false
      }
      
      // 右箭头键：简化处理，只处理Tab节点的跳过
      if (event.key === 'ArrowRight' && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
        if (!editor.value) return false
        
        const { state } = view
        const { selection } = state
        const { $from } = selection
        
        if (selection.from !== selection.to) {
          return false
        }
        
        const currentPos = $from.pos
        
        // 检查光标后面的节点是否是Tab节点
        const nodeAfter = $from.nodeAfter
        
        // 如果后面的节点是Tab节点，跳过它
        if (nodeAfter && nodeAfter.type.name === 'tab') {
          event.preventDefault()
          const { tr } = state
          const tabEndPos = currentPos + nodeAfter.nodeSize
          tr.setSelection(TextSelection.create(state.doc, tabEndPos, tabEndPos))
          view.dispatch(tr)
          return true
        }
        
        return false
      }
      
      return false
    }
  }

  // 检查位置是否在Tab节点内（真正的Tab节点，不是空格Tab区域）
  const isPositionInTabNode = (view: any, pos: number) => {
    if (pos === null || pos === undefined) return false
    
    try {
      const { state } = view
      const resolvedPos = state.doc.resolve(pos)
      
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/e6e3f5de-0c96-472f-80c0-183c21f85628',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKeyboard.ts:isPositionInTabNode:entry',message:'Checking if position is in Tab node',data:{pos},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      // 检查当前位置的节点是否是Tab节点
      const nodeBefore = resolvedPos.nodeBefore
      if (nodeBefore && nodeBefore.type.name === 'tab') {
        const tabStartPos = pos - nodeBefore.nodeSize
        const tabEndPos = pos
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/e6e3f5de-0c96-472f-80c0-183c21f85628',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKeyboard.ts:isPositionInTabNode:nodeBefore',message:'Found Tab node before position',data:{pos,tabStartPos,tabEndPos,nodeSize:nodeBefore.nodeSize},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        if (pos >= tabStartPos && pos <= tabEndPos) {
          return true
        }
      }
      
      // 检查当前位置后面的节点是否是Tab节点
      const nodeAfter = resolvedPos.nodeAfter
      if (nodeAfter && nodeAfter.type.name === 'tab') {
        const tabStartPos = pos
        const tabEndPos = pos + nodeAfter.nodeSize
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/e6e3f5de-0c96-472f-80c0-183c21f85628',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKeyboard.ts:isPositionInTabNode:nodeAfter',message:'Found Tab node after position',data:{pos,tabStartPos,tabEndPos,nodeSize:nodeAfter.nodeSize},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        if (pos >= tabStartPos && pos < tabEndPos) {
          return true
        }
      }
      
      // 检查当前位置是否在Tab节点内部（通过遍历父节点）
      for (let depth = resolvedPos.depth; depth >= 0; depth--) {
        const node = resolvedPos.node(depth)
        if (node && node.type.name === 'tab') {
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/e6e3f5de-0c96-472f-80c0-183c21f85628',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKeyboard.ts:isPositionInTabNode:depth',message:'Found Tab node at depth',data:{pos,depth},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          return true
        }
      }
    } catch (e) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/e6e3f5de-0c96-472f-80c0-183c21f85628',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKeyboard.ts:isPositionInTabNode:error',message:'Error checking Tab node',data:{pos,error:String(e)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    }
    
    return false
  }
  
  // 检查位置是否在空格Tab区域内（向后兼容，但不再阻止选择）
  const isPositionInTabArea = (view: any, pos: number) => {
    // 不再检查空格Tab区域，因为现在使用真正的Tab节点
    return false
  }

  // 创建 handleDOMEvents 对象
  const createHandleDOMEvents = () => {
    return {
      mousedown: (view: any, event: MouseEvent) => {
        // #region agent log
        const target = event.target as HTMLElement
        const coords = { left: event.clientX, top: event.clientY }
        const pos = view.posAtCoords(coords)
        fetch('http://127.0.0.1:7243/ingest/e6e3f5de-0c96-472f-80c0-183c21f85628',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKeyboard.ts:createHandleDOMEvents:mousedown',message:'DOM mousedown event',data:{targetTag:target?.tagName,targetClass:target?.className,targetType:target?.getAttribute('data-type'),coords,pos:pos?.pos},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        if (pos) {
          const { state } = view
          const resolvedPos = state.doc.resolve(pos.pos)
          
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/e6e3f5de-0c96-472f-80c0-183c21f85628',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKeyboard.ts:createHandleDOMEvents:mousedown:resolved',message:'Resolved position in DOM mousedown',data:{pos:pos.pos,nodeBefore:resolvedPos.nodeBefore?.type.name,nodeAfter:resolvedPos.nodeAfter?.type.name,parentType:resolvedPos.parent?.type.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
        }
        
        // 不再阻止选择Tab节点，允许正常选择
        // Tab节点现在可以被选中和拖拽选择
        return false
      },
      beforeinput: (view: any, event: InputEvent) => {
        // 在输入之前检查并应用颜色
        if (!editor.value || isTitleFocused.value) return false
        
        // 如果用户真正输入了内容（不是删除、不是选择等），清除历史记录
        // 这可以防止初始内容加载和点击选择被记录为可撤销操作
        if (event.inputType === 'insertText' || event.inputType === 'insertCompositionText') {
          // 用户真正输入了文本，清除历史记录
          // 使用 setTimeout 确保在输入处理之前清除
          setTimeout(() => {
            if (editor.value && editor.value.commands) {
              ;(editor.value.commands as any).clearHistory?.()
            }
          }, 0)
        }
        
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

  // 设置选择事件监听器（在编辑器初始化后调用）
  const setupSelectionHandlers = (view: any) => {
    if (!view || !view.dom) return
    
    const editorElement = view.dom
    
    // 处理selectstart事件，允许选择Tab节点
    const handleSelectStart = (event: Event) => {
      // 不再阻止选择Tab节点，允许正常选择
      // Tab节点现在可以被选中
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/e6e3f5de-0c96-472f-80c0-183c21f85628',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKeyboard.ts:handleSelectStart',message:'Select start event',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    }
    
    // 处理双击事件，选中Tab节点
    let lastClickTime = 0
    let lastClickPos = -1
    const handleDoubleClick = (e: MouseEvent) => {
      if (!editor.value || isTitleFocused.value) return
      
      const coords = { left: e.clientX, top: e.clientY }
      const pos = view.posAtCoords(coords)
      
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/e6e3f5de-0c96-472f-80c0-183c21f85628',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKeyboard.ts:handleDoubleClick:entry',message:'Double click event',data:{coords,pos:pos?.pos},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      if (pos) {
        const { state } = view
        const resolvedPos = state.doc.resolve(pos.pos)
        
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/e6e3f5de-0c96-472f-80c0-183c21f85628',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKeyboard.ts:handleDoubleClick:resolved',message:'Resolved position',data:{pos:pos.pos,depth:resolvedPos.depth,nodeBefore:resolvedPos.nodeBefore?.type.name,nodeAfter:resolvedPos.nodeAfter?.type.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        // 查找Tab节点 - 不依赖 isPositionInTabNode，直接检查
        let tabNode = null
        let tabStartPos = -1
        let tabEndPos = -1
        
        // 检查前面的节点
        const nodeBefore = resolvedPos.nodeBefore
        if (nodeBefore && nodeBefore.type.name === 'tab') {
          tabNode = nodeBefore
          tabStartPos = pos.pos - nodeBefore.nodeSize
          tabEndPos = pos.pos
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/e6e3f5de-0c96-472f-80c0-183c21f85628',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKeyboard.ts:handleDoubleClick:nodeBefore',message:'Found Tab node before',data:{tabStartPos,tabEndPos},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
        }
        
        // 检查后面的节点
        if (!tabNode) {
          const nodeAfter = resolvedPos.nodeAfter
          if (nodeAfter && nodeAfter.type.name === 'tab') {
            tabNode = nodeAfter
            tabStartPos = pos.pos
            tabEndPos = pos.pos + nodeAfter.nodeSize
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/e6e3f5de-0c96-472f-80c0-183c21f85628',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKeyboard.ts:handleDoubleClick:nodeAfter',message:'Found Tab node after',data:{tabStartPos,tabEndPos},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
          }
        }
        
        // 检查当前位置的节点（通过遍历父节点）
        if (!tabNode) {
          for (let depth = resolvedPos.depth; depth >= 0; depth--) {
            const node = resolvedPos.node(depth)
            if (node && node.type.name === 'tab') {
              tabNode = node
              const nodeStart = resolvedPos.start(depth)
              tabStartPos = nodeStart
              tabEndPos = nodeStart + node.nodeSize
              // #region agent log
              fetch('http://127.0.0.1:7243/ingest/e6e3f5de-0c96-472f-80c0-183c21f85628',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKeyboard.ts:handleDoubleClick:depth',message:'Found Tab node at depth',data:{depth,tabStartPos,tabEndPos},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
              // #endregion
              break
            }
          }
        }
        
        // 也检查点击的目标元素是否是 Tab 节点
        if (!tabNode) {
          const target = e.target as HTMLElement
          if (target && target.classList.contains('tab-node')) {
            // 找到包含这个 Tab 节点的位置
            const parent = target.parentElement
            if (parent) {
              // 尝试通过 DOM 找到对应的 ProseMirror 位置
              const domPos = view.posAtDOM(parent, 0)
              if (domPos !== null && domPos !== undefined) {
                const domResolvedPos = state.doc.resolve(domPos)
                // 查找 Tab 节点
                for (let i = 0; i < domResolvedPos.parent.childCount; i++) {
                  const child = domResolvedPos.parent.child(i)
                  if (child.type.name === 'tab') {
                    tabNode = child
                    const nodeStart = domResolvedPos.start(domResolvedPos.depth) + domResolvedPos.parentOffset
                    let offset = 0
                    for (let j = 0; j < i; j++) {
                      offset += domResolvedPos.parent.child(j).nodeSize
                    }
                    tabStartPos = nodeStart + offset
                    tabEndPos = tabStartPos + child.nodeSize
                    // #region agent log
                    fetch('http://127.0.0.1:7243/ingest/e6e3f5de-0c96-472f-80c0-183c21f85628',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKeyboard.ts:handleDoubleClick:dom',message:'Found Tab node via DOM',data:{tabStartPos,tabEndPos},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                    // #endregion
                    break
                  }
                }
              }
            }
          }
        }
        
        if (tabNode && tabStartPos >= 0 && tabEndPos >= 0) {
          e.preventDefault()
          e.stopPropagation()
          
          const { tr } = state
          tr.setSelection(TextSelection.create(state.doc, tabStartPos, tabEndPos))
          view.dispatch(tr)
          
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/e6e3f5de-0c96-472f-80c0-183c21f85628',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKeyboard.ts:handleDoubleClick:selected',message:'Selected Tab node',data:{tabStartPos,tabEndPos},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
        } else {
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/e6e3f5de-0c96-472f-80c0-183c21f85628',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKeyboard.ts:handleDoubleClick:notFound',message:'Tab node not found',data:{pos:pos.pos,targetClass:(e.target as HTMLElement)?.className},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
        }
      }
    }
    
    // 处理mousemove事件，允许拖拽选择Tab节点
    let isDragging = false
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) { // 左键
        isDragging = true
        const currentTime = Date.now()
        const coords = { left: e.clientX, top: e.clientY }
        const pos = view.posAtCoords(coords)
        
        // #region agent log
        const target = e.target as HTMLElement
        fetch('http://127.0.0.1:7243/ingest/e6e3f5de-0c96-472f-80c0-183c21f85628',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKeyboard.ts:handleMouseDown:entry',message:'Mouse down event',data:{coords,pos:pos?.pos,targetTag:target?.tagName,targetClass:target?.className,targetType:target?.getAttribute('data-type')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        if (pos) {
          const { state } = view
          const resolvedPos = state.doc.resolve(pos.pos)
          
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/e6e3f5de-0c96-472f-80c0-183c21f85628',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKeyboard.ts:handleMouseDown:resolved',message:'Resolved position at mouse down',data:{pos:pos.pos,depth:resolvedPos.depth,nodeBefore:resolvedPos.nodeBefore?.type.name,nodeAfter:resolvedPos.nodeAfter?.type.name,parentType:resolvedPos.parent?.type.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
        }
        
        // 检测双击
        if (pos && currentTime - lastClickTime < 300 && Math.abs(pos.pos - lastClickPos) < 5) {
          // 这是双击，但我们在 dblclick 事件中处理
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/e6e3f5de-0c96-472f-80c0-183c21f85628',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKeyboard.ts:handleMouseDown:doubleClick',message:'Detected double click',data:{timeSinceLastClick:currentTime - lastClickTime},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
        } else {
          lastClickTime = currentTime
          lastClickPos = pos ? pos.pos : -1
        }
      }
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      // 不再阻止选择Tab节点，允许正常拖拽选择
      if (!isDragging) return
      
      // #region agent log
      const coords = { left: e.clientX, top: e.clientY }
      const pos = view.posAtCoords(coords)
      if (pos) {
        const { state } = view
        const resolvedPos = state.doc.resolve(pos.pos)
        const isInTab = isPositionInTabNode(view, pos.pos)
        fetch('http://127.0.0.1:7243/ingest/e6e3f5de-0c96-472f-80c0-183c21f85628',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKeyboard.ts:handleMouseMove',message:'Mouse move while dragging',data:{pos:pos.pos,isInTabNode:isInTab,nodeBefore:resolvedPos.nodeBefore?.type.name,nodeAfter:resolvedPos.nodeAfter?.type.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      }
      // #endregion
    }
    
    const handleMouseUp = () => {
      isDragging = false
    }
    
    // 添加事件监听器
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/e6e3f5de-0c96-472f-80c0-183c21f85628',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKeyboard.ts:setupSelectionHandlers:addListeners',message:'Adding event listeners',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    editorElement.addEventListener('selectstart', handleSelectStart)
    editorElement.addEventListener('dblclick', handleDoubleClick)
    editorElement.addEventListener('mousedown', handleMouseDown)
    editorElement.addEventListener('mousemove', handleMouseMove)
    editorElement.addEventListener('mouseup', handleMouseUp)
    
    // 直接在 Tab 节点上添加点击事件监听器（使用事件委托，捕获阶段）
    const handleTabNodeClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const tabNodeElement = target?.closest('.tab-node') || (target?.classList.contains('tab-node') ? target : null)
      
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/e6e3f5de-0c96-472f-80c0-183c21f85628',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKeyboard.ts:handleTabNodeClick:entry',message:'Click event captured',data:{targetTag:target?.tagName,targetClass:target?.className,targetType:target?.getAttribute('data-type'),hasTabNode:!!tabNodeElement,isDoubleClick:e.detail === 2,eventType:e.type},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      if (tabNodeElement) {
        if (e.detail === 2 || e.type === 'dblclick') {
          // 双击选中 Tab 节点
          e.preventDefault()
          e.stopPropagation()
          
          const coords = { left: e.clientX, top: e.clientY }
          const pos = view.posAtCoords(coords)
          
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/e6e3f5de-0c96-472f-80c0-183c21f85628',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKeyboard.ts:handleTabNodeClick:doubleClick',message:'Double click on Tab node',data:{coords,pos:pos?.pos},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          
          if (pos) {
            const { state } = view
            const resolvedPos = state.doc.resolve(pos.pos)
            
            // 查找 Tab 节点
            let tabStartPos = -1
            let tabEndPos = -1
            
            const nodeBefore = resolvedPos.nodeBefore
            if (nodeBefore && nodeBefore.type.name === 'tab') {
              tabStartPos = pos.pos - nodeBefore.nodeSize
              tabEndPos = pos.pos
            } else {
              const nodeAfter = resolvedPos.nodeAfter
              if (nodeAfter && nodeAfter.type.name === 'tab') {
                tabStartPos = pos.pos
                tabEndPos = pos.pos + nodeAfter.nodeSize
              }
            }
            
            // 如果还没找到，遍历父节点
            if (tabStartPos < 0) {
              for (let depth = resolvedPos.depth; depth >= 0; depth--) {
                const node = resolvedPos.node(depth)
                if (node && node.type.name === 'tab') {
                  const nodeStart = resolvedPos.start(depth)
                  tabStartPos = nodeStart
                  tabEndPos = nodeStart + node.nodeSize
                  break
                }
              }
            }
            
            if (tabStartPos >= 0 && tabEndPos >= 0) {
              const { tr } = state
              tr.setSelection(TextSelection.create(state.doc, tabStartPos, tabEndPos))
              view.dispatch(tr)
              
              // #region agent log
              fetch('http://127.0.0.1:7243/ingest/e6e3f5de-0c96-472f-80c0-183c21f85628',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKeyboard.ts:handleTabNodeClick:selected',message:'Selected Tab node via click handler',data:{tabStartPos,tabEndPos},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
              // #endregion
            }
          }
        }
      }
    }
    
    // 使用事件委托，监听所有点击事件（捕获阶段，确保能捕获到）
    editorElement.addEventListener('click', handleTabNodeClick, true)
    editorElement.addEventListener('dblclick', handleTabNodeClick, true)
    
    // 也监听 mousedown 事件，记录点击信息
    const handleTabNodeMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const tabNodeElement = target?.closest('.tab-node') || (target?.classList.contains('tab-node') ? target : null)
      if (tabNodeElement) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/e6e3f5de-0c96-472f-80c0-183c21f85628',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKeyboard.ts:handleTabNodeMouseDown',message:'Mouse down on Tab node',data:{targetTag:target.tagName,targetClass:target.className},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
      }
    }
    editorElement.addEventListener('mousedown', handleTabNodeMouseDown, true)
    
    // 返回清理函数
    return () => {
      editorElement.removeEventListener('selectstart', handleSelectStart)
      editorElement.removeEventListener('dblclick', handleDoubleClick)
      editorElement.removeEventListener('mousedown', handleMouseDown)
      editorElement.removeEventListener('mousemove', handleMouseMove)
      editorElement.removeEventListener('mouseup', handleMouseUp)
      editorElement.removeEventListener('click', handleTabNodeClick, true)
      editorElement.removeEventListener('dblclick', handleTabNodeClick, true)
      editorElement.removeEventListener('mousedown', handleTabNodeMouseDown, true)
    }
  }

  return {
    createHandleKeyDown,
    createHandleDOMEvents,
    setupSelectionHandlers
  }
}

