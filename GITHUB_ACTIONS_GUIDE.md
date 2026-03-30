# 🚀 GitHub Actions 自动打包完全指南

## 📋 **什么是 GitHub Actions？**

GitHub Actions 是 GitHub 提供的 CI/CD 服务，可以：
- ✅ 自动构建你的应用
- ✅ 自动测试代码
- ✅ 自动发布到多个平台
- ✅ **在真实的 macOS 环境中打包**（这是关键！）

---

## 🎯 **为什么使用 GitHub Actions 打包 Mac 版本？**

### **优势**

| 优势 | 说明 |
|------|------|
| ✅ **真实 Mac 环境** | 使用 GitHub 的 macOS 服务器打包 |
| ✅ **免费额度** | 每月 2000 分钟免费构建时间 |
| ✅ **自动签名** | 可配置 Apple 证书自动签名 |
| ✅ **多平台同时打包** | Windows、Mac、Linux 一次完成 |
| ✅ **自动发布** | 打包完成后自动上传到 Release |

### **对比其他方案**

| 方案 | 成本 | 难度 | 可靠性 |
|------|------|------|--------|
| **GitHub Actions** | 免费 | ⭐⭐简单 | ✅ 100% |
| 买 Mac 电脑 | $500+ | ⭐简单 | ✅ 100% |
| 租云 Mac | $20/月 | ⭐⭐中等 | ✅ 100% |
| Windows 交叉编译 | 免费 | ⭐⭐⭐困难 | ❌ 不可用 |

---

## 📦 **已为你创建的文件**

### **1. `.github/workflows/build.yml`**
- 基础构建配置
- 支持 Windows、macOS、Linux
- 每次 push 自动触发

### **2. `.github/workflows/release.yml`**
- 发布版本构建
- 推送标签时触发（如 v1.0.0）
- 自动上传到 GitHub Release

---

## 🚀 **快速开始（3 步搞定）**

### **第 1 步：推送到 GitHub**

```bash
# 1. 初始化 Git（如果还没有）
git init

# 2. 添加所有文件
git add .

# 3. 提交
git commit -m "Initial commit"

# 4. 创建 GitHub 仓库并推送
git remote add origin https://github.com/你的用户名/你的仓库名.git
git branch -M main
git push -u origin main
```

---

### **第 2 步：触发自动打包**

#### **方式 A：普通打包（不推荐，仅测试）**

```bash
# 推送到 main 分支会自动触发构建
git push
```

#### **方式 B：正式发布打包（推荐 ⭐）**

```bash
# 1. 打版本号标签
git tag v1.0.0

# 2. 推送标签（会触发 release.yml）
git push origin v1.0.0
```

---

### **第 3 步：查看构建进度**

1. 打开你的 GitHub 仓库
2. 点击 **"Actions"** 标签
3. 选择对应的 workflow
4. 查看实时日志

