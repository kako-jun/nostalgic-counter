/**
 * Ranking Domain Entity - ランキング機能のエンティティ定義
 */

import { z } from 'zod'
import { CommonSchemas } from '@/lib/core/validation'

/**
 * Rankingエンティティの基本型
 */
export interface RankingEntity {
  id: string
  url: string
  created: Date
  totalEntries: number
  lastUpdate?: Date
}

/**
 * ランキングエントリの型
 */
export interface RankingEntry {
  name: string
  score: number
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
  id: CommonSchemas.publicId,
  url: CommonSchemas.url,
  created: CommonSchemas.date,
  totalEntries: CommonSchemas.nonNegativeInt,
  lastUpdate: CommonSchemas.date.optional()
})

export const RankingEntrySchema = z.object({
  name: z.string().min(1).max(50),
  score: CommonSchemas.nonNegativeInt,
  timestamp: CommonSchemas.date
})

export const RankingDataSchema = z.object({
  id: z.string(),
  url: CommonSchemas.url,
  entries: z.array(RankingEntrySchema),
  totalEntries: CommonSchemas.nonNegativeInt,
  lastUpdate: CommonSchemas.date.optional()
})

export const RankingCreateParamsSchema = z.object({
  maxEntries: z.number().int().min(1).max(10000).default(1000)
})

export const RankingSubmitParamsSchema = z.object({
  name: z.string().min(1).max(50),
  score: CommonSchemas.nonNegativeInt
})

export const RankingUpdateParamsSchema = z.object({
  name: z.string().min(1).max(50),
  score: CommonSchemas.nonNegativeInt
})

export const RankingRemoveParamsSchema = z.object({
  name: z.string().min(1).max(50)
})

export const RankingDisplayParamsSchema = z.object({
  id: CommonSchemas.publicId,
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