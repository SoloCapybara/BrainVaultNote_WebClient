<template>
  <div 
    class="sidebar" 
    :class="{ 
      'collapsed': collapsed, 
      'mobile-open': mobileOpen 
    }"
  >
    <!-- Logo区域 -->
    <div class="logo">
      <div class="logo-content">
        <i class="fas fa-brain"></i>
        <h1>脑洞库</h1>
      </div>
      <button 
        class="toggle-sidebar" 
        @click="handleToggleSidebar"
        @mouseleave="handleMouseLeave"
        ref="toggleButton"
      >
        <i class="fas" :class="collapsed ? 'fa-chevron-right' : 'fa-chevron-left'"></i>
      </button>
    </div>
    
    <!-- 搜索框 -->
    <div class="search-box">
      <div class="search-input-wrapper">
        <input 
          type="text" 
          placeholder="搜索笔记..." 
          v-model="searchQuery"
          @input="handleSearch"
          @keyup.enter="handleSearch"
          ref="searchInput"
        >
        <div class="search-buttons">
          <button 
            v-if="searchQuery" 
            class="clear-btn" 
            @click="handleClearSearch"
            @mouseleave="handleSearchMouseLeave"
            type="button"
          >
            <i class="fas fa-times"></i>
          </button>
          <button 
            class="search-btn" 
            @click="handleSearchClick"
            @mouseleave="handleSearchMouseLeave"
            type="button"
          >
            <i class="fas fa-search"></i>
          </button>
        </div>
      </div>
    </div>
    
    <!-- 主要导航 -->
    <div class="nav-section">
      <div class="nav-title">主要</div>
      <div 
        class="nav-item" 
        :class="{ active: activeSection === 'home' }"
        @click="handleNavItemClick('home', 'section', $event)"
        ref="navItemHome"
      >
        <i class="fas fa-home"></i>
        <span>主页</span>
      </div>
      <div 
        class="nav-item" 
        :class="{ active: activeSection === 'notes' }"
        @click="handleNavItemClick('notes', 'section', $event)"
        ref="navItemNotes"
      >
        <i class="fas fa-sticky-note"></i>
        <span>所有笔记</span>
      </div>
      <div 
        class="nav-item" 
        :class="{ active: activeSection === 'favorites' }"
        @click="handleNavItemClick('favorites', 'section', $event)"
        ref="navItemFavorites"
      >
        <i class="fas fa-star"></i>
        <span>收藏</span>
      </div>
      <div 
        class="nav-item" 
        :class="{ active: activeSection === 'recent' }"
        @click="handleNavItemClick('recent', 'section', $event)"
        ref="navItemRecent"
      >
        <i class="fas fa-history"></i>
        <span>最近</span>
      </div>
    </div>
    
    <!-- AI工具 -->
    <div class="nav-section">
      <div class="nav-title">AI工具</div>
      <div 
        class="nav-item" 
        :class="{ active: activeTool === 'assistant' }"
        @click="handleNavItemClick('assistant', 'tool', $event)"
        ref="navItemAssistant"
      >
        <i class="fas fa-robot"></i>
        <span>AI助手</span>
        <span class="ai-tag">NEW</span>
      </div>
      <div 
        class="nav-item" 
        :class="{ active: activeTool === 'organize' }"
        @click="handleNavItemClick('organize', 'tool', $event)"
        ref="navItemOrganize"
      >
        <i class="fas fa-magic"></i>
        <span>智能整理</span>
      </div>
      <div 
        class="nav-item" 
        :class="{ active: activeTool === 'analytics' }"
        @click="handleNavItemClick('analytics', 'tool', $event)"
        ref="navItemAnalytics"
      >
        <i class="fas fa-chart-bar"></i>
        <span>数据分析</span>
      </div>
    </div>
    
    <!-- 主题颜色选择器 -->
    <div class="nav-section">
      <div class="nav-title">主题颜色</div>
      <div 
        class="nav-item theme-color-item" 
        @click="toggleColorPicker"
      >
        <i class="fas fa-palette"></i>
        <span>主题色</span>
        <div 
          class="current-color" 
          :style="{ backgroundColor: selectedColor }"
        ></div>
      </div>
      <!-- 收起状态下的搜索按钮 -->
      <div 
        v-if="collapsed"
        class="nav-item search-icon-nav-item" 
        @click="toggleSearchModal"
      >
        <i class="fas fa-search"></i>
        <span>搜索</span>
      </div>
    </div>
    
    <!-- 底部导航 -->
    <div class="nav-section" style="margin-top: auto;">
      <div class="nav-item" @click="openSettings">
        <i class="fas fa-cog"></i>
        <span>设置</span>
      </div>
      <div class="nav-item" @click="openHelp">
        <i class="fas fa-question-circle"></i>
        <span>帮助</span>
      </div>
    </div>
    
    <!-- 搜索模态框 - 使用 Teleport 传送到 body，避免受侧边栏影响 -->
    <Teleport to="body">
      <div 
        class="search-modal" 
        :class="{ active: showSearchModal }"
        @click="closeSearchModal"
      >
        <div 
          class="search-modal-content" 
          @click.stop
        >
          <div class="search-modal-header">
            <h3>搜索笔记</h3>
            <button class="close-btn" @click="closeSearchModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="search-modal-body">
            <div class="search-input-wrapper-modal">
              <input 
                type="text" 
                placeholder="搜索笔记..." 
                v-model="searchQuery"
                @input="handleSearch"
                @keyup.enter="handleSearch"
                @keyup.esc="closeSearchModal"
                ref="searchModalInput"
                autofocus
              >
              <div class="search-buttons-modal">
                <button 
                  v-if="searchQuery" 
                  class="clear-btn-modal" 
                  @click="handleClearSearch"
                  type="button"
                >
                  <i class="fas fa-times"></i>
                </button>
                <button 
                  class="search-btn-modal" 
                  @click="handleSearchClick"
                  type="button"
                >
                  <i class="fas fa-search"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
    
    <!-- 颜色选择模态框 - 使用 Teleport 传送到 body，避免受侧边栏影响 -->
    <Teleport to="body">
      <div 
        class="color-picker-modal" 
        :class="{ active: showColorPicker }"
        @click="closeColorPicker"
      >
        <div 
          class="modal-content" 
          @click.stop
        >
        <div class="modal-header">
          <h3>主题设置</h3>
          <button class="close-btn" @click="closeColorPicker">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <!-- 主题模式切换 -->
        <div class="theme-mode-section">
          <h4>主题模式</h4>
          <p class="theme-tip">主题模式会同时修改侧边栏和编辑区域的颜色</p>
          <div class="theme-mode-options">
            <div 
              class="theme-mode-option" 
              :class="{ active: !props.isDark }"
              @click="selectLightMode"
            >
              <div class="mode-preview light">
                <div class="preview-window light">
                  <div class="preview-header"></div>
                  <div class="preview-content"></div>
                </div>
              </div>
              <div class="mode-info">
                <i class="fas fa-sun"></i>
                <span>浅色模式</span>
              </div>
            </div>
            <div 
              class="theme-mode-option" 
              :class="{ active: props.isDark }"
              @click="selectDarkMode"
            >
              <div class="mode-preview dark">
                <div class="preview-window dark">
                  <div class="preview-header"></div>
                  <div class="preview-content"></div>
                </div>
              </div>
              <div class="mode-info">
                <i class="fas fa-moon"></i>
                <span>深色模式</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 主题颜色选择 -->
        <div class="theme-color-section">
          <h4>主题颜色</h4>
          <p class="theme-tip">主题色只修改侧边栏颜色，不切换编辑区域颜色</p>
          <div class="color-grid">
          <div 
            v-for="color in themeColors" 
            :key="color.value"
            class="color-option-modal" 
            :class="{ 
              active: selectedColor === color.value && userSelectedThemeColor,
              disabled: false
            }"
            :style="{ backgroundColor: color.value }"
            @click="selectColorFromModal(color.value)"
          >
            <i class="fas fa-check" v-if="selectedColor === color.value && userSelectedThemeColor"></i>
            <div class="color-name">{{ color.name }}</div>
          </div>
          </div>
        </div>
        </div>
      </div>
    </Teleport>
    
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue'

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

