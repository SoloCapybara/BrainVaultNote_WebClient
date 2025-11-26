<template>
  <div class="content-word-count">
    <div class="word-count-item">
      <span class="label">内容字数:</span>
      <span class="value">{{ wordCount}}</span>
    </div>
    <div class="word-count-item">
      <span class="label">标点:</span>
      <span class="value">{{ punctuationCount}}</span>
    </div>
    <div class="word-count-item">
      <span class="label">共</span>
      <span class="value">{{ lineCount}}</span>
      <span class="label">行</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  wordCount: number
  punctuationCount: number
  lineCount: number
}>()
</script>

<style scoped>
.content-word-count {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  user-select: none;
}

.word-count-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.word-count-item .label {
  opacity: 0.85;
}

.word-count-item .value {
  font-weight: 600;
  color: var(--color-text-primary);
}

@media (max-width: 1400px) {
  .content-word-count {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    width: 100%;
  }

  .word-count-item {
    width: auto;
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .content-word-count {
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;
    flex-direction: row;
  }

  .word-count-item {
    padding: 4px 10px;
    font-size: 11px;
  }
}
</style>

