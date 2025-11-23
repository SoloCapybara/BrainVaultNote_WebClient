<template>
  <div class="pagination-container">
    <!-- 每页显示数量选择器 -->
    <div class="page-size-selector">
      <label>每页显示：</label>
      <div class="custom-select" @click="togglePageSizeDropdown">
        <div class="select-display">
          <span>{{ localPageSize }}条</span>
          <i class="fas fa-chevron-down" :class="{ 'rotated': showPageSizeDropdown }"></i>
        </div>
        <div class="select-options" :class="{ 'show': showPageSizeDropdown }">
          <div 
            v-for="option in pageSizeOptions" 
            :key="option.value"
            class="select-option"
            :class="{ 'active': localPageSize === option.value }"
            @click.stop="selectPageSize(option.value)"
          >
            {{ option.label }}
          </div>
        </div>
      </div>
    </div>

    <!-- 跳转输入框 - 移到第一行 -->
    <div class="page-jumper">
      <label>跳转到：</label>
      <div class="custom-jump-input">
        <button @click="decreaseJumpPage" class="jump-btn decrease" title="减少">
          <i class="fas fa-chevron-left"></i>
        </button>
        <input 
          type="number" 
          v-model="jumpPage" 
          :min="1" 
          :max="totalPages"
          @keyup.enter="handleJump"
          class="jump-input"
          placeholder="页码"
        >
        <button @click="increaseJumpPage" class="jump-btn increase" title="增加">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- 分页信息 -->
    <div class="pagination-info">
      <span>共 {{ totalItems }} 条数据，第 {{ currentPage }} / {{ totalPages }} 页</span>
    </div>

    <!-- 分页控件 -->
    <div class="pagination-controls">
      <!-- 上一页 -->
      <button 
        class="pagination-btn prev-btn" 
        :disabled="currentPage <= 1"
        @click="goToPage(currentPage - 1)"
        title="上一页"
      >
        <i class="fas fa-chevron-left"></i>
      </button>

      <!-- 页码按钮 -->
      <div class="page-numbers">
        <!-- 省略号 -->
        <span v-if="showFirstEllipsis" class="ellipsis">...</span>

        <!-- 页码按钮 -->
        <button 
          v-for="page in visiblePages" 
          :key="page"
          class="pagination-btn page-btn"
          :class="{ active: currentPage === page }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>

        <!-- 省略号 -->
        <span v-if="showLastEllipsis" class="ellipsis">...</span>
      </div>

      <!-- 下一页 -->
      <button 
        class="pagination-btn next-btn" 
        :disabled="currentPage >= totalPages"
        @click="goToPage(currentPage + 1)"
        title="下一页"
      >
        <i class="fas fa-chevron-right"></i>
      </button>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps<{
  currentPage: number
  pageSize: number
  totalItems: number
}>()

// Emits
const emit = defineEmits<{
  'page-change': [page: number]
  'page-size-change': [pageSize: number]
}>()

// 响应式状态
const localPageSize = ref(props.pageSize)
const jumpPage = ref(1) // 始终显示1，用户自己输入
const showPageSizeDropdown = ref(false)

// 每页显示数量选项
const pageSizeOptions = [
  { value: 5, label: '5条' },
  { value: 10, label: '10条' },
  { value: 20, label: '20条' },
  { value: 50, label: '50条' }
]

// 计算属性
const totalPages = computed(() => Math.ceil(props.totalItems / props.pageSize))

const visiblePages = computed(() => {
  const pages = []
  const current = props.currentPage
  const total = totalPages.value
  
  if (total <= 5) {
    // 总页数少于等于5页，显示所有页码
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // 总页数大于5页，智能显示
    if (current <= 3) {
      // 当前页在前3页，显示前5页
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
    } else if (current >= total - 2) {
      // 当前页在后3页，显示后5页
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // 当前页在中间，显示当前页前后2页
      for (let i = current - 2; i <= current + 2; i++) {
        pages.push(i)
      }
    }
  }
  
  return pages
})

const showFirstEllipsis = computed(() => {
  return props.currentPage > 3 && totalPages.value > 5
})

const showLastEllipsis = computed(() => {
  return props.currentPage < totalPages.value - 2 && totalPages.value > 5
})

// 方法
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit('page-change', page)
  }
}

const handlePageSizeChange = () => {
  emit('page-size-change', localPageSize.value)
}

const handleJump = () => {
  const page = parseInt(jumpPage.value.toString())
  if (page >= 1 && page <= totalPages.value) {
    goToPage(page)
    // 跳转成功后保持输入的值，不重置
  } else {
    // 输入无效时，重置为当前页码
    jumpPage.value = props.currentPage
  }
}

