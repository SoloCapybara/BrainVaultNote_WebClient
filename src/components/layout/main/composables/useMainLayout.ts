import { ref, computed, watch, nextTick } from 'vue'

/**
 * MainLayout 的主要逻辑 composable
 */
export function useMainLayout() {
  // 响应式状态
  const sidebarCollapsed = ref(false)
  const showMobileSidebar = ref(false)
  const notesListCollapsed = ref(false)
  const aiAssistantCollapsed = ref(false)
  const windowWidth = ref(window.innerWidth)
  const isMounted = ref(false)

  // 计算属性：判断是否是中屏模式
  const isMidScreen = computed(() => {
    return windowWidth.value > 768 && windowWidth.value <= 1024
  })

  // 计算属性：content-area 的 class
  const contentAreaClass = computed(() => {
    const classes: string[] = []
    if (isMidScreen.value) {
      classes.push('mid-screen')
    }
    if (sidebarCollapsed.value) {
      classes.push('sidebar-collapsed')
    }
    return classes.join(' ')
  })

  // 侧边栏状态管理
  const loadSidebarState = () => {
    const savedState = localStorage.getItem('sidebarCollapsed')
    if (savedState !== null) {
      sidebarCollapsed.value = savedState === 'true'
    }
  }

  const saveSidebarState = () => {
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed.value.toString())
  }

  const toggleSidebar = () => {
    try {
      // 在移动端，如果侧边栏是打开的，点击收回按钮应该关闭侧边栏
      if (window.innerWidth <= 768 && showMobileSidebar.value) {
        showMobileSidebar.value = false
        sidebarCollapsed.value = false
        saveSidebarState()
        return
      }
      // 桌面端正常切换collapsed状态
      sidebarCollapsed.value = !sidebarCollapsed.value
      saveSidebarState()
    } catch (error) {
      console.error('Error toggling sidebar:', error)
    }
  }

  const toggleMobileSidebar = () => {
    if (window.innerWidth <= 768) {
      if (!showMobileSidebar.value) {
        sidebarCollapsed.value = false
        saveSidebarState()
      }
    }
    showMobileSidebar.value = !showMobileSidebar.value
  }

  const closeMobileSidebar = () => {
    showMobileSidebar.value = false
  }

  // 笔记列表和AI助手折叠状态管理
  const loadCollapsedStates = () => {
    const savedNotesListState = localStorage.getItem('notesListCollapsed')
    if (savedNotesListState !== null) {
      notesListCollapsed.value = savedNotesListState === 'true'
    }
    
    const savedAIAssistantState = localStorage.getItem('aiAssistantCollapsed')
    if (savedAIAssistantState !== null) {
      aiAssistantCollapsed.value = savedAIAssistantState === 'true'
    }
  }

  const saveNotesListState = () => {
    localStorage.setItem('notesListCollapsed', notesListCollapsed.value.toString())
  }

  const saveAIAssistantState = () => {
    localStorage.setItem('aiAssistantCollapsed', aiAssistantCollapsed.value.toString())
  }

  // 仅保存状态的监听，避免在渲染周期内互相修改导致补丁异常
  watch(notesListCollapsed, () => {
    try {
      saveNotesListState()
    } catch (error) {
      console.error('Error saving notesListCollapsed:', error)
    }
  })

  watch(aiAssistantCollapsed, () => {
    try {
      saveAIAssistantState()
    } catch (error) {
      console.error('Error saving aiAssistantCollapsed:', error)
    }
  })

  // 切换笔记列表
  const toggleNotesList = async() => {
    try {
      // 确保组件已挂载
      if (!isMounted.value) {
        return
      }
      const nextCollapsed = !notesListCollapsed.value
      const isMidScreenWidth = windowWidth.value > 768 && windowWidth.value <= 1024
      if (!nextCollapsed && isMidScreenWidth) {
        // 中屏：展开笔记列表 -> 先折叠 AI，再在下一个更新周期展开笔记列表
        aiAssistantCollapsed.value = true
        await nextTick()

        if(!isMounted.value){
          return
        }
        try {
          notesListCollapsed.value = false
        } catch (error) {
          console.error('Error toggling notes list:', error)
        }
      } else {
        notesListCollapsed.value = nextCollapsed
      }
    } catch (error) {
      console.error('Error toggling notes list:', error)
    }
  }

  // 切换AI助手
  const toggleAIAssistant = async () => {
    try {
      // 确保组件已挂载
      if (!isMounted.value) {
        return
      }
      const nextCollapsed = !aiAssistantCollapsed.value
      const isMidScreenWidth = windowWidth.value > 768 && windowWidth.value <= 1024
      if (!nextCollapsed && isMidScreenWidth) {
        // 中屏：展开 AI 助手 -> 先折叠笔记列表，再在下一个更新周期展开 AI
        notesListCollapsed.value = true
        await nextTick()
        console.log(isMounted)
        if(!isMounted.value){
          return
        }
        try {
          aiAssistantCollapsed.value = false
        } catch (error) {
          console.error('Error toggling AI assistant:', error)
        }
      } else {
        aiAssistantCollapsed.value = nextCollapsed
      }
    } catch (error) {
      console.error('Error toggling AI assistant:', error)
    }
  }

  // 窗口大小变化处理
  const handleResize = () => {
    if (!isMounted) {
      return
    }
    
    const width = window.innerWidth
    windowWidth.value = width
    const isNarrowScreen = width <= 768
    const isMidScreen = width > 768 && width <= 1024
    
    if (isNarrowScreen) {
      showMobileSidebar.value = false
      // 窄屏模式下，确保笔记列表和AI助手都展开
      if (notesListCollapsed.value) {
        notesListCollapsed.value = false
      }
      if (aiAssistantCollapsed.value) {
        aiAssistantCollapsed.value = false
      }
    } else if (isMidScreen) {
      // 中屏模式下，确保笔记列表和AI助手只有一个展开
      if (!notesListCollapsed.value && !aiAssistantCollapsed.value) {
        // 如果两个都展开了，默认折叠AI助手
        aiAssistantCollapsed.value = true
      }
    }
  }

  // 初始化
  const init = () => {
    isMounted.value = true
    loadSidebarState()
    loadCollapsedStates()
    if (window.innerWidth <= 768) {
      notesListCollapsed.value = false
      aiAssistantCollapsed.value = false
    }
    window.addEventListener('resize', handleResize)
  }

  // 清理
  const cleanup = () => {
    isMounted.value = false
    window.removeEventListener('resize', handleResize)
  }

  return {
    sidebarCollapsed,
    showMobileSidebar,
    notesListCollapsed,
    aiAssistantCollapsed,
    windowWidth,
    isMidScreen,
    contentAreaClass,
    toggleSidebar,
    toggleMobileSidebar,
    closeMobileSidebar,
    toggleNotesList,
    toggleAIAssistant,
    init,
    cleanup
  }
}

