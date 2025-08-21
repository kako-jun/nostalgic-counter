/**
 * Ranking Domain Entity - ランキング機能のエンティティ定義
 */

import { z } from 'zod'
import { BaseSchemas } from '@/lib/core/validation'

/**
 * Ranking固有のフィールドスキーマ
 */
export const RankingFieldSchemas = {
  playerName: z.string().min(1).max(50),
  score: BaseSchemas.nonNegativeInt,
  maxEntries: z.number().int().min(1).max(10000),
  limit: z.number().int().min(1).max(1000)
} as const

/**
 * Rankingエンティティの基本型
 */
export interface RankingEntity {
  id: string
  url: string
  created: Date
  totalEntries: number
  maxEntries: number
  title?: string
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
  title?: string
  lastUpdate?: Date
}

/**
 * Ranking作成時のパラメータ
 */
export interface RankingCreateParams {
  maxEntries?: number
  title?: string
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
  title: BaseSchemas.title.optional(),
  lastUpdate: BaseSchemas.date.optional()
})

export const RankingEntrySchema = z.object({
  name: RankingFieldSchemas.playerName,
  score: RankingFieldSchemas.score,
  rank: BaseSchemas.positiveInt, // Web Components用にランク番号を追加
  timestamp: BaseSchemas.date
})

export const RankingDataSchema = z.object({
  id: z.string(),
  url: BaseSchemas.url,
  entries: z.array(RankingEntrySchema),
  totalEntries: BaseSchemas.nonNegativeInt,
  maxEntries: BaseSchemas.nonNegativeInt,
  title: BaseSchemas.title.optional(),
  lastUpdate: BaseSchemas.date.optional()
})

export const RankingCreateParamsSchema = z.object({
  maxEntries: RankingFieldSchemas.maxEntries.default(1000),
  title: BaseSchemas.title.default('RANKING')
})

export const RankingSubmitParamsSchema = z.object({
  name: RankingFieldSchemas.playerName,
  score: RankingFieldSchemas.score
})

export const RankingUpdateParamsSchema = z.object({
  name: RankingFieldSchemas.playerName,
  score: RankingFieldSchemas.score
})

export const RankingRemoveParamsSchema = z.object({
  name: RankingFieldSchemas.playerName
})

export const RankingDisplayParamsSchema = z.object({
  id: BaseSchemas.publicId,
  limit: RankingFieldSchemas.limit.default(10)
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