// 响应式状态
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement | null>(null)
const toggleButton = ref<HTMLButtonElement | null>(null)
const activeSection = ref('home')
const activeTool = ref('')
const selectedColor = ref('#5b6bf0')
const showColorPicker = ref(false)
const showSearchModal = ref(false)
const searchModalInput = ref<HTMLInputElement | null>(null)

// 主题颜色选项
const themeColors = [
  { name: '经典蓝', value: '#5b6bf0' },
  { name: '热情红', value: '#f25f5c' },
  { name: '神秘紫', value: '#8a2be2' },
  { name: '自然绿', value: '#3a9d5d' },
  { name: '活力橙', value: '#f9a826' },
  { name: '深海蓝', value: '#1e3a8a' },
  { name: '玫瑰粉', value: '#e91e63' },
  { name: '森林绿', value: '#059669' },
  { name: '日落橙', value: '#ea580c' },
  { name: '优雅灰', value: '#6b7280' }
]

// 方法
const handleSearch = () => {
  emit('search', searchQuery.value)
}

const clearSearch = () => {
  searchQuery.value = ''
  emit('search', '')
  // 清除后重新聚焦到输入框
  nextTick(() => {
    if (searchInput.value) {
      searchInput.value.focus()
    }
  })
}

const handleToggleSidebar = () => {
  emit('toggle-collapse')
  
  // 添加涟漪效果
  if (toggleButton.value) {
    toggleButton.value.classList.add('ripple')
    
    // 涟漪动画结束后移除类名
    setTimeout(() => {
      toggleButton.value?.classList.remove('ripple')
    }, 150)
    
    // 立即移除焦点，防止背景滞留
    nextTick(() => {
      toggleButton.value?.blur()
    })
  }
}

const handleMouseLeave = () => {
  // 鼠标离开时立即移除焦点，防止背景滞留
  if (toggleButton.value) {
    toggleButton.value.blur()
  }
}

const handleClearSearch = () => {
  clearSearch()
  
  // 添加涟漪效果
  const clearBtn = document.querySelector('.clear-btn') as HTMLButtonElement
  if (clearBtn) {
    clearBtn.classList.add('ripple')
    setTimeout(() => {
      clearBtn.classList.remove('ripple')
    }, 120)
  }
  
  // 点击后立即移除焦点
  nextTick(() => {
    if (clearBtn) {
      clearBtn.blur()
    }
  })
}

const handleSearchClick = () => {
  handleSearch()
  
  // 添加涟漪效果
  const searchBtn = document.querySelector('.search-btn') as HTMLButtonElement
  if (searchBtn) {
    searchBtn.classList.add('ripple')
    setTimeout(() => {
      searchBtn.classList.remove('ripple')
    }, 120)
  }
  
  // 点击后立即移除焦点
  nextTick(() => {
    if (searchBtn) {
      searchBtn.blur()
    }
  })
}

const handleSearchMouseLeave = () => {
  // 搜索按钮鼠标离开时立即移除焦点
  const clearBtn = document.querySelector('.clear-btn') as HTMLButtonElement
  const searchBtn = document.querySelector('.search-btn') as HTMLButtonElement
  
  if (clearBtn) clearBtn.blur()
  if (searchBtn) searchBtn.blur()
}

