# 🚀 Gitee + GitHub 双平台打包方案

## 🎯 **为什么使用双平台？**

| 平台 | 优势 | 用途 |
|------|------|------|
| **Gitee（码云）** | ✅ 国内访问速度快<br>✅ 中文界面友好 | 代码备份、国内用户下载 |
| **GitHub** | ✅ Actions 免费强大<br>✅ 自动打包成熟 | **自动打包 Mac 版本** ⭐ |

---

## 📋 **完整操作步骤**

### **第 1 步：在 GitHub 创建仓库**

1. 打开 https://github.com/new
2. Repository name: `embedded-usb-app`
3. 点击 "Create repository"

---

### **第 2 步：配置双远程仓库**

```bash
# 查看当前远程仓库
git remote -v

# 添加 GitHub 远程仓库
git remote add github https://github.com/你的用户名/embedded-usb-app.git

# 再次查看（应该有两个 origin）
git remote -v
```

**输出示例：**
```
origin    https://gitee.com/jianghongcen/torras_-electron.git (fetch)
origin    https://gitee.com/jianghongcen/torras_-electron.git (push)
github    https://github.com/你的用户名/embedded-usb-app.git (fetch)
github    https://github.com/你的用户名/embedded-usb-app.git (push)
```

---

### **第 3 步：推送到两个平台**

#### **首次推送：**

```bash
# 推送到 Gitee
git push -u origin main

# 推送到 GitHub
git push -u github main
```

#### **后续推送：**

```bash
# 一次性推送到两个平台
git push --all
```

---

### **第 4 步：触发 GitHub Actions 自动打包**

```bash
# 打版本号标签
git tag v1.0.0

# 推送到 GitHub（触发自动打包！）
git push github v1.0.0

# 也推送到 Gitee（可选，做备份）
git push origin v1.0.0
```

---

### **第 5 步：等待构建完成**

#### **查看进度：**
1. 打开 https://github.com/你的用户名/embedded-usb-app
2. 点击 **"Actions"** 标签
3. 看到正在运行的 workflow

#### **预计时间：**
- Windows 构建：~8 分钟
- **Mac 构建：~10 分钟** ⭐
- Linux 构建：~6 分钟

---

### **第 6 步：下载安装包**

#### **从 GitHub Releases 下载：**
1. 打开仓库 → **Releases**
2. 找到 **v1.0.0** 版本
3. 下载 Assets 中的文件：
   - `图拉斯 -1.0.0-x64.dmg` → Intel Mac
   - `图拉斯 -1.0.0-arm64.dmg` → M1/M2/M3 Mac
   - `图拉斯 Setup 1.0.0.exe` → Windows

#### **从 Gitee 下载（可选）：**
1. 打开 Gitee 仓库
2. 点击 **"发布"**
3. 创建新版本（手动上传从 GitHub 下载的文件）

---

## 🔄 **日常开发流程**

### **提交代码并同步到两个平台**

```bash
# 1. 提交更改
git add .
git commit -m "修复某个 bug"

# 2. 推送到两个平台
git push --all

# 或者分别推送
git push origin main
git push github main
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

# 3. 打标签
git tag v1.0.1

# 4. 推送到 GitHub（自动打包）
git push github v1.0.1

# 5. 推送到 Gitee（备份）
git push origin v1.0.1
```

---

## ⚙️ **优化：一键推送脚本**

创建 `scripts/push-all.sh`：

```bash
#!/bin/bash

echo "🚀 推送到所有远程仓库..."

# 推送分支
echo "📦 推送分支到 Gitee..."
git push origin main

echo "📦 推送分支到 GitHub..."
git push github main

# 如果有标签，也推送
if [ $# -gt 0 ]; then
  echo "🏷️  推送标签 $1..."
  git push origin $1
  git push github $1
fi

echo "✅ 推送完成！"
```

使用方法：
```bash
# 仅推送分支
./scripts/push-all.sh

# 推送分支和标签
./scripts/push-all.sh v1.0.0
```

---

## 💡 **常见问题**

### **Q: 可以只用 Gitee 吗？**

A: ❌ **不推荐**。Gitee 的 CI/CD 服务：
- 需要付费购买额度
- macOS 构建资源有限
- 文档和社区不如 GitHub 完善

### **Q: 可以只用 GitHub 吗？**

A: ✅ **可以**！但建议保留 Gitee：
- 作为代码备份
- 方便国内用户访问
- 符合某些项目要求（如学校作业）

### **Q: 两个平台都要维护吗？**

A: 
- **主要开发**: GitHub（用 Actions 自动打包）
- **镜像备份**: Gitee（自动同步或手动推送）

---

## 📊 **推荐工作流**

```
本地开发
    ↓
提交到 Git
    ↓
推送到 GitHub ──→ GitHub Actions ──→ 自动打包 Mac/Windows/Linux
    ↓
推送到 Gitee ──→ 代码备份（国内访问快）
```

---

## 🎉 **总结**

### **最佳实践**

1. ✅ **代码托管**: Gitee + GitHub 双备份
2. ✅ **自动打包**: 使用 GitHub Actions（免费、强大）
3. ✅ **分发下载**: 
   - 国内用户 → Gitee Releases
   - 国际用户 → GitHub Releases

### **核心命令速查**

```bash
# 初始化双远程
git remote add github https://github.com/用户名/仓库名.git

# 日常推送
git push --all

# 发布新版本
git tag v1.0.0
git push github v1.0.0  # 触发自动打包
git push origin v1.0.0  # 备份到 Gitee
```

---

**最后更新**: 2026-03-30  
**适用场景**: Gitee + GitHub 双平台协作  
**推荐指数**: ⭐⭐⭐⭐⭐
