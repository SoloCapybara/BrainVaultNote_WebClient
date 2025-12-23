import { ref } from 'vue'
import TurndownService from 'turndown'
import { marked } from 'marked'
import type { Editor } from '@tiptap/vue-3'

export function useMarkdown() {
  const markdownSource = ref('')
  const markdownTextareaRef = ref<HTMLTextAreaElement | null>(null)

  // Turndown 实例（用于将 HTML 转换为 Markdown）
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '*',
    strongDelimiter: '**',
    linkStyle: 'inlined',
    linkReferenceStyle: 'full',
  })

  // 添加自定义规则
  turndownService.addRule('underline', {
    filter: 'u',
    replacement: function (content) {
      return '<u>' + content + '</u>'
    }
  })

  turndownService.addRule('strikethrough', {
    filter: ['del', 's'],
    replacement: function (content) {
      return '~~' + content + '~~'
    }
  })

  // 将 Markdown 转换为 HTML
  const convertMarkdownToHTML = (markdown: string): string => {
    try {
      return marked(markdown, {
        breaks: true,
        gfm: true,
      }) as string
    } catch (error) {
      console.error('Markdown 转换错误:', error)
      return markdown
    }
  }

  // 将 HTML 转换为 Markdown
  const convertHTMLToMarkdown = (html: string): string => {
    try {
      return turndownService.turndown(html)
    } catch (error) {
      console.error('HTML 转换错误:', error)
      return html
    }
  }

  // 同步 Markdown 到编辑器
  const syncMarkdownToEditor = (editor: Editor | null) => {
    if (!editor) return

    const html = convertMarkdownToHTML(markdownSource.value)
    editor.commands.setContent(html)
  }

  return {
    markdownSource,
    markdownTextareaRef,
    convertMarkdownToHTML,
    convertHTMLToMarkdown,
    syncMarkdownToEditor,
    turndownService
  }
}

