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
  display: flex;
  flex-direction: column; /* 确保所有子元素垂直排列 */
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

body.dark .stats-card {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
}

body.dark .stats-card::after {
  background: radial-gradient(
    circle at 30% 30%,
    rgba(91, 107, 240, 0.2) 0%,
    transparent 50%
  );
}

body.dark .stats-card h3 {
  color: #e9ecf7;
}

body.dark .stats-number {
  background: linear-gradient(135deg, #7c5cff, #00e0ff);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

body.dark .stats-desc {
  color: #b7bfdd;
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

body:not(.dark) .stats-card {
  background: rgba(255, 255, 255, 0.6);
  border-color: rgba(0, 0, 0, 0.1);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

body:not(.dark) .stats-card::after {
  background: radial-gradient(
    circle at 30% 30%,
    rgba(91, 107, 240, 0.1) 0%,
    transparent 50%
  );
}

body:not(.dark) .stats-card h3 {
  color: #333333 !important;
}

body:not(.dark) .stats-number {
  background: linear-gradient(135deg, var(--primary-color), #7c5cff) !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  font-weight: 700 !important;
}

body:not(.dark) .stats-desc {
  color: #4a5568 !important;
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
  display: flex;
  flex-direction: column; /* 确保子元素垂直排列 */
  width: 100%; /* 确保每个section占满宽度 */
  box-sizing: border-box; /* 确保padding包含在width内 */
  flex-shrink: 0; /* 防止被压缩 */
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
  width: 100%; /* 确保每个建议占满宽度 */
  box-sizing: border-box; /* 确保padding包含在width内 */
  flex-shrink: 0; /* 防止被压缩 */
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
  flex-shrink: 0; /* 防止按钮被压缩 */
  box-sizing: border-box; /* 确保padding包含在width内 */
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
  position: relative;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: var(--color-text-primary);
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 20px;
  animation: fadeIn 0.6s ease;
  width: 100%;
  box-sizing: border-box;
  flex-shrink: 0;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

/* 液态玻璃光泽效果 */
.stats-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.4) 50%, 
    transparent
  );
  pointer-events: none;
}

.stats-card::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle at 30% 30%,
    rgba(91, 107, 240, 0.15) 0%,
    transparent 50%
  );
  pointer-events: none;
  animation: shimmer 8s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.5;
  }
  50% {
    transform: translate(20px, 20px) scale(1.1);
    opacity: 0.8;
  }
}

.stats-card h3 {
  font-size: 16px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
  color: var(--color-text-primary);
  font-weight: 600;
}

.stats-card h3 i {
  margin-right: 8px;
  color: var(--primary-color);
}

.stats-number {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 5px;
  position: relative;
  z-index: 1;
  color: var(--color-text-primary);
  background: linear-gradient(135deg, var(--primary-color), #7c5cff);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stats-desc {
  font-size: 14px;
  margin-bottom: 15px;
  position: relative;
  z-index: 1;
  color: var(--color-text-secondary);
  opacity: 0.9;
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
