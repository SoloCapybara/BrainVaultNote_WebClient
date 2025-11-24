<template>
  <div class="color-picker-wrapper" ref="wrapperRef">
    <div class="color-picker-button-group">
      <Tooltip :text="tooltipText || ''" placement="top">
        <button 
          class="color-picker-trigger"
          :class="{ active: isActive }"
          :disabled="disabled"
          @click="handleApplyColor"
          :style="triggerStyle"
        >
          <i :class="icon || 'fas fa-palette'"></i>
          <div 
            v-if="hasColor"
            class="color-indicator"
            :style="{ backgroundColor: modelValue }"
          ></div>
        </button>
      </Tooltip>
      <button 
        class="color-picker-dropdown-trigger"
        :class="{ active: showPicker }"
        :disabled="disabled"
        @click="togglePicker"
      >
        <i class="fas fa-chevron-down"></i>
      </button>
    </div>
    
    <Teleport to="body">
      <div 
        v-if="showPicker" 
        class="color-picker-dropdown" 
        :class="{ 'has-scroll': needsScroll }"
        :style="dropdownStyle" 
        ref="dropdownRef"
        @mousedown.stop
        @click.stop
      >
        <div class="color-picker-main">
        <!-- 左侧：预设颜色 -->
        <div class="color-picker-presets">
          <div 
            v-for="color in presetColors" 
            :key="color"
            class="color-preset-item"
            :class="{ active: modelValue === color, 'gradient-item': isGradient(color) }"
            :style="isGradient(color) ? { backgroundImage: color } : { backgroundColor: color }"
            @click="selectColor(color)"
          >
            <span v-if="isGradient(color)" class="gradient-label">渐变</span>
          </div>
        </div>
        
        <!-- 右侧：自定义颜色选择器 -->
        <div class="color-picker-custom-section">
          <div class="color-picker-custom-label">自定义颜色</div>
          
          <!-- 主颜色选择区域（饱和度/亮度） -->
          <div 
            ref="saturationLightnessAreaRef"
            class="saturation-lightness-area"
            :style="{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))` }"
            @mousedown="startSaturationLightnessDrag"
          >
            <div 
              class="saturation-lightness-marker"
              :style="{ 
                left: saturation + '%',
                top: (100 - lightness) + '%',
                backgroundColor: currentColor
              }"
            ></div>
          </div>
          
          <!-- 色相滑块 -->
          <div 
            ref="hueSliderRef"
            class="hue-slider"
            @mousedown="startHueDrag"
          >
            <div 
              class="hue-slider-marker"
              :style="{ left: (hue / 360 * 100) + '%' }"
            ></div>
          </div>
          
          <!-- 颜色预览和输入 -->
          <div class="color-inputs-section" v-if="!isGradient(modelValue)">
            <div class="color-preview-box" :style="{ backgroundColor: currentColor }"></div>
            <div class="color-inputs">
              <div class="color-input-group">
                <label>HEX</label>
                <input 
                  type="text" 
                  class="color-hex-text"
                  :value="modelValue.replace('#', '')"
                  maxlength="6"
                  @input="handleHexInput"
                >
              </div>
              <div class="color-input-group">
                <label>R</label>
                <input 
                  type="number" 
                  class="color-number-input"
                  :value="rgb.r"
                  min="0"
                  max="255"
                  @input="handleRgbInput('r', $event)"
                >
              </div>
              <div class="color-input-group">
                <label>G</label>
                <input 
                  type="number" 
                  class="color-number-input"
                  :value="rgb.g"
                  min="0"
                  max="255"
                  @input="handleRgbInput('g', $event)"
                >
              </div>
              <div class="color-input-group">
                <label>B</label>
                <input 
                  type="number" 
                  class="color-number-input"
                  :value="rgb.b"
                  min="0"
                  max="255"
                  @input="handleRgbInput('b', $event)"
                >
              </div>
            </div>
          </div>
          <div v-else class="gradient-preview-section">
            <div class="color-preview-box gradient-preview" :style="{ backgroundImage: modelValue }"></div>
            <div class="gradient-info">渐变色已选择</div>
          </div>
        </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Teleport } from 'vue'
import Tooltip from './Tooltip.vue'

