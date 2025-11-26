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
    onCreate?:(editorInstance: TiptapEditor) => void
  }
) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        underline:false, //false,关闭内置Underline
        link:false, //false,关闭内置Link
        horizontalRule:false, //false,关闭内置HorizontalRule
      }),
      Underline, //下划线
      TextStyle, //文本样式
      Color, //颜色
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      GradientText, //渐变文本(扩展自定义)
      FontSize, //字体大小(扩展自定义)
      CollapsibleHeading, //可折叠标题(扩展自定义)
      HorizontalRule, //水平线
      Image.configure({
        inline: true, //是否内联
        allowBase64: true, //是否允许Base64编码
      }), //图片
      Link.configure({
        openOnClick: false, //是否点击打开
        HTMLAttributes: { //HTML属性
          target: '_blank', //目标
          rel: 'noopener noreferrer', //关系
        },
      }), //链接
      Table.configure({  //表格
        resizable: true, //是否可调整大小
      }),
      TableRow, //表格行
      TableHeader, //表格头
      TableCell, //表格单元格
    ],
    content: '', //内容
    onUpdate: ({ editor: editorInstance }) => {
      //获取HTML内容
      const html = editorInstance.getHTML()
      //设置笔记内容
      noteContent.value = html
      //如果笔记类型不为Markdown，则设置Markdown源
      if (!isMarkdownMode.value) {
        markdownSource.value = turndownService.turndown(html)
      }
      //如果回调函数存在，则调用回调函数
      if (callbacks.onUpdate) {
        callbacks.onUpdate(editorInstance as TiptapEditor)
      }
    },
    //创建编辑器
    onCreate:({editor:editorInstance}) => {
      //如果回调函数存在，则调用回调函数
      if (callbacks.onCreate) {
        callbacks.onCreate?.(editorInstance as TiptapEditor)
      }
    },
    //编辑器属性
    editorProps: {
      attributes: { //属性
        class: 'tiptap-content',
        'data-placeholder': '开始输入笔记内容...', //占位符
        style: '--selection-background: rgba(138, 43, 226, 0.2); --selection-color: inherit;', //样式
      },
      handleDOMEvents: callbacks.handleDOMEvents || {}, //DOM事件
      handleKeyDown: callbacks.handleKeyDown || (() => false), //键盘事件
    },
    //选择更新
    onSelectionUpdate: ({ editor: editorInstance }) => {
      //如果回调函数存在，则调用回调函数
      if (callbacks.onSelectionUpdate) {
        callbacks.onSelectionUpdate(editorInstance as TiptapEditor)
      }
    },
  })

  return {
    editor: editor as any as TiptapEditor
  }
}

