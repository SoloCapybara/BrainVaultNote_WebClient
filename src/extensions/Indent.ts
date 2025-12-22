import { Extension } from '@tiptap/core'

export interface IndentOptions {
  types: string[]
  minLevel: number
  maxLevel: number
  defaultLevel: number
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    indent: {
      /**
       * Increase the indent level
       */
      increaseIndent: () => ReturnType
      /**
       * Decrease the indent level
       */
      decreaseIndent: () => ReturnType
      /**
       * Set the indent level
       */
      setIndent: (level: number) => ReturnType
    }
  }
}

export const Indent = Extension.create<IndentOptions>({
  name: 'indent',

  addOptions() {
    return {
      types: ['paragraph', 'heading'],
      minLevel: 0,
      maxLevel: 9,
      defaultLevel: 0,
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textIndentOnly: {
            default: false,
            parseHTML: element => {
              // 检查是否有data-text-indent-only标记
              return element.getAttribute('data-text-indent-only') === 'true'
            },
            renderHTML: attributes => {
              if (attributes.textIndentOnly === true) {
                return { 'data-text-indent-only': 'true' }
              }
              return {}
            },
          },
          indent: {
            default: this.options.defaultLevel,
            parseHTML: element => {
              const indent = element.getAttribute('data-indent')
              if (indent) {
                const level = parseInt(indent, 10)
                if (!isNaN(level)) {
                  return Math.max(this.options.minLevel, Math.min(this.options.maxLevel, level))
                }
              }
              // 尝试从style中解析缩进
              const style = element.getAttribute('style') || ''

              // 检查是否有text-indent（首行缩进）
              const textIndentMatch = style.match(/text-indent:\s*([^;]+)/)
              const hasTextIndent = textIndentMatch && textIndentMatch[1]

              // 检查是否有padding-left（整体缩进）
              const paddingMatch = style.match(/padding-left:\s*([^;]+)/)
              const hasPaddingLeft = paddingMatch && paddingMatch[1]

              if (hasTextIndent && textIndentMatch?.[1]) {
                const textIndent = textIndentMatch[1].trim()
                const emMatch = textIndent.match(/([\d.]+)em/)
                if (emMatch && emMatch[1]) {
                  const emValue = parseFloat(emMatch[1])
                  if (!isNaN(emValue) && emValue >= 2) {
                    // 如果有text-indent且>=2em，说明至少有1级缩进
                    if (hasPaddingLeft && paddingMatch?.[1]) {
                      const padding = paddingMatch[1].trim()
                      const paddingEmMatch = padding.match(/([\d.]+)em/)
                      if (paddingEmMatch && paddingEmMatch[1]) {
                        const paddingValue = parseFloat(paddingEmMatch[1])
                        if (!isNaN(paddingValue)) {
                          // 有padding-left，说明是整体缩进，级别 = 1 + paddingValue/2
                          const level = 1 + Math.round(paddingValue / 2)
                          return Math.max(this.options.minLevel, Math.min(this.options.maxLevel, level))
                        }
                      }
                    }
                    // 只有text-indent，说明是1级缩进
                    return 1
                  }
                }
              }

              // 如果只有padding-left（没有text-indent），说明是textIndentOnly=true的状态
              if (hasPaddingLeft && !hasTextIndent && paddingMatch?.[1]) {
                const padding = paddingMatch[1].trim()
                const emMatch = padding.match(/([\d.]+)em/)
                if (emMatch && emMatch[1]) {
                  const emValue = parseFloat(emMatch[1])
                  if (!isNaN(emValue)) {
                    // 计算缩进级别：padding-left = (level - 1) * 2em
                    // 所以 level = paddingValue / 2 + 1
                    const level = Math.round(emValue / 2) + 1
                    return Math.max(this.options.minLevel, Math.min(this.options.maxLevel, level))
                  }
                }
              }

              // 向后兼容：只有padding-left（旧格式）
              if (hasPaddingLeft && paddingMatch?.[1]) {
                const padding = paddingMatch[1].trim()
                const emMatch = padding.match(/([\d.]+)em/)
                if (emMatch && emMatch[1]) {
                  const emValue = parseFloat(emMatch[1])
                  if (!isNaN(emValue)) {
                    // 假设每级缩进是2em，计算缩进级别
                    const level = Math.round(emValue / 2)
                    return Math.max(this.options.minLevel, Math.min(this.options.maxLevel, level))
                  }
                }
              }
              return this.options.defaultLevel
            },
            renderHTML: attributes => {
              if (!attributes.indent || attributes.indent === 0) {
                return {}
              }

              const level = Math.max(this.options.minLevel, Math.min(this.options.maxLevel, attributes.indent))

              // 检查是否有textIndentOnly标记（用于表示只有首行缩进，没有整体缩进）
              const textIndentOnly = attributes.textIndentOnly === true

              // 第一级缩进使用首行缩进（text-indent），后续级别使用整体缩进（padding-left）
              if (level === 1) {
                // 首行缩进：只有第一行有缩进
                const textIndent = '2em'
                return {
                  'data-indent': level.toString(),
                  style: `text-indent: ${textIndent};`,
                }
              } else {
                // 整体缩进：整个段落都有缩进
                // 第2级开始，每级2em，但第1级已经用了2em首行缩进，所以从第2级开始计算
                const paddingLeft = `${(level - 1) * 2}em`
                // 如果有textIndentOnly标记，表示已经删除了首行缩进，只显示整体缩进（padding-left），不显示首行缩进（text-indent）
                // 但整体缩进应该包含首行，所以当删除整体缩进时，应该直接变成level-1（只有首行缩进）
                if (textIndentOnly) {
                  // 只有整体缩进（不包含首行），显示padding-left
                  return {
                    'data-indent': level.toString(),
                    'data-text-indent-only': 'true',
                    style: `padding-left: ${paddingLeft};`,
                  }
                } else {
                  // 有首行+整体缩进，显示text-indent和padding-left
                  return {
                    'data-indent': level.toString(),
                    style: `text-indent: 2em; padding-left: ${paddingLeft};`,
                  }
                }
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      increaseIndent: () => ({ chain, state, commands }) => {
        const { selection } = state
        const { $from } = selection

        // 找到块级节点（paragraph或heading）
        // 从最深的块级节点开始查找
        let depth = $from.depth
        let node = $from.node(depth)
        let nodeType = ''

        // 向上查找，直到找到paragraph或heading
        while (depth >= 0) {
          node = $from.node(depth)

          // 如果找到了paragraph或heading，使用它
          if (node && this.options.types.includes(node.type.name)) {
            nodeType = node.type.name
            break
          }

          // 如果遇到doc节点，说明没有找到合适的块级节点
          if (node && node.type.name === 'doc') {
            return false
          }

          depth--
          if (depth < 0) break
        }

        // 检查节点类型，确保是paragraph或heading
        if (!node || !nodeType || !this.options.types.includes(nodeType)) {
          return false
        }

        const currentIndent = (node.attrs.indent !== undefined ? node.attrs.indent : this.options.defaultLevel) as number
        const textIndentOnly = node.attrs.textIndentOnly === true
        const newIndent = Math.min(this.options.maxLevel, currentIndent + 1)

        // 如果缩进没有变化，不需要更新
        if (currentIndent === newIndent && !textIndentOnly) {
          return true
        }

        // 如果当前是 Level 1，增加到 Level 2 时，应该同时有首行缩进和整体缩进
        if (currentIndent === 1 && newIndent === 2) {
          return chain()
            .updateAttributes(nodeType, { indent: newIndent, textIndentOnly: false })
            .run()
        }

        // 如果当前有 textIndentOnly=true，增加缩进时应该变成有整体缩进
        if (textIndentOnly && currentIndent >= 2) {
          return chain()
            .updateAttributes(nodeType, { indent: currentIndent, textIndentOnly: false })
            .run()
        }

        // 使用updateAttributes命令更新节点属性
        return chain()
          .updateAttributes(nodeType, { indent: newIndent, textIndentOnly: false })
          .run()
      },
      decreaseIndent: () => ({ chain, state, commands }) => {
        const { selection } = state
        const { $from } = selection

        // 找到块级节点（paragraph或heading）
        // 从最深的块级节点开始查找
        let depth = $from.depth
        let node = $from.node(depth)
        let nodeType = ''

        // 向上查找，直到找到paragraph或heading
        while (depth >= 0) {
          node = $from.node(depth)

          // 如果找到了paragraph或heading，使用它
          if (node && this.options.types.includes(node.type.name)) {
            nodeType = node.type.name
            break
          }

          // 如果遇到doc节点，说明没有找到合适的块级节点
          if (node && node.type.name === 'doc') {
            return false
          }

          depth--
          if (depth < 0) break
        }

        // 检查节点类型，确保是paragraph或heading
        if (!node || !nodeType || !this.options.types.includes(nodeType)) {
          return false
        }

        const currentIndent = (node.attrs.indent !== undefined ? node.attrs.indent : this.options.defaultLevel) as number
        const textIndentOnly = node.attrs.textIndentOnly === true

        // 删除缩进的逻辑：
        // 1. 如果有首行缩进（!textIndentOnly），先删除首行缩进
        // 2. 如果没有首行缩进（textIndentOnly=true），把首行当作整体的一部分，一起减少一个缩进级别
        if (currentIndent > 1) {
          if (!textIndentOnly) {
            // 当前有首行+整体缩进，先删除首行缩进，保留整体缩进（但不包含首行）
            // 设置textIndentOnly=true，表示只有整体缩进，没有首行缩进
            return chain()
              .updateAttributes(nodeType, { indent: currentIndent, textIndentOnly: true })
              .run()
          } else {
            // 当前只有整体缩进（textIndentOnly=true，不包含首行）
            // 把首行当作整体的一部分，一起减少一个缩进级别
            // 关键：保持 textIndentOnly=true，直到缩进级别变成 1
            const newIndent = Math.max(this.options.minLevel, currentIndent - 1)
            if (newIndent > 1) {
              // Level > 1：减少缩进级别，但保持 textIndentOnly=true（不恢复首行缩进）
              return chain()
                .updateAttributes(nodeType, { indent: newIndent, textIndentOnly: true })
                .run()
            } else if (newIndent === 1) {
              // 当从 Level 2（只有整体缩进）删除到 Level 1 时
              // 因为整体缩进应该包含首行，所以删除整体缩进时，应该直接变成 Level 0（无缩进）
              // 而不是先变成 Level 1（只有首行缩进），避免多删一次
              return chain()
                .updateAttributes(nodeType, { indent: 0, textIndentOnly: false })
                .run()
            } else {
              // 如果减少后是 level 0，直接变成无缩进
              return chain()
                .updateAttributes(nodeType, { indent: 0, textIndentOnly: false })
                .run()
            }
          }
        } else if (currentIndent === 1) {
          // 只有首行缩进（level 1），删除首行缩进，变成level 0
          return chain()
            .updateAttributes(nodeType, { indent: 0, textIndentOnly: false })
            .run()
        }

        // 如果缩进已经是0，不需要更新
        return true
      },
      setIndent: (level: number) => ({ chain, state, commands }) => {
        const indentLevel = Math.max(this.options.minLevel, Math.min(this.options.maxLevel, level))
        const { selection } = state
        const { $from } = selection

        // 找到块级节点（paragraph或heading）
        // 从最深的块级节点开始查找
        let depth = $from.depth
        let node = $from.node(depth)
        let nodeType = ''

        // 向上查找，直到找到paragraph或heading
        while (depth >= 0) {
          node = $from.node(depth)

          // 如果找到了paragraph或heading，使用它
          if (node && this.options.types.includes(node.type.name)) {
            nodeType = node.type.name
            break
          }

          // 如果遇到doc节点，说明没有找到合适的块级节点
          if (node && node.type.name === 'doc') {
            return false
          }

          depth--
          if (depth < 0) break
        }

        // 检查节点类型，确保是paragraph或heading
        if (!node || !nodeType || !this.options.types.includes(nodeType)) {
          return false
        }

        // 使用updateAttributes命令更新节点属性
        return chain()
          .updateAttributes(nodeType, { indent: indentLevel })
          .run()
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        // 如果是在列表项中，使用默认行为
        if (this.editor.isActive('listItem')) {
          return false
        }
        // 执行增加缩进命令
        const result = this.editor.commands.increaseIndent()
        return result
      },
      'Shift-Tab': () => {
        // 如果是在列表项中，使用默认行为
        if (this.editor.isActive('listItem')) {
          return false
        }
        // 执行减少缩进命令
        const result = this.editor.commands.decreaseIndent()
        return result
      },
    }
  },
})
