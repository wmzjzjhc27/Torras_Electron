/**
 * 语言切换器组件
 * 
 * 提供一个下拉菜单或按钮组来切换语言
 */

import { useState, memo, useMemo } from 'react';
import { supportedLanguages, type LanguageKey } from '@/i18n/config';
import { useI18n } from '@/hooks/useI18n';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'button';
  size?: 'small' | 'medium' | 'large';
  theme?: 'light' | 'dark'; // 新增主题属性
}

export const LanguageSwitcher = memo(function LanguageSwitcher({ variant = 'dropdown', size = 'medium', theme = 'light' }: LanguageSwitcherProps) {
  const { changeLanguage, currentLanguage } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  // 使用 useMemo 缓存计算结果
  const handleLanguageChange = useMemo(() => (lng: LanguageKey) => {
    changeLanguage(lng);
    setIsOpen(false);
  }, [changeLanguage]);

  // 获取当前语言的显示文本
  const currentLangLabel = supportedLanguages[currentLanguage];

  // 根据尺寸设置样式（使用 useMemo 缓存）
  const sizeStyles = useMemo(() => ({
    small: { padding: '8px 20px', fontSize: '12px' },
    medium: { padding: '8px 12px', fontSize: '14px' },
    large: { padding: '10px 16px', fontSize: '16px' },
  }), []);

  // 下拉菜单样式
  if (variant === 'dropdown') {
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {/* 触发按钮 */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            ...sizeStyles[size],
            background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: theme === 'dark' 
              ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
              : '0 2px 8px rgba(0, 0, 0, 0.08)',
            color: theme === 'dark' ? '#ffffff' : '#333',
            fontWeight: 500,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = theme === 'dark' 
              ? 'rgba(255, 255, 255, 0.15)' 
              : 'rgba(255, 255, 255, 0.95)';
            e.currentTarget.style.boxShadow = theme === 'dark'
              ? '0 4px 16px rgba(0, 0, 0, 0.4)'
              : '0 4px 16px rgba(0, 0, 0, 0.12)';
            e.currentTarget.style.borderColor = theme === 'dark'
              ? 'rgba(255, 255, 255, 0.3)'
              : 'rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = theme === 'dark' 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(255, 255, 255, 0.9)';
            e.currentTarget.style.boxShadow = theme === 'dark'
              ? '0 2px 8px rgba(0, 0, 0, 0.3)'
              : '0 2px 8px rgba(0, 0, 0, 0.08)';
            e.currentTarget.style.borderColor = theme === 'dark'
              ? 'rgba(255, 255, 255, 0.2)'
              : 'rgba(0, 0, 0, 0.1)';
          }}
        >
          <span style={{ fontSize: size === 'small' ? '18px' : '16px' }}>🌐</span>
          <span>{currentLangLabel}</span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transition: 'transform 0.3s ease',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              opacity: 0.6,
            }}
          >
            <path d="M2.5 4.25L6 7.75L9.5 4.25" />
          </svg>
        </button>

        {/* 下拉菜单 */}
        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 2px)',
              right: 0,
              background: theme === 'dark' ? 'rgba(26, 27, 46, 0.98)' : 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
              borderRadius: '10px',
              boxShadow: theme === 'dark'
                ? '0 8px 32px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3)'
                : '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
              zIndex: 1000,
              minWidth: '140px',
              padding: '6px',
              animation: 'languageMenuSlideIn 0.2s ease-out',
            }}
          >
            {Object.entries(supportedLanguages).map(([code, label]) => (
              <button
                key={code}
                onClick={() => handleLanguageChange(code as LanguageKey)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: currentLanguage === code 
                    ? (theme === 'dark' ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.08)')
                    : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: currentLanguage === code 
                    ? (theme === 'dark' ? '#6ea6ff' : '#667eea')
                    : (theme === 'dark' ? '#ffffff' : '#333'),
                  fontWeight: currentLanguage === code ? 600 : 400,
                  transition: 'all 0.2s ease',
                  marginBottom: code !== 'en-US' ? '2px' : '0',
                }}
                onMouseEnter={(e) => {
                  if (currentLanguage !== code) {
                    e.currentTarget.style.background = theme === 'dark' 
                      ? 'rgba(255, 255, 255, 0.08)' 
                      : 'rgba(0, 0, 0, 0.04)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentLanguage !== code) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>
                    {code === 'zh-CN' ? '🇨🇳' : code === 'en-US' ? '🇺🇸' : '🌐'}
                  </span>
                  <span>{label}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 点击外部关闭菜单 */}
        {isOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    );
  }

  // 按钮组样式
  if (variant === 'button') {
    return (
      <div style={{ display: 'flex', gap: '6px',justifyContent:'space-evenly' }}>
        {Object.entries(supportedLanguages).map(([code, label]) => (
          <button
            key={code}
            onClick={() => handleLanguageChange(code as LanguageKey)}
            style={{
              ...sizeStyles[size],
              background: currentLanguage === code ? 'rgba(102, 126, 234, 0.08)' : 'rgba(255, 255, 255, 0.9)',
              color: currentLanguage === code ? '#00d6b9' : '#333',
              border: `1px solid ${currentLanguage === code ? 'var(--primary-color)' : 'rgba(0, 0, 0, 0.1)'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: currentLanguage === code ? 600 : 500,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: currentLanguage === code 
                ? '0 2px 8px rgba(102, 126, 234, 0.3)' 
                : '0 1px 4px rgba(0, 0, 0, 0.08)',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => {
              if (currentLanguage !== code) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.12)';
              } else {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentLanguage !== code) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                e.currentTarget.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.08)';
              } else {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '14px' }}>
                {code === 'zh-CN' ? '🇨🇳' : code === 'en-US' ? '🇺🇸' : '🌐'}
              </span>
              <span>{label.split(' ')[0]}</span>
            </div>
          </button>
        ))}
      </div>
    );
  }

  return null;
});
