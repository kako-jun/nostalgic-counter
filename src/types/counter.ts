export interface CounterData {
  id: string        // 公開ID（例: blog-2025-a7b9）
  url: string
  total: number
  today: number
  yesterday: number
  week: number
  month: number
  lastVisit: Date
  firstVisit: Date
}

export interface CounterMetadata {
  id: string
  url: string
  created: Date
}

export interface DailyCount {
  date: string // YYYY-MM-DD format
  count: number
}

export type CounterType = 'total' | 'today' | 'yesterday' | 'week' | 'month'

export interface CounterRequest {
  url: string
  type?: CounterType
  userAgent?: string
  ip?: string
}