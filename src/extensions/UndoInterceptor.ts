import { Extension } from '@tiptap/core'

// 简单哈希函数，用于快速比较内容
const simpleHash = (str: string): string => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 转换为 32 位整数
  }
  return hash.toString(36)
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    undoInterceptor: {
      /**
       * 设置初始内容，用于拦截撤销
       */
      setInitialContent: (content: string) => ReturnType
      /**
       * 安全撤销：带检查的撤销命令，防止撤销到初始加载状态之前
       */
      safeUndo: () => ReturnType
    }
  }
}

/**
 * 撤销拦截器扩展
 *
 * 功能：防止撤销操作清空初始加载的笔记内容
 *
 * 使用方法：
 * 1. 在加载笔记后调用 editor.commands.setInitialContent(content)
 * 2. 在工具栏和快捷键中使用 safeUndo 替代 undo
 * 3. 当撤销到初始状态时，会自动拦截并阻止继续撤销
 */
export const UndoInterceptor = Extension.create({
  name: 'undoInterceptor',

  addStorage() {
    return {
      initialContentLength: 0, // 记录初始内容长度（快速检查）
      initialContentHash: '', // 记录初始内容哈希（精确检查）
    }
  },

  addCommands() {
    return {
      // 设置初始内容
      setInitialContent: (content: string) => () => {
        this.storage.initialContentLength = content.length
        this.storage.initialContentHash = simpleHash(content)
        console.log('📝 设置初始内容哈希:', this.storage.initialContentHash, '长度:', content.length)
        return true
      },
      // 安全撤销：带检查的撤销命令
      safeUndo: () => ({ state, commands }: { state: any; commands: any }) => {
        const currentLength = state.doc.textContent.length

        console.log('🔄 安全撤销 - 当前长度:', currentLength, '初始长度:', this.storage.initialContentLength)

        // 快速检查：长度不同，肯定不是初始状态，允许撤销
        if (currentLength !== this.storage.initialContentLength) {
          console.log('✅ 允许撤销（长度不同）')
          return commands.undo()
        }

        // 长度相同，再做精确检查（哈希比较）
        const currentContent = state.doc.textContent
        const currentHash = simpleHash(currentContent)

        console.log('🔍 哈希对比 - 当前:', currentHash, '初始:', this.storage.initialContentHash)

        if (currentHash === this.storage.initialContentHash) {
          console.log('🛡️ 拦截撤销：已经回到初始状态')
          return true // 阻止撤销，返回 true 表示命令已处理
        }

        // 不是初始状态，允许撤销
        console.log('✅ 允许撤销（哈希不同）')
        return commands.undo()
      }
    } as any
  },

  addKeyboardShortcuts() {
    return {
      // 拦截 Ctrl+Z / Cmd+Z，调用 safeUndo
      'Mod-z': () => {
        return (this.editor.commands as any).safeUndo()
      },
    }
  }
})
