# 🚀 快速参考卡 - Electron USB 应用

## ⚡ 一行命令启动

```bash
npm install && npm run electron:dev
```

---

## 📋 核心功能速查

### 🔍 扫描设备
- **位置**: 首页 或 `/devices` 页面
- **按钮**: "🔍 扫描 USB 设备"
- **返回**: 设备列表（VID, PID, 总线号等）

### 📖 读取数据
- **前提**: 先选择设备
- **按钮**: "📖 读取设备数据"
- **返回**: 十进制 + 十六进制数据

### 🌐 双模式切换
- **自动检测**: Electron / Web 浏览器
- **Electron**: 完整 USB 支持 ✅
- **Web**: 有限支持 ⚠️

---

## 🎯 常用命令

| 命令 | 作用 | 使用场景 |
|------|------|----------|
| `npm run electron:dev` | 开发模式 | 日常开发 |
| `npm run dev` | 仅 Web 端 | 测试纯前端功能 |
| `npm run electron:build` | 打包应用 | 发布给用户 |
| `npm run lint` | 代码检查 | 提交前检查 |

---

## 📁 关键文件定位

| 文件 | 路径 | 作用 |
|------|------|------|
| 主进程 | `electron/main.js` | USB 操作核心 |
| 预加载 | `electron/preload.js` | API 桥接 |
| 类型定义 | `src/types/electron.d.ts` | TS 智能提示 |
| 设备管理 | `src/pages/DeviceManager/` | 专业界面 |
| 首页 | `src/pages/Home/Home.tsx` | 双模式支持 |

---

## 🐛 故障排查速查

### ❌ 找不到设备
1. 检查物理连接
2. Windows: 安装 libusb 驱动
3. Linux: 配置 udev 规则
4. macOS: 授予 USB 权限

### ❌ 权限被拒绝
- Windows: 管理员身份运行
- Linux: `sudo usermod -aG plugdev $USER`
- macOS: 系统设置中添加权限

### ❌ 数据读取失败
1. 查看控制台日志
2. 确认端点地址
3. 检查数据包大小
4. 查阅设备文档

---

## 💡 IPC API 速查

### 前端调用示例
```typescript
// 获取设备列表
const devices = await window.electronAPI?.getUsbDevices();

// 读取设备数据
const data = await window.electronAPI?.readDeviceData({});

// 退出应用
window.electronAPI?.quitApp();
```

### 主进程处理
```javascript
ipcMain.handle('get-usb-devices', async () => {
  const usb = require('usb');
  const devices = usb.getDeviceList();
  return { success: true, devices };
});
```

---

## 📊 设备信息字段

| 字段 | 说明 | 示例 |
|------|------|------|
| `busNumber` | 总线号 | 1 |
| `deviceAddress` | 设备地址 | 5 |
| `idVendor` | 厂商 ID (十六进制) | "0x0483" |
| `idProduct` | 产品 ID (十六进制) | "0x5740" |
| `deviceVersion` | 设备版本 | "2.00" |

---

## 🔗 完整文档索引

| 文档 | 用途 |
|------|------|
| [QUICK_START.md](./QUICK_START.md) | 5 分钟快速上手 |
| [README_ELECTRON_USB.md](./README_ELECTRON_USB.md) | USB 功能详解 |
| [ELECTRON_GUIDE.md](./ELECTRON_GUIDE.md) | Electron 开发指南 |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | 生产环境部署 |

---

## 🎨 UI 组件速查

### 按钮样式
```typescript
// 主按钮（青色）
background: "#4ecdc4"

// 危险按钮（红色）
background: "#ff6b6b"

// 渐变背景
background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
```

### 卡片样式
```typescript
// 标准卡片
border: "1px solid #e0e0e0"
borderRadius: "var(--border-radius-md)"
background: "#fff"
boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)"
```

---

## 🎯 路由速查

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | 重定向到 `/home` | 默认首页 |
| `/home` | Home | 首页（双模式） |
| `/devices` | DeviceManager | 设备管理 |
| `/login` | Login | 登录页 |
| `/about` | About | 关于页 |

---

## 📦 依赖版本

| 包 | 版本 | 作用 |
|----|------|------|
| electron | 33.4.0 | 桌面框架 |
| usb | 2.17.0 | USB 模块 |
| react | 19.2.0 | UI 框架 |
| vite | 8.0.0-beta | 构建工具 |

---

**打印此卡片作为桌面参考！** 📌

最后更新：2026-03-20
