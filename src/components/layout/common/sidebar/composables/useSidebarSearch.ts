import { ref, nextTick } from 'vue'

export function useSidebarSearch(onSearch?: (query: string) => void) {
  const searchQuery = ref('')
  const searchInput = ref<HTMLInputElement | null>(null)

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery.value)
    }
  }

  const clearSearch = () => {
    searchQuery.value = ''
    if (onSearch) {
      onSearch('')
    }
  }

  return {
    searchQuery,
    searchInput,
    handleSearch,
    clearSearch
  }
}

