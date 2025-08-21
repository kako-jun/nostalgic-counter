/**
 * Counter Domain Entity
 */

import { z } from 'zod'
import { BaseEntity } from '@/lib/core/base-service'
import { CommonSchemas } from '@/lib/core/validation'

/**
 * Counter固有のフィールドスキーマ
 */
export const CounterFieldSchemas = {
  counterType: z.enum(['total', 'today', 'yesterday', 'week', 'month']),
  counterFormat: z.enum(['json', 'text', 'image']),
  counterDigits: z.coerce.number().int().min(1).max(10).optional()
} as const

/**
 * カウンターエンティティのスキーマ
 */
export const CounterEntitySchema = z.object({
  id: CommonSchemas.publicId,
  url: CommonSchemas.url,
  created: CommonSchemas.date,
  lastVisit: CommonSchemas.date.optional(),
  totalCount: CommonSchemas.nonNegativeInt.default(0)
})

export const CounterDataSchema = z.object({
  id: z.string(),
  url: z.string(),
  total: CommonSchemas.nonNegativeInt,
  today: CommonSchemas.nonNegativeInt,
  yesterday: CommonSchemas.nonNegativeInt,
  week: CommonSchemas.nonNegativeInt,
  month: CommonSchemas.nonNegativeInt,
  lastVisit: CommonSchemas.date.optional()
})

export const CounterCreateParamsSchema = z.object({
  maxValue: CommonSchemas.positiveInt.optional(),
  enableDailyStats: z.boolean().default(true)
})

export const CounterIncrementParamsSchema = z.object({
  id: CommonSchemas.publicId,
  by: CommonSchemas.positiveInt.default(1)
})

export const CounterSetParamsSchema = z.object({
  url: CommonSchemas.url,
  token: CommonSchemas.token,
  value: CommonSchemas.nonNegativeInt
})

export const CounterDisplayParamsSchema = z.object({
  id: CommonSchemas.publicId,
  type: CounterFieldSchemas.counterType.default('total'),
  theme: CommonSchemas.theme.default('classic'),
  digits: CounterFieldSchemas.counterDigits,
  format: CounterFieldSchemas.counterFormat.default('image')
})

export type CounterEntity = z.infer<typeof CounterEntitySchema>
export type CounterData = z.infer<typeof CounterDataSchema>
export type CounterCreateParams = z.infer<typeof CounterCreateParamsSchema>
export type CounterIncrementParams = z.infer<typeof CounterIncrementParamsSchema>
export type CounterSetParams = z.infer<typeof CounterSetParamsSchema>
export type CounterDisplayParams = z.infer<typeof CounterDisplayParamsSchema>
// 型定義は schema-constants からインポート
export type { CounterType } from '@/lib/validation/schema-constants'