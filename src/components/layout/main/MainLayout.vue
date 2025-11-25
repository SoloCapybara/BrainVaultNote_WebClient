<template>
  <div 
    class="container" 
    :class="{ 'sidebar-collapsed': sidebarCollapsed }"
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
      @select-note="handleNoteSelected"
      @search="handleSearch"
      @change-theme-color="handleChangeThemeColor"
      @toggle-theme="toggleTheme"
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
      />
      
      <!-- 内容区域 -->
      <div class="content-area" :class="contentAreaClass">
        <!-- 笔记列表 -->
        <NotesList 
          :key="'notes-list'"
          v-show="!notesListCollapsed"
          :collapsed="notesListCollapsed"
          @select-note="handleNoteSelected"
          @toggle-collapse="toggleNotesList"
        />
        
        <!-- 折叠/展开箭头按钮（只在宽屏和中屏显示） -->
        <button 
          :key="'notes-toggle-btn'"
          class="notes-collapse-toggle-btn"
          :class="{ collapsed: notesListCollapsed }"
          @click="toggleNotesList"
          title="收起/展开笔记列表"
        >
          <i class="fas" :class="notesListCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'"></i>
        </button>
        
        <!-- 笔记编辑器 -->
        <NoteEditor 
          :key="'note-editor'"
          :note="activeNote"
          @save="updateNoteInStore"
          @update="updateNoteInStore"
        />
        
        <!-- AI助手 -->
        <AIAssistant 
          v-show="!aiAssistantCollapsed"
          :key="'ai-assistant'"
          ref="aiAssistantRef"
          :note="activeNote || null"
          :collapsed="aiAssistantCollapsed"
          @toggle-collapse="toggleAIAssistant"
          @generate-summary="handleAIGenerateSummary"
          @generate-tags="handleAIGenerateTags"
          @find-related="handleAIFindRelated"
          @add-tag="handleAIAddTag"
          @apply-suggestion="handleAIApplySuggestion"
        />
        
        <!-- AI助手折叠/展开箭头按钮（只在宽屏和中屏显示） -->
        <button 
          :key="'ai-toggle-btn'"
          ref="aiToggleBtnRef"
          class="ai-collapse-toggle-btn"
          :class="aiToggleBtnClass"
          @click.stop.prevent="handleAIToggleClick"
          title="收起/展开AI助手"
        >
          <i class="fas" :class="aiAssistantCollapsed ? 'fa-chevron-left' : 'fa-chevron-right'"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import Sidebar from '../common/sidebar/Sidebar.vue'
import TopBar from '../common/topbar/TopBar.vue'
import NotesList from '../../notelist/NotesList.vue'
import NoteEditor from '../../noteeditor/NoteEditor.vue'
import AIAssistant from '../../aiassistant/AIAssistant.vue'
import { useThemeFinal } from '../../../composables/useThemeFinal'
import { useMainLayout } from './composables/useMainLayout'
import { useNotesStore } from '../../notelist/composables/useNotesStore'
import type { MockNote } from '../../notelist/mock/notes'
import './css/main-layout.css'
import './css/toggle-buttons.css'
import './css/responsive.css'

// 主题管理
const { isDark, toggleTheme: toggleThemeGlobal } = useThemeFinal()

// TopBar的主题切换
const toggleTheme = () => {
  toggleThemeGlobal()
}

// 使用 MainLayout composable
const {
  sidebarCollapsed,
  showMobileSidebar,
  notesListCollapsed,
  aiAssistantCollapsed,
  contentAreaClass,
  windowWidth,
  toggleSidebar,
  toggleMobileSidebar,
  closeMobileSidebar,
  toggleNotesList,
  toggleAIAssistant,
  init,
  cleanup
} = useMainLayout()

const notesStore = useNotesStore()
const { activeNote, selectNote: selectNoteInStore, updateNote: updateNoteInStore } = notesStore

// 方法
const handleNoteSelected = (note: MockNote) => {
  selectNoteInStore(note)
  if (window.innerWidth <= 768) {
    showMobileSidebar.value = false
  }
}

const handleSearch = (query: string) => {
  console.log('搜索:', query)
}

const handleChangeThemeColor = (color: string) => {
  document.documentElement.style.setProperty('--primary-color', color)
}

const aiAssistantRef = ref<InstanceType<typeof AIAssistant> | null>(null)
const aiToggleBtnRef = ref<HTMLButtonElement | null>(null)

// 计算属性：AI折叠按钮的状态类
const aiToggleBtnClass = computed(() => {
  return {
    collapsed: aiAssistantCollapsed.value
  }
})



// 处理AI助手生成摘要
const handleAIGenerateSummary = () => {
  console.log('处理AI生成摘要')
  // 这里可以添加生成摘要的实际逻辑
}

// 处理AI助手生成标签
const handleAIGenerateTags = () => {
  console.log('处理AI生成标签')
  // 这里可以添加生成标签的实际逻辑
}

// 处理AI助手查找相关内容
const handleAIFindRelated = () => {
  console.log('处理AI查找相关内容')
  // 这里可以添加查找相关内容的实际逻辑
}

// 处理AI助手添加标签
const handleAIAddTag = (tag: string) => {
  console.log('处理AI添加标签:', tag)
  // 这里可以添加添加标签到当前笔记的实际逻辑
}

// 处理AI助手应用建议
const handleAIApplySuggestion = (suggestion: any) => {
  console.log('处理AI应用建议:', suggestion)
  // 这里可以添加应用建议到当前笔记的实际逻辑
}

// 处理AI折叠按钮点击
const handleAIToggleClick = (event: MouseEvent) => {
  console.log('AI折叠按钮被点击', event)
  event.stopPropagation()
  event.preventDefault()
  nextTick(() => {
    toggleAIAssistant()
  })
}

// 移除containerStyle，只使用CSS来控制布局

// 监听 activeNote 变化，确保布局状态正确
watch(() => activeNote.value, () => {
  if (window.innerWidth <= 768) {
    showMobileSidebar.value = false
  }
})

// 初始化
onMounted(async () => {
  init()
  if (activeNote.value) {
    selectNoteInStore(activeNote.value)
  }
})

// 清理
onUnmounted(() => {
  cleanup()
})
</script>
