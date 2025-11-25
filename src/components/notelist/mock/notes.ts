export interface MockNote {
  id: number | string
  title: string
  content: string
  preview: string
  tags: string[]
  date: string
  wordCount: number
  isAI: boolean
  noteType?: 'richText' | 'markdown'
}

export const mockNotes: MockNote[] = [
  {
    id: 1,
    title: 'AI技术发展趋势分析',
    content: '近年来，人工智能技术取得了突破性进展。从GPT系列到ChatGPT，大语言模型的能力不断提升，不仅在自然语言处理领域表现出色，还在代码生成、创意写作等方面展现出惊人的能力。多模态学习也成为新的热点，能够同时处理文本、图像、音频等多种数据类型。强化学习在游戏、机器人控制等领域也取得了显著成果。未来AI技术将更加注重通用性、可解释性和安全性。',
    preview: '本文分析了当前AI技术的主要发展趋势，包括大语言模型、多模态学习、强化学习等领域的突破...',
    tags: ['AI', '技术', '智能摘要'],
    date: '2024-01-15',
    wordCount: 1248,
    isAI: true,
    noteType: 'richText'
  },
  {
    id: 2,
    title: '项目进度报告',
    content: '本周项目完成了第一阶段开发，主要实现了用户认证、笔记创建和基本编辑功能。用户界面设计采用了现代化的设计语言，支持深色和浅色主题切换。后端API已经搭建完成，数据库设计合理，支持笔记的增删改查操作。下一步计划添加AI助手功能，包括智能摘要、标签生成和内容推荐。',
    preview: '本周项目完成了第一阶段开发，主要实现了用户认证、笔记创建和基本编辑功能...',
    tags: ['工作', '项目'],
    date: '2024-01-14',
    wordCount: 856,
    isAI: false,
    noteType: 'richText'
  },
  {
    id: 3,
    title: '读书笔记 - 设计心理学',
    content: '唐纳德·诺曼在《设计心理学》中提出了以用户为中心的设计理念。他强调产品的可用性和用户体验应该放在首位，而不是单纯追求技术上的先进性。书中提到的"诺曼门"概念很好地说明了设计对用户行为的影响。好的设计应该是直观的，用户不需要学习就能使用。这对我理解产品设计有很大的启发。',
    preview: '唐纳德·诺曼在《设计心理学》中提出了以用户为中心的设计理念，强调产品的可用性和用户体验...',
    tags: ['阅读', '心理学', '关键点提取'],
    date: '2024-01-12',
    wordCount: 1532,
    isAI: true,
    noteType: 'richText'
  }
]

