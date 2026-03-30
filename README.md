# 嵌入式后台管理系统

基于 **React 18 + TypeScript + Vite + Ant Design** 的现代化前端应用，现已支持 **Electron 桌面模式**和 **USB 设备直接访问**！

## 🎉 重磅更新

### ✨ 新增 Electron USB 桌面应用模式
- ✅ 使用 Node.js USB 模块直接访问硬件设备
- ✅ 突破浏览器安全限制，支持所有工业级 USB 设备
- ✅ 跨平台支持（Windows/macOS/Linux）
- ✅ 可打包为独立桌面应用

**📚 核心文档:** 
- [快速启动指南](./QUICK_START.md) - 5 分钟上手
- [Electron USB 详解](./README_ELECTRON_USB.md) - USB 功能完整说明
- [开发指南](./ELECTRON_GUIDE.md) - Electron 开发全攻略

## 🚀 快速开始

### 环境要求
- Node.js >= 18.x
- npm >= 9.x

### 安装依赖
```bash
npm install
```

### 启动开发服务器

#### 方式一：纯 Web 端（传统模式）
```bash
npm run dev
```
访问：`http://localhost:5173`

#### 方式二：Electron 桌面应用（推荐 ⭐）
```bash
npm run electron:dev
```
自动打开 Electron 窗口，支持完整的 USB 设备访问功能！

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

## 📁 项目结构
src/
├── components/    # 公共组件 (Navbar, PageLayout, etc.)
├── pages/         # 页面组件 (Home, About, Login, DeviceManager)
├── hooks/         # 自定义 Hooks (useAuth, useResponsive)
├── router/        # 路由配置
├── utils/         # 工具函数 (HTTP 请求封装)
├── styles/        # 全局样式
├── types/         # TypeScript 类型定义 (含 Electron API)
electron/          # Electron 主进程文件 ⭐
├── main.js        # Electron 主进程入口
└── preload.js     # 预加载脚本（安全的 IPC 桥接）
```

## 🛠️ 技术栈
- **框架**: React 19.2.0
- **语言**: TypeScript 5.x
- **构建**: Vite 8.x
- **UI**: Ant Design 6.x
- **路由**: React Router v7
- **HTTP**: Axios 封装
- **桌面框架**: Electron 33.4.0 ⭐
- **USB 模块**: node-usb 2.17.0 ⭐

## 🌍 国际化
支持中文和英文切换，使用 `<LanguageSwitcher />` 组件即可。

## 📱 响应式设计
内置完整的响应式系统，支持手机、平板、桌面设备。

```tsx
import { useResponsive } from '@/hooks/useResponsive';

const { isMobile, isTablet, isDesktop } = useResponsive();
```

## 🔐 路由守卫
使用 `ProtectedRoute` 组件保护需要登录的路由。

```tsx
<ProtectedRoute requireAuth={true}>
  <Home />
</ProtectedRoute>
```

## 📋 可用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（Web 端） |
| `npm run electron:dev` | 启动 Electron 桌面应用 ⭐ |
| `npm run electron:build` | 打包 Electron 应用为安装包 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产构建 |
| `npm run lint` | 代码检查 |

## 📚 精选文档
- 📖 [部署指南](./DEPLOYMENT_GUIDE.md) - 生产环境部署
- 📖 [Ant Design 使用](./ANT_DESIGN_USAGE.md) - UI 组件库指南
- 📖 [国际化指南](./I18N_GUIDE.md) - 多语言支持
- 📖 [快速参考](./QUICK_REFERENCE.md) - 常用命令和技巧

## 🎯 核心特性
- ✅ **TypeScript** - 完整类型支持
- ✅ **响应式设计** - 移动端/平板/桌面自适应
- ✅ **路由系统** - React Router v7 + 路由守卫
- ✅ **国际化** - i18next 多语言支持
- ✅ **HTTP 封装** - Axios 拦截器 + 统一错误处理
- ✅ **高端 UI** - Ant Design 6.x + 自定义主题
- ✅ **性能优化** - 代码分割 + Tree Shaking
- ✅ **Electron 桌面应用** - 跨平台桌面支持 ⭐
- ✅ **USB 设备直连** - Node.js 原生模块，无浏览器限制 ⭐
- ✅ **双模式运行** - Web 端 + 桌面应用无缝切换 ⭐

## 📝 示例代码

### 使用 Hook
```tsx
import { useAuth } from '@/hooks/useAuth';
import { useResponsive } from '@/hooks/useResponsive';

const { isAuthenticated, user } = useAuth();
const { isMobile } = useResponsive();
```

### API 调用
```tsx
import { get, post } from '@/utils/request';

const data = await get('/api/users');
await post('/api/login', { username, password });
```

## 🤝 贡献
欢迎提交 Issue 和 Pull Request！

## 📄 License
MIT
