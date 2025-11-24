import { ref } from 'vue'

export function useThemeFinal() {
  // 立即加载保存的主题，而不是等到组件挂载
  const loadTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      return true
    } else if (savedTheme === 'light') {
      return false
    } else {
      // 默认使用浅色模式
      return false
    }
  }
  
  const isDark = ref(loadTheme()) // 立即加载保存的主题
  
  const toggleTheme = () => {
    isDark.value = !isDark.value
    applyTheme()
    saveTheme()
  }
  
  const setTheme = (theme: 'light' | 'dark') => {
    isDark.value = theme === 'dark'
    applyTheme()
    saveTheme()
  }
  
  const applyTheme = () => {
    const body = document.body
    const html = document.documentElement
    
    if (isDark.value) {
      // 深色主题
      html.style.backgroundColor = '#000000'
      html.style.color = '#ffffff'
      body.style.backgroundColor = '#000000'
      body.style.color = '#ffffff'
      body.classList.add('dark')
    } else {
      // 浅色主题
      html.style.backgroundColor = '#ffffff'
      html.style.color = '#333333'
      body.style.backgroundColor = '#ffffff'
      body.style.color = '#333333'
      body.classList.remove('dark')
    }
  }
  
  const saveTheme = () => {
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }
  
  // 立即应用主题（在模块加载时）
  if (typeof document !== 'undefined') {
    applyTheme()
  }
  
  return {
    isDark,
    toggleTheme,
    setTheme
  }
}