const increaseJumpPage = () => {
  if (jumpPage.value < totalPages.value) {
    jumpPage.value++
  }
}

const decreaseJumpPage = () => {
  if (jumpPage.value > 1) {
    jumpPage.value--
  }
}

const togglePageSizeDropdown = () => {
  showPageSizeDropdown.value = !showPageSizeDropdown.value
}

const selectPageSize = (value: number) => {
  localPageSize.value = value
  showPageSizeDropdown.value = false
  handlePageSizeChange()
}

// 监听当前页码变化，更新跳转输入框
watch(() => props.currentPage, (newPage) => {
  jumpPage.value = newPage
})

</script>

<style scoped>
.pagination-container {
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: auto auto auto;
  align-items: center;
  padding: 15px 20px 12px 20px; /* 减少底部 padding，从 20px 改为 12px */
  background-color: var(--color-bg-primary);
  border-top: 1px solid var(--color-border);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  flex-shrink: 0;
  gap: 15px;
  min-height: 90px;
  overflow: visible;
  max-width: 100%;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
}

body.dark .pagination-container {
  background-color: var(--color-bg-primary);
  border-top-color: var(--color-border);
}

/* 每页显示数量选择器 - 第1列第1行 */
.page-size-selector {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  grid-column: 1;
  grid-row: 1;
  justify-self: start;
}

.page-size-selector label {
  font-weight: 500;
}

/* 自定义下拉框 */
.custom-select {
  position: relative;
  min-width: 60px;
  z-index: 10001; /* 提高层级，确保下拉菜单在笔记列表之上 */
}

.select-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  user-select: none;
  height: 28px;
}

.select-display:hover {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(91, 107, 240, 0.1);
}

.select-display i {
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  font-size: 10px;
  color: var(--color-text-secondary);
}

.select-display i.rotated {
  transform: rotate(180deg);
}

.select-options {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10001; /* 提高层级，确保在笔记列表和分页组件之上 */
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
  margin-bottom: 4px;
}

.select-options.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.select-option {
  padding: 6px 8px;
  font-size: 12px;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
  border-bottom: 1px solid var(--color-border);
}

.select-option:last-child {
  border-bottom: none;
}

.select-option:hover {
  background-color: var(--primary-color);
  color: white;
}

.select-option.active {
  background-color: var(--primary-color);
  color: white;
  font-weight: 500;
}

body.dark .select-display {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-border);
  color: var(--color-text-primary);
}

body.dark .select-options {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-border);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.3);
}

body.dark .select-option {
  color: var(--color-text-primary);
  border-bottom-color: var(--color-border);
}

/* 分页信息 - 跨3列第3行，居中 */
.pagination-info {
  font-size: 13px;
  color: var(--color-text-primary);
  font-weight: 500;
  white-space: nowrap;
  grid-column: 1 / -1;
  grid-row: 3;
  text-align: center;
  padding: 4px 20px 0 20px; /* 减少顶部 padding，从 8px 改为 4px */
  display: block;
  margin-top: -4px; /* 向上移动 4px */
}

body.dark .pagination-info {
  color: var(--color-text-primary);
}

/* 分页控件 - 跨3列第2行，左对齐 */
.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  grid-column: 1 / -1;
  grid-row: 2;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 2px;
  margin-top: -2px;
  overflow: visible;
  flex-wrap: nowrap;
  min-width: 0;
}

/* 页码按钮容器 */
.page-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: nowrap;
  min-width: 0;
  overflow: visible;
  padding-top: 2px;
  margin-top: -2px;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  flex-shrink: 0;
}

.pagination-btn:hover:not(:disabled) {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(91, 107, 240, 0.3);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.pagination-btn.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

body.dark .pagination-btn {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-border);
  color: var(--color-text-primary);
}

body.dark .pagination-btn:hover:not(:disabled) {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

body.dark .pagination-btn.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 1px;
  flex-wrap: nowrap;
  max-width: 220px;
  justify-content: flex-start;
  overflow: hidden;
}

.ellipsis {
  padding: 0 8px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

body.dark .ellipsis {
  color: var(--color-text-secondary);
}

/* 跳转输入框 - 第3列第1行 */
.page-jumper {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  grid-column: 3;
  grid-row: 1;
  justify-self: end;
  max-width: 100%;
  overflow: visible;
  min-width: 0;
}

/* 自定义跳转输入框 */
.custom-jump-input {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-bg-primary);
  overflow: visible;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  height: 26px;
  width: auto;
  min-width: 72px;
  max-width: 72px;
  flex-shrink: 0;
}

