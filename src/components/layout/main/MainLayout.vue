<template>
  <div 
    class="container" 
    :class="{ 'sidebar-collapsed': sidebarCollapsed }"
    :style="isMobile ? {} : {
      marginLeft: sidebarCollapsed ? '90px' : '260px',
      width: sidebarCollapsed ? 'calc(100vw - 90px)' : 'calc(100vw - 260px)'
    }"
  >
    <!-- 侧边栏遮罩层 -->
    <div 
      class="sidebar-overlay" 
      :class="{ active: showMobileSidebar }"
      @click="closeMobileSidebar"
    ></div>
    
    <!-- 侧边栏 -->
    <Sidebar 
      :collapsed="sidebarCollapsed"
      :mobile-open="showMobileSidebar"
      :is-dark="isDark"
      @toggle-collapse="toggleSidebar"
      @select-note="selectNote"
      @search="handleSearch"
      @change-theme-color="handleChangeThemeColor"
      @toggle-theme="toggleGlobalTheme"
      @close-mobile-sidebar="closeMobileSidebar"
    />
    
    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部栏 -->
      <TopBar 
        :is-dark="isDark"
        @toggle-sidebar="toggleSidebar"
        @toggle-mobile-sidebar="toggleMobileSidebar"
        @toggle-theme="toggleTheme"
        @sync="handleSync"
        @notification="handleNotification"
        @upload="handleUpload"
      />
      
      <!-- 内容区域 -->
      <div class="content-area" :class="contentAreaClass">
        <!-- 笔记列表 -->
        <NotesList 
          :collapsed="notesListCollapsed"
          @select-note="selectNote"
          @new-note="(noteType?: 'richText' | 'markdown') => createNewNote(noteType)"
          @toggle-collapse="toggleNotesList"
        />
        
        <!-- 折叠/展开箭头按钮（只在宽屏和中屏显示） -->
        <button 
          class="notes-collapse-toggle-btn"
          :class="{ collapsed: notesListCollapsed }"
          @click="toggleNotesList"
          title="收起/展开笔记列表"
        >
          <i class="fas" :class="notesListCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'"></i>
        </button>
        
        <!-- 笔记编辑器 -->
        <NoteEditor 
          :note="activeNote"
          @save="handleSaveNote"
          @update="handleUpdateNote"
        />
        
        <!-- AI助手 -->
        <AIAssistant 
          :note="activeNote"
          :collapsed="aiAssistantCollapsed"
          @close="showAIAssistant = false"
          @generate-summary="handleGenerateSummary"
          @generate-tags="handleGenerateTags"
          @find-related="handleFindRelated"
          @toggle-collapse="toggleAIAssistant"
        />
        
        <!-- AI助手折叠/展开箭头按钮（只在宽屏和中屏显示） -->
        <button 
          class="ai-collapse-toggle-btn"
          :class="{ collapsed: aiAssistantCollapsed }"
          @click="toggleAIAssistant"
          title="收起/展开AI助手"
        >
          <i class="fas" :class="aiAssistantCollapsed ? 'fa-chevron-left' : 'fa-chevron-right'"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import Sidebar from '@/components/layout/common/sidebar/Sidebar.vue'
import TopBar from '@/components/layout/common/topbar/TopBar.vue'
import NotesList from '@/components/notelist/NotesList.vue'
import NoteEditor from '@/components/noteeditor/NoteEditor.vue'
import AIAssistant from '@/components/aiassistant/AIAssistant.vue'
import { useThemeFinal } from '@/composables/useThemeFinal'
import { useNotesStore } from '@/components/notelist/composables/useNotesStore'
import type { MockNote } from '@/components/notelist/mock/notes'
// 导入模块化样式
import './css/main-layout.css'
import './css/toggle-buttons.css'
import './css/responsive.css'

// 主题管理
const { isDark, toggleTheme: toggleThemeGlobal } = useThemeFinal()

// TopBar的主题切换 - 现在也调用全局主题切换
const toggleTheme = () => {
  // 直接调用全局主题切换，让Switch和模态框使用同一个逻辑
  toggleThemeGlobal()
}

// 模态框的主题切换 - 现在和Switch使用同一个逻辑
const toggleGlobalTheme = () => {
  // 直接调用全局主题切换，和Switch使用同一个逻辑
  toggleThemeGlobal()
}

