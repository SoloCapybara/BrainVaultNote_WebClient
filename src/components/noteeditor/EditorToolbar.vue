<template>
  <div v-if="!isMarkdownMode" class="editor-toolbar" :class="{ disabled: isTitleFocused }">
    <div class="toolbar-left">
      <!-- 第一组：撤销、重做 -->
      <Tooltip text="撤销" placement="top">
        <button 
          class="toolbar-btn" 
          :disabled="!editor || isTitleFocused || !editor.can().undo()"
          @click="editor && editor.chain().focus().undo().run()"
        >
          <i class="fas fa-undo"></i>
        </button>
      </Tooltip>
      <Tooltip text="重做" placement="top">
        <button 
          class="toolbar-btn" 
          :disabled="!editor || isTitleFocused || !editor.can().redo()"
          @click="editor && editor.chain().focus().redo().run()"
        >
          <i class="fas fa-redo"></i>
        </button>
      </Tooltip>
      <!-- 分割线 -->
      <div class="toolbar-divider"></div>
      
      <!-- 第二组：字体大小、大纲工具 -->
      <Dropdown v-model="fontSizeDropdownOpen" @update:modelValue="handleFontSizeDropdownChange">
        <template #trigger>
          <button 
            class="toolbar-btn toolbar-btn-group"
            :disabled="isTitleFocused"
          >
            <span>{{ currentFontSize }}</span>
            <i class="fas fa-chevron-down"></i>
          </button>
        </template>
        <DropdownItem 
          v-for="size in fontSizes" 
          :key="size"
          :class="{ 'font-size-item': true, 'active': currentFontSize === size }"
          @click="setFontSize(size)"
        >
          {{ size }}
        </DropdownItem>
      </Dropdown>
      <Dropdown v-model="headingDropdownOpen" @update:modelValue="handleHeadingDropdownChange">
        <template #trigger>
          <button 
            class="toolbar-btn toolbar-btn-group"
            :disabled="isTitleFocused"
          >
            <span>{{ currentHeading || '正文' }}</span>
            <i class="fas fa-chevron-down"></i>
          </button>
        </template>
        <DropdownItem 
          v-for="heading in headings" 
          :key="heading.value"
          :class="{ 'heading-item': true, 'active': currentHeading === heading.label }"
          @click="setHeading(heading.value)"
        >
          {{ heading.label }}
        </DropdownItem>
      </Dropdown>
      <!-- 分割线 -->
      <div class="toolbar-divider"></div>
      
      <!-- 第三组：加粗、斜体、下划线、删除线 -->
      <Tooltip text="粗体" placement="top">
        <button 
          class="toolbar-btn" 
          :class="{ active: editor?.isActive('bold') }"
          :disabled="!editor || isTitleFocused"
          @click="editor && editor.chain().focus().toggleBold().run()"
        >
          <i class="fas fa-bold"></i>
        </button>
      </Tooltip>
      <Tooltip text="斜体" placement="top">
        <button 
          class="toolbar-btn" 
          :class="{ active: editor?.isActive('italic') }"
          :disabled="!editor || isTitleFocused"
          @click="editor && editor.chain().focus().toggleItalic().run()"
        >
          <i class="fas fa-italic"></i>
        </button>
      </Tooltip>
      <Tooltip text="下划线" placement="top">
        <button 
          class="toolbar-btn" 
          :class="{ active: editor?.isActive('underline') }"
          :disabled="!editor || isTitleFocused"
          @click="editor && editor.chain().focus().toggleUnderline().run()"
        >
          <i class="fas fa-underline"></i>
        </button>
      </Tooltip>
      <Tooltip text="删除线" placement="top">
        <button 
          class="toolbar-btn" 
          :class="{ active: editor?.isActive('strike') }"
          :disabled="!editor || isTitleFocused"
          @click="editor && editor.chain().focus().toggleStrike().run()"
        >
          <i class="fas fa-strikethrough"></i>
        </button>
      </Tooltip>
      <!-- 分割线 -->
      <div class="toolbar-divider"></div>
      
      <!-- 第四组：文字颜色、背景颜色 -->
      <ColorPicker
        ref="textColorPickerRef"
        v-model="textColor"
        tooltip-text="文本颜色"
        icon="fas fa-font"
        type="text"
        :disabled="isTitleFocused"
        :is-active="false"
        :close-other-picker="closeHighlightColorPicker"
        :on-apply-color="applyTextColor"
        @update:modelValue="setTextColor"
        @open="closeHighlightColorPicker"
        @apply="applyTextColor"
        @clear="clearTextColor"
      />
      <ColorPicker
        ref="highlightColorPickerRef"
        v-model="highlightColor"
        tooltip-text="背景颜色"
        icon="fas fa-highlighter"
        type="background"
        :disabled="isTitleFocused"
        :is-active="false"
        :close-other-picker="closeTextColorPicker"
        :on-apply-color="applyHighlightColor"
        @update:modelValue="setHighlightColor"
        @open="closeTextColorPicker"
        @apply="applyHighlightColor"
        @clear="clearHighlightColor"
      />
      <!-- 分割线 -->
      <div class="toolbar-divider"></div>
      
      <!-- 第五组：有序列表、无序列表、对齐工具 -->
      <Tooltip text="无序列表" placement="top">
        <button 
          class="toolbar-btn" 
          :class="{ active: editor?.isActive('bulletList') }"
          :disabled="!editor || isTitleFocused"
          @click="editor && editor.chain().focus().toggleBulletList().run()"
        >
          <i class="fas fa-list-ul"></i>
        </button>
      </Tooltip>
      <Tooltip text="有序列表" placement="top">
        <button 
          class="toolbar-btn" 
          :class="{ active: editor?.isActive('orderedList') }"
          :disabled="!editor || isTitleFocused"
          @click="editor && editor.chain().focus().toggleOrderedList().run()"
        >
          <i class="fas fa-list-ol"></i>
        </button>
      </Tooltip>
      <Dropdown v-model="textAlignDropdownOpen" @update:modelValue="handleTextAlignDropdownChange">
        <template #trigger>
          <button 
            class="toolbar-btn toolbar-btn-group"
            :disabled="isTitleFocused"
          >
            <i :class="currentTextAlignIcon"></i>
            <i class="fas fa-chevron-down"></i>
          </button>
        </template>
        <DropdownItem 
          v-for="align in textAlignOptions" 
          :key="align.value"
          :class="{ 'active': currentTextAlign === align.value }"
          @click="setTextAlign(align.value)"
        >
          <i :class="align.icon"></i>
          <span>{{ align.label }}</span>
        </DropdownItem>
      </Dropdown>
      <!-- 分割线 -->
      <div class="toolbar-divider"></div>
      
      <!-- 第六组：链接、分割线 -->
      <Tooltip text="链接" placement="top">
        <button 
          class="toolbar-btn" 
          :class="{ active: editor?.isActive('link') }"
          :disabled="!editor || isTitleFocused"
          @click="editor && setLink()"
        >
          <i class="fas fa-link"></i>
        </button>
      </Tooltip>
      <Tooltip text="分割线" placement="top">
        <button 
          class="toolbar-btn"
          :disabled="!editor || isTitleFocused"
          @click="editor && insertHorizontalRule()"
        >
          <i class="fas fa-minus"></i>
        </button>
      </Tooltip>
      <!-- 分割线 -->
      <div class="toolbar-divider"></div>
      
      <!-- 第七组：更多工具（图片、代码块、表格） -->
      <Dropdown v-model="moreToolsDropdownOpen">
        <template #trigger>
          <Tooltip text="更多工具" placement="top">
            <button 
              class="toolbar-btn"
              :disabled="isTitleFocused"
            >
              <i class="fas fa-plus"></i>
            </button>
          </Tooltip>
        </template>
        <DropdownItem @click="handleMoreToolClick('image')">
          <i class="fas fa-image"></i>
          <span>图片</span>
        </DropdownItem>
        <DropdownItem 
          :class="{ active: editor?.isActive('codeBlock') }"
          @click="handleMoreToolClick('code')"
        >
          <i class="fas fa-code"></i>
          <span>代码块</span>
        </DropdownItem>
        <DropdownItem @click="handleMoreToolClick('table')">
          <i class="fas fa-table"></i>
          <span>表格</span>
        </DropdownItem>
      </Dropdown>
    </div>
    <EditorStats
      :word-count="wordCount"
      :punctuation-count="punctuationCount"
      :line-count="lineCount"
    />
  </div>
  
  <!-- Markdown 类型：只显示统计 -->
  <div v-else class="editor-toolbar markdown-toolbar">
    <div class="toolbar-left"></div>
    <EditorStats
      :word-count="wordCount"
      :punctuation-count="punctuationCount"
      :line-count="lineCount"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, toRef, watch} from 'vue'
