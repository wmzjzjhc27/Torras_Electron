import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function NotFound() {
  const { t } = useTranslation();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5,
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1428 100%)',
        overflow: 'hidden',
        color: '#ffffff',
      }}
    >
      {/* 动态背景网格 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(102, 126, 234, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(102, 126, 234, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: `perspective(1000px) rotateX(60deg) translateY(${mousePosition.y * 20}px) translateX(${mousePosition.x * 20}px)`,
          transition: 'transform 0.1s ease-out',
          opacity: 0.4,
        }}
      />

      {/* 浮动光点 */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            background: `rgba(102, 126, 234, ${Math.random() * 0.5 + 0.3})`,
            borderRadius: '50%',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `float ${Math.random() * 3 + 2}s ease-in-out infinite`,
            boxShadow: `0 0 ${Math.random() * 10 + 5}px rgba(102, 126, 234, 0.6)`,
          }}
        />
      ))}

      {/* 主内容区域 */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          padding: '40px',
        }}
      >
        {/* 404 数字 */}
        <div
          style={{
            fontSize: '180px',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #667eea 0%, #4ecdc4 50%, #667eea 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-10px',
            lineHeight: 1,
            marginBottom: '20px',
            textShadow: '0 0 60px rgba(102, 126, 234, 0.5)',
            animation: 'pulse 3s ease-in-out infinite',
            position: 'relative',
          }}
        >
          404
          {/* 发光效果 */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%)',
              filter: 'blur(40px)',
              zIndex: -1,
            }}
          />
        </div>

        {/* 标题 */}
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 700,
            margin: '0 0 16px 0',
            color: '#ffffff',
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}
        >
          {t('notFound.title')}
        </h1>

        {/* 描述文字 */}
        <p
          style={{
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.6)',
            margin: '0 0 40px 0',
            lineHeight: 1.6,
          }}
        >
          {t('notFound.description')}
        </p>

        {/* 返回首页按钮 */}
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '16px 32px',
            background: 'linear-gradient(135deg, #667eea 0%, #4ecdc4 100%)',
            color: '#ffffff',
            textDecoration: 'none',
            borderRadius: '12px',
            fontWeight: 600,
            fontSize: '15px',
            letterSpacing: '0.5px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4), 0 0 40px rgba(102, 126, 234, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.6), 0 0 60px rgba(102, 126, 234, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)'
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4), 0 0 40px rgba(102, 126, 234, 0.2)'
          }}
        >
          {/* 按钮扫光效果 */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              transition: 'left 0.6s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.left = '100%'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.left = '-100%'
            }}
          />
          <span style={{ position: 'relative', zIndex: 1 }}>{t('notFound.backHome')}</span>
        </Link>

        {/* 装饰性元素 */}
        <div
          style={{
            marginTop: '60px',
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              background: '#667eea',
              borderRadius: '50%',
              boxShadow: '0 0 20px rgba(102, 126, 234, 0.8)',
              animation: 'pulse 2s ease-in-out infinite 0.5s',
            }}
          />
          <div
            style={{
              width: '8px',
              height: '8px',
              background: '#4ecdc4',
              borderRadius: '50%',
              boxShadow: '0 0 20px rgba(78, 205, 196, 0.8)',
              animation: 'pulse 2s ease-in-out infinite 1s',
            }}
          />
          <div
            style={{
              width: '8px',
              height: '8px',
              background: '#f093fb',
              borderRadius: '50%',
              boxShadow: '0 0 20px rgba(240, 147, 251, 0.8)',
              animation: 'pulse 2s ease-in-out infinite 1.5s',
            }}
          />
        </div>
      </div>

      {/* CSS 动画定义 */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-30px) translateX(10px);
            opacity: 0.8;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  )
}
