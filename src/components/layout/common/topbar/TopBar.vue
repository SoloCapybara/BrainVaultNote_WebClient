<template>
  <div class="top-bar">
    <div class="user-info">
      <button class="mobile-menu-btn" @click="$emit('toggle-mobile-sidebar')">
        <i class="fas fa-bars"></i>
      </button>
      <div class="user-avatar">用户</div>
      <div class="user-details">
        <div class="welcome-text">欢迎回来！</div>
        <div class="notification-text">今天有3条笔记待处理</div>
      </div>
    </div>
    
    <div class="top-actions">
      <div class="theme-toggle">
        <span>{{ props.isDark ? '切换到浅色' : '切换到深色' }}</span>
        <label class="switch">
          <input 
            type="checkbox" 
            :checked="props.isDark"
            @change="$emit('toggle-theme')"
          >
          <span class="slider"></span>
        </label>
      </div>
      <button class="action-btn" @click="$emit('sync')" title="同步">
        <i class="fas fa-sync-alt"></i>
      </button>
      <button class="action-btn" @click="$emit('notification')" title="通知">
        <i class="fas fa-bell"></i>
      </button>
      <button class="action-btn" @click="$emit('upload')" title="上传">
        <i class="fas fa-cloud-upload-alt"></i>
      </button>
      <button class="action-btn" @click="toggleFullscreen" :title="isFullscreen ? '退出全屏' : '全屏'">
        <i :class="isFullscreen ? 'fas fa-compress' : 'fas fa-expand'"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// 主题状态从父组件传入
const props = defineProps<{
  isDark: boolean
}>()

// 全屏状态
const isFullscreen = ref(false)

// 全屏功能
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    // 进入全屏
    document.documentElement.requestFullscreen().then(() => {
      isFullscreen.value = true
    }).catch((err) => {
      console.error('无法进入全屏模式:', err)
    })
  } else {
    // 退出全屏
    document.exitFullscreen().then(() => {
      isFullscreen.value = false
    }).catch((err) => {
      console.error('无法退出全屏模式:', err)
    })
  }
}

// 监听全屏状态变化
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

// 生命周期
onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})

// Emits
defineEmits<{
  'toggle-mobile-sidebar': []
  'toggle-theme': []
  'sync': []
  'notification': []
  'upload': []
}>()
</script>

<style scoped>
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  min-height: 60px; /* 固定最小高度 */
  max-height: 60px; /* 固定最大高度 */
  flex-wrap: nowrap; /* 防止换行 */
  overflow: hidden; /* 隐藏溢出内容 */
  width: 100%; /* 确保占据100%宽度 */
  box-sizing: border-box; /* 确保padding包含在宽度内 */
}

/* 防止所有子元素文字被选中 */
.top-bar * {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

body.dark .top-bar {
  background-color: var(--color-bg-primary);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

body.dark .user-info h3 {
  color: #e9ecef;
}

body.dark .user-info p {
  color: #a0a7b5;
}

body.dark .action-btn {
  color: #a0a7b5;
}

body.dark .action-btn:hover {
  background-color: #1a1a1a;
  color: var(--color-text-primary);
}

body.dark .theme-toggle span {
  color: #e9ecef;
}

.user-info {
  display: flex;
  align-items: center;
  flex-shrink: 1; /* 允许收缩 */
  min-width: 0; /* 允许缩小到0 */
  overflow: hidden; /* 隐藏溢出内容 */
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  font-size: 20px;
  color: #212529;
  cursor: pointer;
  margin-right: 15px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

body.dark .mobile-menu-btn {
  color: #ffffff;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  margin-right: 10px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.user-details {
  display: flex;
  flex-direction: column;
  min-width: 0; /* 允许缩小到0 */
  overflow: hidden; /* 隐藏溢出内容 */
}

.welcome-text {
  font-weight: 500;
  color: #212529;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  white-space: nowrap; /* 防止换行 */
  overflow: hidden; /* 隐藏溢出内容 */
  text-overflow: ellipsis; /* 超出部分显示省略号 */
  line-height: 1.2; /* 固定行高 */
}

body.dark .welcome-text {
  color: #ffffff;
}

.notification-text {
  font-size: 14px;
  color: #6c757d;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  white-space: nowrap; /* 防止换行 */
  overflow: hidden; /* 隐藏溢出内容 */
  text-overflow: ellipsis; /* 超出部分显示省略号 */
  line-height: 1.2; /* 固定行高 */
}

body.dark .notification-text {
  color: #cccccc;
}

.top-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

.action-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #212529;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  padding: 0;
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
  max-width: 36px;
  max-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

body.dark .action-btn {
  color: #ffffff;
}

.action-btn:hover {
  color: var(--primary-color);
  transform: scale(1.1);
  background-color: rgba(91, 107, 240, 0.1);
}

.theme-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
}

.theme-toggle span {
  font-size: 14px;
  color: #212529;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

body.dark .theme-toggle span {
  color: #ffffff;
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: #ffffff;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary-color);
}

input:checked + .slider:before {
  transform: translateX(26px);
}

/* 中屏模式适配 */
@media (max-width: 1024px) and (min-width: 769px) {
  .top-bar {
    padding: 10px 15px;
    min-height: 60px;
    max-height: 60px;
    flex-wrap: nowrap;
    align-items: center;
    overflow: hidden;
  }

  .user-info {
    flex-shrink: 1;
    min-width: 0;
    overflow: hidden;
  }

  .user-avatar {
    width: 36px;
    height: 36px;
    min-width: 36px;
    min-height: 36px;
    font-size: 14px;
  }

  .welcome-text {
    font-size: 13px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.2;
  }

  .notification-text {
    font-size: 11px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.2;
  }

  .top-actions {
    flex-shrink: 0;
    gap: 10px;
  }

  .action-btn {
    font-size: 16px;
    padding: 6px;
  }

  .theme-toggle span {
    font-size: 12px;
    white-space: nowrap;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .top-bar {
    padding: 10px 15px;
    min-height: 50px;
    max-height: 70px;
    flex-wrap: wrap;
    align-items: center;
  }

  .mobile-menu-btn {
    display: block;
    margin-right: 10px;
    font-size: 18px;
  }
  
  .theme-toggle span {
    display: none;
  }

  .user-info {
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    font-size: 12px;
    margin-right: 8px;
    flex-shrink: 0;
  }

  .user-details {
    min-width: 0;
    flex: 1;
    overflow: hidden;
  }

  .welcome-text {
    font-size: 13px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.2;
  }

  .notification-text {
    font-size: 11px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.2;
    margin-top: 2px;
  }

  .top-actions {
    gap: 8px;
    flex-shrink: 0;
  }

  .action-btn {
    padding: 6px;
    font-size: 16px;
  }

  .switch {
    width: 40px;
    height: 20px;
  }

  .slider:before {
    height: 14px;
    width: 14px;
  }

  input:checked + .slider:before {
    transform: translateX(20px);
  }
}
</style>