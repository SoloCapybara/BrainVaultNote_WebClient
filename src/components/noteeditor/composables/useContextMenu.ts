import { ref, computed, type Ref } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import type { ContextMenuItem } from '../../ui/ContextMenu.vue'

export function useContextMenu(
  editor: { value: Editor | null },
  isMarkdownMode: { value: boolean },
  markdownSource: { value: string }
) {
  const showContextMenu = ref(false)
  const contextMenuX = ref(0)
  const contextMenuY = ref(0)
  const hasSelection = ref(false)

  const handleContextMenu = (event: MouseEvent) => {
    event.preventDefault()

    const selection = window.getSelection()
    hasSelection.value = selection !== null && selection.toString().trim().length > 0

    contextMenuX.value = event.clientX
    contextMenuY.value = event.clientY
    showContextMenu.value = true
  }

  const contextMenuItems = computed<ContextMenuItem[]>(() => {
    const items: ContextMenuItem[] = []

    if (hasSelection.value) {
      // 有选中文本时的菜单
      items.push(
        {
          label: '复制',
          icon: 'fas fa-copy',
          shortcut: 'Ctrl+C',
          action: () => {
            document.execCommand('copy')
          }
        },
        {
          label: '剪切',
          icon: 'fas fa-cut',
          shortcut: 'Ctrl+X',
          action: () => {
            document.execCommand('cut')
          }
        },
        {
          label: '粘贴',
          icon: 'fas fa-paste',
          shortcut: 'Ctrl+V',
          action: async () => {
            try {
              const text = await navigator.clipboard.readText()
              if (editor.value && !isMarkdownMode.value) {
                editor.value.chain().focus().insertContent(text).run()
              } else if (isMarkdownMode.value) {
                const textarea = document.querySelector('.markdown-source') as HTMLTextAreaElement
                if (textarea) {
                  const start = textarea.selectionStart
                  const end = textarea.selectionEnd
                  markdownSource.value =
                    markdownSource.value.substring(0, start) +
                    text +
                    markdownSource.value.substring(end)
                }
              }
            } catch (err) {
              document.execCommand('paste')
            }
          }
        },
        { divider: true },
        {
          label: '加粗',
          icon: 'fas fa-bold',
          shortcut: 'Ctrl+B',
          disabled: isMarkdownMode.value as boolean,
          action: () => {
            if (editor.value && !isMarkdownMode.value) {
              editor.value.chain().focus().toggleBold().run()
            }
          }
        },
        {
          label: '斜体',
          icon: 'fas fa-italic',
          shortcut: 'Ctrl+I',
          disabled: isMarkdownMode.value as boolean,
          action: () => {
            if (editor.value && !isMarkdownMode.value) {
              editor.value.chain().focus().toggleItalic().run()
            }
          }
        },
        {
          label: '下划线',
          icon: 'fas fa-underline',
          shortcut: 'Ctrl+U',
          disabled: isMarkdownMode.value as boolean,
          action: () => {
            if (editor.value && !isMarkdownMode.value) {
              editor.value.chain().focus().toggleUnderline().run()
            }
          }
        }
      )
    } else {
      // 没有选中文本时的菜单
      items.push(
        {
          label: '粘贴',
          icon: 'fas fa-paste',
          shortcut: 'Ctrl+V',
          action: async () => {
            try {
              const text = await navigator.clipboard.readText()
              if (editor.value && !isMarkdownMode.value) {
                editor.value.chain().focus().insertContent(text).run()
              } else if (isMarkdownMode.value) {
                const textarea = document.querySelector('.markdown-source') as HTMLTextAreaElement
                if (textarea) {
                  const start = textarea.selectionStart
                  markdownSource.value =
                    markdownSource.value.substring(0, start) +
                    text +
                    markdownSource.value.substring(start)
                }
              }
            } catch (err) {
              document.execCommand('paste')
            }
          }
        },
        { divider: true },
        {
          label: '全选',
          icon: 'fas fa-check-square',
          shortcut: 'Ctrl+A',
          action: () => {
            if (editor.value && !isMarkdownMode.value) {
              editor.value.chain().focus().selectAll().run()
            } else if (isMarkdownMode.value) {
              const textarea = document.querySelector('.markdown-source') as HTMLTextAreaElement
              if (textarea) {
                textarea.select()
              }
            }
          }
        }
      )
    }

    return items
  })

  const handleContextMenuItemClick = (item: ContextMenuItem) => {
    // action 已经在 item.action 中执行了
  }

  return {
    showContextMenu,
    contextMenuX,
    contextMenuY,
    handleContextMenu,
    contextMenuItems,
    handleContextMenuItemClick
  }
}

