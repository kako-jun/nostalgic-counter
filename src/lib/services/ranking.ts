import { RankingData, RankingMetadata, RankingEntry } from '@/types/ranking'
import { getRedis } from '@/lib/core/db'
import { generatePublicId } from '@/lib/core/id'
import { hashToken } from '@/lib/core/auth'

export class RankingService {
  private get redis() {
    return getRedis()
  }

  // 公開IDでランキングデータを取得
  async getRankingById(id: string, limit: number = 10): Promise<RankingData | null> {
    const metadataStr = await this.redis.get(`ranking:${id}`)
    if (!metadataStr) return null
    const metadata: RankingMetadata = JSON.parse(metadataStr)

    // Sorted Setから上位を取得（スコア降順）
    const rawEntries = await this.redis.zrevrange(`ranking:${id}:scores`, 0, limit - 1, 'WITHSCORES')
    
    const entries: RankingEntry[] = []
    for (let i = 0; i < rawEntries.length; i += 2) {
      const name = rawEntries[i]
      const score = parseInt(rawEntries[i + 1])
      const rank = Math.floor(i / 2) + 1
      
      entries.push({
        name,
        score,
        rank,
        timestamp: new Date() // 簡易実装（実際のタイムスタンプは別途管理が必要）
      })
    }

    const totalEntries = await this.redis.zcard(`ranking:${id}:scores`)

    return {
      id: metadata.id,
      url: metadata.url,
      entries,
      totalEntries
    }
  }

  // URL+トークンでランキングを検索
  async getRankingByUrl(url: string): Promise<{ id: string; url: string } | null> {
    const id = await this.redis.get(`url:ranking:${encodeURIComponent(url)}`)
    if (!id) return null

    const metadataStr = await this.redis.get(`ranking:${id}`)
    if (!metadataStr) return null
    const metadata: RankingMetadata = JSON.parse(metadataStr)

    return { id, url: metadata.url }
  }

  // 新規ランキング作成
  async createRanking(url: string, token: string, maxEntries: number = 100): Promise<{ id: string; rankingData: RankingData }> {
    const id = generatePublicId(url)
    const now = new Date()
    const hashedToken = hashToken(token)
    
    const metadata: RankingMetadata = {
      id,
      url,
      created: now,
      ownerTokenHash: hashedToken,
      maxEntries
    }
    
    await Promise.all([
      this.redis.set(`ranking:${id}`, JSON.stringify(metadata)),
      this.redis.set(`ranking:${id}:owner`, hashedToken),
      this.redis.set(`url:ranking:${encodeURIComponent(url)}`, id)
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
    const metadataStr = await this.redis.get(`ranking:${id}`)
    if (!metadataStr) return null
    const metadata: RankingMetadata = JSON.parse(metadataStr)
    
    // Sorted Setにスコアを追加
    await this.redis.zadd(`ranking:${id}:scores`, score, name)
    
    // 最大エントリー数を超えた場合、下位を削除
    const totalEntries = await this.redis.zcard(`ranking:${id}:scores`)
    if (totalEntries > metadata.maxEntries) {
      const removeCount = totalEntries - metadata.maxEntries
      await this.redis.zremrangebyrank(`ranking:${id}:scores`, 0, removeCount - 1)
    }
    
    return await this.getRankingById(id, 10)
  }
  
  // オーナートークンの検証
  async verifyOwnership(url: string, token: string): Promise<boolean> {
    const result = await this.getRankingByUrl(url)
    if (!result) return false
    
    const storedHash = await this.redis.get(`ranking:${result.id}:owner`)
    if (!storedHash) return false
    
    return hashToken(token) === storedHash
  }
  
  // ランキングのクリア
  async clearRanking(url: string, token: string): Promise<boolean> {
    const isOwner = await this.verifyOwnership(url, token)
    if (!isOwner) return false
    
    const result = await this.getRankingByUrl(url)
    if (!result) return false
    
    await this.redis.del(`ranking:${result.id}:scores`)
    return true
  }
  
  // 特定のスコアを削除
  async removeScore(url: string, token: string, name: string): Promise<boolean> {
    const isOwner = await this.verifyOwnership(url, token)
    if (!isOwner) return false
    
    const result = await this.getRankingByUrl(url)
    if (!result) return false
    
    const removed = await this.redis.zrem(`ranking:${result.id}:scores`, name)
    return removed > 0
  }
  
  // 特定のスコアを更新
  async updateScore(url: string, token: string, name: string, newScore: number): Promise<boolean> {
    const isOwner = await this.verifyOwnership(url, token)
    if (!isOwner) return false
    
    const result = await this.getRankingByUrl(url)
    if (!result) return false
    
    // 既存のエントリが存在するか確認
    const currentScore = await this.redis.zscore(`ranking:${result.id}:scores`, name)
    if (currentScore === null) return false
    
    // スコアを更新（既存エントリを上書き）
    await this.redis.zadd(`ranking:${result.id}:scores`, newScore, name)
    return true
  }
}

export const rankingService = new RankingService()