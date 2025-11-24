import { Mark, mergeAttributes } from '@tiptap/core'

export interface GradientTextOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    gradientText: {
      /**
       * Set a gradient text color
       */
      setGradientText: (gradient: string) => ReturnType
      /**
       * Unset the gradient text color
       */
      unsetGradientText: () => ReturnType
    }
  }
}

export const GradientText = Mark.create<GradientTextOptions>({
  name: 'gradientText',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      gradient: {
        default: null,
        parseHTML: element => {
          // 从 style 属性中解析渐变值
          const style = (element as HTMLElement).getAttribute('style') || ''
          const gradientMatch = style.match(/background-image:\s*([^;]+)/)
          if (gradientMatch && gradientMatch[1]) {
            return gradientMatch[1].trim()
          }
          // 或者从 data-gradient 属性读取
          return (element as HTMLElement).getAttribute('data-gradient')
        },
        renderHTML: attributes => {
          if (!attributes.gradient) {
            return {}
          }

          // 使用背景裁剪技巧实现渐变文字
          // 注意：color 设置为 transparent，然后用 background-image 和 background-clip 实现渐变效果
          // 不使用 display: inline-block，避免换行问题
          const gradientStyle = `background-image: ${attributes.gradient}; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent;`
          return {
            'data-gradient': attributes.gradient,
            style: gradientStyle,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-gradient]',
      },
      {
        tag: 'span',
        getAttrs: element => {
          // 检查是否有渐变样式
          const style = (element as HTMLElement).getAttribute('style') || ''
          if (style.includes('background-image') && 
              (style.includes('linear-gradient') || style.includes('radial-gradient')) &&
              style.includes('background-clip: text')) {
            return {}
          }
          return false
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setGradientText: (gradient: string) => ({ commands }) => {
        return commands.setMark(this.name, { gradient })
      },
      unsetGradientText: () => ({ commands }) => {
        return commands.unsetMark(this.name)
      },
    }
  },
})

