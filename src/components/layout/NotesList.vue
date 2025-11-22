<template>
  <div class="notes-list">
    <div class="notes-header">
      <h2>我的笔记</h2>
      <button class="new-note-btn" @click="$emit('new-note')">
        <i class="fas fa-plus"></i> 新建笔记
      </button>
    </div>
    
    <div class="notes-container">
      <div 
        v-for="note in paginatedNotes" 
        :key="note.id"
        class="note-item" 
        :class="{ active: activeNote && activeNote.id === note.id }"
        @click="selectNote(note)"
      >
        <div class="note-title">
          <span>{{ note.title }}</span>
          <span class="note-date">{{ getRelativeDate(note.date) }}</span>
        </div>
        <div class="note-preview">
          {{ note.preview }}
        </div>
        <div class="note-meta">
          <span>{{ note.date }}</span>
          <span>{{ note.wordCount }}字</span>
        </div>
        <div class="note-tags" v-if="note.tags && note.tags.length > 0">
          <span 
            v-for="tag in note.tags" 
            :key="tag"
            class="tag" 
            :class="{ 'ai-tag': note.isAI && tag.includes('AI') }"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </div>

    <!-- 分页组件 -->
    <Pagination
      :current-page="currentPage"
      :page-size="pageSize"
      :total-items="notes.length"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Pagination from '../ui/Pagination.vue'

// Props
const props = defineProps<{
  notes: any[]
  activeNote: any
}>()

// Emits
const emit = defineEmits<{
  'select-note': [note: any]
  'new-note': []
}>()

// 分页状态
const currentPage = ref(1)
const pageSize = ref(10)

// 计算属性 - 分页后的笔记
const paginatedNotes = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return props.notes.slice(start, end)
})

// 方法
const selectNote = (note: any) => {
  emit('select-note', note)
}

const handlePageChange = (page: number) => {
  currentPage.value = page
}

const handlePageSizeChange = (newPageSize: number) => {
  pageSize.value = newPageSize
  currentPage.value = 1 // 重置到第一页
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
</script>

<style scoped>
.notes-list {
  width: 300px;
  min-width: 250px;
  max-width: 350px;
  max-height: calc(100vh - 60px);
  background-color: var(--color-bg-primary);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  flex-shrink: 0;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  overflow: visible;
  box-sizing: border-box;
  position: relative;
}

/* 防止所有子元素文字被选中 */
.notes-list * {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

body.dark .notes-list {
  background-color: var(--color-bg-primary);
  border-right-color: var(--color-border);
}

.notes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3px;
  padding: 5px 20px 0 20px;
  flex-shrink: 0;
}

.notes-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--dark-color);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

body.dark .notes-header h2 {
  color: var(--color-text-primary);
}

body.dark .note-item {
  background-color: var(--color-bg-primary);
}

body.dark .note-item:hover {
  background-color: #1a1a1a;
}

body.dark .note-item.active {
  background-color: #1a1a1a;
}

body.dark .note-title span:first-child {
  color: #e9ecef;
}

body.dark .note-meta {
  color: #a0a7b5;
}

body.dark .note-preview {
  color: #a0a7b5;
}

body.dark .note-tags {
  color: #a0a7b5;
}

body.dark .tag {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-secondary);
}

body.dark .tag.ai-tag {
  background-color: var(--color-bg-primary);
  color: #7b9fff;
}

.new-note-btn {
  background-color: #5b6bf0;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 15px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  align-items: center;
  font-weight: 500;
}

.new-note-btn:hover {
  background-color: var(--secondary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(91, 107, 240, 0.3);
}

.new-note-btn i {
  margin-right: 5px;
}

.notes-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px 20px 5px 20px;
  min-height: 0; /* 确保可以收缩 */
}

.note-item {
  padding: 15px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid transparent;
  animation: fadeIn 0.3s ease;
  background-color: #ffffff;
}

.note-item:hover {
  background-color: #f0f4f8;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.note-item.active {
  background-color: #f0f7ff;
  border-color: #5b6bf0;
}

.note-title {
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.note-title span:first-child {
  color: var(--dark-color);
  flex: 1;
  margin-right: 10px;
}

body.dark .note-title span:first-child {
  color: var(--color-text-primary);
}

.note-date {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: 400;
}

body.dark .note-date {
  color: var(--color-text-secondary);
}

.note-preview {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

body.dark .note-preview {
  color: var(--color-text-secondary);
}

.note-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #adb5bd;
  margin-bottom: 8px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

body.dark .note-meta {
  color: #7a8294;
}

.note-tags {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.tag {
  background-color: #e9ecef;
  color: var(--color-text-primary);
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 11px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

body.dark .tag {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-secondary);
}

.tag.ai-tag {
  background-color: #f0f7ff;
  color: var(--primary-color);
}

body.dark .tag.ai-tag {
  background-color: var(--color-bg-primary);
  color: #7b9fff;
}

/* 动画 */
@keyframes fadeIn {
  from { 
    opacity: 0; 
    transform: translateY(10px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

/* 响应式设计 */
@media (max-width: 1024px) and (min-width: 769px) {
  .notes-list {
    width: 280px;
    max-height: calc(100vh - 60px); /* 减去TopBar的固定高度 */
    height: calc(100vh - 60px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .notes-container {
    padding-bottom: 8px;
    min-height: 0;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .notes-header {
    padding: 8px 15px 5px 15px;
    flex-shrink: 0;
  }
}

@media (max-width: 1024px) {
  .notes-list {
    width: 280px;
  }
}

@media (max-width: 768px) {
  .notes-list {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
    max-height: calc(100vh - 70px); /* 减去TopBar的高度 */
    height: calc(100vh - 70px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  body.dark .notes-list {
    border-bottom-color: #3a4152;
  }

  .notes-container {
    padding-bottom: 8px;
    min-height: 0;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .notes-header {
    padding: 8px 15px 5px 15px;
    flex-shrink: 0;
  }
}
</style>