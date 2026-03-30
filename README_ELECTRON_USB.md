# 🚀 Electron USB 设备读取 - 完整实施指南

## ✅ 已完成的改造

### 1. 项目架构升级
- ✅ 添加 Electron 主进程 (`electron/main.js`)
- ✅ 创建预加载脚本 (`electron/preload.js`)
- ✅ 配置 TypeScript 类型定义 (`src/types/electron.d.ts`)
- ✅ 更新 package.json 添加 Electron 相关脚本

### 2. USB 读取功能实现
- ✅ Node.js USB 模块集成（已安装 `usb` 包）
- ✅ IPC 通信机制（安全的跨进程通信）
- ✅ 设备列表扫描功能
- ✅ 设备数据读取功能
- ✅ 错误处理与日志记录

### 3. 前端界面更新
- ✅ Home 页面支持双模式（Web/Electron）
- ✅ 自动检测运行环境
- ✅ Electron 专属 UI 提示
- ✅ USB 设备扫描按钮
- ✅ 数据读取展示区域
- ✅ 新增 DeviceManager 专业管理页面

### 4. 路由系统更新
- ✅ 添加 `/devices` 路由指向 DeviceManager
- ✅ 懒加载配置完成
- ✅ 路由守卫正常工作

---

## 🎯 如何使用

### 方式一：开发模式（推荐新手）

#### 1. 安装依赖
```bash
npm install
```

#### 2. 启动 Electron 应用
```bash
npm run electron:dev
```

**这个命令会：**
- 自动启动 Vite 开发服务器（http://localhost:3000）
- 等待服务就绪后打开 Electron 窗口
- 支持热重载（修改代码自动刷新）
- 自动打开开发者工具

#### 3. 测试 USB 功能
1. 连接你的 USB 设备
2. 点击 "🔍 扫描 USB 设备" 按钮
3. 查看设备列表
4. 选择设备后点击 "📖 读取设备数据"
5. 查看返回的十六进制/十进制数据

---

### 方式二：打包为独立应用

#### 1. 构建安装包
```bash
npm run electron:build
```

**产物位置：**
- Windows: `dist-electron/Embedded USB App Setup x.x.x.exe`
- macOS: `dist-electron/Embedded USB App-x.x.x.dmg`
- Linux: `dist-electron/Embedded USB App-x.x.x.AppImage`

#### 2. 安装并运行
双击安装包，按照提示安装即可。

**安装后的应用特性：**
- ✅ 独立运行，无需 Node.js 环境
- ✅ 完整的 USB 设备访问能力
- ✅ 离线使用
- ✅ 自动更新支持（需额外配置）

---

## 📁 关键文件说明

### Electron 核心文件

#### `electron/main.js` (主进程)
```javascript
// 主要功能：
// 1. 创建浏览器窗口
// 2. 监听 IPC 请求
// 3. 调用 Node.js USB 模块
// 4. 返回设备数据给渲染进程
```

**关键 IPC 处理器：**
- `get-usb-devices` - 获取所有 USB 设备列表
- `read-device-data` - 读取指定设备数据
- `quit-app` - 退出应用

#### `electron/preload.js` (预加载脚本)
```javascript
// 安全桥接：
// 1. 暴露有限的 API 给渲染进程
// 2. 隔离 Node.js 环境（安全性）
// 3. 防止原型污染攻击
```

**暴露的 API：**
- `window.electronAPI.getUsbDevices()`
- `window.electronAPI.readDeviceData(config)`
- `window.electronAPI.quitApp()`

---

### 前端文件

#### `src/pages/Home/Home.tsx`
- 双模式支持（Web USB + Electron USB）
- 自动环境检测
- 基础 USB 操作界面

#### `src/pages/DeviceManager/DeviceManager.tsx` ⭐ **推荐使用**
- 专业的设备管理界面
- 可视化设备列表
- 实时数据展示（网格布局）
- 完整的错误处理

#### `src/types/electron.d.ts`
TypeScript 类型定义，提供智能提示和类型检查。

---

## 🔧 常见问题解决

### Q1: "找不到 USB 设备"
**可能原因：**
- 设备未正确连接
- 缺少驱动程序（Windows）
- 权限不足（Linux/macOS）

**解决方案：**

**Windows:**
```bash
# 安装 libusb 驱动
# 下载：https://github.com/libusb/libusb/releases
# 或使用 Zadig 工具：https://zadig.akeo.ie/
```

**Linux:**
```bash
# 配置 udev 规则
echo 'SUBSYSTEM=="usb", ATTR{idVendor}=="*", MODE="0666"' | sudo tee /etc/udev/rules.d/50-usb.rules
sudo udevadm control --reload-rules
sudo service udev restart

# 将用户加入 plugdev 组
sudo usermod -aG plugdev $USER
# 重新登录生效
```