.custom-jump-input:focus-within {
  border-color: var(--color-border);
  box-shadow: none;
}

.page-jumper label {
  font-weight: 500;
  color: var(--color-text-secondary);
  font-size: 11px;
  white-space: nowrap;
}

body.dark .page-jumper label {
  color: var(--color-text-secondary);
}

.jump-input {
  width: 32px;
  min-width: 32px;
  padding: 3px 1px;
  border: none;
  background-color: transparent;
  color: var(--color-text-primary);
  font-size: 11px;
  text-align: center;
  outline: none;
  -moz-appearance: textfield; /* Firefox */
  flex-shrink: 0;
}

.jump-input::-webkit-outer-spin-button,
.jump-input::-webkit-inner-spin-button {
  -webkit-appearance: none; /* Chrome, Safari, Edge */
  margin: 0;
}

.jump-input:focus {
  outline: none;
}

body.dark .jump-input {
  background-color: transparent;
  color: var(--color-text-primary);
}

.jump-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 26px;
  min-width: 20px;
  min-height: 26px;
  background-color: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  font-size: 9px;
  padding: 0;
  flex-shrink: 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  user-select: none;
}

.jump-btn:hover {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(91, 107, 240, 0.3);
}

.jump-btn:active {
  background-color: rgba(91, 107, 240, 0.15);
}

.jump-btn:focus {
  outline: none !important;
  background-color: transparent;
  box-shadow: none !important;
  border-color: var(--color-border) !important;
}

.jump-btn:focus-visible {
  outline: none !important;
  background-color: transparent;
  box-shadow: none !important;
  border-color: var(--color-border) !important;
}

.jump-btn:active {
  outline: none !important;
  box-shadow: none !important;
  border-color: var(--color-border) !important;
}

.jump-btn:active:focus,
.jump-btn:active:focus-visible {
  background-color: rgba(91, 107, 240, 0.15);
  outline: none !important;
  box-shadow: none !important;
  border-color: var(--color-border) !important;
}

.jump-btn.decrease {
  border-left: none;
  border-right: 1px solid var(--color-border);
  border-radius: 6px 0 0 6px;
}

.jump-btn.decrease:focus,
.jump-btn.decrease:focus-visible,
.jump-btn.decrease:active {
  outline: none !important;
  box-shadow: none !important;
  border-color: var(--color-border) !important;
}

.jump-btn.increase {
  border-left: 1px solid var(--color-border);
  border-right: none;
  border-radius: 0 6px 6px 0;
}

.jump-btn.increase:focus,
.jump-btn.increase:focus-visible,
.jump-btn.increase:active {
  outline: none !important;
  box-shadow: none !important;
  border-color: var(--color-border) !important;
}

.jump-btn i {
  font-size: 9px;
  display: block;
}

.jump-btn.go {
  background-color: var(--primary-color);
  color: white;
  margin-left: 4px;
  border-radius: 0 6px 6px 0;
}

.jump-btn.go:hover {
  background-color: var(--primary-color);
  opacity: 0.8;
}

body.dark .jump-btn {
  background-color: transparent;
  border-top-color: var(--color-border);
  border-bottom-color: var(--color-border);
  color: var(--color-text-primary);
}

body.dark .jump-btn.decrease {
  border-left-color: transparent;
  border-right-color: var(--color-border);
}

body.dark .jump-btn.increase {
  border-left-color: var(--color-border);
  border-right-color: transparent;
}

