import { useEditor, type Editor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import { GradientText } from '../../../extensions/GradientText'
import { FontSize } from '../../../extensions/FontSize'
import { CollapsibleHeading } from '../../../extensions/CollapsibleHeading'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import type { Ref } from 'vue'
import type { Editor as TiptapEditor } from '@tiptap/vue-3'

export function useEditorSetup(
  noteContent: Ref<string>,
  isMarkdownMode: Ref<boolean>,
  markdownSource: Ref<string>,
  turndownService: any,
    callbacks: {
    onUpdate?: (editorInstance: TiptapEditor) => void
    onSelectionUpdate?: (editorInstance: TiptapEditor) => void
    handleKeyDown?: (view: any, event: KeyboardEvent) => boolean | void
    handleDOMEvents?: {
      mousedown?: (view: any, event: MouseEvent) => boolean | void
      beforeinput?: (view: any, event: InputEvent) => boolean | void
    }
  }
) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      GradientText,
      FontSize,
      CollapsibleHeading,
      HorizontalRule,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: '',
    onUpdate: ({ editor: editorInstance }) => {
      const html = editorInstance.getHTML()
      noteContent.value = html
      
      if (!isMarkdownMode.value) {
        markdownSource.value = turndownService.turndown(html)
      }
      
      if (callbacks.onUpdate) {
        callbacks.onUpdate(editorInstance as TiptapEditor)
      }
    },
    editorProps: {
      attributes: {
        class: 'tiptap-content',
        'data-placeholder': '开始输入笔记内容...',
        style: '--selection-background: rgba(138, 43, 226, 0.2); --selection-color: inherit;',
      },
      handleDOMEvents: callbacks.handleDOMEvents || {},
      handleKeyDown: callbacks.handleKeyDown || (() => false),
    },
    onSelectionUpdate: ({ editor: editorInstance }) => {
      if (callbacks.onSelectionUpdate) {
        callbacks.onSelectionUpdate(editorInstance as TiptapEditor)
      }
    },
  })

  return {
    editor: editor as any as TiptapEditor
  }
}

