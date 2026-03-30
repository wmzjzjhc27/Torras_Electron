# Ant Design 集成指南

## ✅ 已完成配置

### 📦 安装的依赖

```bash
npm install antd
```

**版本**: antd 5.x (最新)

---

## 🎨 主题定制

### 全局主题配置 (`src/main.tsx`)

```typescript
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

<ConfigProvider
  locale={zhCN}
  theme={{
    token: {
      colorPrimary: '#667eea',      // 主色调
      borderRadius: 6,               // 基础圆角
      fontFamily: '系统字体',        // 全局字体
    },
    components: {
      Card: {
        borderRadiusLG: 12,          // 大卡片圆角
      },
      Button: {
        borderRadius: 6,             // 按钮圆角
      },
      Input: {
        borderRadius: 6,             // 输入框圆角
      },
    },
  }}
>
  <RouterProvider router={router} />
</ConfigProvider>
```

---

## 🔐 登录页面改造

### 使用的组件

- ✅ **Card** - 卡片容器
- ✅ **Typography** - 排版组件（Title, Text）
- ✅ **Form** - 表单组件
- ✅ **Input** - 输入框（带密码模式）
- ✅ **Button** - 按钮（主要按钮、图标按钮）
- ✅ **Checkbox** - 复选框
- ✅ **Alert** - 警告提示
- ✅ **Divider** - 分割线
- ✅ **Space** - 间距布局

### 图标库

```typescript
import { 
  UserOutlined,      // 用户图标
  LockOutlined,      // 锁图标
  LoginOutlined,     // 登录图标
  GithubOutlined,    // GitHub 图标
  GoogleOutlined,    // Google 图标
} from '@ant-design/icons';
```

---

## 📝 核心代码示例

### 1. Form 表单

```typescript
import { Form, Input, Button, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

type FieldType = {
  username?: string;
  password?: string;
  remember?: boolean;
};

<Form
  name="login"
  initialValues={{ remember: true }}
  onFinish={onFinish}
  size="large"
>
  <Form.Item
    name="username"
    rules={[
      { required: true, message: '请输入用户名' },
      { min: 3, message: '用户名至少 3 个字符' },
    ]}
  >
    <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
  </Form.Item>

  <Form.Item
    name="password"
    rules={[
      { required: true, message: '请输入密码' },
      { min: 6, message: '密码至少 6 个字符' },
    ]}
  >
    <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
  </Form.Item>

  <Form.Item name="remember" valuePropName="checked">
    <Checkbox>记住我</Checkbox>
  </Form.Item>

  <Form.Item>
    <Button type="primary" htmlType="submit" block>
      登录
    </Button>
  </Form.Item>
</Form>
```

### 2. Alert 错误提示

```typescript
import { Alert } from 'antd';

{error && (
  <Alert
    message={error}
    type="error"
    showIcon
    closable
    style={{ marginBottom: '24px' }}
  />
)}
```

### 3. Card 卡片

```typescript
import { Card } from 'antd';

<Card
  style={{
    maxWidth: '420px',
    width: '100%',
    borderRadius: token.borderRadiusLG,
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
  }}
  bordered={false}
>
  {/* 内容 */}
</Card>
```

### 4. Typography 排版

```typescript
import { Typography } from 'antd';

const { Title, Text } = Typography;

<Title level={2}>用户登录</Title>
<Text type="secondary">欢迎回来</Text>
```

### 5. Space 间距布局

```typescript
import { Space, Button } from 'antd';

<Space direction="vertical" style={{ width: '100%' }}>
  <Text>快速登录</Text>
  <Space wrap>
    <Button icon={<GithubOutlined />}>Admin</Button>
    <Button icon={<GoogleOutlined />}>User</Button>
  </Space>
</Space>
```

---

## 🎯 常用组件速查

### Button 按钮

```typescript
<Button type="primary">主要按钮</Button>
<Button type="default">默认按钮</Button>
<Button type="dashed">虚线按钮</Button>
<Button type="link">链接按钮</Button>

<Button loading>加载中</Button>
<Button disabled>禁用</Button>
<Button icon={<SearchOutlined />}>图标按钮</Button>
<Button block>块级按钮</Button>
```

