/**
 * Counter Domain Entity
 */

import { z } from 'zod'
import { BaseEntity } from '@/lib/core/base-service'
import { BaseSchemas } from '@/lib/core/validation'

/**
 * カウンターエンティティのスキーマ
 */
export const CounterEntitySchema = z.object({
  id: BaseSchemas.publicId,
  url: BaseSchemas.url,
  created: BaseSchemas.date,
  lastVisit: BaseSchemas.date.optional(),
  totalCount: BaseSchemas.nonNegativeInt.default(0)
})

export const CounterDataSchema = z.object({
  id: z.string(),
  url: z.string(),
  total: BaseSchemas.nonNegativeInt,
  today: BaseSchemas.nonNegativeInt,
  yesterday: BaseSchemas.nonNegativeInt,
  week: BaseSchemas.nonNegativeInt,
  month: BaseSchemas.nonNegativeInt,
  lastVisit: BaseSchemas.date.optional()
})

export const CounterCreateParamsSchema = z.object({
  maxValue: BaseSchemas.positiveInt.optional(),
  enableDailyStats: z.boolean().default(true)
})

export const CounterIncrementParamsSchema = z.object({
  id: BaseSchemas.publicId,
  by: BaseSchemas.positiveInt.default(1)
})

export const CounterSetParamsSchema = z.object({
  url: BaseSchemas.url,
  token: BaseSchemas.token,
  value: BaseSchemas.nonNegativeInt
})

export const CounterDisplayParamsSchema = z.object({
  id: BaseSchemas.publicId,
  type: BaseSchemas.counterType.default('total'),
  theme: BaseSchemas.theme.default('classic'),
  digits: BaseSchemas.counterDigits,
  format: z.enum(['json', 'text', 'image']).default('image')
})

export type CounterEntity = z.infer<typeof CounterEntitySchema>
export type CounterData = z.infer<typeof CounterDataSchema>
export type CounterCreateParams = z.infer<typeof CounterCreateParamsSchema>
export type CounterIncrementParams = z.infer<typeof CounterIncrementParamsSchema>
export type CounterSetParams = z.infer<typeof CounterSetParamsSchema>
export type CounterDisplayParams = z.infer<typeof CounterDisplayParamsSchema>
// 型定義は schema-constants からインポート
export type { CounterType } from '@/lib/validation/schema-constants'