import { ref } from 'vue'

export function useSidebarNavigation() {
  const activeSection = ref('home')
  const activeTool = ref('')

  const setActiveSection = (section: string) => {
    activeSection.value = section
    activeTool.value = ''
  }

  const setActiveTool = (tool: string) => {
    activeTool.value = tool
    activeSection.value = ''
  }

  return {
    activeSection,
    activeTool,
    setActiveSection,
    setActiveTool
  }
}