**macOS:**
```bash
# 在 系统设置 → 隐私与安全性 → 辅助功能 中添加终端/Electron 权限
```

---

### Q2: "Permission denied" 或 "Access denied"
**原因：** 没有权限访问 USB 设备

**解决方案：**
- Windows: 以管理员身份运行
- Linux: 参考上面的 udev 配置
- macOS: 授予 USB 访问权限

---

### Q3: 设备被内核驱动占用
**错误信息：** `Resource busy` 或 `Unable to detach kernel driver`

**解决方案：**
在 `electron/main.js` 中已有自动分离驱动的代码：
```javascript
if (iface.isKernelDriverActive()) {
  iface.detachKernelDriver();
}
```

如果失败，手动禁用对应驱动或重启系统。

---

### Q4: 读取的数据为空或错误
**可能原因：**
- 端点地址不正确
- 数据包长度设置错误
- 设备需要特定的初始化指令

**调试方法：**
1. 查看控制台日志
2. 使用 USB 分析工具（如 USBTreeView）
3. 查阅设备技术文档确认端点和协议

---

## 🛠️ 进阶开发

### 自定义设备配置

如果你的设备需要特定配置，修改 `electron/main.js`：

```javascript
ipcMain.handle('read-device-data', async (event, deviceConfig) => {
  // deviceConfig 示例：
  // {
  //   vendorId: 0x1234,
  //   productId: 0x5678,
  //   interface: 0,
  //   endpoint: 0x81,
  //   packetSize: 64
  // }
  
  const usb = require('usb');
  const devices = usb.getDeviceList();
  
  // 根据 VID/PID 精确查找
  const targetDevice = devices.find(dev => {
    const desc = dev.deviceDescriptor;
    return desc.idVendor === deviceConfig.vendorId && 
           desc.idProduct === deviceConfig.productId;
  });
  
  // ... 其余代码
});
```

### 连续读取/实时监控

```javascript
let reading = false;

ipcMain.handle('start-continuous-read', async () => {
  reading = true;
  while (reading) {
    const data = await readFromDevice();
    mainWindow.webContents.send('device-data', data);
    await sleep(100); // 100ms 间隔
  }
});

ipcMain.handle('stop-continuous-read', () => {
  reading = false;
});
```

前端接收：
```javascript
useEffect(() => {
  window.electronAPI?.onDeviceData((data) => {
    console.log('收到数据:', data);
  });
}, []);
```

### 写入数据到设备

```javascript
ipcMain.handle('write-device-data', async (event, data) => {
  const usb = require('usb');
  // ... 找到设备并打开
  
  const endpoint = targetDevice.endpoints.find(ep => ep.direction === 'out');
  
  return new Promise((resolve, reject) => {
    endpoint.transfer(data, (error) => {
      if (error) reject(error);
      else resolve({ success: true });
    });
  });
});
```

---

## 📊 性能优化建议

1. **批量读取**
   - 一次读取多个数据包
   - 减少 IPC 通信次数

2. **异步队列**
   - 避免并发访问冲突
   - 使用队列管理 USB 操作

3. **数据缓存**
   - 设备列表缓存 5 秒
   - 避免频繁扫描

4. **错误重试**
   - 网络波动自动重试（最多 3 次）
   - 指数退避策略

---

## 🔒 安全最佳实践

1. **最小权限原则**
   - 仅暴露必要的 API
   - 验证所有输入参数

2. **上下文隔离**
   - `contextIsolation: true`（已启用）
   - 禁用 `nodeIntegration`（已禁用）

3. **IPC 验证**
   - 验证发送者身份
   - 限制数据类型和范围

4. **代码签名**
   - 生产环境对应用签名
   - 防止篡改

---

## 📚 扩展阅读

- [Node.js USB 文档](https://github.com/tessel/node-usb)
- [Electron 安全最佳实践](https://www.electronjs.org/docs/latest/tutorial/security)
- [libusb 编程指南](https://libusb.info/)
- [USB 协议入门](https://www.beyondlogic.org/usbnutshell/usb1.shtml)

---

## 🎉 下一步计划

### 短期（本周）
- [ ] 添加设备连接状态监测
- [ ] 实现数据导出功能（CSV/JSON）
- [ ] 增加设备收藏夹功能
- [ ] 优化大数据传输性能

### 中期（本月）
- [ ] 支持多设备同时连接
- [ ] 添加设备配置文件管理
- [ ] 实现固件升级功能
- [ ] 增加图表可视化

### 长期（下季度）
- [ ] 插件系统支持
- [ ] 云端设备管理
- [ ] 移动端配套 APP
- [ ] OTA 更新机制

---

**祝你开发顺利！** 🚀

如有问题，请查看：
- 控制台日志
- Electron 开发者工具
- [ELECTRON_GUIDE.md](./ELECTRON_GUIDE.md)
