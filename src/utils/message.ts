// 使用事件总线的方式，避免创建新的 Vue 应用实例
let messageInstance: any = null

const getMessageInstance = () => {
  if (!messageInstance) {
    console.warn('Message instance not initialized. Make sure Message component is mounted in App.vue')
    return null
  }
  return messageInstance
}

export const setMessageInstance = (instance: any) => {
  messageInstance = instance
}

export interface MessageOptions {
  message: string
  type?: 'success' | 'warning' | 'error' | 'info'
  duration?: number
  showClose?: boolean
  onClose?: () => void
}

const showMessage = (options: MessageOptions | string) => {
  const instance = getMessageInstance()
  if (!instance) {
    console.warn('Message component not mounted')
    return null
  }
  const opts: MessageOptions = typeof options === 'string' 
    ? { message: options }
    : options
  
  return instance.addMessage(opts)
}

export const Message = {
  success: (message: string, duration?: number) => {
    return showMessage({ message, type: 'success', duration })
  },
  
  warning: (message: string, duration?: number) => {
    return showMessage({ message, type: 'warning', duration })
  },
  
  error: (message: string, duration?: number) => {
    return showMessage({ message, type: 'error', duration })
  },
  
  info: (message: string, duration?: number) => {
    return showMessage({ message, type: 'info', duration })
  },
  
  show: (options: MessageOptions | string, duration?: number) => {
    if (typeof options === 'string') {
      return showMessage({ message: options, duration })
    }
    return showMessage({ ...options, duration: duration ?? options.duration })
  },
  
  close: (id: number) => {
    if (messageInstance) {
      messageInstance.closeMessage(id)
    }
  },
  
  clearAll: () => {
    if (messageInstance) {
      messageInstance.clearAll()
    }
  }
}

export default Message

