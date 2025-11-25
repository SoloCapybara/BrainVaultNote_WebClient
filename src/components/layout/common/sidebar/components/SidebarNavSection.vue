<template>
  <div class="nav-section">
    <div class="nav-title" v-if="title">{{ title }}</div>
    <div 
      v-for="item in items"
      :key="item.id"
      class="nav-item"
      :class="{ 
        active: isActive(item),
        'theme-color-item': item.type === 'theme-color'
      }"
      @click="handleClick(item, $event)"
    >
      <i :class="item.icon"></i>
      <span v-if="!collapsed">
        <template v-if="item.type === 'theme-color'">
          {{ themeColorLabel || item.label }}
        </template>
        <template v-else>
          {{ item.label }}
        </template>
      </span>
      <span v-if="item.badge && !collapsed" class="ai-tag">{{ item.badge }}</span>
      <div 
        v-if="item.type === 'theme-color' && !collapsed && userSelectedThemeColor && selectedColor"
        class="current-color" 
        :style="{ backgroundColor: selectedColor }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, computed } from 'vue'
import { THEME_COLORS } from '../composables/useSidebarTheme'

interface NavItem {
  id: string
  label: string
  icon: string
  type?: 'section' | 'tool' | 'theme-color' | 'action'
  badge?: string
}

const props = defineProps<{
  title?: string
  items: NavItem[]
  collapsed: boolean
  activeSection?: string | undefined
  activeTool?: string | undefined
  selectedColor?: string | undefined
  isDark?: boolean
  userSelectedThemeColor?: boolean
}>()

// 根据颜色值获取颜色名称
const getColorName = (colorValue: string): string => {
  const color = THEME_COLORS.find(c => c.value === colorValue)
  return color ? color.name : '自定义'
}

// 计算主题色显示文本
const themeColorLabel = computed(() => {
  if (props.items.some(item => item.type === 'theme-color')) {
    if (props.userSelectedThemeColor && props.selectedColor) {
      // 选择了侧边栏颜色
      const colorName = getColorName(props.selectedColor)
      const themeMode = props.isDark ? '深色主题' : '浅色主题'
      return `${themeMode}+${colorName}`
    } else {
      // 只选择了主题模式
      return props.isDark ? '深色主题' : '浅色主题'
    }
  }
  return ''
})

const emit = defineEmits<{
  'item-click': [item: NavItem, event: Event]
}>()

const isActive = (item: NavItem) => {
  if (item.type === 'section') {
    return props.activeSection === item.id
  } else if (item.type === 'tool') {
    return props.activeTool === item.id
  }
  return false
}

const handleClick = async (item: NavItem, event: Event) => {
  // 添加涟漪效果
  const navItem = event.currentTarget as HTMLElement
  if (navItem) {
    const isDark = document.body.classList.contains('dark')
    const rippleColor = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.3)'
    
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
    
    navItem.offsetHeight
    
    requestAnimationFrame(() => {
      ripple.style.transform = 'translateX(100%)'
    })
    
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple)
      }
    }, 200)
  }
  
  await nextTick()
  setTimeout(() => {
    emit('item-click', item, event)
  }, 100)
}
</script>

<style scoped>
.nav-section {
  margin-bottom: 8px;
  flex-shrink: 0;
}

.nav-title {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 20px 8px;
  margin-bottom: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
  background-color: rgba(255, 255, 255, 0.15);
  border-left-color: white;
  color: white;
}

.nav-item i {
  font-size: 18px;
  margin-right: 12px;
  width: 20px;
  text-align: center;
}

.nav-item span {
  flex: 1;
  font-size: 14px;
}

.ai-tag {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
  font-weight: 600;
}

.theme-color-item {
  justify-content: space-between;
}

.current-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  margin-left: 8px;
}

/* 浅色模式 - 只在没有主题色时应用 */
body:not(.dark) .sidebar:not([data-theme-color]) .nav-title {
  color: #666666;
}

body:not(.dark) .sidebar:not([data-theme-color]) .nav-item {
  color: #333333;
}

body:not(.dark) .sidebar:not([data-theme-color]) .nav-item:hover {
  background-color: #f5f5f5;
}

body:not(.dark) .sidebar:not([data-theme-color]) .nav-item.active {
  background-color: #e3f2fd;
  color: #1976d2;
  border-left-color: #1976d2;
}

body:not(.dark) .sidebar:not([data-theme-color]) .ai-tag {
  background: rgba(0, 0, 0, 0.1);
  color: #333333;
}

body:not(.dark) .sidebar:not([data-theme-color]) .current-color {
  border-color: rgba(0, 0, 0, 0.2);
}

/* 有主题色时的样式 - 使用CSS变量 */
.sidebar[data-theme-color] .nav-title {
  color: var(--sidebar-text-secondary, rgba(255, 255, 255, 0.7));
}

.sidebar[data-theme-color] .nav-item {
  color: var(--sidebar-text-color, rgba(255, 255, 255, 0.9));
}

.sidebar[data-theme-color] .nav-item i {
  color: var(--sidebar-text-color, rgba(255, 255, 255, 0.9));
}

.sidebar[data-theme-color] .nav-item:hover {
  background-color: var(--sidebar-text-hover, rgba(255, 255, 255, 0.1));
}

.sidebar[data-theme-color] .nav-item.active {
  background-color: var(--sidebar-text-active, rgba(255, 255, 255, 0.15));
  color: var(--sidebar-text-color, #ffffff);
  border-left-color: var(--sidebar-text-color, #ffffff);
}

.sidebar[data-theme-color] .ai-tag {
  background: var(--sidebar-text-hover, rgba(255, 255, 255, 0.2));
  color: var(--sidebar-text-color, #ffffff);
}

.sidebar[data-theme-color] .current-color {
  border-color: var(--sidebar-text-secondary, rgba(255, 255, 255, 0.3));
}

/* 折叠状态 */
.sidebar.collapsed .nav-title,
.sidebar.collapsed .nav-item span,
.sidebar.collapsed .ai-tag,
.sidebar.collapsed .current-color {
  display: none;
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 10px;
}

.sidebar.collapsed .nav-item i {
  margin-right: 0;
}
</style>

