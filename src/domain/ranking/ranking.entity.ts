/**
 * Ranking Domain Entity - ランキング機能のエンティティ定義
 */

import { z } from 'zod'
import { CommonSchemas } from '@/lib/core/validation'

/**
 * Ranking制限値定数
 */
export const RANKING_LIMITS = {
  PLAYER_NAME_MIN: 1,
  PLAYER_NAME_MAX: 50,
  MAX_ENTRIES_MIN: 1,
  MAX_ENTRIES_MAX: 10000,
  LIMIT_MIN: 1,
  LIMIT_MAX: 1000,
} as const

/**
 * Ranking固有のフィールドスキーマ
 */
export const RankingFieldSchemas = {
  playerName: z.string().min(RANKING_LIMITS.PLAYER_NAME_MIN).max(RANKING_LIMITS.PLAYER_NAME_MAX),
  score: CommonSchemas.nonNegativeInt,
  maxEntries: z.number().int().min(RANKING_LIMITS.MAX_ENTRIES_MIN).max(RANKING_LIMITS.MAX_ENTRIES_MAX),
  limit: z.number().int().min(RANKING_LIMITS.LIMIT_MIN).max(RANKING_LIMITS.LIMIT_MAX),
  format: z.enum(['interactive'])
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
  id: CommonSchemas.publicId,
  url: CommonSchemas.url,
  created: CommonSchemas.date,
  totalEntries: CommonSchemas.nonNegativeInt,
  maxEntries: CommonSchemas.nonNegativeInt,
  title: CommonSchemas.title.optional(),
  lastUpdate: CommonSchemas.date.optional()
})

export const RankingEntrySchema = z.object({
  name: RankingFieldSchemas.playerName,
  score: RankingFieldSchemas.score,
  rank: CommonSchemas.positiveInt, // Web Components用にランク番号を追加
  timestamp: CommonSchemas.date
})

export const RankingDataSchema = z.object({
  id: z.string(),
  url: CommonSchemas.url,
  entries: z.array(RankingEntrySchema),
  totalEntries: CommonSchemas.nonNegativeInt,
  maxEntries: CommonSchemas.nonNegativeInt,
  title: CommonSchemas.title.optional(),
  lastUpdate: CommonSchemas.date.optional()
})

export const RankingCreateParamsSchema = z.object({
  maxEntries: RankingFieldSchemas.maxEntries.default(1000),
  title: CommonSchemas.title.default('RANKING')
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
  id: CommonSchemas.publicId,
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