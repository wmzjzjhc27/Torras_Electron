# 🍎 macOS 打包完全指南

## ✅ **当前状态**

你的 Electron 应用**已完全支持 macOS 打包**，配置包括：
- ✅ DMG 安装包格式
- ✅ 支持 Intel (x64) 和 Apple Silicon (arm64) 双架构
- ✅  hardened runtime（强化运行时）
- ✅ USB 设备访问权限
- ✅ 完整的图标和权限配置

---

## 📦 **打包方式**

### **方式一：在 Mac 上原生打包**（强烈推荐 ⭐⭐⭐⭐⭐）

这是**最可靠、最推荐**的方式。

#### 📋 **前提条件**
1. macOS 10.13 或更高版本
2. Node.js >= 18.x
3. Xcode Command Line Tools

#### 🔧 **安装步骤**

```bash
# 1. 安装 Xcode Command Line Tools
xcode-select --install

# 2. 安装 Node.js（如果未安装）
brew install node@18

# 3. 克隆项目并安装依赖
cd /path/to/embedded_system
npm install

# 4. 打包 macOS 版本
npm run electron:build
```

#### 📤 **输出文件**

打包成功后，在 `dist-electron/` 目录生成：

| 文件 | 适用设备 | 大小预估 |
|------|---------|---------|
| `图拉斯 -1.0.0-x64.dmg` | Intel Mac | ~400MB |
| `图拉斯 -1.0.0-arm64.dmg` | M1/M2/M3 Mac | ~380MB |

#### 🎯 **支持的 Mac 设备**

- **Intel 芯片**: MacBook Pro/Air (2012+), iMac, Mac mini, Mac Pro
- **Apple Silicon**: M1/M2/M3 系列所有机型

---

### **方式二：在 Windows 上交叉编译** ⚠️

**不推荐**，仅限测试使用。

```bash
# 在 Windows 上执行
npm run electron:build -- --mac
```

#### ⚠️ **严重限制**

1. **无法代码签名** - 需要 Apple Developer 证书（$99/年）
2. **无法公证（Notarization）** - macOS Catalina+ 会警告"无法打开"
3. **仅支持 x64 架构** - 无法生成 Apple Silicon 版本
4. **USB 模块可能不工作** - 原生模块跨平台编译有问题

#### 🔓 **临时解决方案（仅限开发测试）**

如果在 Windows 打包后遇到"无法打开"的警告：

```bash
# 在 Mac 上右键点击应用 -> 打开
# 或执行以下命令
xattr -cr /Applications/图拉斯.app
```

---

## 🔐 **代码签名和公证**（生产环境必需）

### **获取 Apple Developer 证书**

1. **加入 Apple Developer Program** ($99/年)
   - 访问：https://developer.apple.com/programs/

2. **创建证书**
   ```bash
   # 在 Keychain Access 中
   # Keychain Access -> Certificate Assistant -> Request a Certificate From a Certificate Authority
   ```

3. **配置签名身份**
   ```bash
   # 查看可用证书
   security find-identity -v -p codesigning
   
   # 输出示例：
   # 1) ABCDEF1234567890... "Developer ID Application: Your Name"
   ```

4. **更新打包配置**
   
   在 `electron-builder.config.json` 中添加：
   ```json
   {
     "mac": {
       "identity": "Developer ID Application: Your Name",
       "hardenedRuntime": true,
       "gatekeeperAssess": false,
       "notarize": {
         "teamId": "YOUR_TEAM_ID"
       }
     }
   }
   ```

5. **自动公证（推荐）**
   
   使用 `electron-notarize` 包：
   ```bash
   npm install electron-notarize --save-dev
   ```

   创建 `scripts/notarize.js`:
   ```javascript
   require('dotenv').config();
   const { notarize } = require('electron-notarize');

   exports.default = async function notarizing(context) {
     const { electronPlatformName, appOutDir } = context;  
     if (electronPlatformName !== 'darwin') {
       return;
     }

     const appName = context.packager.appInfo.productFilename;

     return await notarize({
       tool: 'notarytool',
       teamId: process.env.APPLE_TEAM_ID,
       appPath: `${appOutDir}/${appName}.app`,
       appleId: process.env.APPLE_ID,
       appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
     });
   };
   ```

   更新 `electron-builder.config.json`:
   ```json
   {
     "afterSign": "scripts/notarize.js"
   }
   ```

---

## 🎯 **USB 设备访问特殊配置**

由于你的应用需要访问 USB 设备，需要额外配置：

### ** entitlements.mac.plist**（已创建）

文件位置：`build/entitlements.mac.plist`

包含的关键权限：
- ✅ `com.apple.security.device.usb` - USB 访问
- ✅ `com.apple.security.network.client` - 网络访问
- ✅ `com.apple.security.device.camera` - 摄像头（可选）
- ✅ `com.apple.security.device.bluetooth` - 蓝牙（可选）

### **⚠️ macOS 系统权限提示**

首次运行时，用户会看到：

```
"图拉斯"想要访问 USB 设备
允许 / 拒绝
```

这是**正常的系统安全提示**，不是错误。

---

## 📊 **打包体积优化（macOS 特定）**

### **分离架构打包**

针对不同芯片架构分别打包，减小单个体积：

```bash
# Intel 版本
npm run electron:build -- --mac --x64

# Apple Silicon 版本
npm run electron:build -- --mac --arm64
```

### **体积对比**

