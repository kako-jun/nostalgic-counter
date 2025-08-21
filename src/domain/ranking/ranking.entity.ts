/**
 * Ranking Domain Entity - ランキング機能のエンティティ定義
 */

import { z } from 'zod'
import { BaseSchemas } from '@/lib/core/validation'

/**
 * Rankingエンティティの基本型
 */
export interface RankingEntity {
  id: string
  url: string
  created: Date
  totalEntries: number
  maxEntries: number
  lastUpdate?: Date
}

/**
 * ランキングエントリの型
 */
export interface RankingEntry {
  name: string
  score: number
  rank: number // Web Components用にランク番号を追加
  timestamp: Date
}

/**
 * クライアントに返すRankingデータの型
 */
export interface RankingData {
  id: string
  url: string
  entries: RankingEntry[]
  totalEntries: number
  maxEntries: number
  lastUpdate?: Date
}

/**
 * Ranking作成時のパラメータ
 */
export interface RankingCreateParams {
  maxEntries?: number
}

/**
 * スコア送信時のパラメータ
 */
export interface RankingSubmitParams {
  name: string
  score: number
}

/**
 * スコア更新時のパラメータ
 */
export interface RankingUpdateParams {
  name: string
  score: number
}

/**
 * エントリ削除時のパラメータ
 */
export interface RankingRemoveParams {
  name: string
}

/**
 * ランキング表示時のパラメータ
 */
export interface RankingDisplayParams {
  id: string
  limit?: number
}

/**
 * Zodスキーマ定義
 */
export const RankingEntitySchema = z.object({
  id: BaseSchemas.publicId,
  url: BaseSchemas.url,
  created: BaseSchemas.date,
  totalEntries: BaseSchemas.nonNegativeInt,
  maxEntries: BaseSchemas.nonNegativeInt,
  lastUpdate: BaseSchemas.date.optional()
})

export const RankingEntrySchema = z.object({
  name: z.string().min(1).max(50),
  score: BaseSchemas.nonNegativeInt,
  rank: BaseSchemas.positiveInt, // Web Components用にランク番号を追加
  timestamp: BaseSchemas.date
})

export const RankingDataSchema = z.object({
  id: z.string(),
  url: BaseSchemas.url,
  entries: z.array(RankingEntrySchema),
  totalEntries: BaseSchemas.nonNegativeInt,
  maxEntries: BaseSchemas.nonNegativeInt,
  lastUpdate: BaseSchemas.date.optional()
})

export const RankingCreateParamsSchema = z.object({
  maxEntries: z.number().int().min(1).max(10000).default(1000)
})

export const RankingSubmitParamsSchema = z.object({
  name: z.string().min(1).max(50),
  score: BaseSchemas.nonNegativeInt
})

export const RankingUpdateParamsSchema = z.object({
  name: z.string().min(1).max(50),
  score: BaseSchemas.nonNegativeInt
})

export const RankingRemoveParamsSchema = z.object({
  name: z.string().min(1).max(50)
})

export const RankingDisplayParamsSchema = z.object({
  id: BaseSchemas.publicId,
  limit: z.number().int().min(1).max(1000).default(10)
})

/**
 * 型エクスポート
 */
export type RankingEntityType = z.infer<typeof RankingEntitySchema>
export type RankingEntryType = z.infer<typeof RankingEntrySchema>
export type RankingDataType = z.infer<typeof RankingDataSchema>
export type RankingCreateParamsType = z.infer<typeof RankingCreateParamsSchema>
export type RankingSubmitParamsType = z.infer<typeof RankingSubmitParamsSchema>
export type RankingUpdateParamsType = z.infer<typeof RankingUpdateParamsSchema>
export type RankingRemoveParamsType = z.infer<typeof RankingRemoveParamsSchema>
export type RankingDisplayParamsType = z.infer<typeof RankingDisplayParamsSchema>