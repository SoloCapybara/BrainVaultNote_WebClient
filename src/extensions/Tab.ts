import { Node, mergeAttributes } from '@tiptap/core'

export interface TabOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tab: {
      /**
       * Insert a tab node
       */
      insertTab: () => ReturnType
    }
  }
}

export const Tab = Node.create<TabOptions>({
  name: 'tab',

  group: 'inline',

  inline: true,

  atom: false,

  selectable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      width: {
        default: 8,
        parseHTML: element => {
          const width = element.getAttribute('data-width')
          return width ? parseInt(width, 10) : 8
        },
        renderHTML: attributes => {
          if (!attributes.width) {
            return {}
          }
          return {
            'data-width': attributes.width.toString(),
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="tab"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    // 使用普通 inline 元素，避免 inline-block 导致的光标定位问题
    // 使用 8 个不间断空格来模拟 Tab 宽度
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'tab',
        class: 'tab-node',
        // 使用 inline 而不是 inline-block，确保文本流正常
        style: 'white-space: pre;',
      }),
      '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0', // 8 个不间断空格
    ]
  },

  addCommands() {
    return {
      insertTab: () => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { width: 8 },
        })
      },
    }
  },
})
