import { ref, watch, onMounted } from 'vue'

export const THEME_COLORS = [
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

export function useSidebarTheme(
  isDark: { value: boolean },
  onColorChange?: (color: string) => void
) {
  const selectedColor = ref('#5b6bf0')
  const showColorPicker = ref(false)
  const userSelectedThemeColor = ref(false)

  onMounted(() => {
    const mode = localStorage.getItem('sidebar-mode')
    const savedColor = localStorage.getItem('theme-color') || localStorage.getItem('sidebarThemeColor')
    const sidebar = document.querySelector('.sidebar') as HTMLElement
    if (mode === 'color' && savedColor) {
      selectedColor.value = savedColor
      userSelectedThemeColor.value = true
      localStorage.setItem('theme-color', savedColor)
      localStorage.setItem('sidebarThemeColor', savedColor)
      updateSidebarBackground()
    } else {
      userSelectedThemeColor.value = false
      selectedColor.value = '#5b6bf0'
      if (sidebar) {
        sidebar.removeAttribute('data-theme-color')
        if (isDark.value) {
          sidebar.style.background = 'linear-gradient(135deg, #1a1a1a, #2d2d2d)'
        } else {
          sidebar.style.background = '#ffffff'
        }
      }
    }
  })

  const selectColor = (color: string) => {
    selectedColor.value = color
    userSelectedThemeColor.value = true
    // 同时保存到两个key，确保兼容性
    localStorage.setItem('sidebarThemeColor', color)
    localStorage.setItem('theme-color', color)
    updateSidebarBackground()
    if (onColorChange) {
      onColorChange(color)
    }
  }

  const updateSidebarBackground = () => {
    const sidebar = document.querySelector('.sidebar') as HTMLElement
    if (sidebar && userSelectedThemeColor.value) {
      sidebar.setAttribute('data-theme-color', selectedColor.value)
      
      // 计算渐变色
      const baseColor = selectedColor.value
      const darkerColor = darkenColor(baseColor, 15)
      sidebar.style.background = `linear-gradient(135deg, ${baseColor}, ${darkerColor})`
      
      // 根据背景色亮度设置文字颜色
      const textColor = getTextColorForTheme(baseColor)
      sidebar.style.setProperty('--sidebar-text-color', textColor)
      sidebar.style.setProperty('--sidebar-text-secondary', textColor === '#ffffff' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)')
      sidebar.style.setProperty('--sidebar-text-hover', textColor === '#ffffff' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)')
      sidebar.style.setProperty('--sidebar-text-active', textColor === '#ffffff' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)')
      sidebar.style.setProperty('--sidebar-border-color', textColor === '#ffffff' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')
      
      // 更新所有文字和图标颜色
      updateTextColors(sidebar, textColor)
    }
  }

  const updateTextColors = (sidebar: HTMLElement, textColor: string) => {
    // 使用CSS变量，让CSS样式自动应用
    // 这里主要是确保CSS变量被设置，实际的样式由CSS文件中的选择器处理
    const secondaryColor = textColor === '#ffffff' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
    const hoverBg = textColor === '#ffffff' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
    const activeBg = textColor === '#ffffff' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'
    const borderColor = textColor === '#ffffff' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
    
    sidebar.style.setProperty('--sidebar-text-color', textColor)
    sidebar.style.setProperty('--sidebar-text-secondary', secondaryColor)
    sidebar.style.setProperty('--sidebar-text-hover', hoverBg)
    sidebar.style.setProperty('--sidebar-text-active', activeBg)
    sidebar.style.setProperty('--sidebar-border-color', borderColor)
  }

  const darkenColor = (color: string, percent: number): string => {
    const num = parseInt(color.replace('#', ''), 16)
    const R = (num >> 16) + Math.round(2.55 * percent * -1)
    const G = (num >> 8 & 0x00FF) + Math.round(2.55 * percent * -1)
    const B = (num & 0x0000FF) + Math.round(2.55 * percent * -1)
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)
  }

  const getTextColorForTheme = (color: string): string => {
    const num = parseInt(color.replace('#', ''), 16)
    const r = (num >> 16) / 255
    const g = (num >> 8 & 0x00FF) / 255
    const b = (num & 0x0000FF) / 255
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 0.5 ? '#000000' : '#ffffff'
  }

  watch(() => isDark.value, () => {
    if (!userSelectedThemeColor.value) {
      const sidebar = document.querySelector('.sidebar') as HTMLElement
      if (sidebar) {
        sidebar.removeAttribute('data-theme-color')
        // 根据当前主题模式设置背景
        if (isDark.value) {
          // 深色模式：使用深色渐变
          sidebar.style.background = 'linear-gradient(135deg, #1a1a1a, #2d2d2d)'
        } else {
          // 浅色模式：使用白色背景
          sidebar.style.background = '#ffffff'
        }
      }
    } else {
      // 如果用户选择了主题色，更新背景
      updateSidebarBackground()
    }
  })

  return {
    selectedColor,
    showColorPicker,
    userSelectedThemeColor,
    selectColor,
    toggleColorPicker: () => { showColorPicker.value = !showColorPicker.value },
    closeColorPicker: () => { showColorPicker.value = false },
    updateSidebarBackground,
    getTextColorForTheme
  }
}

