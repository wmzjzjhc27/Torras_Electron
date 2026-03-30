/**
 * 国际化 Hook
 * 
 * 提供语言切换、翻译等功能的便捷访问
 */

import { useTranslation } from 'react-i18next';

export function useI18n() {
  const { t, i18n, ready } = useTranslation();

  /**
   * 切换语言
   */
  const changeLanguage = (lng: 'zh-CN' | 'en-US') => {
    return i18n.changeLanguage(lng);
  };

  /**
   * 当前语言
   */
  const currentLanguage: 'zh-CN' | 'en-US' = (i18n.language as 'zh-CN' | 'en-US') || 'zh-CN';

  /**
   * 是否已准备好（翻译文件已加载）
   */
  const isReady = ready;

  return {
    t,              // 翻译函数
    i18n,           // i18n 实例
    changeLanguage, // 切换语言
    currentLanguage,// 当前语言
    isReady,        // 是否准备好
  };
}
