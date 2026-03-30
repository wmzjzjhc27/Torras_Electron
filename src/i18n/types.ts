/**
 * i18next 国际化类型定义
 */

import zhCN from './locales/zh-CN.json';

// 从中文翻译文件推断类型
type TranslationKeys = typeof zhCN;

// 递归获取所有嵌套的 key
type Flatten<T extends object, Prefix extends string = ''> = {
  [K in keyof T]: T[K] extends object
    ? Flatten<T[K], `${Prefix}${K & string}.`>
    : `${Prefix}${K & string}`;
}[keyof T];

// 导出翻译键类型
export type TranslationKey = Flatten<TranslationKeys>;

// 支持的语言
export type Language = 'zh-CN' | 'en-US';
