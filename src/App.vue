<template>
  <div id="app">
    <MainLayout />
    <Message ref="messageRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import MainLayout from './components/layout/main/MainLayout.vue'
import Message from './components/ui/Message.vue'
import { setMessageInstance } from './utils/message'

const messageRef = ref<InstanceType<typeof Message> | null>(null)

onMounted(() => {
  // 使用 nextTick 确保组件完全挂载后再注册
  nextTick(() => {
    if (messageRef.value) {
      setMessageInstance(messageRef.value)
      console.log('Message instance registered')
    } else {
      console.warn('Message ref is null')
    }
  })
})
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f5f5;
  color: #333;
  line-height: 1.6;
}

#app {
  height: 100vh;
  overflow: hidden;
}

/* CSS变量定义已移至 main.css，这里只保留样式使用 */

/* 深色模式全局样式 */
body.dark {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
}

/* 浅色模式全局样式 */
body:not(.dark) {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

/* 主内容区域 */
.main-content {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
}

/* 顶部栏 */
.main-content .top-bar {
  background-color: var(--color-bg-primary);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid var(--color-border);
}

.main-content .top-bar * {
  color: var(--color-text-primary);
}

/* 笔记列表 */
.main-content .notes-list {
  background-color: var(--color-bg-primary);
  border-right: 1px solid var(--color-border);
}

.main-content .notes-list * {
  color: var(--color-text-primary);
}

/* 笔记项目 */
.main-content .note-item {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.main-content .note-item:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.main-content .note-item.active {
  background-color: #f0f7ff;
  border: 1px solid var(--primary-color);
  color: var(--dark-color);
}

/* 选中笔记内的文字颜色 - 浅色模式 */
body:not(.dark) .main-content .note-item.active .note-title span:first-child {
  color: var(--dark-color);
}

body:not(.dark) .main-content .note-item.active .note-meta {
  color: #6c757d;
}

body:not(.dark) .main-content .note-item.active .note-preview {
  color: #6c757d;
}

/* 选中笔记内的文字颜色 - 深色模式 */
body.dark .main-content .note-item.active .note-title span:first-child {
  color: rgba(255, 255, 255, 1);
}

body.dark .main-content .note-item.active .note-meta {
  color: #cccccc;
}

body.dark .main-content .note-item.active .note-preview {
  color: #cccccc;
}

/* 笔记编辑器 - 浅色模式 */
body:not(.dark) .main-content .note-editor {
  background-color: var(--color-bg-primary);
}

body:not(.dark) .main-content .note-editor * {
  color: var(--color-text-primary);
}

/* 笔记编辑器 - 深色模式 */
body.dark .main-content .note-editor {
  background-color: var(--color-bg-primary);
}

body.dark .main-content .note-editor * {
  color: #ffffff;
}

/* 富文本工具按钮 - 浅色模式 */
body:not(.dark) .main-content .toolbar-btn {
  color: #6c757d;
  opacity: 0.5;
}

body:not(.dark) .main-content .toolbar-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
  color: var(--dark-color);
  opacity: 1;
}

/* 富文本工具按钮 - 深色模式 */
body.dark .main-content .toolbar-btn {
  color: #cccccc;
  opacity: 0.5;
}

body.dark .main-content .toolbar-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  opacity: 1;
}

/* 编辑器工具栏分隔线 */
.main-content .editor-toolbar {
  border-bottom: 1px solid var(--color-border);
}

/* AI助手 */
.main-content .ai-assistant {
  background-color: var(--color-bg-primary);
  border-left: 1px solid var(--color-border);
  color: var(--color-text-primary);
}

.main-content .ai-assistant * {
  color: var(--color-text-primary);
}

/* 笔记列表中的特定元素 - 浅色模式 */
body:not(.dark) .main-content .note-title span:first-child {
  color: var(--dark-color);
}

body:not(.dark) .main-content .note-meta {
  color: #6c757d;
}

body:not(.dark) .main-content .note-preview {
  color: #6c757d;
}

/* 笔记列表中的特定元素 - 深色模式 */
body.dark .main-content .note-title span:first-child {
  color: #ffffff;
}

body.dark .main-content .note-meta {
  color: #cccccc;
}

body.dark .main-content .note-preview {
  color: #cccccc;
}

/* 笔记标签 - 浅色模式 */
body:not(.dark) .main-content .note-tags {
  color: #adb5bd;
}

/* 笔记标签 - 深色模式 */
body.dark .main-content .note-tags {
  color: #cccccc;
}

/* 标签 - 浅色模式 */
body:not(.dark) .main-content .tag {
  background-color: #e9ecef;
  color: var(--dark-color);
}