const props = defineProps<{
  modelValue: string
  tooltipText?: string
  icon?: string
  disabled?: boolean
  presetColors?: string[]
  isActive?: boolean
  type?: 'text' | 'background'
  closeOtherPicker?: () => void // 关闭其他颜色选择器的函数
  onApplyColor?: () => void // 应用颜色的回调函数
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'open': []
  'apply': [] // 应用颜色事件
}>()

const showPicker = ref(false)
const saturationLightnessAreaRef = ref<HTMLElement | null>(null)
const hueSliderRef = ref<HTMLElement | null>(null)
const wrapperRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const dropdownStyle = ref<{ top: string; left: string; maxHeight?: string; maxWidth?: string; width?: string }>({ top: '0px', left: '0px' })
const needsScroll = ref(false)

// 预设颜色（包括渐变色）
const defaultPresetColors = [
  // 纯色
  '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
  '#FF0000', '#FF6600', '#FFCC00', '#66FF00', '#00FF66', '#00CCFF',
  '#0066FF', '#6600FF', '#CC00FF', '#FF00CC', '#FF0066', '#FF3333',
  '#FF9933', '#FFCC33', '#99FF33', '#33FF99', '#33CCFF', '#3366FF',
  '#9933FF', '#CC33FF', '#FF33CC', '#FF3399', '#E91E63', '#9C27B0',
  '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688',
  '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
  '#FF5722', '#795548', '#607D8B', '#9E9E9E',
  // 渐变色（仅用于文本颜色）- 单个字符内部从左到右渐变效果
  'linear-gradient(90deg, #3b82f6 0%, #10b981 100%)',  // 蓝绿渐变（蓝色到明显绿色）
  'linear-gradient(90deg, #ec4899 0%, #f87171 100%)',  // 红粉渐变（从左到右，单字符内渐变）
  'linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%)',  // 紫粉渐变（紫色到粉色，明显对比）
  'linear-gradient(90deg, #22c55e 0%, #d1fae5 100%)'  // 绿白渐变（从左到右，单字符内渐变）
]

const presetColors = computed(() => {
  // 如果是背景颜色类型，过滤掉渐变色
  if (props.type === 'background') {
    return (props.presetColors || defaultPresetColors).filter(color => !isGradient(color))
  }
  return props.presetColors || defaultPresetColors
})

// 判断是否为渐变色
const isGradient = (color: string): boolean => {
  return color.startsWith('linear-gradient') || color.startsWith('radial-gradient')
}

// HSL 值
const hsl = computed(() => {
  // 如果是渐变色，返回默认值
  if (isGradient(props.modelValue)) {
    return { h: 0, s: 0, l: 0 }
  }
  const hex = props.modelValue || '#000000'
  // 确保是有效的 HEX 颜色
  if (!hex.startsWith('#') || hex.length !== 7) {
    return { h: 0, s: 0, l: 0 }
  }
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2
  
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
})

const hue = ref(hsl.value.h)
const saturation = ref(hsl.value.s)
const lightness = ref(hsl.value.l)

// 当前颜色
const currentColor = computed(() => {
  // 如果是渐变色，返回原值
  if (isGradient(props.modelValue)) {
    return props.modelValue
  }
  return hslToHex(hue.value, saturation.value, lightness.value)
})

// RGB 值
const rgb = computed(() => {
  // 如果是渐变色，返回默认值
  if (isGradient(props.modelValue)) {
    return { r: 0, g: 0, b: 0 }
  }
  const hex = props.modelValue || '#000000'
  // 确保是有效的 HEX 颜色
  if (!hex.startsWith('#') || hex.length !== 7) {
    return { r: 0, g: 0, b: 0 }
  }
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16)
  }
})

// HSL 转 HEX
const hslToHex = (h: number, s: number, l: number) => {
  s /= 100
  l /= 100
  
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = l - c / 2
  
  let r = 0, g = 0, b = 0
  
  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x
  }
  
  r = Math.round((r + m) * 255)
  g = Math.round((g + m) * 255)
  b = Math.round((b + m) * 255)
  
  return `#${[r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')}`
}

// 同步 HSL 值到 modelValue
watch(() => props.modelValue, (newVal) => {
  const hex = newVal || '#000000'
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2
  
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  
  hue.value = Math.round(h * 360)
  saturation.value = Math.round(s * 100)
  lightness.value = Math.round(l * 100)
}, { immediate: true })

// 判断按钮是否应该高亮
const isActive = computed(() => {
  return props.isActive || false
})