body.dark .jump-btn:hover {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

body.dark .jump-btn.decrease:hover {
  border-left-color: transparent;
  border-right-color: var(--color-border);
}

body.dark .jump-btn.increase:hover {
  border-left-color: var(--color-border);
  border-right-color: transparent;
}

/* 中等屏幕适配 - 当编辑区域消失时 */
@media (max-width: 1024px) and (min-width: 769px) {
  .pagination-container {
    overflow: visible;
    max-width: 100%;
    padding: 12px 15px 15px 15px;
    gap: 10px;
    min-height: 85px;
  }

  .pagination-info {
    font-size: 12px;
    padding: 8px 20px 0 20px;
    color: var(--color-text-primary);
  }

  .page-jumper {
    max-width: 100%;
    overflow: visible;
    min-width: 0;
    gap: 3px;
    font-size: 11px;
  }

  .custom-jump-input {
    width: auto;
    min-width: 72px;
    max-width: 72px;
    height: 26px;
    flex-shrink: 0;
    overflow: visible;
  }

  .page-jumper label {
    flex-shrink: 0;
  }

  .jump-btn {
    width: 20px;
    height: 26px;
    min-width: 20px;
    min-height: 26px;
    font-size: 9px;
  }

  .jump-btn i {
    font-size: 9px;
  }

  .jump-input {
    width: 30px;
    min-width: 30px;
    font-size: 11px;
  }

  .pagination-controls {
    overflow: visible;
    flex-wrap: nowrap;
    gap: 4px;
  }

  .page-numbers {
    flex-wrap: nowrap;
    overflow: visible;
    gap: 2px;
  }

  .pagination-btn {
    flex-shrink: 0;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .pagination-container {
    display: flex !important;
    flex-direction: column !important;
    gap: 6px;
    padding: 8px 10px 10px 10px;
    min-height: auto;
    margin-top: auto;
    position: relative;
    z-index: 10;
    flex-shrink: 0;
    background-color: var(--color-bg-primary);
    overflow: visible !important; /* 确保下拉菜单不被裁剪 */
  }

  .page-size-selector,
  .pagination-controls,
  .page-jumper {
    width: 100%;
    display: flex !important;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    max-width: 100%;
    overflow: hidden;
    box-sizing: border-box;
  }

  .pagination-info {
    width: 100%;
    display: block !important;
    text-align: center;
    flex-shrink: 0;
    max-width: 100%;
    overflow: hidden;
    box-sizing: border-box;
    padding: 8px 20px 0 20px;
    font-size: 12px;
    color: var(--color-text-primary);
  }

  .page-size-selector {
    order: 1;
    margin-bottom: 0;
  }
  
  /* 窄屏模式下确保下拉菜单层级足够高且不被裁剪 */
  .pagination-container {
    overflow: visible !important; /* 允许下拉菜单溢出 */
  }
  
  .custom-select {
    z-index: 10001 !important;
    position: relative !important;
  }
  
  .select-options {
    z-index: 10002 !important;
    position: absolute !important;
    bottom: 100% !important;
    left: 0 !important;
    right: 0 !important;
    top: auto !important;
    overflow: visible !important;
  }
  
  .page-size-selector {
    overflow: visible !important;
  }

  .page-jumper {
    order: 2;
    margin-bottom: 0;
    padding: 0;
    min-width: 0;
    justify-content: center;
    gap: 4px;
    font-size: 11px;
  }

  .page-jumper label {
    flex-shrink: 0;
    white-space: nowrap;
    font-size: 11px;
  }

  .custom-jump-input {
    width: auto;
    min-width: 70px;
    max-width: 70px;
    height: 26px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .jump-btn {
    width: 20px;
    height: 26px;
    min-width: 20px;
    min-height: 26px;
    font-size: 9px;
  }

  .jump-btn i {
    font-size: 9px;
  }

  .jump-input {
    width: 30px;
    min-width: 30px;
    font-size: 11px;
    text-align: center;
  }

  .pagination-controls {
    order: 3;
    margin-bottom: 0;
    display: flex !important;
    justify-content: center;
    align-items: center;
    overflow: visible;
    flex-wrap: nowrap;
    gap: 4px;
  }

  .pagination-info {
    order: 4;
    font-size: 11px;
    padding: 0;
    margin-top: 0;
    display: block !important;
  }

  .page-numbers {
    flex-wrap: nowrap;
    justify-content: center;
    gap: 2px;
    display: flex !important;
    overflow: visible;
    min-width: 0;
  }

  .pagination-btn {
    width: 28px;
    height: 28px;
    font-size: 12px;
    display: flex !important;
  }
}

@media (max-width: 480px) {
  .pagination-container {
    padding: 8px 10px 10px 10px;
    min-height: auto;
    gap: 6px;
    overflow: hidden;
  }

  .page-size-selector,
  .pagination-info,
  .page-jumper {
    font-size: 11px;
    max-width: 100%;
    overflow: hidden;
  }

  .page-jumper {
    padding: 0;
    justify-content: center;
    gap: 4px;
    font-size: 10px;
  }

  .page-jumper label {
    font-size: 10px;
    flex-shrink: 0;
    white-space: nowrap;
  }

  .custom-jump-input {
    width: auto;
    min-width: 65px;
    max-width: 65px;
    height: 24px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pagination-info {
    font-size: 10px;
  }

  .pagination-btn {
    width: 24px;
    height: 24px;
    font-size: 11px;
  }

  .jump-input {
    width: 28px;
    min-width: 28px;
    font-size: 10px;
    padding: 3px 1px;
    text-align: center;
  }

  .jump-btn {
    width: 18px;
    height: 24px;
    min-width: 18px;
    min-height: 24px;
    font-size: 8px;
  }

  .jump-btn i {
    font-size: 8px;
  }
}

</style>
