import { getRedis } from '@/lib/core/db'
import { generatePublicId } from '@/lib/core/id'
import { rankingKeys } from '@/lib/utils/redis-keys'
import { createOwnershipManager } from '@/lib/utils/ownership'
import {
  RankingData,
  RankingMetadata,
  RankingEntry,
  RankingDataSchema,
  RankingMetadataSchema
} from '@/lib/validation/schemas'
import { safeParseRedisData, safeParseInt } from '@/lib/validation/safe-parse'
import { safeRedisSet } from '@/lib/validation/db-validation'
import { safeRedisZRevRangeWithScores } from '@/lib/validation/redis-validation'

export class RankingService {
  private get redis() {
    return getRedis()
  }

  // 公開IDでランキングデータを取得
  async getRankingById(id: string, limit: number = 10): Promise<RankingData | null> {
    const metadataStr = await this.redis.get(rankingKeys.metadata(id))
    if (!metadataStr) return null
    const metadataResult = safeParseRedisData(RankingMetadataSchema, metadataStr)
    if (!metadataResult.success) {
      console.error(`Ranking metadata validation failed for ${id}:`, metadataResult.error)
      return null
    }
    const metadata = metadataResult.data

    // Sorted Setから上位を取得（スコア降順）
    const entriesResult = await safeRedisZRevRangeWithScores(this.redis, rankingKeys.scores(id), 0, limit - 1)
    
    if (!entriesResult.success) {
      console.error(`Failed to get ranking entries for ${id}:`, entriesResult.error)
      return null
    }
    
    const entries: RankingEntry[] = entriesResult.data.map((entry, index) => ({
      name: entry.name,
      score: entry.score,
      rank: index + 1,
      timestamp: new Date() // 簡易実装（実際のタイムスタンプは別途管理が必要）
    }))

    const totalEntries = await this.redis.zcard(rankingKeys.scores(id))

    return {
      id: metadata.id,
      url: metadata.url,
      entries,
      totalEntries
    }
  }

  // URL+トークンでランキングを検索
  async getRankingByUrl(url: string): Promise<{ id: string; url: string } | null> {
    const id = await this.redis.get(rankingKeys.urlMapping(url))
    if (!id) return null

    const metadataStr = await this.redis.get(rankingKeys.metadata(id))
    if (!metadataStr) return null
    const metadataResult = safeParseRedisData(RankingMetadataSchema, metadataStr)
    if (!metadataResult.success) {
      console.error(`Ranking metadata validation failed for ${id}:`, metadataResult.error)
      return null
    }
    const metadata = metadataResult.data

    return { id, url: metadata.url }
  }

  // 新規ランキング作成
  async createRanking(url: string, token: string, maxEntries: number = 100): Promise<{ id: string; rankingData: RankingData }> {
    const id = generatePublicId(url)
    const now = new Date()
    const ownershipManager = createOwnershipManager('ranking', this.getRankingByUrl.bind(this))
    
    const metadata: RankingMetadata = {
      id,
      url,
      created: now,
      maxEntries
    }
    
    // 安全なRedis書き込み
    const metadataResult = await safeRedisSet(this.redis, rankingKeys.metadata(id), RankingMetadataSchema, metadata)
    
    if (!metadataResult.success) {
      throw new Error(`Failed to save ranking metadata: ${metadataResult.error}`)
    }
    
    await Promise.all([
      ownershipManager.set(id, token),
      this.redis.set(rankingKeys.urlMapping(url), id)
    ])
    
    const rankingData: RankingData = {
      id,
      url,
      entries: [],
      totalEntries: 0
    }
    
    return { id, rankingData }
  }

  // スコア送信
  async submitScore(id: string, name: string, score: number): Promise<RankingData | null> {
    const metadataStr = await this.redis.get(rankingKeys.metadata(id))
    if (!metadataStr) return null
    const metadataResult = safeParseRedisData(RankingMetadataSchema, metadataStr)
    if (!metadataResult.success) {
      console.error(`Ranking metadata validation failed for ${id}:`, metadataResult.error)
      return null
    }
    const metadata = metadataResult.data
    
    // Sorted Setにスコアを追加
    await this.redis.zadd(rankingKeys.scores(id), score, name)
    
    // 最大エントリー数を超えた場合、下位を削除
    const totalEntries = await this.redis.zcard(rankingKeys.scores(id))
    if (totalEntries > metadata.maxEntries) {
      const removeCount = totalEntries - metadata.maxEntries
      await this.redis.zremrangebyrank(rankingKeys.scores(id), 0, removeCount - 1)
    }
    
    return await this.getRankingById(id, 10)
  }
  
  // オーナートークンの検証
  async verifyOwnership(url: string, token: string): Promise<boolean> {
    const ownershipManager = createOwnershipManager('ranking', this.getRankingByUrl.bind(this))
    return ownershipManager.verify(url, token)
  }
  
  // ランキングのクリア
  async clearRanking(url: string, token: string): Promise<boolean> {
    const isOwner = await this.verifyOwnership(url, token)
    if (!isOwner) return false
    
    const result = await this.getRankingByUrl(url)
    if (!result) return false
    
    await this.redis.del(rankingKeys.scores(result.id))
    return true
  }
  
  // 特定のスコアを削除
  async removeScore(url: string, token: string, name: string): Promise<boolean> {
    const isOwner = await this.verifyOwnership(url, token)
    if (!isOwner) return false
    
    const result = await this.getRankingByUrl(url)
    if (!result) return false
    
    const removed = await this.redis.zrem(rankingKeys.scores(result.id), name)
    return removed > 0
  }
  
  // 特定のスコアを更新
  async updateScore(url: string, token: string, name: string, newScore: number): Promise<boolean> {
    const isOwner = await this.verifyOwnership(url, token)
    if (!isOwner) return false
    
    const result = await this.getRankingByUrl(url)
    if (!result) return false
    
    // 既存のエントリが存在するか確認
    const currentScoreResult = await this.redis.zscore(rankingKeys.scores(result.id), name)
    if (currentScoreResult === null) return false
    
    // スコアを更新（既存エントリを上書き）
    await this.redis.zadd(rankingKeys.scores(result.id), newScore, name)
    return true
  }
}

export const rankingService = new RankingService()