// 是否有颜色（用于显示颜色指示条）
const hasColor = computed(() => {
  return props.modelValue && props.modelValue !== '#000000' && props.modelValue !== '#ffffff'
})

// 按钮样式
const triggerStyle = computed(() => {
  if (props.type === 'background') {
    return {
      color: '#6c757d'
    }
  } else {
    return {
      color: props.modelValue || '#6c757d'
    }
  }
})

// 应用颜色（点击主按钮时）
const handleApplyColor = () => {
  if (props.disabled) return
  emit('apply')
  if (props.onApplyColor) {
    props.onApplyColor()
  }
}

// 更新下拉菜单位置
const updateDropdownPosition = () => {
  if (!showPicker.value || !wrapperRef.value) return
  
  nextTick(() => {
    if (!wrapperRef.value) return
    
    const wrapperRect = wrapperRef.value.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth
    
    // ColorPicker 的宽度大约是 400px
    const dropdownWidth = 400
    
    // 计算菜单应该出现的位置
    let menuTop = wrapperRect.bottom + 8
    let menuLeft = wrapperRect.left
    
    // 如果右侧空间不够，调整到左侧
    if (menuLeft + dropdownWidth > viewportWidth) {
      menuLeft = viewportWidth - dropdownWidth - 16
      // 如果左侧也不够，则使用最大宽度并添加滚动
      if (menuLeft < 16) {
        menuLeft = 16
      }
    }
    
    // 等待 DOM 更新后获取实际内容尺寸
    nextTick(() => {
      if (!dropdownRef.value) return
      
      // 先完全移除所有宽度和高度限制，确保能获取到真实的 scrollWidth 和 scrollHeight
      dropdownRef.value.style.width = 'auto'
      dropdownRef.value.style.maxWidth = 'none'
      dropdownRef.value.style.maxHeight = 'none'
      dropdownRef.value.style.overflowX = 'hidden'
      dropdownRef.value.style.overflowY = 'hidden'
      
      // 再次等待 DOM 更新，确保样式重置生效
      nextTick(() => {
        if (!dropdownRef.value) return
        
        // 使用 requestAnimationFrame 确保在浏览器重绘前获取准确的尺寸
        requestAnimationFrame(() => {
          if (!dropdownRef.value) return
          
          // 获取实际内容高度和宽度（不包含滚动条）
          const actualHeight = dropdownRef.value.scrollHeight
          const actualWidth = dropdownRef.value.scrollWidth
          // 计算可用高度：视口高度减去菜单位置和底部边距
          const availableHeight = viewportHeight - menuTop - 16
          
          // 如果内容超出浏览器底部，必须显示纵向滚动条
          const needsVerticalScroll = actualHeight > availableHeight
          
          // 计算可用屏幕宽度（视口宽度减去菜单位置和边距）
          const availableScreenWidth = viewportWidth - menuLeft - 16
          
          // 检查是否需要横向滚动：只有当实际内容宽度超过可用屏幕宽度时，才需要横向滚动
          let finalMaxWidth: string | undefined = undefined
          let finalWidth: string | undefined = undefined
          let needsHorizontalScroll = false
          
          // 只有当实际内容宽度超过可用屏幕宽度时，才需要横向滚动
          // 检查当前状态，使用更大的容差值来避免频繁切换
          const currentHasScroll = dropdownRef.value.style.overflowX === 'auto'
          
          // 使用更大的容差值（20px），避免在边界情况下频繁切换
          // 如果当前有滚动条，需要明显超出才移除；如果当前没有滚动条，需要明显不足才添加
          const threshold = 20
          
          if (currentHasScroll) {
            // 当前有滚动条：只有当内容明显小于可用宽度时才移除滚动条
            // 使用更大的容差值（30px），确保只有在明显不足时才移除
            if (actualWidth < availableScreenWidth - 30) {
              finalWidth = `${actualWidth}px`
              needsHorizontalScroll = false
            } else {
              // 保持滚动条状态
              finalMaxWidth = `${availableScreenWidth}px`
              needsHorizontalScroll = true
            }
          } else {
            // 当前没有滚动条：只有当内容明显超出可用宽度时才添加滚动条
            if (actualWidth > availableScreenWidth + threshold) {
              finalMaxWidth = `${availableScreenWidth}px`
              needsHorizontalScroll = true
            } else {
              // 保持完全显示状态
              finalWidth = `${actualWidth}px`
              needsHorizontalScroll = false
            }
          }
          
          // 如果内容超出浏览器底部，必须显示纵向滚动条
          if (needsVerticalScroll) {
            needsScroll.value = true
            dropdownStyle.value = {
              top: `${menuTop}px`,
              left: `${menuLeft}px`,
              maxHeight: `${availableHeight}px`,
              maxWidth: finalMaxWidth,
              width: finalWidth,
            }
            // 确保纵向滚动条显示
            if (dropdownRef.value) {
              dropdownRef.value.style.overflowY = 'auto'
            }
          } else {
            // 可以完全显示，不限制高度，不添加纵向滚动
            needsScroll.value = false
            dropdownStyle.value = {
              top: `${menuTop}px`,
              left: `${menuLeft}px`,
              maxWidth: finalMaxWidth,
              width: finalWidth,
            }
            // 确保纵向滚动条隐藏
            if (dropdownRef.value) {
              dropdownRef.value.style.overflowY = 'hidden'
            }
          }
          
          // 如果需要横向滚动，直接设置 DOM 元素的 overflow-x
          if (dropdownRef.value) {
            if (needsHorizontalScroll) {
              dropdownRef.value.style.overflowX = 'auto'
            } else {
              dropdownRef.value.style.overflowX = 'hidden'
            }
          }
        })
      })
    })
  })
}

