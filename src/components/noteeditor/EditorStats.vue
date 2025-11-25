<template>
  <div class="content-word-count">
    <div class="word-count-item">
      内容字数: {{ wordCount }}
    </div>
    <div class="word-count-item">
      标点: {{ punctuationCount }}
    </div>
    <div class="word-count-item">
      共{{ lineCount }}行
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
  gap: 15px;
  flex-shrink: 0;
}

.word-count-item {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

@media (max-width: 1400px) {
  .content-word-count {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    width: 100%;
  }

  .word-count-item {
    width: 100%;
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .content-word-count {
    justify-content: center;
    gap: 8px;
    flex-direction: row;
  }

  .word-count-item {
    padding: 4px 8px;
    font-size: 11px;
    width: auto;
    justify-content: center;
  }
}
</style>