### Input 输入框

```typescript
<Input placeholder="请输入" />
<Input.Password placeholder="密码" />
<Input.Search placeholder="搜索" />
<Input.TextArea placeholder="多行文本" />
<Input prefix={<UserOutlined />} placeholder="带图标" />
```

### Form 表单验证规则

```typescript
rules={[
  { required: true, message: '必填项' },
  { type: 'email', message: '邮箱格式不正确' },
  { min: 6, message: '至少 6 个字符' },
  { max: 20, message: '最多 20 个字符' },
  { pattern: /^[0-9]+$/, message: '只能输入数字' },
]}
```

---

## 🎨 主题定制指南

### 使用 Design Token

```typescript
import { theme } from 'antd';

function MyComponent() {
  const { token } = theme.useToken();
  
  return (
    <div style={{ 
      color: token.colorPrimary,
      fontSize: token.fontSize,
      padding: token.padding,
    }}>
      内容
    </div>
  );
}
```

### 修改主题色

```typescript
<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#your-color',
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorError: '#ff4d4f',
      colorInfo: '#1890ff',
    },
  }}
/>
```

---

## 📦 按需加载（已自动配置）

Ant Design 5.x 默认支持 Tree Shaking，无需额外配置。

```typescript
// ✅ 推荐：单独导入
import { Button, Input } from 'antd';

// ❌ 不推荐：全量导入
// import * as Antd from 'antd';
```

---

## 🌐 国际化

```typescript
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import jaJP from 'antd/locale/ja_JP';
import koKR from 'antd/locale/ko_KR';

<ConfigProvider locale={zhCN}>
  <App />
</ConfigProvider>
```

---

## 🎯 最佳实践

### ✅ 推荐做法

1. **使用 Form 组件**
   - 自动处理表单状态
   - 内置验证规则
   - 优雅的错误提示

2. **使用 Design Token**
   - 保持设计一致性
   - 便于主题切换
   - 响应式适配

3. **合理使用 Space**
   - 自动处理间距
   - 响应式布局
   - 代码简洁

4. **统一错误处理**
   - 使用 Alert 组件
   - 可关闭的提示
   - 友好的文案

### ❌ 避免做法

1. **不要混用样式方案**
   - 优先使用 Ant Design 组件
   - 减少自定义 CSS
   - 使用 theme token 而非硬编码颜色

2. **不要忽略无障碍性**
   - 使用语义化标签
   - 添加 aria 标签
   - 键盘导航支持

---

## 🔧 常见问题

### Q: 如何修改组件样式？

A: 使用 `style` 属性或 `className`：

```typescript
<Button 
  type="primary"
  style={{ width: '100%', marginTop: '10px' }}
  className="custom-button"
>
  按钮
</Button>
```

### Q: 如何使用暗黑模式？

A: 配置 `theme.algorithm`：

```typescript
import { theme } from 'antd';

<ConfigProvider
  theme={{
    algorithm: theme.darkAlgorithm,
  }}
/>
```

### Q: 如何自定义组件主题？

A: 使用 `components` 配置：

```typescript
<ConfigProvider
  theme={{
    components: {
      Button: {
        colorPrimary: '#ff0000',
        algorithm: true,
      },
      Input: {
        colorBorder: '#999',
      },
    },
  }}
/>
```

---

## 📚 学习资源

- [Ant Design 官方文档](https://ant.design/)
- [Ant Design 组件总览](https://ant.design/components/overview)
- [Ant Design 主题定制](https://ant.design/docs/react/customize-theme-cn)
- [Ant Design Icons](https://ant.design/components/icon)

---

## 🎉 下一步

现在您可以在其他页面中使用 Ant Design 组件了！

### 示例：改造 About 页面

```typescript
import { Card, Typography, Space, Tag } from 'antd';

function About() {
  return (
    <Card title="关于我们">
      <Typography.Paragraph>
        我们是一家专注于创新技术的公司
      </Typography.Paragraph>
      
      <Space wrap>
        <Tag color="blue">React</Tag>
        <Tag color="green">TypeScript</Tag>
        <Tag color="orange">Vite</Tag>
      </Space>
    </Card>
  );
}
```

祝您使用愉快！🚀
