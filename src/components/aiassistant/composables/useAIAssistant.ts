import { ref, computed, watch } from 'vue'

/**
 * AI助手组件的Composable
 * 管理标签建议、AI功能等
 * 折叠状态由父组件（MainLayout）管理
 */
export function useAIAssistant(initialCollapsed = false) {
  // 响应式状态
  const collapsed = ref(initialCollapsed)
  const windowWidth = ref(window.innerWidth)
  
  // 标签建议
  const suggestedTags = ref([
    '人工智能',
    '技术趋势',
    '机器学习',
    '深度学习',
    '自然语言处理',
    '计算机视觉',
    '强化学习',
    '神经网络',
    '数据科学',
    '算法优化',
    '模型训练',
    '特征工程',
    '数据预处理',
    '模型评估',
    '超参数调优',
    '集成学习'
  ])
  
  // 计算属性：判断是否是中屏模式
  const isMidScreen = computed(() => {
    return windowWidth.value > 768 && windowWidth.value <= 1024
  })
  
  // 计算属性：判断是否是窄屏模式
  const isNarrowScreen = computed(() => {
    return windowWidth.value <= 768
  })
  
  // 更新折叠状态（由父组件调用）
  const updateCollapsedState = (newState: boolean) => {
    collapsed.value = newState
  }
  
  // 添加标签
  const addTag = (tag: string) => {
    console.log('添加标签:', tag)
    // 这里可以触发添加标签的逻辑
    // 返回事件供父组件处理
    return tag
  }
  
  // 生成摘要
  const generateSummary = () => {
    console.log('生成摘要')
    // 返回事件供父组件处理
  }
  
  // 生成标签
  const generateTags = () => {
    console.log('生成标签')
    // 返回事件供父组件处理
  }
  
  // 查找相关内容
  const findRelated = () => {
    console.log('查找相关内容')
    // 返回事件供父组件处理
  }
  
  // 窗口大小变化处理
  const handleResize = () => {
    const width = window.innerWidth
    windowWidth.value = width
  }
  
  // 初始化
  const init = () => {
    window.addEventListener('resize', handleResize)
  }
  
  // 清理
  const cleanup = () => {
    window.removeEventListener('resize', handleResize)
  }
  
  return {
    // 状态
    collapsed,
    windowWidth,
    suggestedTags,
    
    // 计算属性
    isMidScreen,
    isNarrowScreen,
    
    // 方法
    updateCollapsedState,
    addTag,
    generateSummary,
    generateTags,
    findRelated,
    init,
    cleanup
  }
}