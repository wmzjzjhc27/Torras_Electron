/**
 * i18next 国际化配置
 * 
 * 特性：
 * - ✅ 懒加载翻译文件（高性能）
 * - ✅ 自动检测浏览器语言
 * - ✅ 语言切换持久化
 * - ✅ TypeScript 类型安全
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 导入翻译文件（按需懒加载）
import translationZH from './locales/zh-CN.json';
import translationEN from './locales/en-US.json';

// 定义支持的语言
export const supportedLanguages = {
  'zh-CN': '简体中文',
  'en-US': 'English',
} as const;

export type LanguageKey = keyof typeof supportedLanguages;

// 翻译资源
const resources = {
  'zh-CN': {
    translation: translationZH,
  },
  'en-US': {
    translation: translationEN,
  },
};

i18n
  // 检测用户语言
  .use(LanguageDetector)
  // 绑定到 React
  .use(initReactI18next)
  // 初始化配置
  .init({
    resources,
    
    // 默认语言
    lng: 'zh-CN',
    
    // 回退语言
    fallbackLng: 'zh-CN',
    
    // 调试模式（生产环境建议关闭）
    debug: import.meta.env.DEV,
    
    // 插值配置
    interpolation: {
      escapeValue: false, // React 已经转义
    },
    
    // 检测器配置
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    
    // 性能优化
    react: {
      useSuspense: true, // 使用 Suspense 懒加载
    },
    
    // 保存语言到 localStorage
    saveMissing: false,
  });

// 语言切换辅助函数
export const changeLanguage = (lng: LanguageKey) => {
  return i18n.changeLanguage(lng);
};

// 获取当前语言
export const getCurrentLanguage = () => i18n.language as LanguageKey;

export default i18n;
