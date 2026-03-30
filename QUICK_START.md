# 🚀 Electron USB 应用 - 快速启动

## 第一次运行

### 1️⃣ 安装依赖
```bash
npm install
```

### 2️⃣ 启动 Electron 应用
```bash
npm run electron:dev
```

**就这么简单！** 🎉

应用会自动打开，你就可以：
- 🔍 扫描所有 USB 设备
- 📖 读取设备数据
- 🔌 查看设备详情

---

## 🎯 常用命令

```bash
# 开发模式
npm run electron:dev          # 启动开发服务器 + Electron 窗口

# 仅 Web 端（不使用 USB）
npm run dev                   # 仅在浏览器中运行

# 打包应用
npm run electron:build        # 生成安装包（.exe/.dmg/.AppImage）
npm run electron:pack         # 仅打包，不生成安装包

# 其他
npm run lint                  # 代码检查
```

---

## 📱 访问设备管理页面

启动应用后，在导航栏点击 **"设备管理"** 或访问：
```
http://localhost:3000/devices
```

---

## ⚠️ 常见问题

### Q: 提示 "找不到 USB 设备"？
**A:** 
1. 确保设备已连接
2. Windows 用户可能需要安装 libusb 驱动
3. Linux/macOS 用户可能需要配置权限

详见：[README_ELECTRON_USB.md](./README_ELECTRON_USB.md)

### Q: 如何退出应用？
**A:**
- Windows/Linux: 点击窗口关闭按钮 或 `Alt+F4`
- macOS: `Cmd+Q` 或点击菜单 Quit

---

## 📚 完整文档

- [Electron 开发指南](./ELECTRON_GUIDE.md)
- [USB 功能详细说明](./README_ELECTRON_USB.md)

---

**开始使用吧！** ✨
