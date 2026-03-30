# Electron 桌面应用开发指南

## 📦 项目架构

本项目已改造为 **Electron + React + TypeScript + Vite** 混合应用，支持：
- ✅ Web 端模式（浏览器访问）
- ✅ Electron 桌面模式（原生 USB 设备访问）

### 架构图
```
┌─────────────────────────────────────────────┐
│           Electron 应用                      │
├──────────────────┬──────────────────────────┤
│   渲染进程        │      主进程               │
│  (前端 React)     │   (Node.js + USB)       │
│                  │                          │
│  window.electronAPI│◄──► IPC ◄──► require('usb')
│                  │                          │
└──────────────────┴──────────────────────────┘
```

---

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 开发模式

#### 仅运行 Web 端（传统模式）
```bash
npm run dev
```
访问 http://localhost:3000

#### 运行 Electron 桌面应用（推荐）
```bash
npm run electron:dev
```
此命令会：
1. 启动 Vite 开发服务器
2. 自动打开 Electron 窗口
3. 支持完整的 USB 设备访问功能
4. 自动打开开发者工具

### 3. 构建打包

```bash
# 构建 Electron 应用（生成安装包）
npm run electron:build

# 仅打包不生成安装包（用于测试）
npm run electron:pack
```

构建产物位于 `dist-electron/` 目录，当前配置产品名称为"图拉斯"。

---

## 🔌 USB 设备访问

### Electron 模式（桌面应用）
- ✅ 使用 Node.js `usb` 模块
- ✅ 支持所有 USB 设备（包括工业级设备）
- ✅ 无需浏览器安全限制
- ✅ 通过 IPC 安全通信

### Web 模式（浏览器）
- ⚠️ 仅限 Chrome/Edge 89+
- ⚠️ 需要 HTTPS 或 localhost
- ⚠️ 需要用户主动触发
- ⚠️ 仅支持 Web USB API 兼容设备

### 核心工作流程

1. **前端发送请求** (Home.tsx / DeviceManager.tsx)
```typescript
const devices = await window.electronAPI?.getUsbDevices();
const data = await window.electronAPI?.readDeviceData({});
```

2. **IPC 通信桥接** (preload.js)
```javascript
contextBridge.exposeInMainWorld('electronAPI', {
  getUsbDevices: () => ipcRenderer.invoke('get-usb-devices'),
  readDeviceData: (config) => ipcRenderer.invoke('read-device-data', config)
});
```

3. **主进程处理** (main.js)
```javascript
ipcMain.handle('get-usb-devices', async () => {
  const usbModule = await import('usb');
  const usb = usbModule.default || usbModule;
  const devices = usb.getDeviceList();
  // 处理设备信息...
  return { success: true, devices: [...] };
});
```

---

## 📁 关键文件说明

### Electron 核心文件
- `electron/main.js` - Electron 主进程入口，处理 USB 设备访问
- `electron/preload.js` - 预加载脚本，安全的 IPC 桥接

### TypeScript 类型定义
- `src/types/electron.d.ts` - Electron API TypeScript 类型定义
- `src/types/web-usb.d.ts` - Web USB API 类型定义

### 前端页面
- `src/pages/Home/Home.tsx` - 首页（包含基础 USB 操作）
- `src/pages/DeviceManager/DeviceManager.tsx` - 专业 USB 设备管理界面

---

## 🛠️ 开发技巧

### 调试 Electron
Electron 开发模式下会自动打开开发者工具，支持：
- React DevTools
- Console 调试
- Network 监控
- Performance 分析

### IPC 通信完整示例

**前端调用 (TypeScript):**
```typescript
// 获取 USB 设备列表
const handleScanDevices = async () => {
  try {
    const result = await window.electronAPI?.getUsbDevices();
    if (result?.success) {
      setDevices(result.devices);
    }
  } catch (error) {
    console.error('扫描失败:', error);
  }
};

// 读取设备数据
const handleReadDevice = async (config: any) => {
  const result = await window.electronAPI?.readDeviceData(config);
  if (result?.success) {
    console.log('十六进制数据:', result.hexData);
    console.log('解析数据:', result.parsedData);
  }
};
```

