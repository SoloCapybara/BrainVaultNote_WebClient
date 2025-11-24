# 脑洞库 - AI智能笔记应用 (Web客户端)

> 一个现代化的AI智能笔记应用，采用液态玻璃设计风格，提供流畅的用户体验

![脑洞库](https://via.placeholder.com/800x400/5b6bf0/ffffff?text=BrainVault+Note)

## 📖 项目简介

脑洞库是一个集成了AI能力的智能笔记应用，专注于为用户提供高效、美观的笔记记录和管理体验。Web客户端采用Vue 3 + TypeScript构建，具有响应式设计、液态玻璃UI风格和流畅的交互动画。

## ✨ 核心特性

### 🎨 现代化UI设计
- **液态玻璃风格** - 采用毛玻璃效果和半透明设计，提供优雅的视觉体验
- **响应式布局** - 完美适配宽屏、中屏和窄屏设备
- **流畅动画** - iOS风格的过渡动画，提升交互体验
- **深色/浅色模式** - 支持主题切换，保护眼睛

### 📝 笔记功能
- **富文本编辑** - 支持多种格式和样式
- **实时统计** - 字数、标点、行数实时统计
- **笔记列表** - 卡片式展示，支持分页浏览
- **搜索功能** - 快速搜索笔记内容

### 🤖 AI助手
- **智能统计** - 笔记数据可视化展示
- **AI建议** - 智能内容建议和优化
- **标签推荐** - AI自动生成标签建议
- **相关内容** - 智能查找相关笔记

### 🎯 交互体验
- **侧边栏导航** - 可折叠的侧边栏，节省空间
- **面板管理** - 笔记列表和AI助手面板可独立折叠
- **模态框** - 优雅的搜索和设置模态框
- **自定义主题** - 多种主题颜色可选

## 🛠️ 技术栈

- **框架**: Vue 3.5+ (Composition API)
- **语言**: TypeScript
- **构建工具**: Vite 7+
- **路由**: Vue Router 4
- **状态管理**: Pinia 3
- **样式**: CSS3 (自定义样式，支持毛玻璃效果)
- **图标**: Font Awesome

## 📁 项目结构

```
BrainVaultNote/
├── src/
│   ├── components/          # 组件目录
│   │   ├── layout/         # 布局组件
│   │   │   ├── main/       # 主布局
│   │   │   │   └── MainLayout.vue
│   │   │   ├── Sidebar.vue      # 侧边栏
│   │   │   ├── TopBar.vue       # 顶部栏
│   │   │   ├── NotesList.vue    # 笔记列表
│   │   │   ├── NoteEditor.vue   # 笔记编辑器
│   │   │   └── AIAssistant.vue  # AI助手
│   │   └── ui/             # UI组件
│   │       └── Pagination.vue   # 分页组件
│   ├── composables/        # 组合式函数
│   │   └── useThemeFinal.ts    # 主题管理
│   ├── router/             # 路由配置
│   ├── assets/             # 静态资源
│   │   └── main.css        # 全局样式
│   ├── App.vue             # 根组件
│   └── main.ts             # 入口文件
├── public/                 # 公共资源
├── package.json           # 项目配置
└── vite.config.ts         # Vite配置
```

## 🚀 快速开始

### 环境要求

- **Node.js**: ^20.19.0 || >=22.12.0
- **npm**: 9.0.0+

### 安装依赖

```bash
cd Web客户端/BrainVaultNote
npm install
```

### 启动开发服务器

```bash
npm run dev
```

启动后，访问 `http://localhost:5173` 即可查看应用。

### 其他命令

```bash
# 类型检查
npm run type-check

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint

# 代码格式化
npm run format
```

## 🎨 界面预览

### 主界面
![主界面](https://via.placeholder.com/1200x600/5b6bf0/ffffff?text=Main+Interface)

### 笔记编辑
![笔记编辑](https://via.placeholder.com/1200x600/f25f5c/ffffff?text=Note+Editor)

### AI助手
![AI助手](https://via.placeholder.com/1200x600/8a2be2/ffffff?text=AI+Assistant)

## 📱 响应式设计

- **宽屏模式** (>1024px): 显示侧边栏、笔记列表、编辑器和AI助手
- **中屏模式** (769px-1024px): 显示笔记列表和编辑器，或编辑器和AI助手
- **窄屏模式** (≤768px): 仅显示笔记列表，侧边栏可折叠

## 🎯 主要功能说明

### 侧边栏
- 主页、所有笔记、收藏、最近访问
- AI工具：AI助手、智能整理、数据分析
- 主题颜色选择
- 设置和帮助

### 笔记列表
- 卡片式展示笔记
- 支持分页浏览
- 可折叠面板
- 搜索功能

### 笔记编辑器
- 富文本编辑工具栏
- 实时字数统计
- 选中文本高亮
- 自动保存

### AI助手
- 笔记统计卡片（液态玻璃风格）
- AI功能按钮
- 智能建议
- 标签推荐

## 🔧 开发说明

### 样式规范
- 使用CSS变量统一管理主题颜色
- 支持深色/浅色模式切换
- 液态玻璃效果使用 `backdrop-filter: blur()`
- 动画使用 `cubic-bezier` 缓动函数

### 组件通信
- 使用 `props` 和 `emit` 进行父子组件通信
- 使用 Pinia 管理全局状态（如主题）
- 使用 `localStorage` 持久化用户设置

## 📝 注意事项

1. 确保 Node.js 版本符合要求
2. 首次运行前需要安装依赖：`npm install`
3. 开发模式下支持热更新
4. 生产构建前建议运行类型检查：`npm run type-check`

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**脑洞库** - 让AI为你的思维插上翅膀 🚀