const togglePicker = () => {
  if (props.disabled) return
  const wasOpen = showPicker.value
  showPicker.value = !showPicker.value
  if (showPicker.value && !wasOpen) {
    emit('open')
    if (props.closeOtherPicker) {
      props.closeOtherPicker()
    }
    updateDropdownPosition()
  }
}

const selectColor = (color: string) => {
  emit('update:modelValue', color)
  showPicker.value = false
}

// 饱和度/亮度拖拽
let isDraggingSaturationLightness = false

const startSaturationLightnessDrag = (e: MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()
  isDraggingSaturationLightness = true
  updateSaturationLightness(e)
  document.addEventListener('mousemove', handleSaturationLightnessMove)
  document.addEventListener('mouseup', stopSaturationLightnessDrag)
}

const handleSaturationLightnessMove = (e: MouseEvent) => {
  if (isDraggingSaturationLightness) {
    updateSaturationLightness(e)
  }
}

const stopSaturationLightnessDrag = () => {
  isDraggingSaturationLightness = false
  document.removeEventListener('mousemove', handleSaturationLightnessMove)
  document.removeEventListener('mouseup', stopSaturationLightnessDrag)
}

const updateSaturationLightness = (e: MouseEvent) => {
  if (!saturationLightnessAreaRef.value) return
  const rect = saturationLightnessAreaRef.value.getBoundingClientRect()
  const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
  const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))
  
  saturation.value = x
  lightness.value = 100 - y
  
  emit('update:modelValue', currentColor.value)
}

// 色相拖拽
let isDraggingHue = false

const startHueDrag = (e: MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()
  isDraggingHue = true
  updateHue(e)
  document.addEventListener('mousemove', handleHueMove)
  document.addEventListener('mouseup', stopHueDrag)
}

const handleHueMove = (e: MouseEvent) => {
  if (isDraggingHue) {
    updateHue(e)
  }
}

const stopHueDrag = () => {
  isDraggingHue = false
  document.removeEventListener('mousemove', handleHueMove)
  document.removeEventListener('mouseup', stopHueDrag)
}

const updateHue = (e: MouseEvent) => {
  if (!hueSliderRef.value) return
  const rect = hueSliderRef.value.getBoundingClientRect()
  const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
  
  hue.value = Math.round(x * 3.6)
  
  emit('update:modelValue', currentColor.value)
}

// RGB 输入处理
const handleRgbInput = (channel: 'r' | 'g' | 'b', event: Event) => {
  const target = event.target as HTMLInputElement
  const value = Math.max(0, Math.min(255, parseInt(target.value) || 0))
  const newRgb = { ...rgb.value, [channel]: value }
  const hex = `#${[newRgb.r, newRgb.g, newRgb.b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')}`
  emit('update:modelValue', hex)
}

// HEX 输入处理
const handleHexInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let hex = target.value.replace(/[^0-9A-Fa-f]/g, '')
  if (hex.length === 6) {
    emit('update:modelValue', '#' + hex)
  }
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  // 检查是否点击在 ColorPicker 内部（包括 dropdown 和 wrapper）
  if (!target.closest('.color-picker-wrapper') && !target.closest('.color-picker-dropdown')) {
    showPicker.value = false
  }
}

