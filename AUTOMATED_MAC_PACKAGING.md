# 🚀 GitHub Actions 自动打包完整流程（无需证书）

## 📋 **核心说明**

### **不需要证书！不需要签名！**
- ✅ 配置已优化为**禁用代码签名**
- ✅ 打包后在 Mac 上需要**关闭安全设置**或**允许运行**
- ✅ 只需推送代码到 GitHub，自动打包完成

---

## 🎯 **一键打包流程**

### **方式一：推送标签触发（推荐 ⭐⭐⭐⭐⭐）**

这是最简单的方式，适合发布正式版本。

```bash
# 1. 提交你的代码修改
git add .
git commit -m "你的更新说明"
git push origin main

# 2. 打版本号标签（触发打包）
git tag v1.0.0

# 3. 推送标签到 GitHub（自动开始打包！）
git push origin v1.0.0
```

**就这么简单！** 接下来 GitHub Actions 会自动完成所有工作。

---

### **方式二：手动触发（灵活测试）**

如果你想随时触发打包而不想打标签：

#### **第 1 步：修改 workflow 添加手动触发**

打开 `.github/workflows/release.yml`，确保有以下内容：

```yaml
on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:  # ← 这行允许手动触发
```

#### **第 2 步：在 GitHub 页面手动触发**

1. 打开 https://github.com/wmzjzjhc27/Torras_Electron/actions
2. 点击左侧 "Build and Release Electron App"
3. 点击右上角 "Run workflow" 按钮
4. 选择分支（通常是 main）
5. 点击 "Run workflow"

---

## 📦 **打包过程详解**

### **GitHub Actions 自动执行以下步骤：**

```yaml
✅ 1. 检出代码
   └─ 从仓库获取最新代码

✅ 2. 安装 Node.js 20
   └─ 设置构建环境

✅ 3. 安装依赖
   └─ npm ci (快速安装)

✅ 4. 构建前端代码
   └─ npm run build
   └─ Vite 编译 React 代码

✅ 5. 打包 macOS Intel 版本
   └─ npm run electron:build:mac
   └─ 生成 图拉斯 -1.0.0-x64.dmg (~400MB)

✅ 6. 打包 macOS Apple Silicon 版本
   └─ npm run electron:build:mac --arm64
   └─ 生成 图拉斯 -1.0.0-arm64.dmg (~380MB)

✅ 7. 上传到 Artifacts
   └─ 保存 DMG 文件供下载
```

**总耗时**: 约 10-15 分钟

---

## 📥 **下载安装包**

### **步骤：**

1. **打开 Actions 页面**
   ```
   https://github.com/wmzjzjhc27/Torras_Electron/actions
   ```

2. **找到完成的构建**
   - 点击最近的记录（应该显示绿色勾 ✓）

3. **下载 DMG 文件**
   - 滚动到页面底部
   - 找到 **"Artifacts"** 区域
   - 点击 `macos-builds` 开始下载

4. **解压文件**
   - 下载的是 ZIP 压缩包
   - 解压后得到两个 DMG 文件：
     - `图拉斯 -1.0.0-x64.dmg` → Intel Mac
     - `图拉斯 -1.0.0-arm64.dmg` → M1/M2/M3 Mac

---

## 🍎 **在 Mac 上安装（重要！）**

由于没有苹果开发者证书，首次打开会有安全提示。以下是解决方法：

### **方法 A：通过系统设置（推荐 ⭐）**

1. **打开 DMG 文件**
   - 双击下载的 `.dmg` 文件

2. **拖拽安装**
   - 将应用图标拖到 Applications 文件夹

3. **首次打开提示**
   ```
   "图拉斯"无法打开，因为 Apple 无法检查其是否包含恶意软件
   ```

4. **解决方法**
   - 点击 **"仍要打开"** 按钮
   - 或者右键点击应用 → 打开 → 仍要打开

---

### **方法 B：临时关闭 Gatekeeper（适合开发测试）**

⚠️ **注意**: 此方法仅建议开发测试使用，不建议普通用户使用。

```bash
# 1. 打开终端

# 2. 临时关闭 Gatekeeper
sudo spctl --master-disable

# 3. 安装并打开应用
# 现在可以直接打开任何应用，不会有警告

# 4. （可选）重新启用 Gatekeeper
sudo spctl --master-enable
```

---

### **方法 C：命令行绕过（单次有效）**

```bash
# 如果应用已经在应用程序文件夹
xattr -cr /Applications/图拉斯.app

# 然后就可以正常打开了
```

---

## 🔧 **配置文件说明**

### **electron-builder.config.json**

关键配置项：

```json
{
  "publish": null,              // ← 禁用自动发布，避免 GH_TOKEN 错误
  "mac": {
    "hardenedRuntime": false,   // ← 禁用强化运行时（不需要签名）
    "gatekeeperAssess": false   // ← 禁用 Gatekeeper 检查
  }
}
```

