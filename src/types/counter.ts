// Re-export types from Zod schemas for backward compatibility
export type {
  CounterData,
  CounterMetadata
} from '@/lib/validation/schemas'

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