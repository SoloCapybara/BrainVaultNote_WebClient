import { ref } from 'vue'
import { mockNotes, type MockNote } from '../mock/notes'

//克隆笔记(产生干净副本，防止修改模拟源数据)
const cloneNote = (note: MockNote): MockNote => ({
  ...note,
  tags: Array.isArray(note.tags) ? [...note.tags] : []
})

//所有模拟笔记数据
const notes = ref<MockNote[]>(mockNotes.map(note => ({ ...note }))) 
//初始化选中笔记
const initialActiveNote = notes.value.length > 0 ? cloneNote(notes.value[0] as MockNote) : null
//选中笔记
const activeNote = ref<MockNote | null>(initialActiveNote)

//选中单条笔记
const selectNote = (note: MockNote | null) => {
  //如果有传入note就直接使用克隆赋值给activeNote，否则赋值为null
  activeNote.value = note ? cloneNote(note) : null
}

//选中单条笔记(根据id)
const selectNoteById = (id: MockNote['id']) => {
  const target = notes.value.find(note => note.id === id)
  //如果找到笔记，则选中笔记，并返回克隆后的笔记
  if (target) {
    //选中笔记
    selectNote(target)
    //返回克隆后的笔记
    return cloneNote(target)
  }
  return null
}

//创建新笔记
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

//更新笔记
const updateNote = (note: MockNote) => {
  const updated = cloneNote(note)
  //找到笔记在notes数组中的索引
  const index = notes.value.findIndex(n => n.id === updated.id)
  //如果找到笔记，则更新笔记
  if (index !== -1) {
    notes.value[index] = updated
  } else {
    //如果没找到笔记，则将笔记添加到notes数组的开头
    notes.value.unshift(updated)
  }

  //如果选中笔记的id与更新笔记的id相同，则更新选中笔记
  if (activeNote.value && activeNote.value.id === updated.id) {
    Object.assign(activeNote.value, updated)
  }
}

//导出所有笔记操作函数
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