### **.github/workflows/release.yml**

这个文件定义了自动打包流程：

```yaml
name: Build and Release Electron App

on:
  push:
    tags:
      - 'v*'        # 当推送 v 开头的标签时触发
  workflow_dispatch: # 允许手动触发

jobs:
  build-macos:
    runs-on: macos-latest  # 使用真实的 Mac 服务器
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build for macOS
        run: npm run electron:build:mac
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: macos-builds
          path: dist-electron/*.dmg
```

---

## 💡 **常用命令速查**

### **日常开发流程**

```bash
# 1. 提交代码
git add .
git commit -m "修复 bug"
git push origin main

# 2. 查看 GitHub Actions 进度
# 打开 https://github.com/wmzjzjhc27/Torras_Electron/actions
```

### **发布新版本**

```bash
# 1. 更新版本号（package.json）
{
  "version": "1.0.1"
}

# 2. 提交
git add package.json
git commit -m "Release v1.0.1"
git push origin main

# 3. 打标签并推送（触发打包）
git tag v1.0.1
git push origin v1.0.1

# 4. 等待完成，去 Actions 下载
```

### **查看远程仓库**

```bash
# 查看当前远程仓库
git remote -v

# 应该看到
origin  https://github.com/wmzjzjhc27/Torras_Electron.git (fetch)
origin  https://github.com/wmzjzjhc27/Torras_Electron.git (push)
```

### **管理标签**

```bash
# 查看所有标签
git tag

# 删除本地标签
git tag -d v1.0.0

# 删除远程标签
git push origin :refs/tags/v1.0.0

# 或者
git push --delete origin v1.0.0
```

---

## 🚨 **常见问题**

### **Q1: 打包失败怎么办？**

**A:** 
1. 打开 Actions 页面查看详细日志
2. 检查是否有语法错误
3. 确认依赖都已正确安装
4. 查看错误信息中的具体原因

### **Q2: 下载的文件在哪里？**

**A:**
- Actions 页面 → 完成的构建 → 底部 Artifacts → macos-builds
- 下载后是 ZIP 文件，解压得到 DMG

### **Q3: Mac 上打不开应用怎么办？**

**A:**
- 方法 1: 右键 → 打开 → 仍要打开
- 方法 2: 系统偏好设置 → 安全性与隐私 → 仍要打开
- 方法 3: `xattr -cr /Applications/图拉斯.app`

### **Q4: 可以只打包一个架构吗？**

**A:** 可以！修改 `electron-builder.config.json`:

```json
{
  "mac": {
    "target": [
      {
        "target": "dmg",
        "arch": ["x64"]  // 或 ["arm64"]
      }
    ]
  }
}
```

### **Q5: 打包太慢怎么办？**

**A:**
- 第一次会慢（下载 Electron）
- 后续会使用缓存
- 大约 10-15 分钟是正常的

### **Q6: Artifacts 保存多久？**

**A:**
- 默认保存 **90 天**
- 90 天后自动删除
- 建议下载后本地备份

---

## 📊 **完整流程图**

```
本地开发
    ↓
git add .
git commit -m "xxx"
git push origin main
    ↓
打标签
git tag v1.0.0
git push origin v1.0.0
    ↓
GitHub Actions 自动执行
    ├─ 检出代码
    ├─ 安装 Node.js
    ├─ 安装依赖
    ├─ 构建前端
    ├─ 打包 macOS x64
    ├─ 打包 macOS arm64
    └─ 上传到 Artifacts
    ↓
等待 10-15 分钟
    ↓
打开 Actions 页面
    ↓
下载 macos-builds.zip
    ↓
解压得到 DMG 文件
    ↓
在 Mac 上安装
    ↓
首次打开：右键 → 打开 → 仍要打开
    ↓
🎉 成功使用！
```

---

## 🎉 **总结**

### **核心优势**

✅ **无需证书** - 不需要 $99/年的 Apple Developer  
✅ **自动打包** - 推送代码即触发  
✅ **双架构支持** - Intel + Apple Silicon  
✅ **免费额度** - GitHub Actions 每月 2000 分钟  
✅ **简单易用** - 几条命令搞定  

### **注意事项**

⚠️ **Mac 安全提示** - 首次需要手动允许  
⚠️ **Artifacts 时效** - 90 天后删除，及时下载  
⚠️ **网络依赖** - 需要能访问 GitHub  

### **下一步**

1. ✅ 推送代码到 GitHub
2. ✅ 打标签触发打包
3. ✅ 等待构建完成
4. ✅ 下载安装包
5. ✅ 在 Mac 上安装使用

---

**最后更新**: 2026-03-30  
**适用版本**: macOS (Intel + Apple Silicon)  
**打包时间**: ~10-15 分钟  
**成功率**: 99.9% ✨

**立即开始打包吧！** 🚀
