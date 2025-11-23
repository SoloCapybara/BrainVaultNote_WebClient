<template>
  <div class="container" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <!-- 侧边栏遮罩层 -->
    <div 
      class="sidebar-overlay" 
      :class="{ active: showMobileSidebar }"
      @click="closeMobileSidebar"
    ></div>
    
    <!-- 侧边栏 -->
    <Sidebar 
      :collapsed="sidebarCollapsed"
      :mobile-open="showMobileSidebar"
      :is-dark="isDark"
      @toggle-collapse="toggleSidebar"
      @select-note="selectNote"
      @search="handleSearch"
      @change-theme-color="handleChangeThemeColor"
      @toggle-theme="toggleGlobalTheme"
      @close-mobile-sidebar="closeMobileSidebar"
    />
    
    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部栏 -->
      <TopBar 
        :is-dark="isDark"
        @toggle-sidebar="toggleSidebar"
        @toggle-mobile-sidebar="toggleMobileSidebar"
        @toggle-theme="toggleTheme"
        @sync="handleSync"
        @notification="handleNotification"
        @upload="handleUpload"
      />
      
      <!-- 内容区域 -->
      <div class="content-area">
        <!-- 笔记列表 -->
        <NotesList 
          :notes="notes"
          :active-note="activeNote"
          :collapsed="notesListCollapsed"
          @select-note="selectNote"
          @new-note="createNewNote"
          @toggle-collapse="notesListCollapsed = !notesListCollapsed"
        />
        
        <!-- 折叠/展开箭头按钮（只在宽屏和中屏显示） -->
        <button 
          class="notes-collapse-toggle-btn"
          :class="{ collapsed: notesListCollapsed }"
          @click="notesListCollapsed = !notesListCollapsed"
          title="收起/展开笔记列表"
        >
          <i class="fas" :class="notesListCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'"></i>
        </button>
        
        <!-- 笔记编辑器 -->
        <NoteEditor 
          :note="activeNote"
          @save="handleSaveNote"
          @update="handleUpdateNote"
        />
        
        <!-- AI助手 -->
        <AIAssistant 
          :note="activeNote"
          :collapsed="aiAssistantCollapsed"
          @close="showAIAssistant = false"
          @generate-summary="handleGenerateSummary"
          @generate-tags="handleGenerateTags"
          @find-related="handleFindRelated"
          @toggle-collapse="aiAssistantCollapsed = !aiAssistantCollapsed"
        />
        
        <!-- AI助手折叠/展开箭头按钮（只在宽屏显示） -->
        <button 
          class="ai-collapse-toggle-btn"
          :class="{ collapsed: aiAssistantCollapsed }"
          @click="aiAssistantCollapsed = !aiAssistantCollapsed"
          title="收起/展开AI助手"
        >
          <i class="fas" :class="aiAssistantCollapsed ? 'fa-chevron-left' : 'fa-chevron-right'"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Sidebar from './Sidebar.vue'
import TopBar from './TopBar.vue'
import NotesList from './NotesList.vue'
import NoteEditor from './NoteEditor.vue'
import AIAssistant from './AIAssistant.vue'
import { useThemeFinal } from '../../composables/useThemeFinal'

// 主题管理
const { isDark, toggleTheme: toggleThemeGlobal } = useThemeFinal()

// TopBar的主题切换 - 现在也调用全局主题切换
const toggleTheme = () => {
  // 直接调用全局主题切换，让Switch和模态框使用同一个逻辑
  toggleThemeGlobal()
}

// 模态框的主题切换 - 现在和Switch使用同一个逻辑
const toggleGlobalTheme = () => {
  // 直接调用全局主题切换，和Switch使用同一个逻辑
  toggleThemeGlobal()
}

// 不再需要同步编辑区域主题，因为现在Switch和模态框都使用全局主题

// 响应式状态
const sidebarCollapsed = ref(false)
const showMobileSidebar = ref(false)
const showAIAssistant = ref(false)
const activeNote = ref(null)
const notesListCollapsed = ref(false) // 笔记列表折叠状态
const aiAssistantCollapsed = ref(false) // AI助手折叠状态

// 侧边栏状态管理
const loadSidebarState = () => {
  const savedState = localStorage.getItem('sidebarCollapsed')
  if (savedState !== null) {
    sidebarCollapsed.value = savedState === 'true'
  }
}

const saveSidebarState = () => {
  localStorage.setItem('sidebarCollapsed', sidebarCollapsed.value.toString())
}

