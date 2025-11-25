import { ref } from 'vue'
import { mockNotes, type MockNote } from '../mock/notes'

const cloneNote = (note: MockNote): MockNote => ({
  ...note,
  tags: Array.isArray(note.tags) ? [...note.tags] : []
})

const notes = ref<MockNote[]>(mockNotes.map(note => ({ ...note })))
const initialActiveNote = notes.value.length > 0 ? cloneNote(notes.value[0] as MockNote) : null
const activeNote = ref<MockNote | null>(initialActiveNote)

const selectNote = (note: MockNote | null) => {
  activeNote.value = note ? cloneNote(note) : null
}

const selectNoteById = (id: MockNote['id']) => {
  const target = notes.value.find(note => note.id === id)
  if (target) {
    selectNote(target)
    return cloneNote(target)
  }
  return null
}

const createNote = (noteType: 'richText' | 'markdown' = 'richText') => {
  const dateString = new Date().toISOString().split('T')[0] || ''
  const newNote: MockNote = {
    id: Date.now(),
    title: noteType === 'markdown' ? '新建 Markdown 笔记' : '新建文档',
    content: '',
    preview: '',
    tags: [],
    date: dateString,
    wordCount: 0,
    isAI: false,
    noteType
  }

  notes.value.unshift(newNote)
  selectNote(newNote)

  return cloneNote(newNote)
}

const updateNote = (note: MockNote) => {
  const updated = cloneNote(note)
  const index = notes.value.findIndex(n => n.id === updated.id)

  if (index !== -1) {
    notes.value[index] = updated
  } else {
    notes.value.unshift(updated)
  }

  if (activeNote.value && activeNote.value.id === updated.id) {
    Object.assign(activeNote.value, updated)
  }
}

export function useNotesStore() {
  return {
    notes,
    activeNote,
    selectNote,
    selectNoteById,
    createNote,
    updateNote
  }
}

