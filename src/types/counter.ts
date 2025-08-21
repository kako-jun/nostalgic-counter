// Re-export types from service schemas
export type {
  CounterCreateParams,
  CounterIncrementParams,
  CounterDisplayParams,
  CounterSetParams,
  CounterData
} from '@/lib/validation/service-schemas'

export type CounterType = 'total' | 'today' | 'yesterday' | 'week' | 'month'

// Additional legacy types for backward compatibility
export interface DailyCount {
  date: string // YYYY-MM-DD format
  count: number
}

export interface CounterRequest {
  url: string
  type?: CounterType
  userAgent?: string
  ip?: string
}