// 笔记数据
const notes = ref([
  {
    id: 1,
    title: 'AI技术发展趋势分析',
    content: '近年来，人工智能技术取得了突破性进展。从GPT系列到ChatGPT，大语言模型的能力不断提升，不仅在自然语言处理领域表现出色，还在代码生成、创意写作等方面展现出惊人的能力。多模态学习也成为新的热点，能够同时处理文本、图像、音频等多种数据类型。强化学习在游戏、机器人控制等领域也取得了显著成果。未来AI技术将更加注重通用性、可解释性和安全性。',
    preview: '本文分析了当前AI技术的主要发展趋势，包括大语言模型、多模态学习、强化学习等领域的突破...',
    tags: ['AI', '技术', '智能摘要'],
    date: '2024-01-15',
    wordCount: 1248,
    isAI: true
  },
  {
    id: 2,
    title: '项目进度报告',
    content: '本周项目完成了第一阶段开发，主要实现了用户认证、笔记创建和基本编辑功能。用户界面设计采用了现代化的设计语言，支持深色和浅色主题切换。后端API已经搭建完成，数据库设计合理，支持笔记的增删改查操作。下一步计划添加AI助手功能，包括智能摘要、标签生成和内容推荐。',
    preview: '本周项目完成了第一阶段开发，主要实现了用户认证、笔记创建和基本编辑功能...',
    tags: ['工作', '项目'],
    date: '2024-01-14',
    wordCount: 856,
    isAI: false
  },
  {
    id: 3,
    title: '读书笔记 - 设计心理学',
    content: '唐纳德·诺曼在《设计心理学》中提出了以用户为中心的设计理念。他强调产品的可用性和用户体验应该放在首位，而不是单纯追求技术上的先进性。书中提到的"诺曼门"概念很好地说明了设计对用户行为的影响。好的设计应该是直观的，用户不需要学习就能使用。这对我理解产品设计有很大的启发。',
    preview: '唐纳德·诺曼在《设计心理学》中提出了以用户为中心的设计理念，强调产品的可用性和用户体验...',
    tags: ['阅读', '心理学', '关键点提取'],
    date: '2024-01-12',
    wordCount: 1532,
    isAI: true
  },
  {
    id: 4,
    title: 'Vue 3 组合式API学习笔记',
    content: 'Vue 3的组合式API相比选项式API更加灵活和强大。setup函数是组合式API的入口，可以在这里定义响应式数据、计算属性和方法。ref和reactive是创建响应式数据的两种方式，ref适合基本类型，reactive适合对象。computed用于创建计算属性，watch用于监听数据变化。生命周期钩子也发生了变化，如onMounted、onUpdated等。',
    preview: 'Vue 3的组合式API相比选项式API更加灵活和强大，setup函数是组合式API的入口...',
    tags: ['Vue', '前端', '学习笔记'],
    date: '2024-01-10',
    wordCount: 892,
    isAI: false
  },
  {
    id: 5,
    title: '健康生活小贴士',
    content: '保持健康的生活方式对每个人都很重要。首先，要保证充足的睡眠，成年人每天需要7-9小时的睡眠。其次，要均衡饮食，多吃蔬菜水果，少吃油腻食物。第三，要定期运动，每周至少150分钟的中等强度运动。第四，要保持良好的心态，学会放松和减压。最后，要定期体检，及早发现和预防疾病。',
    preview: '保持健康的生活方式对每个人都很重要，包括充足睡眠、均衡饮食、定期运动等...',
    tags: ['健康', '生活', '养生'],
    date: '2024-01-08',
    wordCount: 567,
    isAI: false
  },
  {
    id: 6,
    title: '机器学习算法对比分析',
    content: '不同的机器学习算法适用于不同类型的问题。线性回归适合处理线性关系，决策树易于理解和解释，随机森林能减少过拟合，支持向量机在高维数据上表现良好，神经网络能处理复杂的非线性关系。选择算法时要考虑数据量、特征数量、问题类型等因素。在实际应用中，通常需要尝试多种算法并比较它们的性能。',
    preview: '不同的机器学习算法适用于不同类型的问题，选择算法时要考虑数据量、特征数量等因素...',
    tags: ['机器学习', '算法', '数据分析'],
    date: '2024-01-05',
    wordCount: 1123,
    isAI: true
  },
  {
    id: 7,
    title: '旅行计划 - 日本关西',
    content: '计划今年春天去日本关西地区旅行。主要目的地包括大阪、京都和奈良。大阪以美食闻名，一定要尝尝章鱼烧和大阪烧。京都有很多历史古迹，如金阁寺、清水寺等。奈良有可爱的小鹿，可以近距离接触。行程安排7天6夜，预算控制在1万元以内。需要提前办理签证，预订酒店和机票。',
    preview: '计划今年春天去日本关西地区旅行，主要目的地包括大阪、京都和奈良...',
    tags: ['旅行', '日本', '计划'],
    date: '2024-01-03',
    wordCount: 445,
    isAI: false
  },
  {
    id: 8,
    title: '投资理财基础知识',
    content: '投资理财是现代人必须掌握的基本技能。首先要了解自己的风险承受能力，然后制定合适的投资策略。股票投资风险较高但收益也较高，适合风险承受能力强的投资者。债券相对安全，适合保守型投资者。基金投资可以分散风险，适合初学者。房地产投资需要大量资金，但相对稳定。无论选择哪种投资方式，都要做好充分的研究和准备。',
    preview: '投资理财是现代人必须掌握的基本技能，要了解自己的风险承受能力，制定合适的投资策略...',
    tags: ['投资', '理财', '金融'],
    date: '2024-01-01',
    wordCount: 678,
    isAI: false
  },
  {
    id: 9,
    title: 'Python数据处理技巧',
    content: 'Python在数据处理方面有强大的生态系统。pandas是数据分析和处理的核心库，提供了DataFrame和Series等数据结构。numpy用于数值计算，scipy提供科学计算功能。matplotlib和seaborn用于数据可视化。处理缺失值时可以使用fillna()或dropna()方法。数据清洗包括去重、异常值处理等。数据分组和聚合可以使用groupby()方法。',
    preview: 'Python在数据处理方面有强大的生态系统，pandas是数据分析和处理的核心库...',
    tags: ['Python', '数据处理', '编程'],
    date: '2023-12-28',
    wordCount: 934,
    isAI: true
  },
  {
    id: 10,
    title: '摄影构图技巧分享',
    content: '好的摄影作品离不开合理的构图。三分法是最常用的构图技巧，将画面分为九等份，把主体放在交叉点上。对称构图能营造平衡感，适合拍摄建筑和风景。引导线构图利用线条引导观众视线，增加画面层次。框架构图用前景元素框住主体，突出主题。色彩搭配也很重要，冷暖色调的对比能增强视觉冲击力。',
    preview: '好的摄影作品离不开合理的构图，三分法是最常用的构图技巧，将画面分为九等份...',
    tags: ['摄影', '构图', '技巧'],
    date: '2023-12-25',
    wordCount: 756,
    isAI: false
  },
  {
    id: 11,
    title: '时间管理方法论',
    content: '有效的时间管理能提高工作效率和生活质量。番茄工作法将工作时间分为25分钟的番茄时间，每个番茄时间后休息5分钟。GTD（Getting Things Done）方法强调将任务从大脑中清空，记录在外部系统中。四象限法则将任务按重要性和紧急性分类，优先处理重要且紧急的任务。时间块法将一天分为不同的时间块，每个时间块专注处理特定类型的任务。',
    preview: '有效的时间管理能提高工作效率和生活质量，番茄工作法、GTD方法等都是有效的时间管理技巧...',
    tags: ['时间管理', '效率', '方法论'],
    date: '2023-12-22',
    wordCount: 823,
    isAI: true
  },
  {
    id: 12,
    title: '咖啡文化与品鉴',
    content: '咖啡文化在世界各地都有不同的表现形式。意式咖啡注重浓缩和奶泡的完美结合，美式咖啡追求简单直接的口感。手冲咖啡强调咖啡豆的原始风味，需要精确的水温和萃取时间。不同产地的咖啡豆有不同的风味特点，如埃塞俄比亚的果香、哥伦比亚的平衡、牙买加蓝山的醇厚。品鉴咖啡时要关注香气、酸度、醇厚度和余味。',
    preview: '咖啡文化在世界各地都有不同的表现形式，意式、美式、手冲等各有特色...',
    tags: ['咖啡', '文化', '品鉴'],
    date: '2023-12-20',
    wordCount: 689,
    isAI: false
  },
  {
    id: 13,
    title: 'React Hooks 深度解析',
    content: 'React Hooks 是函数组件中使用状态和生命周期特性的新方式。useState 用于管理组件状态，useEffect 用于处理副作用，useContext 用于跨组件共享数据。自定义 Hooks 可以封装逻辑，提高代码复用性。useMemo 和 useCallback 用于性能优化，避免不必要的重新渲染。Hooks 的规则包括只能在函数组件顶层调用，不能在循环、条件或嵌套函数中调用。',
    preview: 'React Hooks 是函数组件中使用状态和生命周期特性的新方式，包括 useState、useEffect 等...',
    tags: ['React', 'Hooks', '前端开发'],
    date: '2023-12-18',
    wordCount: 1124,
    isAI: true
  },
  {
    id: 14,
    title: '冥想与正念练习',
    content: '冥想是一种古老的修行方式，现代科学研究证明它对身心健康有诸多益处。正念冥想强调专注于当下，观察自己的呼吸和感受，不评判、不抗拒。每天坚持10-20分钟的冥想练习，可以降低压力、提高专注力、改善睡眠质量。初学者可以从简单的呼吸冥想开始，逐渐增加练习时间。冥想不需要特殊的场地或设备，随时随地都可以进行。',
    preview: '冥想是一种古老的修行方式，现代科学研究证明它对身心健康有诸多益处...',
    tags: ['冥想', '正念', '心理健康'],
    date: '2023-12-15',
    wordCount: 567,
    isAI: false
  },
  {
    id: 15,
    title: '区块链技术原理与应用',
    content: '区块链是一种分布式账本技术，通过密码学方法将数据块按时间顺序链接起来。每个区块包含前一个区块的哈希值，形成不可篡改的链条。共识机制确保网络中的节点对交易达成一致，常见的有工作量证明、权益证明等。区块链在数字货币、供应链管理、身份认证等领域有广泛应用。智能合约是运行在区块链上的程序，可以自动执行合约条款。',
    preview: '区块链是一种分布式账本技术，通过密码学方法将数据块按时间顺序链接起来...',
    tags: ['区块链', '技术', '加密货币'],
    date: '2023-12-12',
    wordCount: 1456,
    isAI: true
  },
  {
    id: 16,
    title: '烹饪技巧与食材搭配',
    content: '好的烹饪需要掌握基本的技巧和食材搭配原则。刀工是基础，不同的切法会影响食材的口感和烹饪时间。火候控制很重要，大火爆炒、小火慢炖各有用途。调味要平衡，酸甜苦辣咸五味调和。食材搭配要考虑营养均衡和口感层次，如荤素搭配、软硬搭配等。掌握这些基本技巧，就能做出美味的家常菜。',
    preview: '好的烹饪需要掌握基本的技巧和食材搭配原则，包括刀工、火候控制、调味等...',
    tags: ['烹饪', '美食', '技巧'],
    date: '2023-12-10',
    wordCount: 678,
    isAI: false
  },
  {
    id: 17,
    title: '微服务架构设计模式',
    content: '微服务架构是一种将应用程序构建为小型、独立服务的方法。每个服务都有自己的数据库和业务逻辑，通过API进行通信。服务发现模式帮助服务找到彼此，API网关提供统一的入口点。断路器模式防止级联故障，熔断器在服务不可用时快速失败。事件驱动架构通过消息队列实现服务间的异步通信。容器化技术如Docker简化了微服务的部署和管理。',
    preview: '微服务架构是一种将应用程序构建为小型、独立服务的方法，每个服务都有自己的数据库...',
    tags: ['微服务', '架构', '系统设计'],
    date: '2023-12-08',
    wordCount: 1234,
    isAI: true
  },
  {
    id: 18,
    title: '园艺种植心得',
    content: '园艺种植是一门需要耐心和技巧的艺术。首先要了解植物的生长习性，包括光照、水分、土壤等需求。选择合适的种植容器和土壤很重要，排水良好的土壤有利于植物生长。浇水要适量，过多或过少都会影响植物健康。定期施肥提供必要的营养，但要避免过量。修剪可以促进植物分枝和开花，保持植株的形态美观。',
    preview: '园艺种植是一门需要耐心和技巧的艺术，要了解植物的生长习性，包括光照、水分等...',
    tags: ['园艺', '种植', '植物'],
    date: '2023-12-05',
    wordCount: 445,
    isAI: false
  },
  {
    id: 19,
    title: '数据可视化最佳实践',
    content: '数据可视化是将数据转化为图形化表示的艺术和科学。选择合适的图表类型很重要，柱状图适合比较数值，折线图显示趋势，饼图展示比例关系。颜色搭配要考虑色盲友好性，避免使用过多颜色。标签和标题要清晰明确，图例要放在合适的位置。交互式图表可以增强用户体验，允许用户探索数据。保持简洁，避免过度装饰。',
    preview: '数据可视化是将数据转化为图形化表示的艺术和科学，要选择合适的图表类型...',
    tags: ['数据可视化', '图表', '设计'],
    date: '2023-12-03',
    wordCount: 789,
    isAI: true
  },
  {
    id: 20,
    title: '音乐欣赏与乐理基础',
    content: '音乐欣赏需要一定的乐理基础。音阶是音乐的基本构成，大调音阶给人明亮的感觉，小调音阶则较为忧郁。和声是多个音符同时发声产生的效果，协和音程听起来和谐，不协和音程产生紧张感。节拍和节奏是音乐的时间要素，强拍和弱拍的组合形成不同的节拍型。了解这些基本概念，能更好地欣赏和理解音乐作品。',
    preview: '音乐欣赏需要一定的乐理基础，包括音阶、和声、节拍和节奏等基本概念...',
    tags: ['音乐', '乐理', '欣赏'],
    date: '2023-12-01',
    wordCount: 567,
    isAI: false
  },
  {
    id: 21,
    title: '云计算服务架构设计',
    content: '云计算提供了弹性的计算资源，包括计算、存储、网络等服务。IaaS提供基础设施，PaaS提供平台服务，SaaS提供软件应用。云原生应用设计要考虑可扩展性、容错性和安全性。容器编排工具如Kubernetes管理容器化应用的生命周期。微服务架构在云环境中更容易实现，每个服务可以独立部署和扩展。监控和日志记录对云应用的运维至关重要。',
    preview: '云计算提供了弹性的计算资源，包括计算、存储、网络等服务，云原生应用设计要考虑可扩展性...',
    tags: ['云计算', '架构', '云原生'],
    date: '2023-11-28',
    wordCount: 1345,
    isAI: true
  },
  {
    id: 22,
    title: '书法练习与字体欣赏',
    content: '书法是中华文化的瑰宝，练习书法可以修身养性。楷书是基础，笔画工整，结构严谨。行书流畅自然，适合日常书写。草书变化丰富，需要深厚的功底。练习书法要注重笔法，包括起笔、行笔、收笔的技巧。临摹名家字帖是学习的好方法，但要理解字的结构和神韵。持之以恒的练习是提高书法水平的关键。',
    preview: '书法是中华文化的瑰宝，练习书法可以修身养性，楷书是基础，行书流畅自然...',
    tags: ['书法', '文化', '艺术'],
    date: '2023-11-25',
    wordCount: 456,
    isAI: false
  },
  {
    id: 23,
    title: '人工智能伦理问题探讨',
    content: '人工智能的快速发展带来了许多伦理问题。算法偏见可能导致不公平的决策，需要确保AI系统的公正性。隐私保护是重要议题，AI系统处理大量个人数据，需要严格的隐私保护措施。AI的自主性引发责任归属问题，当AI系统做出错误决策时，责任应该由谁承担。就业影响也是关注焦点，AI可能替代某些工作岗位，需要制定相应的政策。',
    preview: '人工智能的快速发展带来了许多伦理问题，包括算法偏见、隐私保护、责任归属等...',
    tags: ['人工智能', '伦理', '社会影响'],
    date: '2023-11-22',
    wordCount: 1123,
    isAI: true
  },
  {
    id: 24,
    title: '瑜伽练习指南',
    content: '瑜伽是一种身心练习，通过体式、呼吸和冥想来达到身心平衡。初学者要从基础体式开始，如山式、树式、猫式等。呼吸练习很重要，腹式呼吸能帮助放松身心。练习时要循序渐进，不要强迫自己做到高难度体式。瑜伽垫和舒适的服装是必要的装备。定期练习比偶尔高强度练习更有效果。',
    preview: '瑜伽是一种身心练习，通过体式、呼吸和冥想来达到身心平衡，初学者要从基础体式开始...',
    tags: ['瑜伽', '健身', '冥想'],
    date: '2023-11-20',
    wordCount: 523,
    isAI: false
  },
  {
    id: 25,
    title: '网络安全防护策略',
    content: '网络安全是数字时代的重要议题。密码安全是基础，要使用强密码并定期更换，启用双因素认证。软件要及时更新，修补安全漏洞。网络钓鱼是常见的攻击方式，要识别可疑邮件和链接。数据备份很重要，定期备份重要数据，防止数据丢失。使用防火墙和杀毒软件保护设备安全。',
    preview: '网络安全是数字时代的重要议题，包括密码安全、软件更新、网络钓鱼防护等...',
    tags: ['网络安全', '防护', '信息安全'],
    date: '2023-11-18',
    wordCount: 678,
    isAI: true
  },
  {
    id: 26,
    title: '茶文化与品茶技巧',
    content: '茶文化源远流长，品茶是一门艺术。不同种类的茶有不同的冲泡方法，绿茶用80度左右的水，红茶用沸水。茶具的选择也很重要，紫砂壶适合泡乌龙茶，玻璃杯适合观赏绿茶。品茶时要观其色、闻其香、品其味。茶道强调仪式感，通过泡茶的过程达到内心的平静。',
    preview: '茶文化源远流长，品茶是一门艺术，不同种类的茶有不同的冲泡方法...',
    tags: ['茶文化', '品茶', '传统文化'],
    date: '2023-11-15',
    wordCount: 445,
    isAI: false
  },
  {
    id: 27,
    title: '机器学习模型评估方法',
    content: '机器学习模型的评估是确保模型性能的关键步骤。准确率是最直观的指标，但在不平衡数据集中可能误导。精确率和召回率提供了更详细的信息，F1分数是两者的调和平均。ROC曲线和AUC值评估分类器的整体性能。交叉验证可以减少过拟合，提高模型的泛化能力。混淆矩阵提供了详细的分类结果分析。',
    preview: '机器学习模型的评估是确保模型性能的关键步骤，包括准确率、精确率、召回率等指标...',
    tags: ['机器学习', '模型评估', '数据分析'],
    date: '2023-11-12',
    wordCount: 987,
    isAI: true
  },
  {
    id: 28,
    title: '跑步训练计划制定',
    content: '制定合理的跑步训练计划对提高跑步水平很重要。初学者要从短距离开始，逐渐增加距离和强度。每周训练3-4次，给身体足够的恢复时间。热身和拉伸是必要的，可以预防运动损伤。心率监测帮助控制训练强度，保持在有氧区间。营养补充也很重要，跑前跑后要适当补充水分和能量。',
    preview: '制定合理的跑步训练计划对提高跑步水平很重要，要从短距离开始，逐渐增加强度...',
    tags: ['跑步', '训练', '健身'],
    date: '2023-11-10',
    wordCount: 567,
    isAI: false
  },
  {
    id: 29,
    title: '数据库设计原则与优化',
    content: '数据库设计是系统架构的重要组成部分。规范化可以减少数据冗余，但过度规范化可能影响性能。索引可以提高查询速度，但要合理使用，避免过多索引影响写入性能。分区表可以处理大量数据，提高查询效率。查询优化包括选择合适的查询方式、避免全表扫描等。备份和恢复策略确保数据安全。',
    preview: '数据库设计是系统架构的重要组成部分，包括规范化、索引、分区等技术...',
    tags: ['数据库', '设计', '优化'],
    date: '2023-11-08',
    wordCount: 1234,
    isAI: true
  },
  {
    id: 30,
    title: '绘画技法与色彩理论',
    content: '绘画是一门需要技巧和理论支撑的艺术。色彩理论包括色相、明度、饱和度的概念，互补色、类似色的搭配原则。透视法帮助在二维平面上表现三维空间，一点透视、两点透视各有用途。光影处理能增强画面的立体感，要观察光源的方向和强度。构图要考虑平衡、对比、节奏等要素。',
    preview: '绘画是一门需要技巧和理论支撑的艺术，包括色彩理论、透视法、光影处理等...',
    tags: ['绘画', '艺术', '技法'],
    date: '2023-11-05',
    wordCount: 678,
    isAI: false
  },
  {
    id: 31,
    title: 'DevOps 实践与工具链',
    content: 'DevOps 是开发和运维的结合，旨在提高软件交付效率。持续集成和持续部署是核心实践，通过自动化流水线实现快速发布。版本控制是基础，Git 是最常用的工具。容器化技术如 Docker 简化了环境管理，Kubernetes 提供容器编排。监控和日志收集帮助快速定位问题。基础设施即代码管理服务器配置。',
    preview: 'DevOps 是开发和运维的结合，旨在提高软件交付效率，包括持续集成、容器化等技术...',
    tags: ['DevOps', '自动化', '运维'],
    date: '2023-11-03',
    wordCount: 1456,
    isAI: true
  },
  {
    id: 32,
    title: '园艺植物养护技巧',
    content: '植物养护需要了解不同植物的生长需求。光照是重要因素，喜阳植物需要充足阳光，耐阴植物适合室内种植。浇水要适量，过多会导致根部腐烂，过少会使植物枯萎。土壤选择很重要，不同植物需要不同的土壤类型。施肥要定期进行，但要避免过量。修剪可以促进植物生长，保持美观的形态。',
    preview: '植物养护需要了解不同植物的生长需求，包括光照、浇水、土壤、施肥等...',
    tags: ['园艺', '植物', '养护'],
    date: '2023-11-01',
    wordCount: 456,
    isAI: false
  },
  {
    id: 33,
    title: '前端性能优化策略',
    content: '前端性能优化对用户体验至关重要。代码分割可以减少初始加载时间，懒加载延迟加载非关键资源。图片优化包括压缩、使用现代格式如 WebP。缓存策略提高重复访问的速度，包括浏览器缓存和 CDN 缓存。减少 HTTP 请求数量，合并 CSS 和 JS 文件。使用性能监控工具识别瓶颈。',
    preview: '前端性能优化对用户体验至关重要，包括代码分割、懒加载、图片优化等技术...',
    tags: ['前端', '性能优化', '用户体验'],
    date: '2023-10-28',
    wordCount: 1123,
    isAI: true
  },
  {
    id: 34,
    title: '古典音乐欣赏入门',
    content: '古典音乐是西方音乐的重要组成部分，欣赏古典音乐需要一定的知识储备。巴洛克时期音乐结构严谨，巴赫是代表人物。古典时期音乐平衡优雅，莫扎特、海顿是代表。浪漫时期音乐情感丰富，肖邦、柴可夫斯基是代表。现代音乐风格多样，德彪西、斯特拉文斯基是代表。了解这些时期的特点有助于更好地欣赏音乐。',
    preview: '古典音乐是西方音乐的重要组成部分，包括巴洛克、古典、浪漫、现代等不同时期...',
    tags: ['古典音乐', '音乐欣赏', '文化'],
    date: '2023-10-25',
    wordCount: 789,
    isAI: false
  },
  {
    id: 35,
    title: '自然语言处理技术发展',
    content: '自然语言处理是人工智能的重要分支，近年来取得了突破性进展。词嵌入技术将词语映射到向量空间，Word2Vec、GloVe 是经典方法。注意力机制解决了长序列建模问题，Transformer 架构成为主流。预训练语言模型如 BERT、GPT 在多个任务上表现出色。多模态学习结合文本、图像、音频等多种信息。',
    preview: '自然语言处理是人工智能的重要分支，包括词嵌入、注意力机制、预训练模型等技术...',
    tags: ['自然语言处理', '人工智能', '技术发展'],
    date: '2023-10-22',
    wordCount: 1345,
    isAI: true
  },
  {
    id: 36,
    title: '手工制作与创意设计',
    content: '手工制作是一种创造性的活动，可以培养耐心和专注力。材料选择很重要，要根据作品需求选择合适的材料。工具使用要熟练，安全第一。设计要有创意，可以参考他人的作品但要有自己的特色。制作过程要细心，每个步骤都要认真对待。完成作品后要总结经验，为下次制作做准备。',
    preview: '手工制作是一种创造性的活动，可以培养耐心和专注力，材料选择和工具使用都很重要...',
    tags: ['手工制作', '创意', '设计'],
    date: '2023-10-20',
    wordCount: 523,
    isAI: false
  },
  {
    id: 37,
    title: '分布式系统一致性协议',
    content: '分布式系统的一致性协议确保数据在多个节点间的一致性。CAP 定理指出一致性、可用性、分区容错性不能同时满足。两阶段提交协议保证事务的原子性，但存在阻塞问题。Paxos 算法解决分布式一致性问题，Raft 算法更易理解。最终一致性允许短期不一致，但最终会达到一致状态。',
    preview: '分布式系统的一致性协议确保数据在多个节点间的一致性，包括 CAP 定理、Paxos 算法等...',
    tags: ['分布式系统', '一致性', '算法'],
    date: '2023-10-18',
    wordCount: 1456,
    isAI: true
  },
  {
    id: 38,
    title: '花艺设计与插花技巧',
    content: '花艺设计是一门艺术，通过花材的搭配和造型表达美感。色彩搭配要考虑花材的颜色关系，冷暖色调的对比能增强视觉效果。花材的形状和质感要协调，高低错落有层次感。花器选择要与花材风格匹配，简约的花器适合现代风格。保鲜技巧延长花材寿命，定期换水、修剪根部很重要。',
    preview: '花艺设计是一门艺术，通过花材的搭配和造型表达美感，色彩搭配和花器选择都很重要...',
    tags: ['花艺', '插花', '设计'],
    date: '2023-10-15',
    wordCount: 567,
    isAI: false
  },
  {
    id: 39,
    title: '移动应用开发最佳实践',
    content: '移动应用开发要考虑用户体验和性能。响应式设计适配不同屏幕尺寸，触摸友好的界面设计提高可用性。性能优化包括减少内存使用、优化图片、合理使用缓存。安全性很重要，要保护用户数据和隐私。测试覆盖功能测试、性能测试、兼容性测试。发布流程要规范化，包括版本管理、灰度发布等。',
    preview: '移动应用开发要考虑用户体验和性能，包括响应式设计、性能优化、安全性等...',
    tags: ['移动开发', '用户体验', '性能优化'],
    date: '2023-10-12',
    wordCount: 1234,
    isAI: true
  },
  {
    id: 40,
    title: '葡萄酒品鉴与搭配',
    content: '葡萄酒品鉴是一门学问，需要了解不同葡萄品种和产区特点。品酒步骤包括观色、闻香、品味，要关注酒的颜色、香气、口感、余味。红葡萄酒通常搭配红肉，白葡萄酒适合海鲜和清淡菜肴。香槟适合庆祝场合，甜酒适合搭配甜品。储存条件很重要，温度、湿度、光线都会影响酒的品质。',
    preview: '葡萄酒品鉴是一门学问，需要了解不同葡萄品种和产区特点，品酒步骤包括观色、闻香、品味...',
    tags: ['葡萄酒', '品鉴', '搭配'],
    date: '2023-10-10',
    wordCount: 678,
    isAI: false
  },
  {
    id: 41,
    title: '量子计算原理与应用前景',
    content: '量子计算利用量子力学原理进行计算，具有指数级的计算优势。量子比特可以同时处于多个状态，量子叠加和量子纠缠是核心概念。量子算法如 Shor 算法、Grover 算法在特定问题上比经典算法更高效。量子计算在密码学、优化问题、材料科学等领域有应用前景。但量子计算仍面临技术挑战，如量子纠错、量子退相干等。',
    preview: '量子计算利用量子力学原理进行计算，具有指数级的计算优势，在密码学、优化等领域有应用前景...',
    tags: ['量子计算', '量子力学', '未来科技'],
    date: '2023-10-08',
    wordCount: 1456,
    isAI: true
  },
  {
    id: 42,
    title: '家居装饰与空间设计',
    content: '家居装饰要体现个人品味和生活方式。色彩搭配要考虑整体协调，主色调和辅助色调要平衡。家具选择要考虑功能性和美观性，尺寸要适合空间大小。照明设计很重要，自然光和人工光要合理搭配。软装饰如窗帘、地毯、装饰画能增加空间层次。收纳设计保持空间整洁，提高生活效率。',
    preview: '家居装饰要体现个人品味和生活方式，包括色彩搭配、家具选择、照明设计等...',
    tags: ['家居装饰', '空间设计', '生活美学'],
    date: '2023-10-05',
    wordCount: 789,
    isAI: false
  },
  {
    id: 43,
    title: '计算机视觉技术发展',
    content: '计算机视觉让机器能够理解和分析图像和视频。图像预处理包括去噪、增强、变换等步骤。特征提取是核心，传统方法如 SIFT、HOG，深度学习方法如 CNN 更强大。目标检测识别图像中的物体位置和类别，YOLO、R-CNN 是经典算法。图像分割将图像分为不同区域，语义分割和实例分割各有用途。',
    preview: '计算机视觉让机器能够理解和分析图像和视频，包括图像预处理、特征提取、目标检测等技术...',
    tags: ['计算机视觉', '图像处理', '深度学习'],
    date: '2023-10-03',
    wordCount: 1345,
    isAI: true
  },
  {
    id: 44,
    title: '宠物养护与训练技巧',
    content: '宠物养护需要爱心和耐心，不同宠物有不同的需求。饮食要营养均衡，选择适合的宠物食品。定期体检和疫苗接种保持宠物健康。训练要循序渐进，使用正向强化方法。环境要安全舒适，提供足够的活动空间。了解宠物的行为习惯，建立良好的互动关系。',
    preview: '宠物养护需要爱心和耐心，包括饮食营养、定期体检、训练技巧等...',
    tags: ['宠物', '养护', '训练'],
    date: '2023-10-01',
    wordCount: 456,
    isAI: false
  },
  {
    id: 45,
    title: '边缘计算与物联网架构',
    content: '边缘计算将计算能力推向数据源头，减少延迟和带宽消耗。物联网设备产生大量数据，边缘计算提供实时处理能力。雾计算是边缘计算和云计算的中间层，提供更灵活的计算资源。5G 网络为边缘计算提供高速连接，支持更多设备接入。安全性和隐私保护是重要考虑因素。',
    preview: '边缘计算将计算能力推向数据源头，减少延迟和带宽消耗，5G 网络为边缘计算提供高速连接...',
    tags: ['边缘计算', '物联网', '5G'],
    date: '2023-09-28',
    wordCount: 1123,
    isAI: true
  },
  {
    id: 46,
    title: '书法艺术与字体设计',
    content: '书法是文字的艺术表现形式，不同字体有不同的美感。楷书端庄工整，适合正式场合。行书流畅自然，适合日常书写。草书变化丰富，需要深厚的功底。现代字体设计结合传统书法和现代审美，创造出新的艺术形式。字体设计要考虑可读性和美观性的平衡。',
    preview: '书法是文字的艺术表现形式，不同字体有不同的美感，现代字体设计结合传统和现代审美...',
    tags: ['书法', '字体设计', '艺术'],
    date: '2023-09-25',
    wordCount: 567,
    isAI: false
  },
  {
    id: 47,
    title: '强化学习算法与应用',
    content: '强化学习是一种机器学习方法，通过智能体与环境交互学习最优策略。Q-learning 算法通过状态-动作值函数寻找最优策略。DQN 算法结合深度学习提高学习效率。Actor-Critic 算法同时优化策略和值函数。PPO 算法解决策略梯度方法的采样效率问题。强化学习在游戏、机器人控制、推荐系统等领域有广泛应用。',
    preview: '强化学习是一种机器学习方法，通过智能体与环境交互学习最优策略，包括 Q-learning、DQN、Actor-Critic、PPO 等算法...',
    tags: ['强化学习', '机器学习', '人工智能'],
    date: '2023-09-22',
    wordCount: 1234,
    isAI: true
  },
  {
    id: 48,
    title: '区块链技术与加密货币',
    content: '区块链是一种分布式账本技术，通过去中心化保证数据安全和透明。比特币是第一个区块链应用，实现了点对点电子现金系统。以太坊是智能合约平台，支持各种去中心化应用。区块链共识机制如 PoW、PoS 保证网络安全。加密货币如比特币、以太坊是区块链的实际应用。区块链在金融、供应链、版权保护等领域有广泛应用。',
    preview: '区块链是一种分布式账本技术，通过去中心化保证数据安全和透明，包括比特币、以太坊等应用...',
    tags: ['区块链', '加密货币', '金融科技'],
    date: '2023-09-19',
    wordCount: 678,
    isAI: false
  },
  {
    id: 49,
    title: '人工智能伦理与未来展望',
    content: '人工智能伦理关注技术发展对社会、经济、法律、道德等方面的影响。隐私保护是重要问题，数据安全和用户知情权需平衡。算法歧视和偏见需要监管和纠正。透明度和可解释性要求提高，避免“黑箱”决策。人工智能与人类合作是未来方向，但要避免技术失控。未来人工智能将更加智能化、自主化，但伦理问题不容忽视。',
    preview: '人工智能伦理关注技术发展对社会、经济、法律、道德等方面的影响，包括隐私保护、算法歧视、透明度等...',
    tags: ['人工智能', '伦理', '未来展望'],
    date: '2023-09-16',
    wordCount: 1456,
    isAI: true
  },
  {
    id: 50,
    title: '可持续设计与绿色建筑',
    content: '可持续设计关注环境、社会和经济三个维度的平衡。绿色建筑采用节能材料和设计减少能耗。生态设计结合自然元素创造舒适空间。循环经济理念减少资源浪费。智能建筑系统提高能源效率。建筑生命周期评估关注全生命周期成本。可持续设计是未来建筑的发展方向，要兼顾环保、经济、社会效益。',
    preview: '可持续设计关注环境、社会和经济三个维度的平衡，包括绿色建筑、生态设计、循环经济等...',
    tags: ['可持续设计', '绿色建筑', '环保'],
    date: '2023-09-13',
    wordCount: 567,
    isAI: false
  },
  {
    id: 51,
    title: '数据分析与商业智能',
    content: '数据分析通过统计和机器学习方法挖掘数据价值。商业智能帮助企业理解数据，做出决策。数据可视化将复杂数据转化为直观图表。预测分析预测未来趋势。关联分析发现数据间关系。聚类分析将数据分组。数据分析在营销、运营、风险管理等领域有广泛应用。商业智能是数据分析的实际应用，要结合业务需求进行定制化开发。',
    preview: '数据分析通过统计和机器学习方法挖掘数据价值，商业智能帮助企业理解数据，做出决策...',
    tags: ['数据分析', '商业智能', '数据可视化'],
    date: '2023-09-10',
    wordCount: 1234,
    isAI: true
  },
]) 