**主进程处理 (JavaScript):**
```javascript
// 监听 USB 设备列表请求
ipcMain.handle('get-usb-devices', async () => {
  try {
    const usbModule = await import('usb');
    const usb = usbModule.default || usbModule;
    const devices = usb.getDeviceList();

    const deviceInfo = devices.map((dev) => {
      const desc = dev.deviceDescriptor;
      return {
        busNumber: dev.busNumber,
        deviceAddress: dev.deviceAddress,
        idVendor: `0x${desc.idVendor.toString(16).padStart(4, '0')}`,
        idProduct: `0x${desc.idProduct.toString(16).padStart(4, '0')}`,
        manufacturer: desc?.iManufacturer || null,
        product: desc?.iProduct || null,
      };
    });

    return { success: true, devices: deviceInfo };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 监听读取设备数据请求
ipcMain.handle('read-device-data', async (event, deviceConfig) => {
  try {
    const usbModule = await import('usb');
    const usb = usbModule.default || usbModule;
    const devices = usb.getDeviceList();

    // 查找目标设备
    const targetDevice = devices.find(dev => {
      const desc = dev.deviceDescriptor;
      return desc && 
        desc.idVendor === parseInt(deviceConfig.vendorId) &&
        desc.idProduct === parseInt(deviceConfig.productId);
    });

    if (!targetDevice) {
      throw new Error('未找到设备');
    }

    // 打开设备并读取数据
    targetDevice.open();
    const iface = targetDevice.interface(0);
    iface.claim();

    const endpointIn = iface.endpoints.find(e => e.direction === 'in');
    const endpointOut = iface.endpoints.find(e => e.direction === 'out');

    // 发送初始化指令
    if (endpointOut) {
      await new Promise((resolve, reject) => {
        endpointOut.transfer(Buffer.from([0x01]), (err) => {
          err ? reject(err) : resolve(true);
        });
      });
    }

    // 读取数据
    const data = await new Promise((resolve, reject) => {
      endpointIn.transfer(64, (error, data) => {
        error ? reject(error) : resolve(data);
      });
    });

    // 关闭设备
    iface.release(true);
    targetDevice.close();

    const uint8Data = new Uint8Array(data);
    return {
      success: true,
      data: Array.from(uint8Data),
      hexData: Array.from(uint8Data).map(b => b.toString(16).padStart(2, '0')).join(' '),
      parsedData: uint8Data.length >= 16 ? {
        soc: uint8Data[9],
        voltage: (((uint8Data[11] << 8) | uint8Data[10]) / 100).toFixed(2),
        current: ((((uint8Data[13] << 8) | uint8Data[12]) - 32768) / 100).toFixed(2)
      } : null
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
```

---

## 📝 平台特定配置

### Windows 平台
- 可能需要安装 [libusb](https://github.com/libusb/libusb) 驱动
- 某些设备需要管理员权限才能访问
- 推荐使用 Zadig 工具安装 WinUSB 驱动

### macOS 平台
- 部分设备需要授予 USB 访问权限
- 在 系统设置 → 隐私与安全性 → 辅助功能 中添加权限
- 需要签名才能分发

### Linux 平台
- 可能需要配置 udev 规则
```bash
echo 'SUBSYSTEM=="usb", ATTR{idVendor}=="*", MODE="0666"' | sudo tee /etc/udev/rules.d/50-usb.rules
sudo udevadm control --reload-rules
```
- 将用户加入 `plugdev` 组：`sudo usermod -aG plugdev $USER`

---

## 🔒 安全最佳实践

### 已启用的安全特性

1. **上下文隔离** (`contextIsolation: true`)
   - 防止原型污染攻击
   - 隔离 Node.js 环境

2. **禁用 Node 集成** (`nodeIntegration: false`)
   - 渲染进程无法直接访问 Node.js
   - 必须通过预加载的 API

3. **最小化 API 暴露**
   - 仅暴露必要的 USB 操作
   - 所有参数经过验证

4. **IPC 通信验证**
   - 主进程验证请求来源
   - 数据类型检查

### ⚠️ 禁止事项

❌ **前端组件中严禁使用 `require('usb')`**
```typescript
// ❌ 错误！会导致 ReferenceError: require is not defined
const usb = require('usb');

// ✅ 正确 - 通过 IPC 调用
const result = await window.electronAPI.getUsbDevices();
```

---

## 🎯 常见问题解决

### Q1: "找不到 USB 设备"
**解决方案:**
- 检查设备连接
- Windows: 安装 libusb 驱动或使用 Zadig 工具
- Linux: 配置 udev 规则并重启
- macOS: 授予 USB 访问权限

### Q2: "Permission denied" 或 "Access denied"
**解决方案:**
- Windows: 以管理员身份运行
- Linux: 参考上面的 udev 配置
- macOS: 在隐私与安全性中添加权限

### Q3: 设备被内核驱动占用
**解决方案:**
主进程代码已包含自动分离驱动的逻辑:
```javascript
if (iface.isKernelDriverActive()) {
  iface.detachKernelDriver();
}
```

### Q4: ReferenceError: require is not defined
**原因:** 在前端组件中使用了 `require()`
**解决:** 改用 `window.electronAPI.*` 调用

---

## 🚀 下一步计划

### 短期优化
- [ ] 添加设备收藏夹功能
- [ ] 实现数据导出（CSV/JSON）
- [ ] 增加设备连接状态监测
- [ ] 优化大数据传输性能

### 中期规划
- [ ] 支持多设备同时连接
- [ ] 添加设备配置文件管理
- [ ] 实现固件升级功能
- [ ] 增加图表可视化

### 长期愿景
- [ ] 插件系统支持
- [ ] 云端设备管理
- [ ] 移动端配套 APP
- [ ] OTA 更新机制

---

## 📚 参考资源

### 官方文档
- [Electron 官方文档](https://www.electronjs.org/docs)
- [Node.js USB 模块](https://github.com/tessel/node-usb)
- [Web USB API 规范](https://wicg.github.io/webusb/)
- [libusb 文档](https://libusb.info/)

### 项目文档
- [README.md](./README.md) - 项目总览
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - 部署指南

---

**最后更新:** 2026-03-25  
**产品版本:** 图拉斯 1.0.0  
**Electron 版本:** 33.4.0  
**USB 库版本:** 2.17.0