const handleNavItemClick = (item: string, type: string, event: Event) => {
  // 立即添加涟漪效果
  const navItem = event.currentTarget as HTMLElement
  if (navItem) {
    // 检查当前是否为深色模式
    const isDark = document.body.classList.contains('dark')
    const rippleColor = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.3)'
    
    // 创建涟漪元素
    const ripple = document.createElement('div')
    ripple.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, ${rippleColor}, transparent);
      border-radius: 8px;
      pointer-events: none;
      z-index: 10;
      transform: translateX(-100%);
      transition: transform 0.2s ease-out;
    `
    navItem.appendChild(ripple)
    
    // 强制重绘
    navItem.offsetHeight
    
    // 触发闪光动画
    requestAnimationFrame(() => {
      ripple.style.transform = 'translateX(100%)'
    })
    
    // 清理
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple)
      }
    }, 200)
  }
  
  // 延迟设置活动状态，让涟漪效果先完成
  setTimeout(() => {
    if (type === 'section') {
      setActiveSection(item)
    } else if (type === 'tool') {
      setActiveTool(item)
    }
  }, 100)
}

const setActiveSection = (section: string) => {
  activeSection.value = section
  activeTool.value = ''
}

const setActiveTool = (tool: string) => {
  activeTool.value = tool
  activeSection.value = ''
}


// 选择浅色模式
const selectLightMode = () => {
  // 检查当前状态
  const isCurrentlyDark = document.body.classList.contains('dark')
  
  // 重置为主题色选择模式（默认蓝色）
  selectedColor.value = '#5b6bf0'
  userSelectedThemeColor.value = false // 重置用户选择标志
  localStorage.removeItem('theme-color')
  
  // 触发主题色变更事件，重置笔记卡片颜色为蓝色
  emit('change-theme-color', '#5b6bf0')
  
  // 如果当前是深色模式，切换到浅色模式
  if (isCurrentlyDark) {
    emit('toggle-theme')
    // 延迟更新侧边栏背景，等待主题状态更新
    setTimeout(() => {
      updateSidebarBackground()
    }, 200)
  } else {
    // 如果当前已经是浅色模式，只更新侧边栏背景
    updateSidebarBackground()
  }
  
  // 不再需要同步编辑区域主题，因为现在使用全局主题
}

// 选择深色模式
const selectDarkMode = () => {
  // 检查当前状态
  const isCurrentlyDark = document.body.classList.contains('dark')
  
  // 重置为主题色选择模式（默认蓝色）
  selectedColor.value = '#5b6bf0'
  userSelectedThemeColor.value = false // 重置用户选择标志
  localStorage.removeItem('theme-color')
  
  // 触发主题色变更事件，重置笔记卡片颜色为蓝色
  emit('change-theme-color', '#5b6bf0')
  
  // 如果当前是浅色模式，切换到深色模式
  if (!isCurrentlyDark) {
    emit('toggle-theme')
    // 延迟更新侧边栏背景，等待主题状态更新
    setTimeout(() => {
      updateSidebarBackground()
    }, 200)
  } else {
    // 如果当前已经是深色模式，只更新侧边栏背景
    updateSidebarBackground()
  }
  
  // 不再需要同步编辑区域主题，因为现在使用全局主题
}

const toggleColorPicker = () => {
  // 如果是窄屏模式且侧边栏打开，先关闭侧边栏
  if (window.innerWidth <= 768 && props.mobileOpen) {
    emit('close-mobile-sidebar')
    // 延迟打开模态框，等待侧边栏关闭动画完成
    setTimeout(() => {
      showColorPicker.value = true
    }, 300)
  } else {
    showColorPicker.value = true
  }
}

const closeColorPicker = () => {
  showColorPicker.value = false
}

const toggleSearchModal = () => {
  // 如果是窄屏模式且侧边栏打开，先关闭侧边栏
  if (window.innerWidth <= 768 && props.mobileOpen) {
    emit('close-mobile-sidebar')
    // 延迟打开模态框，等待侧边栏关闭动画完成
    setTimeout(() => {
      showSearchModal.value = true
      // 聚焦到搜索输入框
      nextTick(() => {
        if (searchModalInput.value) {
          searchModalInput.value.focus()
        }
      })
    }, 300)
  } else {
    showSearchModal.value = true
    // 聚焦到搜索输入框
    nextTick(() => {
      if (searchModalInput.value) {
        searchModalInput.value.focus()
      }
    })
  }
}

const closeSearchModal = () => {
  showSearchModal.value = false
}

const selectColorFromModal = (color: string) => {
  // 选择主题色时，不改变深色/浅色模式状态
  console.log('🎨 选择主题色:', color)
  selectedColor.value = color
  userSelectedThemeColor.value = true // 标记用户主动选择了主题色
  localStorage.setItem('theme-color', color)
  emit('change-theme-color', color)
  
  // 更新侧边栏背景
  console.log('🎨 准备更新侧边栏背景')
  updateSidebarBackground()
  
  closeColorPicker()
}

const updateSidebarBackground = () => {
  const sidebar = document.querySelector('.sidebar')
  if (sidebar) {
    console.log('🎨 更新侧边栏背景:', {
      isDark: props.isDark,
      selectedColor: selectedColor.value
    })
    
    if (props.isDark) {
      // 深色模式 - 如果用户主动选择了主题色，使用主题色渐变；否则使用黑色渐变
      if (userSelectedThemeColor.value) {
        const darkerColor = darkenColor(selectedColor.value, 30) // 深色模式下加深更多
        sidebar.style.background = `linear-gradient(135deg, ${selectedColor.value}, ${darkerColor})`
        sidebar.setAttribute('data-theme-color', selectedColor.value)
        
        // 确保深色模式下也保存主题色到localStorage
        localStorage.setItem('theme-color', selectedColor.value)
        
        // 根据主题色设置合适的文字颜色
        const textColor = getTextColorForTheme(selectedColor.value)
        const categoryColor = getCategoryTextColorForTheme(selectedColor.value)
        sidebar.style.color = textColor
        
        // 设置侧边栏子元素的文字颜色
        const navTitles = sidebar.querySelectorAll('.nav-title')
        const navItems = sidebar.querySelectorAll('.nav-item')
        const logoText = sidebar.querySelector('.logo h1')
        const searchInput = sidebar.querySelector('.search-box input')
        const searchButtons = sidebar.querySelectorAll('.search-buttons button')
        const toggleButton = sidebar.querySelector('.toggle-sidebar')
        
        navTitles.forEach((el: any) => {
          el.style.setProperty('color', categoryColor, 'important')
          el.style.fontWeight = '600'
        })
        
        navItems.forEach((el: any) => {
          el.style.setProperty('color', textColor, 'important')
        })
        
        if (logoText) {
          logoText.style.setProperty('color', textColor, 'important')
        }
        
        if (searchInput) {
          // 深色模式下，搜索框使用白色文字和半透明背景
          searchInput.style.setProperty('color', '#ffffff', 'important')
          searchInput.style.setProperty('background-color', 'rgba(255, 255, 255, 0.15)', 'important')
        }
        
        searchButtons.forEach((el: any) => {
          // 深色模式下，搜索按钮使用白色文字和半透明背景
          el.style.setProperty('color', '#ffffff', 'important')
          el.style.setProperty('background-color', 'rgba(255, 255, 255, 0.2)', 'important')
        })
        
        if (toggleButton) {
          toggleButton.style.setProperty('color', textColor, 'important')
        }
        
        console.log('🎨 应用深色模式主题色背景:', selectedColor.value, '文字颜色:', textColor)
      } else {
        // 深色模式默认 - 使用黑色渐变
        sidebar.style.background = 'linear-gradient(135deg, #000000, #1a1a1a)'
        sidebar.removeAttribute('data-theme-color')
        // 重置文字颜色为深色模式默认色
        sidebar.style.color = '#e9ecef'
        
        // 重置侧边栏子元素的颜色为深色模式默认色
        const navTitles = sidebar.querySelectorAll('.nav-title')
        const navItems = sidebar.querySelectorAll('.nav-item')
        const logoText = sidebar.querySelector('.logo h1')
        const searchInput = sidebar.querySelector('.search-box input')
        const searchButtons = sidebar.querySelectorAll('.search-buttons button')
        const toggleButton = sidebar.querySelector('.toggle-sidebar')
        
        navTitles.forEach((el: any) => {
          el.style.color = 'rgba(255, 255, 255, 0.7)'
          el.style.fontWeight = '600'
        })
        
        navItems.forEach((el: any) => {
          el.style.color = '#e9ecef'
        })
        
        if (logoText) {
          logoText.style.color = '#e9ecef'
        }
        
        if (searchInput) {
          // 默认深色模式下，搜索框使用白色文字和半透明背景
          searchInput.style.setProperty('color', '#ffffff', 'important')
          searchInput.style.setProperty('background-color', 'rgba(255, 255, 255, 0.15)', 'important')
        }
        
        searchButtons.forEach((el: any) => {
          // 默认深色模式下，搜索按钮使用白色文字和半透明背景
          el.style.setProperty('color', '#ffffff', 'important')
          el.style.setProperty('background-color', 'rgba(255, 255, 255, 0.2)', 'important')
        })
        
        if (toggleButton) {
          toggleButton.style.color = '#e9ecef'
        }
        
        console.log('🎨 应用深色模式默认背景')
      }
    } else {
      // 浅色模式 - 如果用户主动选择了主题色，使用主题色渐变；否则使用纯白色
      if (userSelectedThemeColor.value) {
        const darkerColor = darkenColor(selectedColor.value, 30)
        // 浅色模式下完全复用深色模式的背景样式
        sidebar.style.background = `linear-gradient(135deg, ${selectedColor.value}, ${darkerColor})`
        sidebar.setAttribute('data-theme-color', selectedColor.value)
        
        // 确保浅色模式下也保存主题色到localStorage
        localStorage.setItem('theme-color', selectedColor.value)
        
        // 根据主题色设置合适的文字颜色
        const textColor = getTextColorForTheme(selectedColor.value)
        const categoryColor = getCategoryTextColorForTheme(selectedColor.value)
        sidebar.style.color = textColor
        
        // 设置侧边栏子元素的文字颜色
        const navTitles = sidebar.querySelectorAll('.nav-title')
        const navItems = sidebar.querySelectorAll('.nav-item')
        const logoText = sidebar.querySelector('.logo h1')
        const searchInput = sidebar.querySelector('.search-box input')
        const searchButtons = sidebar.querySelectorAll('.search-buttons button')
        const toggleButton = sidebar.querySelector('.toggle-sidebar')
        
        // 强制设置所有元素的颜色，使用!important确保优先级
        navTitles.forEach((el: any) => {
          el.style.setProperty('color', categoryColor, 'important')
          el.style.fontWeight = '600'
        })
        
        navItems.forEach((el: any) => {
          el.style.setProperty('color', textColor, 'important')
        })
        
        if (logoText) {
          logoText.style.setProperty('color', textColor, 'important')
        }
        
        if (searchInput) {
          // 浅色模式下，搜索框始终使用浅色背景和深色文字
          searchInput.style.setProperty('color', '#000000', 'important')
          searchInput.style.setProperty('background-color', '#f5f5f5', 'important')
        }
        
        searchButtons.forEach((el: any) => {
          // 浅色模式下，搜索按钮使用深色文字和浅色背景
          el.style.setProperty('color', '#333333', 'important')
          el.style.setProperty('background-color', '#e0e0e0', 'important')
        })
        
        if (toggleButton) {
          toggleButton.style.setProperty('color', textColor, 'important')
        }
        
        console.log('🎨 应用主题色背景:', selectedColor.value, '文字颜色:', textColor, '分类颜色:', categoryColor)
      } else {
        sidebar.style.background = '#ffffff'
        sidebar.removeAttribute('data-theme-color')
        sidebar.style.color = '#333333'
        
        // 重置侧边栏子元素的颜色为默认浅色模式
        const navTitles = sidebar.querySelectorAll('.nav-title')
        const navItems = sidebar.querySelectorAll('.nav-item')
        const logoText = sidebar.querySelector('.logo h1')
        const searchInput = sidebar.querySelector('.search-box input')
        const searchButtons = sidebar.querySelectorAll('.search-buttons button')
        const toggleButton = sidebar.querySelector('.toggle-sidebar')
        
        navTitles.forEach((el: any) => {
          el.style.color = 'rgba(0, 0, 0, 0.7)'
        })
        
        navItems.forEach((el: any) => {
          el.style.color = '#333333'
        })
        
        if (logoText) {
          logoText.style.color = '#333333'
        }
        
        if (searchInput) {
          // 默认浅色模式下，搜索框使用深色文字和浅色背景
          searchInput.style.setProperty('color', '#000000', 'important')
          searchInput.style.setProperty('background-color', '#f5f5f5', 'important')
        }
        
        searchButtons.forEach((el: any) => {
          // 默认浅色模式下，搜索按钮使用深色文字和浅色背景
          el.style.setProperty('color', '#333333', 'important')
          el.style.setProperty('background-color', '#e0e0e0', 'important')
        })
        
        if (toggleButton) {
          toggleButton.style.color = '#333333'
        }
        
        console.log('🎨 应用浅色模式背景: 纯白色')
      }
    }
  }
}

// 根据主题色获取合适的文字颜色
const getTextColorForTheme = (color: string) => {
  // 检查当前是否为深色模式
  const isDark = document.body.classList.contains('dark')
  
  // 活力橙在深色和浅色模式下都使用白色文字，确保一致性
  if (color === '#f9a826') {
    return '#ffffff' // 活力橙 - 白色文字
  }
  
  if (isDark) {
    // 深色模式 - 使用白色文字
    const colorMap: { [key: string]: string } = {
      '#5b6bf0': '#ffffff', // 经典蓝 - 白色文字
      '#f25f5c': '#ffffff', // 热情红 - 白色文字
      '#8a2be2': '#ffffff', // 神秘紫 - 白色文字
      '#3a9d5d': '#ffffff', // 自然绿 - 白色文字
      '#1e3a8a': '#ffffff', // 深海蓝 - 白色文字
      '#e91e63': '#ffffff', // 玫瑰粉 - 白色文字
      '#059669': '#ffffff', // 森林绿 - 白色文字
      '#ea580c': '#ffffff', // 日落橙 - 白色文字
      '#6b7280': '#ffffff'  // 优雅灰 - 白色文字
    }
    return colorMap[color] || '#ffffff'
  } else {
    // 浅色模式 - 复用深色模式的白色文字，保持最醒目效果
    const colorMap: { [key: string]: string } = {
      '#5b6bf0': '#ffffff', // 经典蓝 - 白色文字
      '#f25f5c': '#ffffff', // 热情红 - 白色文字
      '#8a2be2': '#ffffff', // 神秘紫 - 白色文字
      '#3a9d5d': '#ffffff', // 自然绿 - 白色文字
      '#1e3a8a': '#ffffff', // 深海蓝 - 白色文字
      '#e91e63': '#ffffff', // 玫瑰粉 - 白色文字
      '#059669': '#ffffff', // 森林绿 - 白色文字
      '#ea580c': '#ffffff', // 日落橙 - 白色文字
      '#6b7280': '#ffffff'  // 优雅灰 - 白色文字
    }
    return colorMap[color] || '#ffffff'
  }
}

// 根据主题色获取分类标题的醒目颜色
const getCategoryTextColorForTheme = (color: string) => {
  // 活力橙在深色和浅色模式下都使用白色文字，确保一致性
  if (color === '#f9a826') {
    return '#ffffff' // 活力橙 - 白色文字
  }
  
  // 检查当前是否为深色模式
  const isDark = document.body.classList.contains('dark')
  
  if (isDark) {
    // 深色模式 - 使用浅色文字
    const colorMap: { [key: string]: string } = {
      '#5b6bf0': '#e3f2fd', // 经典蓝 - 浅蓝色
      '#f25f5c': '#ffebee', // 热情红 - 浅红色
      '#8a2be2': '#f3e5f5', // 神秘紫 - 浅紫色
      '#3a9d5d': '#e8f5e8', // 自然绿 - 浅绿色
      '#1e3a8a': '#e3f2fd', // 深海蓝 - 浅蓝色
      '#e91e63': '#fce4ec', // 玫瑰粉 - 浅粉色
      '#059669': '#e8f5e8', // 森林绿 - 浅绿色
      '#ea580c': '#fff3e0', // 日落橙 - 浅橙色
      '#6b7280': '#f5f5f5'  // 优雅灰 - 浅灰色
    }
    return colorMap[color] || '#ffffff'
  } else {
    // 浅色模式 - 复用深色模式的浅色文字，保持最醒目效果
    const colorMap: { [key: string]: string } = {
      '#5b6bf0': '#e3f2fd', // 经典蓝 - 浅蓝色
      '#f25f5c': '#ffebee', // 热情红 - 浅红色
      '#8a2be2': '#f3e5f5', // 神秘紫 - 浅紫色
      '#3a9d5d': '#e8f5e8', // 自然绿 - 浅绿色
      '#1e3a8a': '#e3f2fd', // 深海蓝 - 浅蓝色
      '#e91e63': '#fce4ec', // 玫瑰粉 - 浅粉色
      '#059669': '#e8f5e8', // 森林绿 - 浅绿色
      '#ea580c': '#fff3e0', // 日落橙 - 浅橙色
      '#6b7280': '#f5f5f5'  // 优雅灰 - 浅灰色
    }
    return colorMap[color] || '#ffffff'
  }
}

// 判断是否选择了自定义主题色（非默认蓝色）
const hasCustomThemeColor = () => {
  return selectedColor.value !== '#5b6bf0'
}

// 用户是否主动选择了主题色（包括蓝色）
const userSelectedThemeColor = ref(false)

const openSettings = () => {
  console.log('打开设置')
}

const openHelp = () => {
  console.log('打开帮助')
}

// 监听主题变化
watch(() => props.isDark, (newIsDark) => {
  // 只有在没有用户选择的主题色时才重置
  if (!userSelectedThemeColor.value) {
    if (newIsDark) {
      // 深色模式 - 使用默认蓝色
      selectedColor.value = '#5b6bf0'
    } else {
      // 浅色模式 - 使用默认蓝色
      selectedColor.value = '#5b6bf0'
    }
    updateSidebarBackground()
  } else {
    // 如果用户已经选择了主题色，只更新背景，不重置颜色
    updateSidebarBackground()
  }
})

// 初始化
onMounted(() => {
  // 加载保存的主题色
  const savedColor = localStorage.getItem('theme-color')
  if (savedColor) {
    selectedColor.value = savedColor
    userSelectedThemeColor.value = true // 标记为用户选择
    // 触发主题色变更事件，确保笔记卡片颜色也被更新
    emit('change-theme-color', savedColor)
  } else {
    selectedColor.value = '#5b6bf0' // 默认蓝色
    userSelectedThemeColor.value = false // 标记为系统默认
  }
  updateSidebarBackground()
})

// 辅助函数：加深颜色
const darkenColor = (color: string, percent: number) => {
  const num = parseInt(color.replace("#", ""), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) - amt
  const G = (num >> 8 & 0x00FF) - amt
  const B = (num & 0x0000FF) - amt
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  height: 100vh;
  background: linear-gradient(135deg, #5b6bf0, #3a4bd8);
  color: white;
  padding: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  z-index: 100;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow-y: auto;
  overflow-x: hidden;
  position: fixed;
  left: 0;
  top: 0;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* 浅色模式下的侧边栏样式 - 只在没有主题色时应用 */
body:not(.dark) .sidebar:not([data-theme-color]) {
  background: #ffffff !important;
  color: #333333 !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* 浅色模式下的导航标题 */
body:not(.dark) .nav-title {
  color: #666666 !important;
}

/* 浅色模式下的导航项 */
body:not(.dark) .nav-item {
  color: #333333 !important;
}

/* 浅色模式默认的悬浮状态样式 - 只在没有主题色时生效 */
body:not(.dark) .sidebar:not([data-theme-color]) .nav-item:hover {
  background-color: #f5f5f5 !important;
  color: #333333 !important;
}

/* 浅色模式默认的激活状态样式 - 只在没有主题色时生效 */
body:not(.dark) .sidebar:not([data-theme-color]) .nav-item.active {
  background-color: #e3f2fd !important;
  color: #1976d2 !important;
  border-left-color: #1976d2 !important;
}

/* 浅色模式下的搜索框 - 最强力覆盖所有样式 */
body:not(.dark) .search-box input,
body:not(.dark) .sidebar .search-box input,
body:not(.dark) .search-box input[style*="color"],
body:not(.dark) .search-box input[style*="background-color"],
body:not(.dark) .search-box input[style*="color"]:focus,
body:not(.dark) .search-box input:focus,
body:not(.dark) .search-box input:active,
body:not(.dark) .search-box input:hover {
  background-color: #f5f5f5 !important;
  color: #000000 !important;
  border: 1px solid #e0e0e0 !important;
}

body:not(.dark) .search-box input::placeholder,
body:not(.dark) .sidebar .search-box input::placeholder,
body:not(.dark) .search-box input[style*="color"]::placeholder {
  color: #666666 !important;
}

/* 深色模式下的搜索框 - 白色文字 */
body.dark .search-box input,
body.dark .search-box input[style*="color"],
body.dark .search-box input[style*="background-color"],
body.dark .search-box input:focus,
body.dark .search-box input:active,
body.dark .search-box input:hover {
  color: #ffffff !important;
  background-color: rgba(255, 255, 255, 0.15) !important;
}

/* 最强力规则 - 覆盖所有可能的样式 */
.search-box input {
  color: #000000 !important;
}

body:not(.dark) .search-box input,
body:not(.dark) .search-box input[style*="color"],
body:not(.dark) .search-box input[style*="background-color"],
body:not(.dark) .search-box input:focus,
body:not(.dark) .search-box input:active,
body:not(.dark) .search-box input:hover {
  color: #000000 !important;
  background-color: #f5f5f5 !important;
}

body.dark .search-box input,
body.dark .search-box input[style*="color"],
body.dark .search-box input[style*="background-color"],
body.dark .search-box input:focus,
body.dark .search-box input:active,
body.dark .search-box input:hover {
  color: #ffffff !important;
  background-color: rgba(255, 255, 255, 0.15) !important;
}

/* 浅色模式下的搜索框 - 黑色文字（无论什么主题色） */
body:not(.dark) .search-box input,
body:not(.dark) .search-box input[style*="color"],
body:not(.dark) .search-box input[style*="background-color"],
body:not(.dark) .search-box input:focus,
body:not(.dark) .search-box input:active,
body:not(.dark) .search-box input:hover,
body:not(.dark) .sidebar .search-box input,
body:not(.dark) .sidebar .search-box input[style*="color"],
body:not(.dark) .sidebar .search-box input[style*="background-color"] {
  color: #000000 !important;
  background-color: #f5f5f5 !important;
}

/* 深色模式下的搜索框 - 白色文字 */
body.dark .search-box input,
body.dark .search-box input[style*="color"],
body.dark .search-box input[style*="background-color"],
body.dark .search-box input:focus,
body.dark .search-box input:active,
body.dark .search-box input:hover,
body.dark .sidebar .search-box input,
body.dark .sidebar .search-box input[style*="color"],
body.dark .sidebar .search-box input[style*="background-color"] {
  color: #ffffff !important;
  background-color: rgba(255, 255, 255, 0.15) !important;
}

/* 浅色模式下的搜索按钮 */
body:not(.dark) .clear-btn,
body:not(.dark) .search-btn {
  background-color: #e0e0e0 !important;
  color: #333333 !important;
}

body:not(.dark) .clear-btn:hover,
body:not(.dark) .search-btn:hover {
  background-color: #d0d0d0 !important;
}

/* 浅色模式下的AI标签 */
body:not(.dark) .ai-tag {
  background-color: #e91e63 !important;
  color: white !important;
}

/* 浅色模式下的主题色显示 */
body:not(.dark) .current-color {
  border-color: #cccccc !important;
}

/* 浅色模式下的折叠箭头 */
body:not(.dark) .toggle-sidebar {
  color: #333333 !important;
}

/* 浅色模式默认的折叠箭头样式 - 只在没有主题色时生效 */
body:not(.dark) .sidebar:not([data-theme-color]) .toggle-sidebar:hover {
  background-color: #f5f5f5 !important;
}

body:not(.dark) .sidebar:not([data-theme-color]) .toggle-sidebar:focus {
  background-color: #f5f5f5 !important;
}

body:not(.dark) .sidebar:not([data-theme-color]) .toggle-sidebar:active {
  background-color: #e0e0e0 !important;
}

/* 浅色模式下选择主题色时，折叠箭头使用白色半透明背景 */
body:not(.dark) .sidebar[data-theme-color] .toggle-sidebar:hover {
  background-color: rgba(255, 255, 255, 0.2) !important;
}

body:not(.dark) .sidebar[data-theme-color] .toggle-sidebar:focus {
  background-color: rgba(255, 255, 255, 0.2) !important;
}

body:not(.dark) .sidebar[data-theme-color] .toggle-sidebar:active {
  background-color: rgba(255, 255, 255, 0.3) !important;
}

/* 收起状态下的搜索按钮 */
/* 收起状态下的搜索按钮（作为导航项） */
.search-icon-nav-item {
  cursor: pointer;
}

/* 收起状态下隐藏搜索按钮的文字 */
.sidebar.collapsed .search-icon-nav-item span {
  display: none;
}

/* 防止所有子元素文字被选中 */
.sidebar * {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* 自定义滚动条样式 */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* 浅色模式下的侧边栏滚动条 */
body:not(.dark) .sidebar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

body:not(.dark) .sidebar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
}

body:not(.dark) .sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}

.sidebar.collapsed {
  width: 90px; /* 增加宽度给按钮更多空间 */
}

.sidebar.collapsed .logo h1,
.sidebar.collapsed .nav-title,
.sidebar.collapsed .nav-item span,
.sidebar.collapsed .ai-tag,
.sidebar.collapsed .search-box,
.sidebar.collapsed .color-picker {
  display: none;
}

/* 收起状态下显示搜索按钮 */
.sidebar.collapsed .search-icon-nav-item {
  display: flex !important;
}

.sidebar.collapsed .search-icon-nav-item span {
  display: none;
}


.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 10px 10px;
}

.sidebar.collapsed .nav-item i {
  margin-right: 0;
  font-size: 18px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px 12px; /* 顶部padding 10px，微调使分割线对齐TopBar底边（60px） */
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 12px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  min-height: 60px; /* 确保logo区域总高度为60px，使分割线对齐TopBar */
  box-sizing: border-box;
}

/* 浅色模式下的分割线颜色 */
body:not(.dark) .sidebar:not([data-theme-color]) .logo {
  border-bottom-color: rgba(0, 0, 0, 0.1);
}

body:not(.dark) .sidebar[data-theme-color] .logo {
  border-bottom-color: rgba(255, 255, 255, 0.2);
}

.logo-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.sidebar.collapsed .logo {
  padding: 10px 10px 12px; /* 保持顶部padding一致 */
  justify-content: center;
  min-height: 60px; /* 保持高度一致 */
}

.sidebar.collapsed .logo-content {
  display: none;
}

.logo i {
  font-size: 24px;
  margin-right: 8px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.logo h1 {
  font-size: 20px;
  font-weight: 700;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.toggle-sidebar {
  background: none;
  border: none;
  color: white;
  font-size: 16px; /* 稍微减小字体，确保在圆圈中居中 */
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  outline: none; /* 取消默认outline */
  padding: 0; /* 移除padding，让图标完全居中 */
  border-radius: 50%; /* 圆形按钮 */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px; /* 增大背景圆圈 */
  height: 36px;
  position: relative;
  overflow: hidden; /* 确保波纹效果不超出圆形边界 */
  flex-shrink: 0; /* 防止按钮被压缩 */
}

.toggle-sidebar:hover {
  transform: scale(1.1);
}

.toggle-sidebar:focus {
  outline: none; /* 确保聚焦时也没有outline */
}

.toggle-sidebar:active {
  transform: scale(0.95);
}

/* 默认状态 - 透明背景 */
.toggle-sidebar {
  background-color: transparent;
}

/* 悬停状态 - 显示半透明背景 */
.toggle-sidebar:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

/* 聚焦状态 - 显示半透明背景 */
.toggle-sidebar:focus {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

/* 激活状态 - 显示更深的半透明背景 */
.toggle-sidebar:active {
  background-color: rgba(255, 255, 255, 0.2) !important;
}

/* 波纹扩散效果 */
.toggle-sidebar::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease, opacity 0.3s ease;
  pointer-events: none;
  opacity: 0;
}

.toggle-sidebar:active::before {
  width: 120px; /* 增大扩散范围 */
  height: 120px;
  opacity: 1;
}

/* 点击后自动扩散并消失 */
.toggle-sidebar.ripple::before {
  width: 120px;
  height: 120px;
  opacity: 1;
  transition: width 0.3s ease, height 0.3s ease, opacity 0.3s ease 0.1s;
}

.toggle-sidebar.ripple::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.4);
  transform: translate(-50%, -50%);
  animation: ripple 0.15s ease-out;
  pointer-events: none;
  z-index: 1;
}

@keyframes ripple {
  0% {
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    width: 80px;
    height: 80px;
    opacity: 0;
  }
}

.nav-section {
  margin-bottom: 16px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.nav-title {
  font-size: 12px;
  text-transform: uppercase;
  padding: 0 20px;
  margin-bottom: 6px;
  opacity: 0.7;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.nav-item {
  padding: 8px 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
}

.nav-item:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.nav-item.active {
  background-color: rgba(0, 0, 0, 0.15);
  border-left: 4px solid rgba(0, 0, 0, 0.8);
  transition: all 0.2s ease-out;
}

/* 浅色模式下选择主题色时，完全复用深色模式的样式 */
body:not(.dark) .sidebar[data-theme-color] .nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

body:not(.dark) .sidebar[data-theme-color] .nav-item.active {
  background-color: rgba(255, 255, 255, 0.15);
  border-left: 4px solid rgba(255, 255, 255, 0.8);
}

body:not(.dark) .sidebar[data-theme-color] .nav-item.active i,
body:not(.dark) .sidebar[data-theme-color] .nav-item.active span {
  color: inherit !important;
}

/* 确保浅色模式下主题色状态时，选中菜单项的背景是主题色的亮色版本 */
body:not(.dark) .sidebar[data-theme-color] .nav-item.active {
  background-color: rgba(255, 255, 255, 0.2) !important;
}

.nav-item.active i,
.nav-item.active span {
  color: inherit !important;
}

/* 确保涟漪效果在所有状态下都能显示 */
.nav-item.nav-ripple {
  position: relative;
}

.nav-item i {
  margin-right: 10px;
  font-size: 16px;
  width: 20px;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.nav-item span {
  font-size: 14px;
}

/* 导航项涟漪效果 - 从左到右扩散 */
.nav-item.nav-ripple::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.4);
  border-radius: 8px;
  animation: navRipple 0.2s ease-out;
  pointer-events: none;
  z-index: 10;
  display: block !important;
  opacity: 1;
}

.nav-item.nav-ripple::after {
  animation: navRipple 0.2s ease-out forwards;
}

@keyframes navRipple {
  0% {
    width: 0;
    opacity: 1;
  }
  100% {
    width: 100%;
    opacity: 0;
  }
}

/* 全局涟漪动画 */
@keyframes globalNavRipple {
  0% {
    width: 0;
    opacity: 1;
  }
  100% {
    width: 100%;
    opacity: 0;
  }
}

.search-box {
  padding: 0 20px;
  margin-bottom: 12px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box input {
  width: 100%;
  padding: 8px 65px 8px 12px; /* 减少内边距，适配更小的按钮 */
  border-radius: 6px;
  border: none;
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  font-size: 13px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  outline: none; /* 取消outline */
}

.search-box input:focus {
  outline: none;
  background-color: rgba(255, 255, 255, 0.2);
}

.search-box input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.search-buttons {
  position: absolute;
  right: 8px;
  display: flex;
  gap: 4px;
}

.clear-btn,
.search-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%; /* 圆形按钮 */
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  outline: none;
  padding: 0; /* 确保图标完全居中 */
  position: relative;
  overflow: hidden; /* 确保波纹效果不超出圆形边界 */
  font-size: 12px;
}

.clear-btn:focus,
.search-btn:focus {
  outline: none;
  background-color: rgba(255, 255, 255, 0.3);
}

.clear-btn:hover,
.search-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.clear-btn:active,
.search-btn:active {
  transform: scale(0.95);
}

/* 确保搜索按钮点击后背景立即消失 */
.clear-btn:not(:hover):not(:focus):not(:active),
.search-btn:not(:hover):not(:focus):not(:active) {
  background-color: rgba(255, 255, 255, 0.2);
}

/* 搜索按钮波纹扩散效果 */
.clear-btn::before,
.search-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.4);
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease; /* 加快扩散速度 */
  pointer-events: none;
  opacity: 0;
}

.clear-btn:active::before,
.search-btn:active::before {
  width: 80px; /* 增大扩散范围 */
  height: 80px;
  opacity: 1;
}

/* 搜索按钮涟漪动画 */
.clear-btn.ripple::after,
.search-btn.ripple::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.4);
  transform: translate(-50%, -50%);
  animation: rippleSearch 0.12s ease-out;
  pointer-events: none;
  z-index: 1;
}

@keyframes rippleSearch {
  0% {
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    width: 50px;
    height: 50px;
    opacity: 0;
  }
}

.clear-btn i,
.search-btn i {
  font-size: 12px;
}

.ai-tag {
  background-color: #f25f5c;
  color: white;
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 20px;
  margin-left: auto;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.color-picker {
  display: flex;
  padding: 0 20px;
  margin-top: 20px;
  gap: 10px;
  flex-wrap: wrap;
}

.color-option {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 2px solid transparent;
}

.color-option:hover {
  transform: scale(1.2);
}

.color-option.active {
  border-color: white;
  transform: scale(1.2);
}

/* 主题颜色菜单项样式 */
.theme-color-item {
  position: relative;
}

.current-color {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.sidebar.collapsed .current-color {
  right: 50%;
  transform: translate(50%, -50%);
  width: 16px;
  height: 16px;
}

.theme-color-item:hover .current-color {
  transform: translateY(-50%) scale(1.1);
}

.sidebar.collapsed .theme-color-item:hover .current-color {
  transform: translate(50%, -50%) scale(1.1);
}


/* 搜索模态框 */
.search-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.4s cubic-bezier(0.28, 0.11, 0.32, 1),
              background-color 0.4s cubic-bezier(0.28, 0.11, 0.32, 1);
  margin: 0;
  padding: 0;
  transform: none;
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
}

.search-modal.active {
  opacity: 1;
  visibility: visible;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.search-modal-content {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  transform: scale(0.8) translateY(20px);
  opacity: 0;
  transition: transform 0.5s cubic-bezier(0.28, 0.11, 0.32, 1),
              opacity 0.5s cubic-bezier(0.28, 0.11, 0.32, 1);
  will-change: transform, opacity;
}

.search-modal.active .search-modal-content {
  transform: scale(1) translateY(0);
  opacity: 1;
}

.search-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 0.5s cubic-bezier(0.28, 0.11, 0.32, 1) 0.1s,
              transform 0.5s cubic-bezier(0.28, 0.11, 0.32, 1) 0.1s;
}

.search-modal.active .search-modal-header {
  opacity: 1;
  transform: translateY(0);
}

.search-modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 20px;
  font-weight: 600;
}

.search-modal-body {
  width: 100%;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.5s cubic-bezier(0.28, 0.11, 0.32, 1) 0.15s,
              transform 0.5s cubic-bezier(0.28, 0.11, 0.32, 1) 0.15s;
}

.search-modal.active .search-modal-body {
  opacity: 1;
  transform: translateY(0);
}

.search-input-wrapper-modal {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input-wrapper-modal input {
  width: 100%;
  padding: 12px 80px 12px 15px;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  background-color: #f5f5f5;
  color: #000000;
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.28, 0.11, 0.32, 1);
  outline: none;
}

.search-input-wrapper-modal input:focus {
  border-color: var(--primary-color);
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(91, 107, 240, 0.1);
  transform: scale(1.01);
}

.search-input-wrapper-modal input::placeholder {
  color: #999;
}

.search-buttons-modal {
  position: absolute;
  right: 8px;
  display: flex;
  gap: 4px;
}

.clear-btn-modal,
.search-btn-modal {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background-color: rgba(91, 107, 240, 0.1);
  color: var(--primary-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  outline: none;
  padding: 0;
}

.clear-btn-modal:hover,
.search-btn-modal:hover {
  background-color: rgba(91, 107, 240, 0.2);
  transform: scale(1.05);
}

.clear-btn-modal:active,
.search-btn-modal:active {
  transform: scale(0.95);
}

.clear-btn-modal i,
.search-btn-modal i {
  font-size: 12px;
}

/* 深色模式下的搜索模态框 */
body.dark .search-modal-content {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
}

body.dark .search-modal-header h3 {
  color: var(--color-text-primary);
}

body.dark .search-input-wrapper-modal input {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-border);
  color: var(--color-text-primary);
}

body.dark .search-input-wrapper-modal input:focus {
  border-color: var(--primary-color);
  background-color: var(--color-bg-primary);
}

body.dark .search-input-wrapper-modal input::placeholder {
  color: var(--color-text-secondary);
}

body.dark .clear-btn-modal,
body.dark .search-btn-modal {
  background-color: rgba(91, 107, 240, 0.2);
  color: var(--primary-color);
}

body.dark .clear-btn-modal:hover,
body.dark .search-btn-modal:hover {
  background-color: rgba(91, 107, 240, 0.3);
}

/* 窄屏模式下的搜索模态框 */
@media (max-width: 768px) {
  .search-modal-content {
    max-width: 90%;
    padding: 20px;
  }
  
  .search-modal-header h3 {
    font-size: 18px;
  }
}

/* 颜色选择模态框 */
.color-picker-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000; /* 提高层级，确保在侧边栏之上 */
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  /* 确保模态框脱离任何父元素的定位上下文 */
  margin: 0;
  padding: 0;
  transform: none;
}

.color-picker-modal.active {
  opacity: 1;
  visibility: visible;
}

.modal-content {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 30px;
  max-width: 600px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  transform: scale(0.9);
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.color-picker-modal.active .modal-content {
  transform: scale(1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
image.png
.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 20px;
  font-weight: 600;
}

/* 主题模式部分 */
.theme-mode-section {
  margin-bottom: 30px;
}

.theme-mode-section h4 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.theme-tip {
  margin: 0 0 15px 0;
  color: #666;
  font-size: 12px;
  line-height: 1.4;
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 3px solid #5b6bf0;
}

.theme-mode-options {
  display: flex;
  gap: 20px;
}

.theme-mode-option {
  flex: 1;
  padding: 20px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  text-align: center;
}

.theme-mode-option:hover {
  border-color: #ccc;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.theme-mode-option.active {
  border-color: var(--primary-color);
  background-color: #f0f7ff;
  box-shadow: 0 4px 12px rgba(91, 107, 240, 0.2);
}

.mode-preview {
  margin-bottom: 15px;
  display: flex;
  justify-content: center;
}

.preview-window {
  width: 60px;
  height: 40px;
  border-radius: 6px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.preview-window.light {
  background-color: #ffffff;
}

.preview-window.dark {
  background-color: #1a1a1a;
  border-color: rgba(255, 255, 255, 0.2);
}

.preview-header {
  height: 12px;
  background-color: #f0f0f0;
  border-bottom: 1px solid #e0e0e0;
}

.preview-window.dark .preview-header {
  background-color: #333333;
  border-bottom-color: #555555;
}

.preview-content {
  height: 24px;
  background-color: #ffffff;
}

.preview-window.dark .preview-content {
  background-color: #000000;
}

.mode-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.mode-info i {
  font-size: 20px;
  color: #666;
}

.theme-mode-option.active .mode-info i {
  color: var(--primary-color);
}

.mode-info span {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

/* 主题颜色部分 */
.theme-color-section h4 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  min-width: 32px;
  min-height: 32px;
  max-width: 32px;
  max-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: #f0f0f0;
  color: #333;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 30px 25px;
  margin-top: 20px;
}

.color-option-modal {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 3px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin: 0 auto;
}

.color-option-modal:hover {
  transform: scale(1.1);
  border-color: rgba(0, 0, 0, 0.2);
}

.color-option-modal.active {
  border-color: #333;
  transform: scale(1.1);
}

.color-option-modal.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.color-option-modal i {
  color: white;
  font-size: 16px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.color-name {
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  font-weight: 500;
  text-align: center;
  width: 80px;
  line-height: 1.2;
}

/* 深色模式模态框 */
body.dark .modal-content {
  background-color: #1a1a1a;
  color: #e9ecef;
}

body.dark .modal-header h3 {
  color: #e9ecef;
}

body.dark .close-btn {
  color: #cccccc;
}

body.dark .close-btn:hover {
  background-color: #333;
  color: #ffffff;
}

body.dark .color-option-modal.active {
  border-color: #ffffff;
}

body.dark .color-name {
  color: #cccccc;
}

/* 深色模式下的主题模式选项 */
body.dark .theme-mode-section h4 {
  color: #e9ecef;
}

body.dark .theme-tip {
  color: #cccccc;
  background: #1a1a1a;
  border-left-color: #5b6bf0;
}

/* 深色模式下的导航项交互效果 */
body.dark .nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

body.dark .nav-item.active {
  background-color: rgba(255, 255, 255, 0.15);
  border-left: 4px solid rgba(255, 255, 255, 0.8);
}

body.dark .nav-item.active i,
body.dark .nav-item.active span {
  color: inherit !important;
}

body.dark .theme-mode-option {
  border-color: #333333;
  background-color: #1a1a1a;
}

body.dark .theme-mode-option:hover {
  border-color: #555555;
  background-color: #2a2a2a;
}

body.dark .theme-mode-option.active {
  border-color: var(--primary-color);
  background-color: #1a1a2a;
}

body.dark .mode-info i {
  color: #cccccc;
}

body.dark .mode-info span {
  color: #e9ecef;
}

body.dark .theme-color-section h4 {
  color: #e9ecef;
}

body.dark .color-option-modal.disabled {
  opacity: 0.3;
  cursor: not-allowed;
  pointer-events: none;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    height: 100%;
    transform: translateX(-100%);
    z-index: 200;
    width: 280px !important; /* 移动端固定宽度，覆盖collapsed状态 */
  }
  
  /* mobile-open时显示侧边栏，无论collapsed状态如何 */
  .sidebar.mobile-open {
    transform: translateX(0);
  }
  
  /* 移动端打开时，忽略collapsed状态，始终显示完整布局 */
  .sidebar.mobile-open.collapsed {
    width: 280px !important;
  }
  
  .sidebar.mobile-open.collapsed .logo h1,
  .sidebar.mobile-open.collapsed .nav-title,
  .sidebar.mobile-open.collapsed .nav-item span,
  .sidebar.mobile-open.collapsed .ai-tag,
  .sidebar.mobile-open.collapsed .search-box,
  .sidebar.mobile-open.collapsed .color-picker {
    display: block !important;
  }
  
  .sidebar.mobile-open.collapsed .nav-item {
    justify-content: flex-start !important;
    padding: 12px 20px !important;
  }
  
  .sidebar.mobile-open.collapsed .nav-item i {
    margin-right: 12px !important;
    font-size: 18px !important;
  }
  
  .sidebar.mobile-open.collapsed .logo {
    padding: 0 20px 20px !important;
    justify-content: space-between !important;
  }
  
  .sidebar.mobile-open.collapsed .logo-content {
    display: flex !important;
  }
  
  /* 移动端搜索按钮优化 */
  .search-btn {
    width: 32px;
    height: 32px;
  }
  
  .clear-btn {
    width: 32px;
    height: 32px;
  }
  
  .search-box input {
    padding: 12px 90px 12px 15px; /* 移动端也需要更多空间 */
  }
  
  /* 窄屏模式下模态框样式优化 - 确保在屏幕居中 */
  .color-picker-modal {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    z-index: 10000 !important; /* 确保在侧边栏之上 */
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    margin: 0 !important;
    padding: 0 !important;
    transform: none !important; /* 确保不受父元素transform影响 */
    width: 100vw !important;
    height: 100vh !important;
  }
  
  .modal-content {
    position: relative !important;
    max-width: 90vw !important;
    width: 90vw !important;
    padding: 20px;
    transform: scale(0.85); /* 缩小比例 */
    max-height: 85vh;
    overflow-y: auto;
    margin: 0 !important;
  }
  
  .color-picker-modal.active .modal-content {
    transform: scale(0.9); /* 激活时稍微放大，但仍然比默认小 */
  }
  
  .modal-header {
    margin-bottom: 15px;
  }
  
  .modal-header h3 {
    font-size: 18px;
  }
  
  .theme-mode-section {
    margin-bottom: 20px;
  }
  
  .theme-mode-section h4,
  .theme-color-section h4 {
    font-size: 14px;
  }
  
  .theme-tip {
    font-size: 11px;
    padding: 6px 10px;
  }
  
  .theme-mode-option {
    padding: 15px;
  }
  
  .color-option-modal {
    width: 40px;
    height: 40px;
  }
}
</style>