<template>
  <div 
    class="sidebar" 
    :class="{ 
      'collapsed': collapsed, 
      'mobile-open': mobileOpen 
    }"
  >
    <!-- Logo区域 -->
    <SidebarLogo 
      :collapsed="collapsed"
      @toggle="handleToggleSidebar"
      @mouse-leave="handleMouseLeave"
    />
    
    <!-- 搜索框 -->
    <SidebarSearch 
      v-if="!collapsed"
          v-model="searchQuery"
      @search="handleSearch"
      @clear="handleClearSearch"
    />
    
    <!-- 主要导航 -->
    <SidebarNavSection
      title="主要"
      :items="mainNavItems"
      :collapsed="collapsed"
      :active-section="navigation.activeSection.value"
      :active-tool="navigation.activeTool.value"
      @item-click="handleNavItemClick"
    />
    
    <!-- AI工具 -->
    <SidebarNavSection
      title="AI工具"
      :items="aiToolItems"
      :collapsed="collapsed"
      :active-section="navigation.activeSection.value"
      :active-tool="navigation.activeTool.value"
      @item-click="handleNavItemClick"
    />
    
    <!-- 主题颜色选择器 -->
    <SidebarNavSection
      title="主题颜色"
      :items="themeColorItems"
      :collapsed="collapsed"
      :selected-color="theme.selectedColor.value"
      :is-dark="isDark"
      :user-selected-theme-color="theme.userSelectedThemeColor.value"
      @item-click="handleThemeColorClick"
    />
    
    <!-- 收起状态下的搜索按钮 -->
    <div 
      v-if="collapsed"
      class="nav-section"
    >
      <div 
        class="nav-item search-icon-nav-item" 
        @click="toggleSearchModal"
      >
        <i class="fas fa-search"></i>
        <span>搜索</span>
      </div>
    </div>
    
    <!-- 底部导航 -->
    <div class="nav-section" style="margin-top: auto;">
      <SidebarNavSection
        :items="bottomNavItems"
        :collapsed="collapsed"
        @item-click="handleBottomNavClick"
      />
    </div>
    
    <!-- 搜索模态框 -->
    <SidebarSearchModal
      v-model="showSearchModal"
      v-model:search-query="searchQuery"
      @search="handleSearch"
      @close="closeSearchModal"
    />
    
    <!-- 颜色选择模态框 -->
    <SidebarColorPicker
      :model-value="showColorPicker"
      :is-dark="isDark"
      :selected-color="theme.selectedColor.value"
      :user-selected-theme-color="theme.userSelectedThemeColor.value"
      @update:model-value="(val: boolean) => { theme.showColorPicker.value = val }"
      @select-light-mode="selectLightMode"
      @select-dark-mode="selectDarkMode"
      @select-color="selectColorFromModal"
      @close="theme.closeColorPicker"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import SidebarLogo from './components/SidebarLogo.vue'
import SidebarSearch from './components/SidebarSearch.vue'
import SidebarNavSection from './components/SidebarNavSection.vue'
import SidebarSearchModal from './components/SidebarSearchModal.vue'
import SidebarColorPicker from './components/SidebarColorPicker.vue'
import { useSidebarNavigation } from './composables/useSidebarNavigation'
import { useSidebarSearch } from './composables/useSidebarSearch'
import { useSidebarTheme, THEME_COLORS } from './composables/useSidebarTheme'

// Props
const props = defineProps<{
  collapsed: boolean
  mobileOpen: boolean
  isDark: boolean
}>()

// Emits
const emit = defineEmits<{
  'toggle-collapse': []
  'search': [query: string]
  'select-note': [note: any]
  'change-theme-color': [color: string]
  'toggle-theme': []
  'close-mobile-sidebar': []
}>()

// Composables
const navigation = useSidebarNavigation()
const search = useSidebarSearch((query: string) => {
  emit('search', query)
})
const theme = useSidebarTheme(
  { value: props.isDark },
  (color: string) => {
    emit('change-theme-color', color)
  }
)

// 搜索相关状态
const searchQuery = search.searchQuery
const showSearchModal = ref(false)
const showColorPicker = computed({
  get: () => theme.showColorPicker.value,
  set: (val: boolean) => { theme.showColorPicker.value = val }
})