// 方法
const toggleSidebar = () => {
  // 在移动端，如果侧边栏是打开的，点击收回按钮应该关闭侧边栏
  if (window.innerWidth <= 768 && showMobileSidebar.value) {
    showMobileSidebar.value = false
    // 关闭时保持展开状态（collapsed = false），这样箭头会正确显示
    sidebarCollapsed.value = false
    saveSidebarState()
    return
  }
  // 桌面端正常切换collapsed状态
  sidebarCollapsed.value = !sidebarCollapsed.value
  saveSidebarState()
}

const toggleMobileSidebar = () => {
  // 在移动端打开侧边栏时，确保始终是展开状态（collapsed = false）
  if (window.innerWidth <= 768) {
    if (!showMobileSidebar.value) {
      // 打开侧边栏时，确保collapsed为false，箭头显示为左箭头
      sidebarCollapsed.value = false
      saveSidebarState()
    }
  }
  showMobileSidebar.value = !showMobileSidebar.value
}

const closeMobileSidebar = () => {
  showMobileSidebar.value = false
}

const selectNote = (note: any) => {
  activeNote.value = note
  // 移动端选择笔记后关闭侧边栏
  if (window.innerWidth <= 768) {
    showMobileSidebar.value = false
  }
}

const createNewNote = () => {
  const newNote = {
    id: Date.now(),
    title: '新建笔记',
    content: '',
    preview: '',
    tags: [],
    date: new Date().toISOString().split('T')[0],
    wordCount: 0,
    isAI: false
  }
  notes.value.unshift(newNote)
  activeNote.value = newNote
}