watch(showPicker, (newVal) => {
  if (newVal) {
    // 使用 mousedown 而不是 click，避免与输入框和滑条的交互冲突
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 0)
    // 重置样式，确保能获取到真实的 scrollWidth
    nextTick(() => {
      if (dropdownRef.value) {
        dropdownRef.value.style.width = 'auto'
        dropdownRef.value.style.maxWidth = 'none'
        dropdownRef.value.style.overflowX = 'hidden'
      }
      // 等待样式重置后再更新位置
      nextTick(() => {
        updateDropdownPosition()
      })
    })
  } else {
    document.removeEventListener('mousedown', handleClickOutside)
    // 关闭时重置样式
    if (dropdownRef.value) {
      dropdownRef.value.style.width = ''
      dropdownRef.value.style.maxWidth = ''
      dropdownRef.value.style.overflowX = ''
    }
  }
})

// 防抖函数
let resizeTimer: ReturnType<typeof setTimeout> | null = null
const handleResize = () => {
  if (showPicker.value) {
    // 清除之前的定时器
    if (resizeTimer) {
      clearTimeout(resizeTimer)
    }
    // 使用防抖，延迟 100ms 执行
    resizeTimer = setTimeout(() => {
      updateDropdownPosition()
      resizeTimer = null
    }, 100)
  }
}

const handleScroll = (e: Event) => {
  if (showPicker.value) {
    // 检查滚动事件是否来自 ColorPicker 内部
    const target = e.target as HTMLElement
    if (target && dropdownRef.value && dropdownRef.value.contains(target)) {
      // 如果是 ColorPicker 内部的滚动，不更新位置，避免抖动
      return
    }
    // 只有窗口滚动时才更新位置
    updateDropdownPosition()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleScroll, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  document.removeEventListener('mousemove', handleSaturationLightnessMove)
  document.removeEventListener('mouseup', stopSaturationLightnessDrag)
  document.removeEventListener('mousemove', handleHueMove)
  document.removeEventListener('mouseup', stopHueDrag)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleScroll, true)
  // 清除防抖定时器
  if (resizeTimer) {
    clearTimeout(resizeTimer)
    resizeTimer = null
  }
})

// 暴露 showPicker 给父组件
defineExpose({
  showPicker
})
</script>

<style scoped>
.color-picker-wrapper {
  position: relative;
  display: inline-block;
}

.color-picker-button-group {
  display: inline-flex;
  align-items: stretch;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid transparent;
}

.color-picker-button-group:hover:not(:has(.color-picker-trigger:disabled)) {
  border-color: var(--color-border);
}

body.dark .color-picker-button-group:hover:not(:has(.color-picker-trigger:disabled)) {
  border-color: #3a4152;
}

.color-picker-trigger {
  background: none;
  border: none;
  font-size: 16px;
  color: #6c757d;
  cursor: pointer;
  padding: 8px 12px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 6px 0 0 6px;
  min-width: 36px;
  line-height: 1;
  box-sizing: border-box;
}

.color-picker-trigger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.color-picker-trigger:hover:not(:disabled) {
  background-color: #f0f4f8;
}

.color-picker-trigger.active {
  background-color: var(--primary-color);
  color: white;
}

.color-picker-trigger.active .color-indicator {
  border-color: white;
}

body.dark .color-picker-trigger:hover:not(:disabled) {
  background-color: #333333;
  color: #ffffff;
}

.color-indicator {
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 2px;
  border-radius: 1px;
  border: 1px solid rgba(0, 0, 0, 0.2);
}

body.dark .color-indicator {
  border-color: rgba(255, 255, 255, 0.3);
}

.color-picker-dropdown-trigger {
  background: none;
  border: none;
  font-size: 10px;
  color: #6c757d;
  cursor: pointer;
  padding: 8px 8px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: 1px solid var(--color-border);
  border-radius: 0 6px 6px 0;
  line-height: 1;
  box-sizing: border-box;
  margin: 0;
}

.color-picker-dropdown-trigger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.color-picker-dropdown-trigger:hover:not(:disabled) {
  background-color: #f0f4f8;
}

.color-picker-dropdown-trigger.active {
  background-color: var(--primary-color);
  color: white;
  border-left-color: rgba(255, 255, 255, 0.2);
}