// 导航项数据
const mainNavItems = [
  { id: 'home', label: '主页', icon: 'fas fa-home', type: 'section' as const },
  { id: 'notes', label: '所有笔记', icon: 'fas fa-sticky-note', type: 'section' as const },
  { id: 'favorites', label: '收藏', icon: 'fas fa-star', type: 'section' as const },
  { id: 'recent', label: '最近', icon: 'fas fa-history', type: 'section' as const }
]

const aiToolItems = [
  { id: 'assistant', label: 'AI助手', icon: 'fas fa-robot', type: 'tool' as const, badge: 'NEW' },
  { id: 'organize', label: '智能整理', icon: 'fas fa-magic', type: 'tool' as const },
  { id: 'analytics', label: '数据分析', icon: 'fas fa-chart-bar', type: 'tool' as const }
]

const themeColorItems = [
  { id: 'theme-color', label: '主题色', icon: 'fas fa-palette', type: 'theme-color' as const }
]

const bottomNavItems = [
  { id: 'settings', label: '设置', icon: 'fas fa-cog', type: 'action' as const },
  { id: 'help', label: '帮助', icon: 'fas fa-question-circle', type: 'action' as const }
]

// 方法
const handleSearch = () => {
  search.handleSearch()
}

const handleClearSearch = () => {
  search.clearSearch()
}

const handleToggleSidebar = () => {
  emit('toggle-collapse')
}

const handleMouseLeave = () => {
  // 鼠标离开处理
}

const handleNavItemClick = (item: any, event: Event) => {
  if (item.type === 'section') {
    navigation.setActiveSection(item.id)
  } else if (item.type === 'tool') {
    navigation.setActiveTool(item.id)
  }
}

const handleThemeColorClick = (item: any, event: Event) => {
  if (item.type === 'theme-color') {
    // 如果是窄屏模式且侧边栏打开，先关闭侧边栏
    if (window.innerWidth <= 768 && props.mobileOpen) {
      emit('close-mobile-sidebar')
    setTimeout(() => {
        theme.toggleColorPicker()
      }, 300)
    } else {
      theme.toggleColorPicker()
    }
  }
}

const toggleSearchModal = () => {
  // 如果是窄屏模式且侧边栏打开，先关闭侧边栏
  if (window.innerWidth <= 768 && props.mobileOpen) {
    emit('close-mobile-sidebar')
    setTimeout(() => {
      showSearchModal.value = true
    }, 300)
  } else {
    showSearchModal.value = true
  }
}

const closeSearchModal = () => {
  showSearchModal.value = false
}

const selectLightMode = () => {
  const isCurrentlyDark = document.body.classList.contains('dark')
  theme.selectedColor.value = '#5b6bf0'
  theme.userSelectedThemeColor.value = false
  localStorage.setItem('sidebar-mode', 'light')
  localStorage.removeItem('theme-color')
  localStorage.removeItem('sidebarThemeColor')
  emit('change-theme-color', '#5b6bf0')
  
  if (isCurrentlyDark) {
    emit('toggle-theme')
    setTimeout(() => {
      // 清除主题色，让CSS规则生效
      const sidebar = document.querySelector('.sidebar') as HTMLElement
      if (sidebar) {
        sidebar.removeAttribute('data-theme-color')
        sidebar.style.background = '#ffffff'
      }
    }, 200)
  } else {
    // 清除主题色，让CSS规则生效
    const sidebar = document.querySelector('.sidebar') as HTMLElement
    if (sidebar) {
      sidebar.removeAttribute('data-theme-color')
      sidebar.style.background = '#ffffff'
    }
  }
}