![GitHub Actions 界面](https://docs.github.com/assets/cb-70740/mw-1440/images/help/repository/actions-tab.png)

---

## 📊 **打包结果**

### **构建成功后会生成：**

#### **macOS**
```
📦 图拉斯 -1.0.0-x64.dmg      (Intel Mac, ~400MB)
📦 图拉斯 -1.0.0-arm64.dmg   (M1/M2/M3 Mac, ~380MB)
```

#### **Windows**
```
📦 图拉斯 Setup 1.0.0.exe    (Windows, ~420MB)
```

#### **Linux**
```
📦 图拉斯-1.0.0.AppImage     (Linux, ~400MB)
```

---

## 🎯 **下载打包文件**

### **方式 1：从 Actions 下载（测试用）**

1. 打开 GitHub 仓库 → Actions
2. 点击成功的构建记录
3. 滚动到底部 "Artifacts"
4. 点击下载对应平台的压缩包

⚠️ **注意**: Artifacts 保存 90 天后自动删除

### **方式 2：从 Releases 下载（正式发布）**

1. 打开 GitHub 仓库 → Releases
2. 找到对应版本（如 v1.0.0）
3. 在 Assets 中下载安装包

✅ **Releases 永久保存**

---

## 🔐 **高级功能：代码签名和公证**

如果要让 Mac 应用无警告安装，需要进行签名和公证。

### **准备工作**

#### **1. 加入 Apple Developer Program**
- 费用：$99/年
- 网址：https://developer.apple.com/programs/

#### **2. 获取证书**

```bash
# 在 Mac 上执行
# 1. 打开 Keychain Access
# 2. Certificate Assistant -> Request a Certificate From a Certificate Authority
# 3. 保存到磁盘
```

#### **3. 导出证书**

```bash
# 导出为 .p12 文件
# 设置密码（记住这个密码）
```

---

### **配置 GitHub Secrets**

#### **步骤 1：加密证书**

```bash
# 在本地 Mac 上
base64 -i YourCertificate.p12 -o cert.txt
```

复制 `cert.txt` 的内容。

#### **步骤 2：添加到 GitHub**

1. 打开仓库 → Settings → Secrets and variables → Actions
2. 点击 "New repository secret"
3. 添加以下 secrets：

| Name | Value |
|------|-------|
| `CSC_LINK` | 刚才复制的 base64 内容 |
| `CSC_KEY_PASSWORD` | 导出证书时的密码 |
| `APPLE_ID` | 你的 Apple ID 邮箱 |
| `APPLE_APP_SPECIFIC_PASSWORD` | Apple 专用密码（不是登录密码） |
| `APPLE_TEAM_ID` | Apple Team ID |

---

### **启用签名配置**

修改 `.github/workflows/release.yml`：

```yaml
- name: Build for macOS (Universal)
  run: npm run electron:build:mac
  env:
    NODE_ENV: production
    # 取消以下注释
    APPLE_ID: ${{ secrets.APPLE_ID }}
    APPLE_APP_SPECIFIC_PASSWORD: ${{ secrets.APPLE_APP_SPECIFIC_PASSWORD }}
    APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
    CSC_LINK: ${{ secrets.CSC_LINK }}
    CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}
```

---

## 📝 **详细使用说明**

### **场景 1：日常开发测试**

```bash
# 推送到分支，触发 build.yml
git push
```

**结果**: 
- 自动打包三个平台
- 上传到 Actions Artifacts
- 90 天后自动删除

---

### **场景 2：发布新版本**

```bash
# 1. 更新版本号（package.json）
{
  "version": "1.0.1"
}

# 2. 打标签
git tag v1.0.1

# 3. 推送标签
git push origin v1.0.1
```

**结果**:
- 触发 release.yml
- 自动打包并签名（如果配置了证书）
- 上传到 GitHub Release
- 永久保存

---

### **场景 3：只打包 Mac 版本**

修改 `.github/workflows/release.yml`，注释掉其他平台：

```yaml
jobs:
  # build-windows:  # 注释掉
  #   ...
  
  build-macos:  # 只保留这个
    ...
  
  # build-linux:  # 注释掉
  #   ...
```

---

## ⚙️ **自定义配置**

### **修改构建频率**

编辑 `.github/workflows/release.yml`：

```yaml
on:
  push:
    tags:
      - 'v*'  # 只响应 v 开头的标签
  workflow_dispatch:  # 允许手动触发
```

### **修改 Node 版本**

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18'  # 改成你需要的版本
```

### **添加构建前测试**

```yaml
- name: Run tests
  run: npm test
```

---

## 🚨 **常见问题**

### ❌ 问题 1: 构建失败 "Cannot find module"

**解决方案**:
```yaml
# 确保使用 npm ci 而不是 npm install
- name: Install dependencies
  run: npm ci  # 更可靠
```

### ❌ 问题 2: 构建超时

**原因**: 网络问题或依赖太多

**解决方案**:
```yaml
# 使用缓存加速
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

### ❌ 问题 3: Mac 签名失败

**检查清单**:
- [ ] CSC_LINK 是否正确（base64 编码）
- [ ] CSC_KEY_PASSWORD 是否正确
- [ ] 证书是否过期
- [ ] entitlements.mac.plist 是否正确配置

### ❌ 问题 4: 免费额度不够用

**解决方案**:
- 减少构建频率
- 只打包必要的平台
- 购买额外额度（$0.08/分钟）

---

## 📊 **构建时间预估**

| 平台 | 预计时间 | 免费额度消耗 |
|------|---------|-------------|
| Windows | ~8 分钟 | 8 分钟 |
| macOS | ~10 分钟 | 10 分钟 |
| Linux | ~6 分钟 | 6 分钟 |
| **总计** | **~24 分钟** | **24 分钟** |

**每月 2000 分钟免费额度** = 可以打包 **83 次**

---

## 🎉 **完整操作流程示例**

### **发布 v1.0.0 版本**

```bash
# 1. 确认代码已提交
git status

# 2. 更新版本号
# 修改 package.json 中的 version 字段

# 3. 提交更改
git add package.json
git commit -m "Release v1.0.0"

# 4. 打标签
git tag v1.0.0

# 5. 推送
git push origin v1.0.0

# 6. 等待构建完成（约 10-15 分钟）
# 7. 去 Releases 下载安装包
```

---

## 📞 **技术支持**

- **GitHub Actions 文档**: https://docs.github.com/en/actions
- **electron-builder CI/CD**: https://www.electron.build/CI
- **Apple 公证指南**: https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution

---

## 🏆 **总结**

### ✅ **为什么选择 GitHub Actions？**

1. **真实 Mac 环境** - 在 GitHub 的 Mac 服务器上打包
2. **完全免费** - 每月 2000 分钟构建时间
3. **自动化** - 推送代码自动打包
4. **多平台** - 一次构建，三平台发布
5. **永久存储** - Releases 永久保存安装包

### 🎯 **适合谁用？**

- ✅ 没有 Mac 电脑的开发者
- ✅ 需要频繁发布更新的团队
- ✅ 想要自动化流程的个人开发者
- ✅ 预算有限的开源项目

### 📋 **下一步行动**

1. **推送到 GitHub**
2. **创建版本标签** `git tag v1.0.0`
3. **推送标签** `git push origin v1.0.0`
4. **等待构建完成**
5. **下载安装包**

---

**最后更新**: 2026-03-30  
**适用版本**: 所有 Electron 应用  
**当前状态**: 已配置完成，可直接使用 ✨
