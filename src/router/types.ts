/**
 * 路由类型定义
 */

import type { ReactNode } from 'react'

export interface RouteConfig {
  /** 路由路径 */
  path: string
  /** 路由组件 */
  element: ReactNode
  /** 子路由配置 */
  children?: RouteConfig[]
  /** 是否需要认证（预留） */
  requireAuth?: boolean
  /** 路由元信息 */
  meta?: {
    /** 页面标题 */
    title?: string
    /** 是否需要登录 */
    requiresAuth?: boolean
    /** 角色权限 */
    roles?: string[]
  }
}
