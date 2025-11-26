import { computed, ref, onMounted, watch } from 'vue'
import { useNotesStore } from './useNotesStore'
import type { MockNote } from '../mock/notes'

//笔记项接口
interface NoteItem {
  id: number | string | null | undefined //笔记id
  title: string //笔记标题
  preview: string //笔记预览
  date: string //笔记日期
  wordCount?: number //笔记字数
  tags?: string[] //笔记标签
  isAI?: boolean //是否是AI笔记
  [key: string]: any //其他属性
}

//笔记列表组件Props接口
interface NotesListProps {
  collapsed?: boolean
}

//笔记列表组件Emit接口
type NotesListEmit = {
  //折叠状态变化
  (event: 'toggle-collapse'): void
  //选中笔记
  (event: 'select-note', note: NoteItem): void
}

//笔记列表组件Composable函数
export function useNotesList(props: NotesListProps, emit: NotesListEmit) {
  //使用笔记存储
  const {
    notes,
    activeNote,
    selectNote: selectNoteInStore,
    createNote: createNoteInStore
  } = useNotesStore()

  //是否显示笔记类型菜单
  const showNoteTypeMenu = ref(false)
  //当前页码
  const currentPage = ref(1)
  //每页笔记数量
  const pageSize = ref(10)
  //选中笔记id
  const selectedNoteId = ref<number | string | null>(activeNote.value?.id ?? null)

  //笔记总数
  const notesCount = computed(() => notes.value.length)

  //分页笔记
  const paginatedNotes = computed(() => {
    //计算起始索引和结束索引
    const start = (currentPage.value - 1) * pageSize.value
    //计算结束索引
    const end = start + pageSize.value
    //返回分页后的笔记
    return notes.value.slice(start, end)
  })

  //创建笔记
  const createNote = (noteType: 'richText' | 'markdown') => {
    //隐藏笔记类型菜单
    showNoteTypeMenu.value = false
    //创建新笔记
    const newNote = createNoteInStore(noteType)
    //选中新笔记
    selectedNoteId.value = newNote.id
    //选中笔记
    emit('select-note', newNote)
  }

  //选中笔记
  const selectNote = (note: NoteItem) => {
    console.log("选中笔记", note)
    //选中笔记id
    selectedNoteId.value = (note.id ?? null) as number | string | null
    //选中笔记
    selectNoteInStore(note as MockNote)
    //触发选中笔记事件
    emit('select-note', note)
  }

  //切换页码
  const handlePageChange = (page: number) => {
    currentPage.value = page
  }

  //切换每页笔记数量
  const handlePageSizeChange = (newPageSize: number) => {
    //设置每页笔记数量
    pageSize.value = newPageSize
    //重置当前页码为1
    currentPage.value = 1
  }

  //获取相对日期
  const getRelativeDate = (date: string) => {
    //获取当前日期
    const now = new Date()
    //获取笔记日期
    const noteDate = new Date(date)
    const diffTime = Math.abs(now.getTime() - noteDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    //判断日期差值
    if (diffDays === 1) return '今天'
    if (diffDays === 2) return '昨天'
    if (diffDays <= 7) return `${diffDays - 1}天前`
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)}周前`
    return `${Math.floor(diffDays / 30)}个月前`
  }

  //组件挂载时
  onMounted(() => {
    //如果选中笔记
    if (activeNote.value) {
      //选中笔记id
      selectedNoteId.value = activeNote.value.id
      //选中笔记
      selectNoteInStore(activeNote.value as MockNote)
      //触发选中笔记事件
      emit('select-note', activeNote.value)
    } else if (notes.value.length > 0) {
      //获取第一条笔记
      const firstNote = notes.value[0]
      if (firstNote) {
        selectNote(firstNote)
      }
    }
  })

  //监听选中笔记
  watch(activeNote, (note) => {
    if (note) {
      //选中笔记id
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

