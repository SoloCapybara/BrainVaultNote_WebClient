import { computed, ref, onMounted, watch } from 'vue'
import { useNotesStore } from './useNotesStore'
import type { MockNote } from '../mock/notes'

interface NoteItem {
  id: number | string
  title: string
  preview: string
  date: string
  wordCount?: number
  tags?: string[]
  isAI?: boolean
  [key: string]: any
}

interface NotesListProps {
  collapsed?: boolean
}

type NotesListEmit = {
  (event: 'toggle-collapse'): void
  (event: 'select-note', note: NoteItem): void
}

export function useNotesList(props: NotesListProps, emit: NotesListEmit) {
  const {
    notes,
    activeNote,
    selectNote: selectNoteInStore,
    createNote: createNoteInStore
  } = useNotesStore()

  const showNoteTypeMenu = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const selectedNoteId = ref<number | string | null>(activeNote.value?.id ?? null)

  const notesCount = computed(() => notes.value.length)

  const paginatedNotes = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return notes.value.slice(start, end)
  })

  const createNote = (noteType: 'richText' | 'markdown') => {
    showNoteTypeMenu.value = false
    const newNote = createNoteInStore(noteType)
    selectedNoteId.value = newNote.id
    emit('select-note', newNote)
  }

  const selectNote = (note: NoteItem) => {
    selectedNoteId.value = note.id
    selectNoteInStore(note as MockNote)
    emit('select-note', note)
  }

  const handlePageChange = (page: number) => {
    currentPage.value = page
  }

  const handlePageSizeChange = (newPageSize: number) => {
    pageSize.value = newPageSize
    currentPage.value = 1
  }

  const getRelativeDate = (date: string) => {
    const now = new Date()
    const noteDate = new Date(date)
    const diffTime = Math.abs(now.getTime() - noteDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return '今天'
    if (diffDays === 2) return '昨天'
    if (diffDays <= 7) return `${diffDays - 1}天前`
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)}周前`
    return `${Math.floor(diffDays / 30)}个月前`
  }

  onMounted(() => {
    if (activeNote.value) {
      selectedNoteId.value = activeNote.value.id
      selectNoteInStore(activeNote.value as MockNote)
      emit('select-note', activeNote.value)
    } else if (notes.value.length > 0) {
      const firstNote = notes.value[0]
      if (firstNote) {
        selectNote(firstNote)
      }
    }
  })

  watch(activeNote, (note) => {
    if (note) {
      selectedNoteId.value = note.id
    } else {
      selectedNoteId.value = null
    }
  })

  return {
    showNoteTypeMenu,
    paginatedNotes,
    notesCount,
    currentPage,
    pageSize,
    createNote,
    selectNote,
    handlePageChange,
    handlePageSizeChange,
    getRelativeDate,
    selectedNoteId,
    activeNote
  }
}