| 版本 | 体积 | 适用设备 |
|------|------|---------|
| Universal (双架构) | ~750MB | 所有 Mac |
| x64 only | ~400MB | Intel Mac |
| arm64 only | ~380MB | M1/M2/M3 |

**建议**: 提供两个独立安装包，让用户根据芯片选择。

---

## 🧪 **测试安装**

### **开发版本测试**

```bash
# 1. 打包
npm run electron:build

# 2. 本地安装测试
open dist-electron/图拉斯-1.0.0-dmg

# 3. 如果遇到"无法验证开发者"
# 系统偏好设置 -> 安全性与隐私 -> 仍要打开
```

### **生产版本测试**

```bash
# 在干净的 Mac 上测试（无开发证书）
# 应该能看到完整的签名和公证信息
codesign -dv --verbose=4 /Applications/图拉斯.app
spctl -a -v /Applications/图拉斯.app
```

---

## 🚨 **常见问题解决**

### ❌ 问题 1: "无法打开，因为无法验证开发者"

**解决方案 A** - 临时绕过：
```bash
# 方法 1: 右键点击 -> 打开
# 方法 2: 命令行
xattr -cr /Applications/图拉斯.app
```

**解决方案 B** - 正式解决：
- 购买 Apple Developer 证书
- 进行代码签名和公证

### ❌ 问题 2: USB 设备无法识别

**检查清单**：
1. ✅ `entitlements.mac.plist` 包含 USB 权限
2. ✅ 用户已授权 USB 访问
3. ✅ 以管理员权限运行
4. ✅ libusb 驱动正确安装

**调试命令**：
```bash
# 查看 USB 权限
tccutil reset All com.tuolas.app

# 重新授权
sudo chmod 666 /dev/bus/usb/*
```

### ❌ 问题 3: 在 M1 Mac 上运行缓慢

**原因**: 运行的是 Intel 版本（通过 Rosetta 2 转译）

**解决方案**：
```bash
# 确认架构
uname -m
# arm64 = Apple Silicon
# x86_64 = Intel

# 安装正确的版本
# M1/M2/M3 选择 arm64 版本
```

### ❌ 问题 4: 打包失败 "icon.icns not found"

**解决方案**：
```bash
# 检查图标文件
ls -la build/icon.icns

# 如果不存在，从 PNG 转换
png2icns build/icon.icns build/icon.png
# 或使用在线工具转换
```

---

## 📋 **发布前检查清单**

### **开发阶段**
- [ ] 在 Mac 上成功打包
- [ ] 应用可以正常打开
- [ ] USB 设备可以识别
- [ ] 所有功能正常工作

### **生产发布**
- [ ] 已购买 Apple Developer 证书 ($99/年)
- [ ] 已完成代码签名
- [ ] 已通过 Apple 公证（Notarization）
- [ ] 已测试 Intel 和 Apple Silicon 两种架构
- [ ] 已更新 `entitlements.mac.plist` 权限配置
- [ ] 已在多台不同 macOS 版本测试

### **分发准备**
- [ ] 准备下载安装包的服务器/CDN
- [ ] 编写 macOS 版安装说明
- [ ] 准备常见问题解答（FAQ）
- [ ] 设置自动更新机制

---

## 🎉 **完整打包流程示例**

### **场景：在 Mac 上发布生产版本**

```bash
# 1. 环境变量配置
export APPLE_ID="your@email.com"
export APPLE_APP_SPECIFIC_PASSWORD="xxx-xxx-xxx-xxx"
export APPLE_TEAM_ID="XXXXXXXXXX"

# 2. 清理旧的构建
rm -rf dist dist-electron node_modules
npm install

# 3. 构建生产版本
npm run build

# 4. 打包并签名
npm run electron:build -- --mac --publish never

# 5. 公证（自动执行）
# 配置了 afterSign 脚本会自动执行

# 6. 验证
codesign -dv --verbose=4 dist-electron/图拉斯.app
spctl -a -v dist-electron/图拉斯.app

# 7. 创建 DMG
# electron-builder 自动生成 DMG 文件

# 8. 最终检查
open dist-electron/图拉斯-*.dmg
```

---

## 📞 **技术支持资源**

- **Electron 官方文档**: https://www.electronjs.org/docs/latest/
- **electron-builder**: https://www.electron.build/
- **Apple Notarization**: https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution
- **Hardened Runtime**: https://developer.apple.com/documentation/security/hardened_runtime

---

## 🏆 **总结**

### ✅ **可以在 Mac 上安装吗？**

**完全可以！** 你的应用已经完美支持 macOS：

1. ✅ **配置文件完整** - 包含所有必需的 macOS 配置
2. ✅ **图标已准备** - icon.icns 文件就绪
3. ✅ **权限配置** - entitlements.mac.plist 包含 USB 权限
4. ✅ **双架构支持** - Intel + Apple Silicon

### 🎯 **推荐方案**

- **开发测试**: 直接在 Mac 上 `npm run electron:build`
- **生产发布**: 购买 Apple 证书 + 代码签名 + 公证
- **体积优化**: 分别打包 x64 和 arm64 版本

### 📦 **预期输出**

打包成功后会生成：
- `图拉斯 -1.0.0-x64.dmg` (~400MB) - Intel Mac
- `图拉斯 -1.0.0-arm64.dmg` (~380MB) - M1/M2/M3 Mac

---

**最后更新**: 2026-03-30  
**适用版本**: macOS 10.13+  
**当前状态**: 已配置完成，可在 Mac 上直接打包 ✨
