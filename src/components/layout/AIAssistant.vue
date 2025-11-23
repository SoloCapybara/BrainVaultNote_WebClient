<template>
  <div class="ai-assistant" :class="{ collapsed: collapsed }">
    <!-- 统计卡片 -->
    <div class="stats-card">
      <h3><i class="fas fa-chart-line"></i> 笔记统计</h3>
      <div class="stats-number">127</div>
      <div class="stats-desc">总笔记数</div>
      <div class="stats-number">18,542</div>
      <div class="stats-desc">总字数</div>
    </div>
    
    <!-- AI助手功能 -->
    <div class="ai-section">
      <h3><i class="fas fa-robot"></i> AI助手</h3>
      <button class="ai-action-btn" @click="$emit('generate-summary')">
        <i class="fas fa-magic"></i> 智能摘要
      </button>
      <button class="ai-action-btn" @click="$emit('generate-tags')">
        <i class="fas fa-tags"></i> 生成标签
      </button>
      <button class="ai-action-btn" @click="$emit('find-related')">
        <i class="fas fa-search"></i> 相关内容
      </button>
    </div>
    
    <!-- AI建议 -->
    <div class="ai-section">
      <h3><i class="fas fa-lightbulb"></i> AI建议</h3>
      <div class="ai-suggestion">
        <h4>扩展本节内容</h4>
        <p>建议在大语言模型部分添加更多关于参数规模和训练数据的细节。</p>
      </div>
      <div class="ai-suggestion">
        <h4>添加相关研究</h4>
        <p>可以考虑引用最近发表的关于多模态学习的几篇重要论文。</p>
      </div>
      <div class="ai-suggestion">
        <h4>优化结构</h4>
        <p>建议将"边缘计算与AI部署"部分移到"强化学习的应用拓展"之前。</p>
      </div>
      <div class="ai-suggestion">
        <h4>内容补充</h4>
        <p>可以在"深度学习基础"章节中添加更多关于反向传播算法的数学推导过程。</p>
      </div>
      <div class="ai-suggestion">
        <h4>案例研究</h4>
        <p>建议添加一些实际的企业AI应用案例，让内容更加生动具体。</p>
      </div>
      <div class="ai-suggestion">
        <h4>技术更新</h4>
        <p>考虑更新最新的AI技术发展，包括GPT-4、Claude等大模型的最新进展。</p>
      </div>
      <div class="ai-suggestion">
        <h4>实践指导</h4>
        <p>可以添加一些动手实践的部分，帮助读者更好地理解AI技术的应用。</p>
      </div>
    </div>
    
    <!-- 标签建议 -->
    <div class="ai-section">
      <h3><i class="fas fa-tags"></i> 标签建议</h3>
      <div class="tag-suggestions">
        <span 
          v-for="tag in suggestedTags" 
          :key="tag"
          class="tag-suggestion"
          @click="addTag(tag)"
        >
          {{ tag }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Props
defineProps<{
  note: any
  collapsed?: boolean
}>()

// Emits
const emit = defineEmits<{
  'close': []
  'generate-summary': []
  'generate-tags': []
  'find-related': []
  'toggle-collapse': []
}>()

// 响应式状态
const suggestedTags = ref([
  '人工智能',
  '技术趋势',
  '机器学习',
  '深度学习',
  '自然语言处理',
  '计算机视觉',
  '强化学习',
  '神经网络',
  '数据科学',
  '算法优化',
  '模型训练',
  '特征工程',
  '数据预处理',
  '模型评估',
  '超参数调优',
  '集成学习'
])

// 方法
const addTag = (tag: string) => {
  console.log('添加标签:', tag)
  // 这里可以触发添加标签的逻辑
}
</script>

<style scoped>
.ai-assistant {
  width: 280px;
  min-width: 250px;
  max-width: 320px;
  background-color: #ffffff;
  border-left: 1px solid #eaeaea;
  padding: 20px;
  overflow-y: auto;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  height: calc(100vh - 60px);
  max-height: calc(100vh - 60px);
  flex-shrink: 0;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  position: relative;
  z-index: 1;
}

/* 折叠状态 */
.ai-assistant.collapsed {
  width: 0 !important;
  min-width: 0 !important;
  max-width: 0 !important;
  border-left: none;
  padding: 0;
  overflow: hidden;
}

.ai-assistant.collapsed > * {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

/* 防止所有子元素文字被选中 */
.ai-assistant * {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* AI栏自定义滚动条 */
.ai-assistant::-webkit-scrollbar {
  width: 6px;
}

.ai-assistant::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.ai-assistant::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  transition: background 0.3s ease;
}

.ai-assistant::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* 深色模式滚动条 */
body.dark .ai-assistant::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

body.dark .ai-assistant::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

body.dark .ai-assistant::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

body.dark .ai-assistant {
  background-color: var(--color-bg-primary);
  border-left-color: var(--color-border);
}

body.dark .ai-section h3 {
  color: #e9ecef;
}

body.dark .ai-section p {
  color: #cccccc;
}

body.dark .stats-card h3 {
  color: #e9ecef;
}

body.dark .stats-number {
  color: #ffffff;
}

body.dark .stats-desc {
  color: #cccccc;
}

body.dark .ai-action-btn {
  background-color: #1a1a1a;
  color: #e9ecef;
  border: 1px solid #333333;
}

body.dark .ai-action-btn:hover {
  background-color: #2a2a2a;
  color: #ffffff;
}

body.dark .ai-suggestion h4 {
  color: #ffffff;
}

body.dark .ai-suggestion p {
  color: #cccccc;
}

body.dark .tag-suggestion {
  background-color: #1a1a1a;
  color: #7b9fff;
  border: 1px solid #333333;
}

body.dark .tag-suggestion:hover {
  background-color: #2a2a2a;
  color: #9bb5ff;
}

/* 浅色模式下的AI助手样式 */
body:not(.dark) .ai-assistant {
  background-color: #ffffff !important;
  border-left-color: #e0e0e0 !important;
}

body:not(.dark) .ai-section h3 {
  color: #333333 !important;
}

body:not(.dark) .ai-section p {
  color: #666666 !important;
}

body:not(.dark) .stats-card h3 {
  color: #333333 !important;
}

body:not(.dark) .stats-number {
  color: #000000 !important;
  font-weight: 700 !important;
}

body:not(.dark) .stats-desc {
  color: #333333 !important;
  font-weight: 500 !important;
}

body:not(.dark) .ai-action-btn {
  background-color: #f5f5f5 !important;
  color: #333333 !important;
  border-color: #e0e0e0 !important;
}

body:not(.dark) .ai-action-btn:hover {
  background-color: #e0e0e0 !important;
  color: #1976d2 !important;
}

body:not(.dark) .ai-suggestion h4 {
  color: #333333 !important;
}

body:not(.dark) .ai-suggestion p {
  color: #666666 !important;
}

body:not(.dark) .ai-suggestion {
  background-color: #f9f9f9 !important;
}

body:not(.dark) .ai-suggestion:hover {
  background-color: #f0f0f0 !important;
}

body:not(.dark) .tag-suggestion {
  background-color: #e3f2fd !important;
  color: #1976d2 !important;
  border-color: #bbdefb !important;
}

body:not(.dark) .tag-suggestion:hover {
  background-color: #bbdefb !important;
  color: #0d47a1 !important;
}

body.dark .ai-suggestion {
  background-color: var(--color-bg-primary);
}

body.dark .ai-suggestion:hover {
  background-color: #1a1a1a;
}

body.dark .tag-suggestion {
  background-color: #1a1a1a;
  color: #7b9fff;
}

body.dark .tag-suggestion:hover {
  background-color: var(--color-bg-primary);
}

.ai-section {
  margin-bottom: 30px;
  animation: slideIn 0.4s ease;
}

.ai-section h3 {
  font-size: 16px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  color: var(--dark-color);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

body.dark .ai-section h3 {
  color: #000000;
}

.ai-section h3 i {
  color: var(--primary-color);
  margin-right: 8px;
}

.ai-suggestion {
  background-color: var(--color-bg-primary);
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 15px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  animation: fadeIn 0.5s ease;
}

body.dark .ai-suggestion {
  background-color: var(--color-bg-primary);
}

.ai-suggestion:hover {
  background-color: #f0f4f8;
  transform: translateY(-2px);
}

body.dark .ai-suggestion:hover {
  background-color: #1a1a1a;
}

.ai-suggestion h4 {
  font-size: 14px;
  margin-bottom: 8px;
  color: var(--primary-color);
  font-weight: 600;
}

.ai-suggestion p {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

body.dark .ai-suggestion p {
  color: var(--color-text-secondary);
}

.ai-action-btn {
  width: 100%;
  padding: 12px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  margin-bottom: 10px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.4s ease;
}

.ai-action-btn i {
  margin-right: 8px;
}

.ai-action-btn:hover {
  background-color: var(--secondary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(91, 107, 240, 0.3);
}

.tag-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-suggestion {
  background-color: #e9ecef;
  color: #495057;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid transparent;
}

.tag-suggestion:hover {
  background-color: #dee2e6;
  color: #212529;
  transform: scale(1.05);
}

.stats-card {
  background: linear-gradient(135deg, var(--primary-color), #f25f5c);
  color: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  animation: fadeIn 0.6s ease;
}

.stats-card h3 {
  font-size: 16px;
  margin-bottom: 10px;
  opacity: 0.9;
  display: flex;
  align-items: center;
}

.stats-card h3 i {
  margin-right: 8px;
}

.stats-number {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 5px;
}

.stats-desc {
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 15px;
}

/* 动画 */
@keyframes fadeIn {
  from { 
    opacity: 0; 
    transform: translateY(10px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

@keyframes slideIn {
  from { 
    opacity: 0; 
    transform: translateX(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateX(0); 
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .ai-assistant {
    width: 250px;
  }
}

@media (max-width: 1024px) {
  .ai-assistant {
    display: none;
  }
}
</style>