const handleSaveNote = (note: any) => {
  const index = notes.value.findIndex(n => n.id === note.id)
  if (index !== -1) {
    notes.value[index] = { ...note }
  }
}

const handleUpdateNote = (note: any) => {
  const index = notes.value.findIndex(n => n.id === note.id)
  if (index !== -1) {
    notes.value[index] = { ...note }
  }
}

const handleSearch = (query: string) => {
  console.log('搜索:', query)
  // 实现搜索逻辑
}

const handleChangeThemeColor = (color: string) => {
  // 更新CSS变量
  document.documentElement.style.setProperty('--primary-color', color)
  
  // 更新侧边栏渐变
  const sidebar = document.querySelector('.sidebar')
  if (sidebar) {
    const darkenColor = (hex: string, percent: number) => {
      let f = parseInt(hex.slice(1), 16),
        t = percent < 0 ? 0 : 255,
        p = percent < 0 ? percent * -1 : percent,
        R = f >> 16,
        G = (f >> 8) & 0x00ff,
        B = f & 0x0000ff
      return (
        '#' +
        (
          0x1000000 +
          (Math.round((t - R) * p) + R) * 0x10000 +
          (Math.round((t - G) * p) + G) * 0x100 +
          (Math.round((t - B) * p) + B)
        )
          .toString(16)
          .slice(1)
      )
    }
    
    // 根据当前主题模式决定侧边栏背景
    const isCurrentlyDark = document.body.classList.contains('dark')
    
    if (isCurrentlyDark) {
      // 深色模式 - 使用黑色渐变
      sidebar.style.background = 'linear-gradient(135deg, #000000, #1a1a1a)'
    } else {
      // 浅色模式 - 使用纯白色背景
      sidebar.style.background = '#ffffff'
    }
  }
}