// 不再需要同步编辑区域主题，因为现在Switch和模态框都使用全局主题

// 响应式状态
const sidebarCollapsed = ref(false) //侧边栏折叠状态
const showMobileSidebar = ref(false) //移动端侧边栏显示状态
const showAIAssistant = ref(false) //AI助手显示状态
const notesListCollapsed = ref(false) // 笔记列表折叠状态
const aiAssistantCollapsed = ref(false) // AI助手折叠状态
const windowWidth = ref(window.innerWidth) // 窗口宽度

const {
  notes,
  activeNote,
  selectNote: selectNoteInStore,
  createNote: createNoteInStore,
  updateNote: updateNoteInStore
} = useNotesStore()

//添加移动端检测
const isMobile = computed(()=>{
  if(typeof window === 'undefined') return false;
  return window.innerWidth < 768;
})

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

//保存侧边栏状态
const saveSidebarState = () => {
  localStorage.setItem('sidebarCollapsed', sidebarCollapsed.value.toString())
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

//保存笔记栏状态
const saveNotesListState = () => {
  localStorage.setItem('notesListCollapsed', notesListCollapsed.value.toString())
}

//保存AI助手栏状态
const saveAIAssistantState = () => {
  localStorage.setItem('aiAssistantCollapsed', aiAssistantCollapsed.value.toString())
}

// 监听折叠状态变化并保存
watch(notesListCollapsed, () => {
  saveNotesListState()
})

watch(aiAssistantCollapsed, () => {
  saveAIAssistantState()
})

// 方法
const toggleSidebar = () => {
  try {
    // 在移动端，如果侧边栏是打开的，点击收回按钮应该关闭侧边栏
    if (window.innerWidth <= 768 && showMobileSidebar.value) {
      showMobileSidebar.value = false
      // 关闭时保持展开状态（collapsed = false），这样箭头会正确显示
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
  // 在移动端打开侧边栏时，确保始终是展开状态（collapsed = false）
  if (window.innerWidth <= 768) {
    if (!showMobileSidebar.value) {
      // 打开侧边栏时，确保collapsed为false，箭头显示为左箭头
      sidebarCollapsed.value = false
      saveSidebarState()
    }
  }
  showMobileSidebar.value = !showMobileSidebar.value
}

const closeMobileSidebar = () => {
  showMobileSidebar.value = false
}

const selectNote = (note: MockNote | null) => {
  selectNoteInStore(note)
  // 移动端选择笔记后关闭侧边栏
  if (window.innerWidth <= 768) {
    showMobileSidebar.value = false
  }
}

// 切换笔记列表（中屏模式下：只有当两个都展开时，展开一个才收起另一个）
const toggleNotesList = () => {
  const isMidScreen = window.innerWidth > 768 && window.innerWidth <= 1024
  const wasCollapsed = notesListCollapsed.value
  notesListCollapsed.value = !notesListCollapsed.value
  
  // 中屏模式下：只有当两个都展开时，展开笔记列表才收起AI栏
  if (isMidScreen) {
    if (!wasCollapsed && !aiAssistantCollapsed.value) {
      // 两个都展开时，收起笔记列表，也收起AI栏（保持两栏显示）
      aiAssistantCollapsed.value = true
    } else if (wasCollapsed && !aiAssistantCollapsed.value) {
      // 只有AI栏展开时，展开笔记列表，收起AI栏（保持两栏显示）
      aiAssistantCollapsed.value = true
    }
    // 其他情况：可以两个都收起，或者只展开一个
  }
}

// 切换AI助手（中屏模式下：只有当两个都展开时，展开一个才收起另一个）
const toggleAIAssistant = () => {
  const isMidScreen = window.innerWidth > 768 && window.innerWidth <= 1024
  const wasCollapsed = aiAssistantCollapsed.value
  aiAssistantCollapsed.value = !aiAssistantCollapsed.value
  
  // 中屏模式下：只有当两个都展开时，展开AI栏才收起笔记列表
  if (isMidScreen) {
    if (!wasCollapsed && !notesListCollapsed.value) {
      // 两个都展开时，收起AI栏，也收起笔记列表（保持两栏显示）
      notesListCollapsed.value = true
    } else if (wasCollapsed && !notesListCollapsed.value) {
      // 只有笔记列表展开时，展开AI栏，收起笔记列表（保持两栏显示）
      notesListCollapsed.value = true
    }
    // 其他情况：可以两个都收起，或者只展开一个
  }
}

const createNewNote = (noteType?: 'richText' | 'markdown') => {
  const newNote = createNoteInStore(noteType)
  selectNoteInStore(newNote)
}

const handleSaveNote = (note: MockNote) => {
  updateNoteInStore(note)
}

const handleUpdateNote = (note: MockNote) => {
  updateNoteInStore(note)
}

const handleSearch = (query: string) => {
  console.log('搜索:', query)
  // 实现搜索逻辑
}

const handleChangeThemeColor = (color: string) => {
  // 更新CSS变量
  document.documentElement.style.setProperty('--primary-color', color)
  
  // 更新侧边栏渐变
  const sidebar = document.querySelector('.sidebar')
  if (sidebar) {
    const darkenColor = (hex: string, percent: number) => {
      let f = parseInt(hex.slice(1), 16),
        t = percent < 0 ? 0 : 255,
        p = percent < 0 ? percent * -1 : percent,
        R = f >> 16,
        G = (f >> 8) & 0x00ff,
        B = f & 0x0000ff
      return (
        '#' +
        (
          0x1000000 +
          (Math.round((t - R) * p) + R) * 0x10000 +
          (Math.round((t - G) * p) + G) * 0x100 +
          (Math.round((t - B) * p) + B)
        )
          .toString(16)
          .slice(1)
      )
    }
    
    // 根据当前主题模式决定侧边栏背景
    const isCurrentlyDark = document.body.classList.contains('dark')
    
    if (isCurrentlyDark) {
      // 深色模式 - 使用黑色渐变
      (sidebar as HTMLElement).style.background = 'linear-gradient(135deg, #000000, #1a1a1a)'
    } else {
      // 浅色模式 - 使用纯白色背景
      (sidebar as HTMLElement).style.background = '#ffffff'
    }
  }
}

const handleSync = () => {
  console.log('同步数据')
}

const handleNotification = () => {
  console.log('查看通知')
}

const handleUpload = () => {
  console.log('上传文件')
}

const handleGenerateSummary = () => {
  console.log('生成摘要')
}

const handleGenerateTags = () => {
  console.log('生成标签')
}

const handleFindRelated = () => {
  console.log('查找相关内容')
}

// 窗口大小变化处理
const handleResize = () => {
  const width = window.innerWidth
  windowWidth.value = width // 更新窗口宽度
  const isNarrowScreen = width <= 768
  const isMidScreen = width > 768 && width <= 1024
  
  // 在移动端时自动关闭侧边栏
  if (isNarrowScreen) {
    showMobileSidebar.value = false
    // 窄屏模式下，如果笔记列表被折叠，自动展开
    if (notesListCollapsed.value) {
      notesListCollapsed.value = false
    }
    // 窄屏模式下，如果AI助手被折叠，自动展开（虽然窄屏不显示AI助手，但保持状态一致）
    if (aiAssistantCollapsed.value) {
      aiAssistantCollapsed.value = false
    }
  }
  
  // 中屏模式下：如果两个都展开，默认显示笔记列表，收起AI栏（保持两栏显示）
  if (isMidScreen) {
    if (!notesListCollapsed.value && !aiAssistantCollapsed.value) {
      aiAssistantCollapsed.value = true
    }
    // 允许两个都收起，不强制展开
  }
}

// 初始化
onMounted(() => {
  window.addEventListener('resize', handleResize)

  // 加载侧边栏状态
  loadSidebarState()
  
  // 加载笔记列表和AI助手的折叠状态
  loadCollapsedStates()
  
  // 不再需要加载编辑区域主题，因为现在使用全局主题
  
  // 初始化时检查窗口大小，确保窄屏模式下笔记列表展开
  // 注意：这里只在窄屏模式下强制展开，宽屏和中屏模式会使用保存的状态
  if (window.innerWidth <= 768) {
    notesListCollapsed.value = false
    aiAssistantCollapsed.value = false
  }
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

// 清理
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>



