export default function About() {
  return (
    <div className="container p-4">
      <div className="p-5" style={{ 
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        borderRadius: 'var(--border-radius-lg)',
        color: '#fff',
        marginBottom: 'var(--spacing-lg)'
      }}>
        <h1 className="text-3xl mb-3">ℹ️ 关于我们</h1>
        <p className="text-lg">
          专注于创新技术，提供优质的产品和服务
        </p>
      </div>
      
      <div className="row">
        <div className="col col-12 col-md-6 mb-4">
          <div className="p-4" style={{ 
            border: '1px solid #e0e0e0', 
            borderRadius: 'var(--border-radius-md)',
            background: '#fff'
          }}>
            <h2 className="text-2xl mb-3" style={{ color: 'var(--primary-color)' }}>🛠️ 技术栈</h2>
            <ul style={{ paddingLeft: '20px', lineHeight: '2' }}>
              <li><strong>React 19</strong> - 最新的 UI 框架</li>
              <li><strong>TypeScript 5.9</strong> - 类型安全的 JavaScript</li>
              <li><strong>Vite 8</strong> - 极速构建工具</li>
              <li><strong>React Router v7</strong> - 路由管理</li>
            </ul>
          </div>
        </div>
        
        <div className="col col-12 col-md-6 mb-4">
          <div className="p-4" style={{ 
            border: '1px solid #e0e0e0', 
            borderRadius: 'var(--border-radius-md)',
            background: '#fff'
          }}>
            <h2 className="text-2xl mb-3" style={{ color: 'var(--primary-color)' }}>📋 项目特色</h2>
            <ul style={{ paddingLeft: '20px', lineHeight: '2' }}>
              <li>✅ 完整的响应式布局</li>
              <li>✅ 支持移动端导航</li>
              <li>✅ CSS 变量系统</li>
              <li>✅ 组件化架构</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="p-4 mt-4" style={{ 
        background: '#f8f9fa',
        borderRadius: 'var(--border-radius-md)',
        border: '1px solid #e9ecef'
      }}>
        <h3 className="text-xl mb-2">📬 联系方式</h3>
        <p style={{ lineHeight: '1.8' }}>
          📧 Email: contact@example.com<br />
          📱 电话：+86 123 4567 8900<br />
          📍 地址：北京市朝阳区某某街道
        </p>
      </div>
    </div>
  )
}