body:not(.dark) .main-content .tag.ai-tag {
  background-color: #f0f7ff;
  color: var(--primary-color);
}

/* 标签 - 深色模式 */
body.dark .main-content .tag {
  background-color: #333333;
  color: #ffffff;
}

body.dark .main-content .tag.ai-tag {
  background-color: #1a1a1a;
  color: #7b9fff;
}

/* AI板块中的特定元素 - 统一使用全局深色模式颜色 */
body.dark .main-content .ai-section h3 {
  color: #e9ecef;
}

body.dark .main-content .ai-section p {
  color: #cccccc;
}

/* AI板块中的图标 - 统一深色模式颜色 */
body.dark .main-content .ai-section h3 i,
body.dark .main-content .ai-section h3 .fas,
body.dark .main-content .ai-section h3 .far {
  color: var(--primary-color);
}

body.dark .main-content .ai-action-btn i,
body.dark .main-content .ai-action-btn .fas,
body.dark .main-content .ai-action-btn .far {
  color: #e9ecef;
}

/* 统计卡片 */
body.dark .main-content .stats-card h3 {
  color: #ffffff;
}

body.dark .main-content .stats-number {
  color: var(--dark-color);
}

body.dark .main-content .stats-desc {
  color: var(--dark-color);
}

/* 统计卡片中的图标 */
body.dark .main-content .stats-card i,
body.dark .main-content .stats-card .fas,
body.dark .main-content .stats-card .far,
body.dark .main-content .stats-card * i,
body.dark .main-content .stats-card * .fas,
body.dark .main-content .stats-card * .far {
  color: var(--dark-color);
}

/* 确保头像文字颜色始终保持白色 */
body.dark .sidebar .user-avatar,
body.dark .sidebar .user-avatar *,
body.dark .sidebar .user-avatar span,
body.dark .sidebar .user-avatar div,
body.dark .sidebar .user-info,
body.dark .sidebar .user-info *,
body.dark .sidebar .user-info span,
body.dark .sidebar .user-info div {
  color: #ffffff;
}

/* 特别确保"用户"二字是白色 */
body.dark .sidebar .user-avatar span,
body.dark .sidebar .user-avatar div,
body.dark .sidebar .user-info span,
body.dark .sidebar .user-info div {
  color: #ffffff;
}

/* 确保TopBar中的用户头像文字是白色 */
body.dark .top-bar .user-avatar,
body.dark .top-bar .user-avatar * {
  color: #ffffff;
}

/* 确保"我的笔记"标题是白色 */
body.dark .main-content .notes-list h3 {
  color: #ffffff;
}

/* 确保"欢迎回来"文字是白色 */
body.dark .main-content .welcome-text,
body.dark .main-content .welcome-message {
  color: #ffffff;
}

/* AI助手按钮 */
body.dark .main-content .ai-action-btn {
  background-color: #1a1a1a;
  border: 1px solid #333333;
  color: #e9ecef;
}

body.dark .main-content .ai-action-btn:hover {
  background-color: #2a2a2a;
  color: #ffffff;
}

/* AI建议 */
body.dark .main-content .ai-suggestion {
  background-color: var(--color-bg-primary);
  color: #e9ecef;
}

body.dark .main-content .ai-suggestion:hover {
  background-color: #1a1a1a;
  color: #e9ecef;
}

body.dark .main-content .ai-suggestion h4 {
  color: #ffffff;
}

body.dark .main-content .ai-suggestion p {
  color: #cccccc;
}

/* 标签建议 */
body.dark .main-content .tag-suggestion {
  background-color: #1a1a1a;
  border: 1px solid #333333;
  color: #7b9fff;
}

body.dark .main-content .tag-suggestion:hover {
  background-color: #2a2a2a;
  color: #9bb5ff;
}

/* 标签建议标题 */
body.dark .main-content .tag-suggestion h4 {
  color: #7b9fff;
}

/* 标签建议下面的每一条标签 */
body.dark .main-content .tag-suggestion .tag,
body.dark .main-content .tag-suggestion .tag * {
  color: #7b9fff;
}

/* 全局动画 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 通用工具类 */
.fade-in {
  animation: fadeIn 0.3s ease-out;
}

.slide-in {
  animation: slideIn 0.3s ease-out;
}

.pulse {
  animation: pulse 2s infinite;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
  
  .notes-list {
    width: 100%;
    max-height: 200px;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }
  
  .note-editor {
    width: 100%;
  }
  
  .ai-assistant {
    width: 100%;
    border-left: none;
    border-top: 1px solid var(--color-border);
  }
}
</style>