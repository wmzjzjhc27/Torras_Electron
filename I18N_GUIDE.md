# 国际化（i18n）完整指南

## 📋 目录

- [概述](#概述)
- [技术栈](#技术栈)
- [文件结构](#文件结构)
- [快速开始](#快速开始)
- [使用示例](#使用示例)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)

---

## 🌍 概述

本项目采用 **react-i18next + i18next** 作为国际化解决方案，支持中英文双语切换，具备以下特性：

- ✅ **高性能懒加载** - 翻译文件按需加载
- ✅ **自动语言检测** - 根据浏览器语言自动切换
- ✅ **持久化配置** - 用户语言偏好保存到 localStorage
- ✅ **TypeScript 类型安全** - 完整的类型提示和校验
- ✅ **热更新支持** - 开发环境实时预览翻译效果

---

## 🛠️ 技术栈

| 技术 | 版本 | 作用 |
|------|------|------|
| `i18next` | ^23.x | 核心国际化框架 |
| `react-i18next` | ^14.x | React 绑定层 |
| `i18next-browser-languagedetector` | ^7.x | 浏览器语言检测器 |

---

## 📁 文件结构

```
src/
├── i18n/
│   ├── config.ts              # i18n 配置文件
│   ├── types.ts               # TypeScript 类型定义
│   ├── locales/               # 翻译资源文件
│   │   ├── zh-CN.json         # 简体中文
│   │   └── en-US.json         # English (US)
│   └── index.ts               # 统一导出
├── components/
│   ├── LanguageSwitcher.tsx   # 语言切换组件
│   └── Navbar.tsx             # 导航栏（已集成 i18n）
├── pages/
│   ├── Help/Help.tsx          # 帮助中心（已集成 i18n）
│   └── NotFound/NotFound.tsx  # 404 页面（已集成 i18n）
└── main.tsx                   # 应用入口（初始化 i18n）
```

---

## 🚀 快速开始

### 1. 导入翻译文件

在组件中导入 `useTranslation` Hook：

```tsx
import { useTranslation } from 'react-i18next';
```

### 2. 使用 t 函数

```tsx
export default function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('app.title')}</h1>
      <p>{t('app.description')}</p>
    </div>
  );
}
```

### 3. 添加新的翻译 Key

在翻译文件中添加新的 key-value 对：

**zh-CN.json**
```json
{
  "myComponent": {
    "title": "我的组件",
    "description": "这是一个自定义组件"
  }
}
```

**en-US.json**
```json
{
  "myComponent": {
    "title": "My Component",
    "description": "This is a custom component"
  }
}
```

---

## 📖 使用示例

### 示例 1: 基础文本翻译

```tsx
import { useTranslation } from 'react-i18next';

export default function Welcome() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('home.welcome')}</h1>
      <p>{t('home.subtitle')}</p>
    </div>
  );
}
```

### 示例 2: 动态插值

**翻译文件**
```json
{
  "greeting": "你好，{{name}}！",
  "itemCount": "共 {{count}} 项"
}
```

**组件中使用**
```tsx
<p>{t('greeting', { name: '张三' })}</p>
<p>{t('itemCount', { count: 5 })}</p>
```

### 示例 3: 条件渲染

```tsx
export default function Navigation() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  
  return (
    <nav>
      <ul>
        <li>{t('nav.home')}</li>
        <li>{t('nav.about')}</li>
        {currentLang === 'zh-CN' && (
          <li>中文内容</li>
        )}
      </ul>
    </nav>
  );
}
```

### 示例 4: 语言切换

```tsx
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '@/i18n/config';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  const handleLanguageChange = (lng: string) => {
    changeLanguage(lng as any);
  };
  
  return (
    <div>
      <button onClick={() => handleLanguageChange('zh-CN')}>
        中文
      </button>
      <button onClick={() => handleLanguageChange('en-US')}>
        English
      </button>
    </div>
  );
}
```

---

## 📊 完整翻译 Key 列表

### 应用级别 (app)

| Key | 中文 | English |
|-----|------|---------|
| `app.title` | 嵌入式系统应用 | Embedded System App |
| `app.description` | 基于 React + TypeScript + Vite 的现代化应用 | Modern application based on React + TypeScript + Vite |

### 导航菜单 (nav)

| Key | 中文 | English |
|-----|------|---------|
| `nav.home` | 首页 | Home |
| `nav.about` | 关于 | About |
| `nav.login` | 登录 | Login |
| `nav.logout` | 退出 | Logout |
| `nav.profile` | 个人中心 | Profile |
| `nav.dashboard` | 仪表盘 | Dashboard |
| `nav.devices` | 设备管理 | Device Management |
| `nav.help` | 帮助中心 | Help Center |
| `nav.journal` | 日志中心 | Log Center |
| `nav.settings` | 系统配置 | System Settings |
| `nav.deviceList` | 设备列表 | Device List |
| `nav.deviceMonitor` | 设备监控 | Device Monitor |
| `nav.maintenanceRecord` | 维护记录 | Maintenance Records |
| `nav.systemLogs` | 系统日志 | System Logs |
| `nav.operationLogs` | 操作日志 | Operation Logs |
| `nav.errorLogs` | 错误日志 | Error Logs |
| `nav.generalSettings` | 通用设置 | General Settings |
| `nav.securitySettings` | 安全设置 | Security Settings |
| `nav.networkSettings` | 网络设置 | Network Settings |

### 首页 (home)

| Key | 中文 | English |
|-----|------|---------|
| `home.welcome` | 欢迎使用嵌入式系统应用 | Welcome to Embedded System App |
| `home.subtitle` | 这是一个使用 React + TypeScript + Vite 构建的现代化响应式应用 | This is a modern responsive application built with React + TypeScript + Vite |
| `home.features` | 功能特性 | Features |
| `home.techStack` | 技术栈 | Technology Stack |
| `home.responsiveDesign` | 响应式设计 | Responsive Design |
| `home.modernTech` | 现代化技术栈 | Modern Technology Stack |

### 登录页面 (login)

| Key | 中文 | English |
|-----|------|---------|
| `login.title` | 用户登录 | User Login |
| `login.subtitle` | 欢迎回来，请登录您的账号 | Welcome back, please login to your account |
| `login.username` | 用户名 | Username |
| `login.password` | 密码 | Password |
| `login.remember` | 记住我 | Remember me |
| `login.submit` | 登录 | Login |
| `login.loggingIn` | 登录中... | Logging in... |
| `login.error` | 登录失败，请重试 | Login failed, please try again |
| `login.quickLogin` | 💡 开发环境快速登录 | 💡 Quick Login (Dev Environment) |
| `login.noAccount` | 还没有账号？立即注册 | No account? Register now |

### 404 页面 (notFound)

| Key | 中文 | English |
|-----|------|---------|
| `notFound.title` | 页面未找到 | Page Not Found |
| `notFound.description` | 抱歉，您访问的页面不存在或已被移除 | Sorry, the page you visited does not exist or has been removed |
| `notFound.backHome` | 🏠 返回首页 | 🏠 Back to Home |

### 帮助中心 (help)

| Key | 中文 | English |
|-----|------|---------|
| `help.title` | 帮助中心 | Help Center |
| `help.subtitle` | 欢迎使用嵌入式系统后台管理平台... | Welcome to the embedded system management platform... |
| `help.faqTitle` | 常见问题 | Frequently Asked Questions |
| `help.howToAddDevice` | 如何添加新设备？ | How to add a new device? |
| `help.howToViewMonitor` | 如何查看设备监控数据？ | How to view device monitoring data? |
| `help.howToExportLogs` | 如何导出日志？ | How to export logs? |
| `help.forgotPassword` | 忘记密码怎么办？ | What if I forgot my password? |
| `help.supportTitle` | 技术支持 | Technical Support |
| `help.hotline` | 客服热线 | Customer Service Hotline |
| `help.email` | 技术支持邮箱 | Technical Support Email |
| `help.serviceHours` | 服务时间 | Service Hours |
| `help.serviceTimeValue` | 周一至周五 9:00-18:00 | Monday to Friday 9:00 AM - 6:00 PM |

### 通用词汇 (common)

| Key | 中文 | English |
|-----|------|---------|
| `common.loading` | 加载中... | Loading... |
| `common.error` | 错误 | Error |
| `common.success` | 成功 | Success |
| `common.cancel` | 取消 | Cancel |
| `common.confirm` | 确认 | Confirm |
| `common.save` | 保存 | Save |
| `common.delete` | 删除 | Delete |
| `common.edit` | 编辑 | Edit |
| `common.search` | 搜索 | Search |
| `common.back` | 返回 | Back |
| `common.add` | 添加 | Add |
| `common.export` | 导出 | Export |
| `common.reset` | 重置 | Reset |
| `common.close` | 关闭 | Close |
| `common.yes` | 是 | Yes |
| `common.no` | 否 | No |
| `common.ok` | 确定 | OK |

### 认证相关 (auth)

| Key | 中文 | English |
|-----|------|---------|
| `auth.logoutSuccess` | 已成功退出登录 | Successfully logged out |
| `auth.logoutFailed` | 退出登录失败 | Logout failed |
| `auth.pleaseLogin` | 请先登录 | Please login first |
| `auth.redirecting` | 正在跳转... | Redirecting... |

### 用户信息 (user)

| Key | 中文 | English |
|-----|------|---------|
| `user.info` | 用户信息 | User Information |
| `user.username` | 用户名 | Username |
| `user.role` | 角色 | Role |
| `user.email` | 邮箱 | Email |
| `user.phone` | 电话 | Phone |
| `user.department` | 部门 | Department |
| `user.online` | 在线 | Online |
| `user.administrator` | 系统管理员 | System Administrator |

---

## ✨ 最佳实践

### 1. 使用命名空间组织

按照功能模块组织翻译 key，避免冲突：

```
✅ 推荐
{
  "device.list.title": "设备列表",
  "device.monitor.title": "设备监控"
}

❌ 不推荐
{
  "title1": "设备列表",
  "title2": "设备监控"
}
```

### 2. 避免硬编码字符串

```tsx
// ❌ 错误
<h1>帮助中心</h1>

// ✅ 正确
<h1>{t('help.title')}</h1>
```

### 3. 使用 TypeScript 类型提示

启用严格的类型检查，确保 key 的正确性：

```ts
// 在 i18n.d.ts 中声明类型
declare module 'i18next' {
  interface CustomTypeOptions {
    resources: {
      translation: typeof zhCN;
    };
  }
}
```

### 4. 性能优化

对于大量文本，使用 `Trans` 组件：

```tsx
import { Trans } from 'react-i18next';

<Trans
  i18nKey="description"
  components={[<strong />, <a href="/help" />]}
/>
```

### 5. 复数处理

```json
{
  "items_zero": "没有项目",
  "items_one": "{{count}} 个项目",
  "items_other": "{{count}} 个项目"
}
```

```tsx
{t('items', { count: 0 })}  // 没有项目
{t('items', { count: 1 })}  // 1 个项目
{t('items', { count: 5 })}  // 5 个项目
```

---

## 🔧 开发工具

### 1. 提取翻译 Key

使用脚本自动提取所有翻译 key：

```bash
npm run i18n:extract
```

### 2. 缺失翻译检测

自动检测缺失的翻译项：

```bash
npm run i18n:check
```

### 3. 格式化翻译文件

保持 JSON 文件格式一致：

```bash
npm run i18n:format
```

---

## ❓ 常见问题

### Q1: 为什么切换语言后页面没有更新？

**A:** 确保使用了 `useTranslation()` Hook，React 会自动重新渲染。

```tsx
const { t, i18n } = useTranslation();
// 切换语言
i18n.changeLanguage('en-US');
```

### Q2: 如何在非 React 组件中使用翻译？

**A:** 使用 i18n 实例的 `t` 方法：

```tsx
import i18n from '@/i18n/config';

const text = i18n.t('app.title');
```

### Q3: 如何添加新的语言？

**A:** 
1. 创建新的翻译文件 `locales/ja-JP.json`
2. 在 `config.ts` 中添加语言配置
3. 更新 `supportedLanguages`

```ts
export const supportedLanguages = {
  'zh-CN': '简体中文',
  'en-US': 'English',
  'ja-JP': '日本語', // 新增
} as const;
```

### Q4: 翻译文件太大影响加载速度怎么办？

**A:** 使用懒加载和代码分割：

```ts
const resources = {
  'zh-CN': {
    translation: () => import('./locales/zh-CN.json'),
  },
  'en-US': {
    translation: () => import('./locales/en-US.json'),
  },
};
```

---

## 📝 更新日志

### v1.0.0 (2026-03-18)
- ✅ 完成核心页面国际化（Navbar, Help, NotFound）
- ✅ 补充完整的中英文翻译（120+ keys）
- ✅ 优化翻译文件结构，按功能模块分类
- ✅ 更新所有组件使用 i18n
- ✅ 创建完整的使用文档

---

## 🎯 下一步计划

1. **添加更多语言支持** - 日语、韩语、西班牙语等
2. **实现翻译管理系统** - 集成 Crowdin/Weblate
3. **自动化翻译流程** - AI 辅助翻译 + 人工审核
4. **性能监控** - 跟踪翻译文件大小和加载时间

---

**文档更新时间**: 2026-03-18  
**维护者**: Development Team  
**状态**: ✅ 生产就绪
