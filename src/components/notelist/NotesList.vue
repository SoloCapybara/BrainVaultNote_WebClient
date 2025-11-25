<template>
  <div class="notes-list" :class="{ collapsed: collapsed }">
    <div class="notes-header">
      <h2>我的笔记</h2>
      <Dropdown v-model="showNoteTypeMenu">
        <template #trigger>
          <button class="new-note-btn">
            <i class="fas fa-plus"></i> 新建笔记
            <i class="fas fa-chevron-down" :class="{ rotated: showNoteTypeMenu }"></i>
          </button>
        </template>
        <DropdownItem @click="createNote('richText')">
          <i class="fas fa-file-alt"></i>
          <span class="menu-item-title">文档类型</span>
        </DropdownItem>
        <DropdownItem @click="createNote('markdown')">
          <i class="fab fa-markdown"></i>
          <span class="menu-item-title">原生 Markdown</span>
        </DropdownItem>
      </Dropdown>
    </div>
    
    <div class="notes-container">
      <div 
        v-for="note in paginatedNotes" 
        :key="note.id"
        class="note-item" 
        :class="{ active: selectedNoteId === note.id }"
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
      :total-items="notesCount"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
    />
  </div>
</template>

<script setup lang="ts">
import Pagination from '../ui/Pagination.vue'
import Dropdown from '../ui/Dropdown.vue'
import DropdownItem from '../ui/DropdownItem.vue'
import { useNotesList } from './composables/useNotesList.ts'
import './css/notes-list.css'

const props = defineProps<{
  collapsed?: boolean
}>()

const emit = defineEmits<{
  'toggle-collapse': []
  'select-note': [note: any]
}>()

const {
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
  selectedNoteId
} = useNotesList(props, emit)
</script>

<style scoped src="./css/notes-list.css"></style>

