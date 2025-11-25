<template>
  <Teleport to="body">
    <div 
      class="color-picker-modal" 
      :class="{ active: modelValue }"
      @click="$emit('close')"
    >
      <div 
        class="modal-content" 
        @click.stop
      >
        <div class="modal-header">
          <h3>主题设置</h3>
          <button class="close-btn" @click="$emit('close')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <!-- 主题模式切换 -->
        <div class="theme-mode-section">
          <h4>主题模式</h4>
          <p class="theme-tip">主题模式会同时修改侧边栏和编辑区域的颜色</p>
          <div class="theme-mode-options">
            <div 
              class="theme-mode-option" 
              :class="{ active: !isDark }"
              @click="$emit('select-light-mode')"
            >
              <div class="mode-preview light">
                <div class="preview-window light">
                  <div class="preview-header"></div>
                  <div class="preview-content"></div>
                </div>
              </div>
              <div class="mode-info">
                <i class="fas fa-sun"></i>
                <span>浅色模式</span>
              </div>
            </div>
            <div 
              class="theme-mode-option" 
              :class="{ active: isDark }"
              @click="$emit('select-dark-mode')"
            >
              <div class="mode-preview dark">
                <div class="preview-window dark">
                  <div class="preview-header"></div>
                  <div class="preview-content"></div>
                </div>
              </div>
              <div class="mode-info">
                <i class="fas fa-moon"></i>
                <span>深色模式</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 主题颜色选择 -->
        <div class="theme-color-section">
          <h4>主题颜色</h4>
          <p class="theme-tip">主题色只修改侧边栏颜色，不切换编辑区域颜色</p>
          <div class="color-grid">
            <div 
              v-for="color in themeColors" 
              :key="color.value"
              class="color-option-modal" 
              :class="{ 
                active: selectedColor === color.value && userSelectedThemeColor,
              }"
              :style="{ backgroundColor: color.value }"
              @click="$emit('select-color', color.value)"
            >
              <i class="fas fa-check" v-if="selectedColor === color.value && userSelectedThemeColor"></i>
              <div class="color-name">{{ color.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { THEME_COLORS } from '../composables/useSidebarTheme'

defineProps<{
  modelValue: boolean
  isDark: boolean
  selectedColor: string
  userSelectedThemeColor: boolean
  themeColors?: typeof THEME_COLORS
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
  'close': []
  'select-light-mode': []
  'select-dark-mode': []
  'select-color': [color: string]
}>()

const themeColors = THEME_COLORS
</script>

<style scoped>
.color-picker-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.color-picker-modal.active {
  opacity: 1;
  visibility: visible;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  transform: scale(0.9);
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.color-picker-modal.active .modal-content {
  transform: scale(1);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: white;
  z-index: 10;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.theme-mode-section,
.theme-color-section {
  padding: 16px 20px;
}

.theme-mode-section h4,
.theme-color-section h4 {
  margin: 0 0 6px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.theme-tip {
  font-size: 11px;
  color: #666;
  margin: 0 0 12px 0;
  padding: 6px 10px;
  background: #f5f5f5;
  border-radius: 4px;
  line-height: 1.4;
}

.theme-mode-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.theme-mode-option {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.theme-mode-option:hover {
  border-color: #999;
}

.theme-mode-option.active {
  border-color: #5b6bf0;
  background: #f0f4ff;
}

.mode-preview {
  width: 100%;
  height: 60px;
  border-radius: 6px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mode-preview.light {
  background: #f5f5f5;
}

.mode-preview.dark {
  background: #1a1a1a;
}

.preview-window {
  width: 50px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-window.light {
  background: white;
}

.preview-window.dark {
  background: #2a2a2a;
}

.preview-header {
  height: 10px;
  background: #e0e0e0;
}

.preview-window.dark .preview-header {
  background: #333;
}

.preview-content {
  height: 30px;
  background: white;
}

.preview-window.dark .preview-content {
  background: #1a1a1a;
}

.mode-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #333;
}

.mode-info i {
  font-size: 14px;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.color-option-modal {
  aspect-ratio: 1;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s;
  border: 3px solid transparent;
  min-width: 44px;
  min-height: 44px;
}

.color-option-modal:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.color-option-modal.active {
  border-color: #333;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.color-option-modal i {
  color: white;
  font-size: 16px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  margin-bottom: 2px;
}

.color-name {
  font-size: 10px;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  font-weight: 600;
  text-align: center;
  margin-top: 2px;
  line-height: 1.2;
}

body.dark .modal-content {
  background: #1a1a1a;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

body.dark .modal-header {
  border-bottom-color: #333;
  background: #1a1a1a;
}

body.dark .modal-header h3 {
  color: #fff;
}

body.dark .close-btn {
  color: #ccc;
}

body.dark .close-btn:hover {
  background: #333;
  color: #fff;
}

body.dark .theme-mode-section h4,
body.dark .theme-color-section h4 {
  color: #fff;
}

body.dark .theme-tip {
  background: #2a2a2a;
  color: #ccc;
}

body.dark .theme-mode-option {
  border-color: #333;
}

body.dark .theme-mode-option:hover {
  border-color: #555;
}

body.dark .theme-mode-option.active {
  border-color: #5b6bf0;
  background: #2a2a2a;
}

body.dark .mode-info {
  color: #fff;
}

@media (max-width: 768px) {
  .color-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .theme-mode-section h4,
  .theme-color-section h4 {
    font-size: 13px;
  }
  
  .theme-tip {
    font-size: 10px;
    padding: 5px 8px;
  }
  
  .theme-mode-option {
    padding: 10px;
  }
  
  .color-option-modal {
    min-width: 36px;
    min-height: 36px;
  }
}
</style>