const selectDarkMode = () => {
  const isCurrentlyDark = document.body.classList.contains('dark')
  theme.selectedColor.value = '#5b6bf0'
  theme.userSelectedThemeColor.value = false
  localStorage.setItem('sidebar-mode', 'dark')
  localStorage.removeItem('theme-color')
  localStorage.removeItem('sidebarThemeColor')
  emit('change-theme-color', '#5b6bf0')
  
  if (!isCurrentlyDark) {
    emit('toggle-theme')
    setTimeout(() => {
      // 清除主题色，让CSS规则生效
      const sidebar = document.querySelector('.sidebar') as HTMLElement
      if (sidebar) {
        sidebar.removeAttribute('data-theme-color')
        sidebar.style.background = 'linear-gradient(135deg, #1a1a1a, #2d2d2d)'
      }
    }, 200)
  } else {
    // 清除主题色，让CSS规则生效
    const sidebar = document.querySelector('.sidebar') as HTMLElement
    if (sidebar) {
      sidebar.removeAttribute('data-theme-color')
      sidebar.style.background = 'linear-gradient(135deg, #1a1a1a, #2d2d2d)'
    }
  }
}

const selectColorFromModal = (color: string) => {
  // 保存到localStorage，使用与useSidebarTheme一致的key
  localStorage.setItem('theme-color', color)
  localStorage.setItem('sidebar-mode', 'color')
  theme.selectColor(color)
  emit('change-theme-color', color)
  // 立即更新背景和文字颜色
  nextTick(() => {
    theme.updateSidebarBackground()
  })
  theme.closeColorPicker()
}

const handleBottomNavClick = (item: any, event: Event) => {
  if (item.id === 'settings') {
  console.log('打开设置')
  } else if (item.id === 'help') {
  console.log('打开帮助')
  }
}

// 监听主题变化
watch(() => props.isDark, (newIsDark) => {
  if (!theme.userSelectedThemeColor.value) {
    theme.selectedColor.value = '#5b6bf0'
    // 根据当前主题模式设置背景
    const sidebar = document.querySelector('.sidebar') as HTMLElement
    if (sidebar) {
      sidebar.removeAttribute('data-theme-color')
      if (newIsDark) {
        // 深色模式：使用深色渐变
        sidebar.style.background = 'linear-gradient(135deg, #1a1a1a, #2d2d2d)'
      } else {
        // 浅色模式：使用白色背景
        sidebar.style.background = '#ffffff'
      }
    }
  } else {
    theme.updateSidebarBackground()
  }
})

// 初始化
onMounted(() => {
  const mode = localStorage.getItem('sidebar-mode')
  const savedColor = localStorage.getItem('theme-color') || localStorage.getItem('sidebarThemeColor')
  const sidebar = document.querySelector('.sidebar') as HTMLElement
  if (mode === 'color' && savedColor) {
    theme.selectedColor.value = savedColor
    theme.userSelectedThemeColor.value = true
    localStorage.setItem('theme-color', savedColor)
    localStorage.setItem('sidebarThemeColor', savedColor)
    emit('change-theme-color', savedColor)
    theme.updateSidebarBackground()
  } else if (mode === 'dark') {
    theme.selectedColor.value = '#5b6bf0'
    theme.userSelectedThemeColor.value = false
    if (sidebar) {
      sidebar.removeAttribute('data-theme-color')
      sidebar.style.background = 'linear-gradient(135deg, #1a1a1a, #2d2d2d)'
    }
  } else if (mode === 'light') {
    theme.selectedColor.value = '#5b6bf0'
    theme.userSelectedThemeColor.value = false
    if (sidebar) {
      sidebar.removeAttribute('data-theme-color')
      sidebar.style.background = '#ffffff'
    }
  } else if (savedColor) {
    theme.selectedColor.value = savedColor
    theme.userSelectedThemeColor.value = true
    localStorage.setItem('sidebar-mode', 'color')
    localStorage.setItem('theme-color', savedColor)
    localStorage.setItem('sidebarThemeColor', savedColor)
    emit('change-theme-color', savedColor)
    theme.updateSidebarBackground()
  } else {
    theme.selectedColor.value = '#5b6bf0'
    theme.userSelectedThemeColor.value = false
    if (sidebar) {
      sidebar.removeAttribute('data-theme-color')
      const isDark = document.body.classList.contains('dark')
      if (isDark) {
        sidebar.style.background = 'linear-gradient(135deg, #1a1a1a, #2d2d2d)'
      } else {
        sidebar.style.background = '#ffffff'
      }
    }
  }
})
</script>

<style scoped>
@import './css/sidebar.css';
</style>
