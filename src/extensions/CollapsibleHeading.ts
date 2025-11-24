import { Node, mergeAttributes } from '@tiptap/core'

export interface CollapsibleHeadingOptions {
  levels: number[]
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    collapsibleHeading: {
      /**
       * Set a heading
       */
      setHeading: (attributes: { level: number }) => ReturnType
      /**
       * Toggle a heading
       */
      toggleHeading: (attributes: { level: number }) => ReturnType
    }
  }
}

export const CollapsibleHeading = Node.create<CollapsibleHeadingOptions>({
  name: 'collapsibleHeading',

  addOptions() {
    return {
      levels: [1, 2, 3, 4, 5, 6],
      HTMLAttributes: {},
    }
  },

  content: 'inline*',

  group: 'block',

  defining: true,

  addAttributes() {
    return {
      level: {
        default: 1,
        rendered: false,
      },
      collapsed: {
        default: false,
        parseHTML: element => element.getAttribute('data-collapsed') === 'true',
        renderHTML: attributes => {
          if (!attributes.collapsed) {
            return {}
          }
          return {
            'data-collapsed': 'true',
          }
        },
      },
    }
  },

  parseHTML() {
    return this.options.levels.map((level: number) => ({
      tag: `h${level}`,
      attrs: { level },
    }))
  },

  renderHTML({ node, HTMLAttributes }) {
    const hasLevel = this.options.levels.includes(node.attrs.level)
    const level = hasLevel ? node.attrs.level : this.options.levels[0]

    const isCollapsed = node.attrs.collapsed === true
    const collapsedClass = isCollapsed ? 'collapsed' : ''

    return [
      `h${level}`,
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: `collapsible-heading ${collapsedClass}`,
        'data-level': level,
        'data-collapsed': isCollapsed ? 'true' : 'false',
      }),
      [
        'span',
        { class: 'heading-collapse-icon', contenteditable: 'false' },
        isCollapsed ? '▶' : '▼',
      ],
      0,
    ]
  },

  addCommands() {
    return {
      setHeading:
        (attributes) =>
        ({ commands }) => {
          if (!this.options.levels.includes(attributes.level)) {
            return false
          }

          return commands.setNode(this.name, attributes)
        },
      toggleHeading:
        (attributes) =>
        ({ commands }) => {
          if (!this.options.levels.includes(attributes.level)) {
            return false
          }

          return commands.toggleNode(this.name, 'paragraph', attributes)
        },
    }
  },

  addKeyboardShortcuts() {
    return this.options.levels.reduce(
      (items, level) => ({
        ...items,
        [`Mod-Alt-${level}`]: () => this.editor.commands.toggleHeading({ level }),
      }),
      {},
    )
  },
})

