// 全局类型声明
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PageInfo {
  page: number
  pageSize: number
  total: number
}