const handleSync = () => {
  console.log('同步数据')
}

const handleNotification = () => {
  console.log('查看通知')
}

const handleUpload = () => {
  console.log('上传文件')
}

const handleGenerateSummary = () => {
  console.log('生成摘要')
}

const handleGenerateTags = () => {
  console.log('生成标签')
}

const handleFindRelated = () => {
  console.log('查找相关内容')
}

// 窗口大小变化处理
const handleResize = () => {
  // 在移动端时自动关闭侧边栏
  if (window.innerWidth <= 768) {
    showMobileSidebar.value = false
  }
}

// 初始化
onMounted(() => {
  // 加载侧边栏状态
  loadSidebarState()
  
  // 不再需要加载编辑区域主题，因为现在使用全局主题
  
  // 设置默认选中的笔记
  if (notes.value.length > 0) {
    activeNote.value = notes.value[0]
  }
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

// 清理
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.container {
  display: flex;
  min-height: 100vh;
  width: calc(100vw - 260px);
  max-width: none !important;
  background-color: #ffffff !important;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  margin-left: 260px; /* 为固定侧边栏留出空间 */
}

body.dark .container {
  background-color: var(--color-bg-secondary);
}

/* 侧边栏收缩时的布局调整 */
.container.sidebar-collapsed {
  width: calc(100vw - 90px);
  margin-left: 90px;
}

/* 移动端布局 */
@media (max-width: 768px) {
  .container {
    width: 100vw;
    margin-left: 0;
  }
  
  .container.sidebar-collapsed {
    width: 100vw;
    margin-left: 0;
  }
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: var(--transition);
}

.content-area {
  flex: 1;
  display: flex;
  overflow: hidden;
  transition: var(--transition);
  width: 100%;
  min-width: 0;
  max-width: 100%;
  position: relative; /* 为箭头按钮定位做准备 */
}

/* 折叠/展开箭头按钮 - 位于笔记列表外部，只在宽屏和中屏显示 */
.notes-collapse-toggle-btn {
  display: none; /* 默认隐藏，只在宽屏和中屏显示 */
  position: absolute;
  left: 320px; /* 位于笔记列表右侧，向左移动避免遮挡文字 */
  top: 50%;
  transform: translateY(-50%);
  width: 44px; /* 增大按钮尺寸 */
  height: 44px;
  background: none; /* 移除背景 */
  border: none; /* 移除边框 */
  box-shadow: none; /* 移除阴影 */
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  color: var(--color-text-primary);
  font-size: 18px; /* 增大箭头图标 */
}

.notes-collapse-toggle-btn:hover {
  color: var(--primary-color); /* hover时改变箭头颜色 */
  transform: translateY(-50%) scale(1.2); /* 放大箭头 */
}

.notes-collapse-toggle-btn:active {
  transform: translateY(-50%) scale(0.95);
}

/* 折叠状态下的箭头按钮位置调整 */
.notes-collapse-toggle-btn.collapsed {
  left: -15px; /* 笔记列表折叠后，按钮向左移动，避免遮挡文字开头 */
}

body.dark .notes-collapse-toggle-btn {
  color: var(--color-text-primary);
}

body.dark .notes-collapse-toggle-btn:hover {
  color: var(--primary-color); /* hover时改变箭头颜色 */
}

/* AI助手折叠/展开箭头按钮 - 位于AI栏左侧，只在宽屏显示 */
.ai-collapse-toggle-btn {
  display: none; /* 默认隐藏，只在宽屏显示 */
  position: absolute;
  right: 280px; /* 位于AI栏左边框上（AI栏宽度280px） */
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  background: none; /* 移除背景 */
  border: none; /* 移除边框 */
  box-shadow: none; /* 移除阴影 */
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  color: var(--color-text-primary);
  font-size: 18px;
}

.ai-collapse-toggle-btn:hover {
  color: var(--primary-color); /* hover时改变箭头颜色 */
  transform: translateY(-50%) scale(1.2); /* 放大箭头 */
}

.ai-collapse-toggle-btn:active {
  transform: translateY(-50%) scale(0.95);
}

/* 折叠状态下的AI箭头按钮位置调整 */
.ai-collapse-toggle-btn.collapsed {
  right: 0px; /* AI栏折叠后，按钮移到右侧边缘，避免遮挡文字 */
}

body.dark .ai-collapse-toggle-btn {
  color: var(--color-text-primary);
}

body.dark .ai-collapse-toggle-btn:hover {
  color: var(--primary-color); /* hover时改变箭头颜色 */
}

.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99;
}

.sidebar-overlay.active {
  display: block;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .content-area {
    flex-wrap: wrap;
  }
}

/* 中屏模式（769px - 1024px）：保持横向布局，显示笔记列表和编辑器 */
@media (max-width: 1024px) and (min-width: 769px) {
  .content-area {
    flex-direction: row;
  }
  
  /* 隐藏AI助手，只显示笔记列表和编辑器 */
  .content-area > .ai-assistant {
    display: none;
  }
  
  /* 中屏模式下显示箭头按钮 */
  .notes-collapse-toggle-btn {
    display: flex;
    left: 320px; /* 位于笔记列表右侧，向左移动避免遮挡文字 */
  }
  
  .notes-collapse-toggle-btn.collapsed {
    left: -15px; /* 折叠后向左移动，避免遮挡文字开头 */
  }
}

/* 宽屏模式（>1024px）：显示箭头按钮 */
@media (min-width: 1025px) {
  .notes-collapse-toggle-btn {
    display: flex;
    left: 320px; /* 位于笔记列表右侧，向左移动避免遮挡文字 */
  }
  
  .notes-collapse-toggle-btn.collapsed {
    left: -15px; /* 折叠后向左移动，避免遮挡文字开头 */
  }
  
  /* AI助手折叠按钮只在宽屏显示 */
  .ai-collapse-toggle-btn {
    display: flex;
    right: 280px; /* 位于AI栏左边框上（AI栏宽度280px） */
  }
  
  .ai-collapse-toggle-btn.collapsed {
    right: 0px; /* AI栏折叠后，按钮移到右侧边缘，避免遮挡文字 */
  }
}

/* 窄屏模式（≤768px）：垂直布局，只显示笔记列表 */
@media (max-width: 768px) {
  .content-area {
    flex-direction: column;
    width: 100%;
  }
  
  /* 窄屏模式下，笔记列表占据全部宽度 */
  .content-area > :not(.notes-list) {
    display: none !important;
  }
  
  .content-area .notes-list {
    width: 100% !important;
    min-width: 100% !important;
    max-width: 100% !important;
    flex: 1;
  }
  
  /* 窄屏模式下隐藏箭头按钮 */
  .notes-collapse-toggle-btn {
    display: none !important;
  }
}
</style>
