import { ref, computed, watch } from 'vue'

/**
 * AI助手与MainLayout之间联动的Composable
 * 处理与笔记列表的状态同步、响应式布局等
 */
export function useAIAssistantLayout(
  notesListCollapsed: { value: boolean },
  sidebarCollapsed: { value: boolean },
  windowWidth: { value: number }
) {
  // AI助手折叠状态
  const aiAssistantCollapsed = ref(false)
  
  // 计算属性：判断是否是中屏模式
  const isMidScreen = computed(() => {
    return windowWidth.value > 768 && windowWidth.value <= 1024
  })
  
  // 计算属性：判断是否是窄屏模式
  const isNarrowScreen = computed(() => {
    return windowWidth.value <= 768
  })
  
  // 从localStorage加载折叠状态
  const loadCollapsedState = () => {
    const savedState = localStorage.getItem('aiAssistantCollapsed')
    if (savedState !== null) {
      aiAssistantCollapsed.value = savedState === 'true'
    }
  }
  
  // 保存折叠状态到localStorage
  const saveCollapsedState = () => {
    localStorage.setItem('aiAssistantCollapsed', aiAssistantCollapsed.value.toString())
  }
  
  // 监听折叠状态变化
  watch(aiAssistantCollapsed, () => {
    saveCollapsedState()
  })
  
  // 切换AI助手折叠状态（与笔记列表联动）
  const toggleAIAssistant = () => {
    console.log('toggleAIAssistant被调用，当前状态:', aiAssistantCollapsed.value)
    const isMidScreen = windowWidth.value > 768 && windowWidth.value <= 1024
    const wasCollapsed = aiAssistantCollapsed.value
    
    // 先切换AI助手状态
    aiAssistantCollapsed.value = !aiAssistantCollapsed.value
    
    if (isMidScreen) {
      // 中屏模式下，展开AI助手时需要折叠笔记列表（如果笔记列表未折叠）
      // 但只有当AI助手从折叠状态变为展开状态时才折叠笔记列表
      if (wasCollapsed && !notesListCollapsed.value) {
        notesListCollapsed.value = true
      }
    }
    
    return aiAssistantCollapsed.value
  }
  
  // 响应窗口大小变化
  const handleResize = () => {
    if (isNarrowScreen.value) {
      // 窄屏模式下，始终展开
      if (aiAssistantCollapsed.value) {
        aiAssistantCollapsed.value = false
      }
    } else if (isMidScreen.value) {
      // 中屏模式下，确保只有一个侧边栏展开
      if (!notesListCollapsed.value && !aiAssistantCollapsed.value) {
        aiAssistantCollapsed.value = true
      }
    }
  }
  
  // 监听笔记列表状态变化（与AI助手联动）
  const setupNotesListSync = () => {
    watch(notesListCollapsed, (newState, oldState) => {
      if (isMidScreen.value) {
        // 中屏模式下，如果笔记列表从折叠状态变为展开状态，且AI助手未折叠，则折叠AI助手
        if (!oldState && !aiAssistantCollapsed.value) {
          aiAssistantCollapsed.value = true
        }
      }
    })
  }
  
  // 监听侧边栏状态变化
  const setupSidebarSync = () => {
    watch(sidebarCollapsed, () => {
      // 侧边栏状态变化时，可能需要调整AI助手的位置
      // 这里主要依赖CSS处理，但可以添加额外的逻辑
    })
  }
  
  // 初始化
  const init = () => {
    loadCollapsedState()
    handleResize()
    setupSidebarSync()
  }
  
  // 计算AI助手的CSS类
  const computeCSSClass = () => {
    const classes = []
    if (aiAssistantCollapsed.value) {
      classes.push('collapsed')
    }
    if (sidebarCollapsed.value) {
      classes.push('sidebar-collapsed')
    }
    return classes.join(' ')
  }
  
  return {
    // 状态
    aiAssistantCollapsed,
    
    // 计算属性
    isMidScreen,
    isNarrowScreen,
    
    // 方法
    toggleAIAssistant,
    handleResize,
    setupNotesListSync,
    computeCSSClass,
    init
  }
}