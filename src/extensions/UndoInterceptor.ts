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
      initialContentHash: '', // 记录初始文档结构的哈希（包含节点、属性、样式等）
    }
  },

  addCommands() {
    return {
      // 设置初始内容
      setInitialContent: (content: string) => ({ editor }: { editor: any }) => {
        // 使用完整的文档 JSON 来计算哈希，包含所有节点、属性和样式
        const docJSON = JSON.stringify(editor.state.doc.toJSON())
        this.storage.initialContentHash = simpleHash(docJSON)
        console.log('📝 设置初始内容哈希:', this.storage.initialContentHash, '文档长度:', docJSON.length)
        return true
      },
      // 安全撤销：带检查的撤销命令
      safeUndo: () => ({ state, commands }: { state: any; commands: any }) => {
        // 获取当前文档的完整 JSON 结构（包含所有节点、属性、样式）
        const currentDocJSON = JSON.stringify(state.doc.toJSON())
        const currentHash = simpleHash(currentDocJSON)

        console.log('🔄 安全撤销 - 文档哈希:', currentHash)
        console.log('🔍 哈希对比 - 当前:', currentHash, '初始:', this.storage.initialContentHash)

        // 精确检查：如果文档结构完全相同，说明回到初始状态
        if (currentHash === this.storage.initialContentHash) {
          console.log('🛡️ 拦截撤销：已经回到初始状态')
          return true // 阻止撤销，返回 true 表示命令已处理
        }

        // 不是初始状态，允许撤销
        console.log('✅ 允许撤销（文档结构不同）')
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
