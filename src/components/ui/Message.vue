<template>
  <Teleport to="body">
    <TransitionGroup
      name="message"
      tag="div"
      class="message-container"
    >
      <div
        v-for="message in messages"
        :key="message.id"
        :class="['message-item', `message-${message.type}`]"
        :style="{ zIndex: message.zIndex }"
      >
        <div class="message-content">
          <i v-if="message.icon" :class="['message-icon', message.icon]"></i>
          <span class="message-text">{{ message.message }}</span>
          <button
            v-if="message.showClose"
            class="message-close"
            @click="closeMessage(message.id)"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

export interface MessageOptions {
  message: string
  type?: 'success' | 'warning' | 'error' | 'info'
  duration?: number
  showClose?: boolean
  onClose?: () => void
}

interface MessageItem extends MessageOptions {
  id: number
  zIndex: number
  icon?: string
  timer?: number
}

const messages = ref<MessageItem[]>([])
let messageId = 0
let zIndex = 2000
let lastMessageTime = 0
const MESSAGE_THROTTLE = 1000 // 1秒内只显示一条消息

const getIcon = (type: string) => {
  const icons: Record<string, string> = {
    success: 'fas fa-check-circle',
    warning: 'fas fa-exclamation-triangle',
    error: 'fas fa-times-circle',
    info: 'fas fa-info-circle'
  }
  return icons[type] || icons.info
}

const addMessage = (options: MessageOptions) => {
  const now = Date.now()
  
  // 默认持续时间为 3 秒，如果设置为 0 则不自动关闭
  const defaultDuration = 3000
  
  // 节流：如果距离上一条消息时间太短，则更新上一条消息而不是创建新的
  if (now - lastMessageTime < MESSAGE_THROTTLE && messages.value.length > 0) {
    const lastMessage = messages.value[messages.value.length - 1]
    if (lastMessage && lastMessage.timer) {
      clearTimeout(lastMessage.timer)
    }
    
    // 更新最后一条消息
    if (lastMessage) {
      lastMessage.message = options.message
      lastMessage.type = options.type || lastMessage.type || 'info'
      lastMessage.icon = getIcon(lastMessage.type)
      // 如果传入了 duration，使用传入的值，否则使用默认值
      lastMessage.duration = options.duration !== undefined ? options.duration : defaultDuration
      
      // 重新设置自动关闭
      if (lastMessage.duration > 0) {
        lastMessage.timer = window.setTimeout(() => {
          closeMessage(lastMessage.id)
        }, lastMessage.duration)
      }
      
      lastMessageTime = now
      return lastMessage.id
    }
  }
  
  const id = ++messageId
  const type = options.type || 'info'
  // 如果传入了 duration，使用传入的值，否则使用默认值
  const duration = options.duration !== undefined ? options.duration : defaultDuration
  const showClose = options.showClose ?? false
  
  const message: MessageItem = {
    id,
    zIndex: zIndex++,
    message: options.message,
    type,
    duration,
    showClose,
    onClose: options.onClose,
    icon: getIcon(type)
  }
  
  messages.value.push(message)
  lastMessageTime = now
  
  // 自动关闭（duration > 0 时才设置定时器）
  if (duration > 0) {
    message.timer = window.setTimeout(() => {
      closeMessage(id)
    }, duration)
  }
  
  return id
}

const closeMessage = (id: number) => {
  const index = messages.value.findIndex(msg => msg.id === id)
  if (index === -1) return
  
  const message = messages.value[index]
  if (!message) return
  
  if (message.timer) {
    clearTimeout(message.timer)
  }
  
  if (message.onClose) {
    message.onClose()
  }
  
  messages.value.splice(index, 1)
}

const clearAll = () => {
  messages.value.forEach(msg => {
    if (msg.timer) {
      clearTimeout(msg.timer)
    }
  })
  messages.value = []
}

// 导出方法供外部调用
defineExpose({
  addMessage,
  closeMessage,
  clearAll
})
</script>

<style scoped lang="scss">
.message-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.message-item {
  pointer-events: auto;
  min-width: 300px;
  max-width: 500px;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  transform-origin: center top;
  will-change: transform, opacity;
}

.message-content {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.message-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.message-text {
  flex: 1;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.message-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
  transition: opacity 0.2s;
  flex-shrink: 0;
  
  &:hover {
    opacity: 1;
  }
  
  i {
    font-size: 14px;
  }
}

// 不同类型消息的样式
.message-success {
  background: rgba(103, 194, 58, 0.9);
  color: #ffffff;
  border: 1px solid rgba(103, 194, 58, 0.3);
}

.message-warning {
  background: rgba(230, 162, 60, 0.9);
  color: #ffffff;
  border: 1px solid rgba(230, 162, 60, 0.3);
}

.message-error {
  background: rgba(245, 108, 108, 0.9);
  color: #ffffff;
  border: 1px solid rgba(245, 108, 108, 0.3);
}

.message-info {
  background: rgba(91, 107, 240, 0.9);
  color: #ffffff;
  border: 1px solid rgba(91, 107, 240, 0.3);
}

// 深色模式
body.dark {
  .message-success {
    background: rgba(103, 194, 58, 0.2);
    border-color: rgba(103, 194, 58, 0.5);
  }
  
  .message-warning {
    background: rgba(230, 162, 60, 0.2);
    border-color: rgba(230, 162, 60, 0.5);
  }
  
  .message-error {
    background: rgba(245, 108, 108, 0.2);
    border-color: rgba(245, 108, 108, 0.5);
  }
  
  .message-info {
    background: rgba(91, 107, 240, 0.2);
    border-color: rgba(91, 107, 240, 0.5);
  }
}

// 苹果风格的弹性动画
@keyframes messageEnter {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(-20px);
  }
  50% {
    transform: scale(1.05) translateY(0);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes messageLeave {
  0% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  100% {
    opacity: 0;
    transform: scale(0.8) translateY(-20px);
  }
}

.message-enter-active {
  animation: messageEnter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.message-leave-active {
  animation: messageLeave 0.25s cubic-bezier(0.55, 0.055, 0.675, 0.19);
}

.message-move {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>

