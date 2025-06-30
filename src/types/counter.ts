export interface CounterData {
  url: string
  total: number
  today: number
  yesterday: number
  week: number
  month: number
  lastVisit: Date
  firstVisit: Date
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