<template>
  <div class="dropdown-item" :class="{ disabled: disabled }" @click="handleClick">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
interface Props {
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  if (!props.disabled) {
    emit('click')
  }
}
</script>

<style scoped>
.dropdown-item {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  color: var(--color-text-primary);
  border-bottom: 1px solid transparent;
  position: relative;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: var(--color-bg-hover);
}

.dropdown-item:hover::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--primary-color);
}

body.dark .dropdown-item:hover {
  background: rgba(91, 107, 240, 0.2);
}

.dropdown-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dropdown-item.disabled:hover {
  background: transparent;
}

.dropdown-item i {
  width: 24px;
  text-align: center;
  font-size: 18px;
  color: var(--primary-color);
  flex-shrink: 0;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.dropdown-item span {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.menu-item-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  line-height: 1.4;
  flex: 1;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* 字体大小选择器的紧凑样式 */
.dropdown-item.font-size-item {
  padding: 6px 12px;
  gap: 8px;
  font-size: 14px;
}

.dropdown-item.font-size-item.active {
  background: rgba(91, 107, 240, 0.1);
  color: var(--primary-color);
}

body.dark .dropdown-item.font-size-item.active {
  background: rgba(91, 107, 240, 0.2);
}
</style>

