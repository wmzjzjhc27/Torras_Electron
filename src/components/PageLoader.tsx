/**
 * 页面加载动画组件
 * 
 * 在页面刷新或初始加载时显示全屏加载动画
 * 隐藏所有内容，直到加载完成
 */

import React, { useEffect, useState } from 'react';

interface PageLoaderProps {
  onLoadComplete?: () => void;
}

export const PageLoader: React.FC<PageLoaderProps> = ({ onLoadComplete }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查页面是否已经加载完成
    if (document.readyState === 'complete') {
      setLoading(false);
      onLoadComplete?.();
      return;
    }

    // 监听页面加载完成事件
    const handleLoadComplete = () => {
      // 给一个短暂的延迟（100ms），确保所有资源（图片、字体等）都已完全渲染
      setTimeout(() => {
        setLoading(false);
        onLoadComplete?.();
      }, 100);
    };

    window.addEventListener('load', handleLoadComplete);

    // 同时监听 DOMContentLoaded 作为备选
    document.addEventListener('DOMContentLoaded', handleLoadComplete);

    // 清理函数
    return () => {
      window.removeEventListener('load', handleLoadComplete);
      document.removeEventListener('DOMContentLoaded', handleLoadComplete);
    };
  }, [onLoadComplete]);

  if (!loading) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #0a0e21 0%, #1a1f3a 50%, #0f1428 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      {/* 背景装饰 - 流动光效 */}
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: `radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)`,
          animation: 'rotate 20s linear infinite',
          pointerEvents: 'none',
        }}
      />

      {/* 加载动画主体 */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
        }}
      >
        {/* 多层旋转圆环 */}
        <div
          style={{
            position: 'relative',
            width: '120px',
            height: '120px',
            margin: '0 auto 32px',
          }}
        >
          {/* 外环 - 蓝色渐变 */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '50%',
              border: '4px solid rgba(102, 126, 234, 0.2)',
              borderTopColor: '#667eea',
              borderBottomColor: '#667eea',
              animation: 'spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite',
            }}
          />

          {/* 中环 - 青色渐变 */}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              right: '10px',
              bottom: '10px',
              borderRadius: '50%',
              border: '3px solid rgba(78, 205, 196, 0.2)',
              borderLeftColor: '#4ecdc4',
              borderRightColor: '#4ecdc4',
              animation: 'spin-reverse 1s cubic-bezier(0.5, 0, 0.5, 1) infinite',
            }}
          />

          {/* 内环 - 紫色渐变 */}
          <div
            style={{
              position: 'absolute',
              top: '25px',
              left: '25px',
              right: '25px',
              bottom: '25px',
              borderRadius: '50%',
              border: '2px solid rgba(118, 75, 162, 0.2)',
              borderTopColor: '#764ba2',
              animation: 'spin 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite',
            }}
          />

          {/* 中心亮点 */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #4ecdc4 100%)',
              boxShadow: '0 0 30px rgba(102, 126, 234, 0.8), 0 0 60px rgba(78, 205, 196, 0.6)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        </div>

        {/* 加载文字 */}
        <div
          style={{
            color: '#ffffff',
            fontSize: '18px',
            fontWeight: 600,
            letterSpacing: '2px',
            textShadow: '0 0 20px rgba(102, 126, 234, 0.8)',
            opacity: 0.9,
          }}
        >
          LOADING...
        </div>

        {/* 进度条 */}
        <div
          style={{
            width: '200px',
            height: '3px',
            background: 'rgba(102, 126, 234, 0.2)',
            borderRadius: '3px',
            marginTop: '24px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '60%',
              background: 'linear-gradient(90deg, #667eea 0%, #4ecdc4 50%, #667eea 100%)',
              animation: 'progress 2s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      {/* CSS 动画定义 */}
      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spin-reverse {
          to {
            transform: rotate(-360deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.8;
          }
        }

        @keyframes progress {
          0% {
            left: -60%;
          }
          100% {
            left: 100%;
          }
        }

        @keyframes rotate {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};
