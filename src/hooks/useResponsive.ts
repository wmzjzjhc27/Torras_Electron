/**
 * 响应式工具函数和 Hooks
 * 
 * 提供 JavaScript 方式的响应式检测和适配能力
 */

import { useState, useEffect } from 'react';

/**
 * 断点定义（与 responsive.css 保持一致）
 */
export const BREAKPOINTS = {
  xs: 480,    // 小手机
  sm: 768,    // 大手机/小平板
  md: 1024,   // 平板
  lg: 1280,   // 小桌面
  xl: 1536,   // 大桌面
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

/**
 * 获取当前窗口宽度对应的断点
 */
export function getBreakpoint(width: number): BreakpointKey {
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
}

/**
 * 检查是否在特定断点以上
 */
export function isMinWidth(width: number, breakpoint: BreakpointKey): boolean {
  return width >= BREAKPOINTS[breakpoint];
}

/**
 * 检查是否在特定断点以下
 */
export function isMaxWidth(width: number, breakpoint: BreakpointKey): boolean {
  return width < BREAKPOINTS[breakpoint];
}

/**
 * 自定义 Hook: 监听窗口大小变化
 * 
 * @returns 当前窗口宽度和断点信息
 * 
 * 使用示例:
 * ```tsx
 * function MyComponent() {
 *   const { width, height, breakpoint, isMobile, isTablet, isDesktop } = useWindowSize();
 *   
 *   return (
 *     <div>
 *       <p>当前宽度：{width}px</p>
 *       <p>当前断点：{breakpoint}</p>
 *       {isMobile && <p>移动端视图</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useWindowSize() {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    function handleResize() {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    handleResize(); // 初始化
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const breakpoint = getBreakpoint(size.width);

  return {
    width: size.width,
    height: size.height,
    breakpoint,
    isMobile: breakpoint === 'xs' || breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: breakpoint === 'lg' || breakpoint === 'xl',
    isMinWidth: (bp: BreakpointKey) => isMinWidth(size.width, bp),
    isMaxWidth: (bp: BreakpointKey) => isMaxWidth(size.width, bp),
  };
}

/**
 * 自定义 Hook: 检测是否匹配特定媒体查询
 * 
 * @param query 媒体查询字符串
 * @returns 是否匹配
 * 
 * 使用示例:
 * ```tsx
 * function MyComponent() {
 *   const isMobile = useMediaQuery('(max-width: 767px)');
 *   const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
 *   
 *   return (
 *     <div>
 *       {isMobile ? <MobileLayout /> : <DesktopLayout />}
 *       {isDarkMode && <DarkModeToggle />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // 初始检查
    setMatches(media.matches);

    // 监听变化
    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

/**
 * 自定义 Hook: 防抖处理窗口大小变化
 * 
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的窗口尺寸
 * 
 * 使用示例:
 * ```tsx
 * function MyComponent() {
 *   const { width, height } = useWindowSizeDebounced(300);
 *   
 *   return <div>窗口大小：{width} x {height}</div>;
 * }
 * ```
 */
export function useWindowSizeDebounced(delay: number = 300) {
  const [debouncedSize, setDebouncedSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let currentWidth = window.innerWidth;
    let currentHeight = window.innerHeight;

    function handleResize() {
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        currentWidth = window.innerWidth;
        currentHeight = window.innerHeight;
        
        setDebouncedSize({
          width: currentWidth,
          height: currentHeight,
        });
      }, delay);
    }

    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [delay]);

  return debouncedSize;
}

/**
 * 工具函数：生成响应式类名
 * 
 * @param baseClass 基础类名
 * @param modifiers 修饰符对象
 * @returns 生成的类名字符串
 * 
 * 使用示例:
 * ```tsx
 * const className = createResponsiveClass('btn', {
 *   primary: true,
 *   large: breakpoint === 'lg',
 *   mobile: isMobile,
 * });
 * // 输出："btn btn-primary btn-large btn-mobile"
 * ```
 */
export function createResponsiveClass(
  baseClass: string,
  modifiers: Record<string, boolean>
): string {
  const classes = [baseClass];
  
  Object.entries(modifiers).forEach(([key, value]) => {
    if (value) {
      classes.push(`${baseClass}-${key}`);
    }
  });
  
  return classes.join(' ');
}
