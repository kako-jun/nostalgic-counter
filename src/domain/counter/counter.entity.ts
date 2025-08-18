/**
 * Counter Domain Entity
 */

import { z } from 'zod'
import { BaseEntity } from '@/lib/core/base-service'

/**
 * カウンターエンティティのスキーマ
 */
export const CounterEntitySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+-[a-f0-9]{8}$/),
  url: z.string().url(),
  created: z.coerce.date(),
  lastVisit: z.coerce.date().optional(),
  totalCount: z.number().int().min(0).default(0)
})

export const CounterDataSchema = z.object({
  id: z.string(),
  url: z.string(),
  total: z.number().int().min(0),
  today: z.number().int().min(0),
  yesterday: z.number().int().min(0),
  week: z.number().int().min(0),
  month: z.number().int().min(0),
  lastVisit: z.coerce.date().optional()
})

export const CounterCreateParamsSchema = z.object({
  maxValue: z.number().int().positive().optional(),
  enableDailyStats: z.boolean().default(true)
})

export const CounterIncrementParamsSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+-[a-f0-9]{8}$/),
  by: z.number().int().positive().default(1)
})

export const CounterSetParamsSchema = z.object({
  url: z.string().url(),
  token: z.string().min(8).max(16),
  value: z.number().int().min(0)
})

export const CounterDisplayParamsSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+-[a-f0-9]{8}$/),
  type: z.enum(['total', 'today', 'yesterday', 'week', 'month']).default('total'),
  theme: z.enum(['classic', 'modern', 'retro']).default('classic'),
  digits: z.coerce.number().int().min(1).max(10).default(6),
  format: z.enum(['json', 'text', 'image']).default('image')
})

export type CounterEntity = z.infer<typeof CounterEntitySchema>
export type CounterData = z.infer<typeof CounterDataSchema>
export type CounterCreateParams = z.infer<typeof CounterCreateParamsSchema>
export type CounterIncrementParams = z.infer<typeof CounterIncrementParamsSchema>
export type CounterSetParams = z.infer<typeof CounterSetParamsSchema>
export type CounterDisplayParams = z.infer<typeof CounterDisplayParamsSchema>
export type CounterType = 'total' | 'today' | 'yesterday' | 'week' | 'month'