import type { Editor } from '@tiptap/vue-3'
import Tooltip from '../ui/Tooltip.vue'
import Dropdown from '../ui/Dropdown.vue'
import DropdownItem from '../ui/DropdownItem.vue'
import ColorPicker from '../ui/ColorPicker.vue'
import EditorStats from './EditorStats.vue'
import { useToolbar } from './composables/useToolbar'
import { useColorPicker } from './composables/useColorPicker'

const props = defineProps<{
  editor?: Editor
  isTitleFocused: boolean
  isMarkdownMode: boolean
  wordCount: number
  punctuationCount: number
  lineCount: number
}>()

// 使用 composables
const editorRef = ref<Editor | null> (props.editor || null)
const isTitleFocusedRef = toRef(props,'isTitleFocused')
watch(() => props.editor, (newEditor) => {
  editorRef.value = newEditor || null
})

const toolbar = useToolbar(editorRef,isTitleFocusedRef)

const colorPicker = useColorPicker(editorRef,isTitleFocusedRef)

// 暴露 toolbar 和 colorPicker 的方法和状态
const {
  fontSizeDropdownOpen,
  currentFontSize,
  fontSizes,
  setFontSize,
  handleFontSizeDropdownChange,
  headingDropdownOpen,
  currentHeading,
  headings,
  setHeading,
  handleHeadingDropdownChange,
  textAlignDropdownOpen,
  currentTextAlign,
  textAlignOptions,
  currentTextAlignIcon,
  setTextAlign,
  handleTextAlignDropdownChange,
  moreToolsDropdownOpen,
  handleMoreToolClick,
  setLink,
  insertHorizontalRule
} = toolbar

const {
  textColor,
  highlightColor,
  textColorPickerRef,
  highlightColorPickerRef,
  closeTextColorPicker,
  closeHighlightColorPicker,
  setTextColor,
  setHighlightColor,
  applyTextColor,
  applyHighlightColor,
  clearTextColor,
  clearHighlightColor
} = colorPicker
</script>

<style scoped>
/* 工具栏样式从原 NoteEditor.vue 复制 */
.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  gap: 8px;
  flex-wrap: wrap;
}

.editor-toolbar.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  flex: 1;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-text-primary);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  font-size: 14px;
}

.toolbar-btn:hover:not(:disabled) {
  background: var(--color-bg-hover);
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-btn.active {
  background: var(--color-primary);
  color: var(--color-text-on-primary);
}

.toolbar-btn-group {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
  width: auto;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: var(--color-border);
  margin: 0 4px;
}

.markdown-toolbar {
  justify-content: flex-end;
}
</style>