body.dark .color-picker-dropdown-trigger {
  border-left-color: #3a4152;
}

body.dark .color-picker-dropdown-trigger:hover:not(:disabled) {
  background-color: #333333;
  color: #ffffff;
}

body.dark .color-picker-dropdown-trigger.active {
  border-left-color: rgba(255, 255, 255, 0.2);
}

.color-picker-dropdown {
  position: fixed;
  background: #ffffff;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  min-width: 320px;
  width: 400px; /* 默认宽度，会被动态覆盖 */
  animation: colorPickerEnter 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  overflow-y: visible;
  overflow-x: hidden;
  transform-origin: top left;
}

/* 只有当需要滚动时才启用滚动条 */
.color-picker-dropdown.has-scroll {
  overflow-y: auto;
}

/* 如果内容超出，启用横向滚动 */
.color-picker-dropdown {
  overflow-x: hidden;
}

.color-picker-dropdown[style*="max-width"],
.color-picker-dropdown[style*="overflow-x: auto"] {
  overflow-x: auto;
}

/* 自定义滚动条样式 */
.color-picker-dropdown::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.color-picker-dropdown::-webkit-scrollbar-track {
  background: transparent;
}

.color-picker-dropdown::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.color-picker-dropdown::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

body.dark .color-picker-dropdown::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

body.dark .color-picker-dropdown::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.color-picker-main {
  display: flex;
  width: 100%;
  min-width: fit-content;
  flex-shrink: 0;
}

body.dark .color-picker-dropdown {
  background: #1a1a1a;
  border-color: #3a4152;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

@keyframes colorPickerEnter {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.color-picker-presets {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
  padding: 12px;
  border-right: 1px solid var(--color-border);
  flex-shrink: 0;
}

body.dark .color-picker-presets {
  border-right-color: #3a4152;
}

.color-preset-item {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  position: relative;
}

.color-preset-item:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.color-preset-item.active {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(91, 107, 240, 0.3);
}

.color-preset-item.active::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 14px;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  z-index: 2;
}

.color-preset-item.gradient-item {
  position: relative;
  overflow: hidden;
}

.color-preset-item.gradient-item .gradient-label {
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 8px;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  font-weight: bold;
  z-index: 1;
  white-space: nowrap;
}

.color-preset-item.gradient-item.active .gradient-label {
  color: white;
}

.color-picker-custom-section {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.color-picker-custom-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

body.dark .color-picker-custom-label {
  color: #ffffff;
}

.saturation-lightness-area {
  width: 100%;
  height: 180px;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  position: relative;
  cursor: crosshair;
  user-select: none;
}

body.dark .saturation-lightness-area {
  border-color: #3a4152;
}

.saturation-lightness-marker {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid white;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3);
  pointer-events: none;
}

.hue-slider {
  width: 100%;
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(to right, 
    #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000
  );
  position: relative;
  cursor: pointer;
  user-select: none;
  border: 1px solid var(--color-border);
}

body.dark .hue-slider {
  border-color: #3a4152;
}

.hue-slider-marker {
  position: absolute;
  width: 16px;
  height: 16px;
  top: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.5);
  pointer-events: none;
  background: hsl(var(--hue, 0), 100%, 50%);
}

.color-inputs-section {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.color-preview-box {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  flex-shrink: 0;
}

body.dark .color-preview-box {
  border-color: #3a4152;
}

.color-inputs {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.color-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-input-group label {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  min-width: 24px;
}

body.dark .color-input-group label {
  color: #a0a7b5;
}

.color-number-input,
.color-hex-text {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 14px;
  background: var(--color-background);
  color: var(--color-text-primary);
}

.color-hex-text {
  font-family: monospace;
  text-transform: uppercase;
}

body.dark .color-number-input,
body.dark .color-hex-text {
  border-color: #3a4152;
  background: #2a2a2a;
  color: #ffffff;
}

.color-number-input:focus,
.color-hex-text:focus {
  outline: none;
  border-color: var(--primary-color);
}

.gradient-preview-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.gradient-preview {
  width: 100%;
  height: 40px;
  border-radius: 4px;
  border: 1px solid var(--color-border);
}

body.dark .gradient-preview {
  border-color: #3a4152;
}

.gradient-info {
  font-size: 12px;
  color: var(--color-text-secondary);
  text-align: center;
}

body.dark .gradient-info {
  color: #a0a7b5;
}
</style>
