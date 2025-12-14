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
    // 使用 8ch 作为宽度，在等宽字体中应该等于 8 个字符宽度
    // 添加一个零宽空格字符，使节点可以被选中
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'tab',
        class: 'tab-node',
        style: 'display: inline-block; width: 8ch; min-width: 8ch; max-width: 8ch; font-family: inherit;',
      }),
      '\u200B', // 零宽空格，使节点可以被选中
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
