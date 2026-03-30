# 项目部署与访问指南

本文档介绍如何在不同环境下部署和访问本项目。

## 📋 目录

- [本地开发环境](#本地开发环境)
- [局域网访问配置](#局域网访问配置)
- [生产环境部署](#生产环境部署)
- [常见问题排查](#常见问题排查)

---

## 🔧 本地开发环境

### 启动开发服务器

```bash
npm run dev
```

默认配置：
- **端口**: 3000
- **自动打开浏览器**: 是
- **热更新**: 已启用

### 访问地址

- **本地访问**: `http://localhost:3000`
- **本机 IP 访问**: `http://[你的本机IP]:3000`

---

## 🌐 局域网访问配置

### 1. 查看本机 IP 地址

#### Windows 系统
```powershell
ipconfig
```
找到 "IPv4 地址"，例如：`192.168.1.100`

#### macOS / Linux 系统
```bash
ifconfig
# 或
ip addr show
```
找到类似 `inet 192.168.1.100` 的地址

### 2. 配置 Vite 允许外部访问

**当前配置已启用外部访问**（见 `vite.config.ts`）：

```typescript
server: {
  port: 3000,
  open: true,
  host: true, // ✅ 允许外部访问
  strictPort: false,
}
```

### 3. 防火墙设置（Windows）

如果其他设备无法访问，需要配置防火墙：

#### 方法一：临时关闭防火墙（仅测试用）
```powershell
# 不推荐长期使用
NetFirewall set allprofiles state off
```

#### 方法二：添加防火墙规则（推荐）
```powershell
# 允许 Node.js 通过防火墙
netsh advfirewall firewall add rule name="Node.js Server" dir=in action=allow program="C:\Program Files\nodejs\node.exe" enable=yes
```

#### 方法三：允许特定端口
```powershell
# 允许 3000 端口
netsh advfirewall firewall add rule name="Vite Dev Server" dir=in action=allow protocol=TCP localport=3000
```

### 4. 局域网访问示例

假设你的本机 IP 是 `192.168.1.100`，同一局域网内的其他设备可以通过以下地址访问：

```
http://192.168.1.100:3000
```

### 5. 手机/平板测试

确保移动设备和电脑连接**同一个 WiFi**，然后在浏览器中访问：
```
http://[电脑IP]:3000
```

---

## 🚀 生产环境部署

### 1. 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

### 2. 预览生产构建

```bash
npm run preview
```

默认在 `http://localhost:4173` 预览。

### 3. 自定义预览服务器配置

如需让其他人访问生产版本，修改 `package.json`：

```json
{
  "scripts": {
    "preview": "vite preview --host --port 4173"
  }
}
```

### 4. 部署到服务器

#### 使用 Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### 使用 Docker

```dockerfile
FROM nginx:alpine
COPY dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## ⚙️ 环境变量配置

### 环境变量文件说明

项目包含以下环境变量配置文件：

- `.env` - 通用环境变量
- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置

### 配置示例

#### 开发环境 (`.env.development`)

```env
VITE_APP_TITLE=Embedded System App - Development
VITE_API_BASE_URL=http://localhost:3000/api
```

#### 生产环境 (`.env.production`)

```env
VITE_APP_TITLE=Embedded System App - Production
VITE_API_BASE_URL=https://api.yourdomain.com
```

### ⚠️ 重要提示

- 所有环境变量必须以 `VITE_` 前缀才能在客户端代码中访问
- 不要将包含敏感信息的 `.env` 文件提交到 Git

---

## ❓ 常见问题排查

### 问题 1：其他设备无法访问

**检查清单**：
- [ ] 确认设备在同一局域网
- [ ] 检查防火墙设置
- [ ] 确认 Vite 服务器正在运行
- [ ] 检查 `vite.config.ts` 中是否配置了 `host: true`

### 问题 2：端口被占用

如果 3000 端口被占用，Vite 会自动尝试下一个可用端口。你也可以手动指定：

```typescript
// vite.config.ts
server: {
  port: 3000,
  strictPort: true, // 端口被占用时报错而不是自动切换
}
```

### 问题 3：访问速度慢

- 检查网络延迟
- 考虑在生产环境使用 CDN
- 优化构建资源大小

### 问题 4：HTTPS 配置（本地开发）

如需本地 HTTPS：

```bash
# 安装 mkcert 工具
npm install -g mkcert
mkcert -install
mkcert localhost

# 修改 vite.config.ts
server: {
  https: {
    key: fs.readFileSync('localhost-key.pem'),
    cert: fs.readFileSync('localhost.pem')
  }
}
```

---

## 📞 技术支持

如有其他问题，请参考：
- [Vite 官方文档](https://vitejs.dev/)
- [React 官方文档](https://react.dev/)

---

**最后更新**: 2026-03-09
