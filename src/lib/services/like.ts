import { getRedis } from '@/lib/core/db'
import { generatePublicId } from '@/lib/core/id'
import { likeKeys } from '@/lib/utils/redis-keys'
import { generateUserHash } from '@/lib/utils/user-identification'
import { createOwnershipManager } from '@/lib/utils/ownership'
import { TTL } from '@/lib/utils/ttl-constants'
import {
  LikeData,
  LikeMetadata,
  LikeDataSchema,
  LikeMetadataSchema
} from '@/lib/validation/schemas'
import { safeParseRedisData, safeParseInt } from '@/lib/validation/safe-parse'
import { safeRedisSet, safeRedisSetNumber } from '@/lib/validation/db-validation'
import { safeRedisGetJson, safeRedisGetNumber } from '@/lib/validation/redis-validation'

export class LikeService {
  private get redis() {
    return getRedis()
  }

  // 公開IDでいいねデータを取得
  async getLikeById(id: string, userHash: string): Promise<LikeData | null> {
    const metadataStr = await this.redis.get(likeKeys.metadata(id))
    if (!metadataStr) return null
    
    const metadataResult = safeParseRedisData(LikeMetadataSchema, metadataStr)
    if (!metadataResult.success) {
      console.error(`Like metadata validation failed for ${id}:`, metadataResult.error)
      return null
    }
    const metadata = metadataResult.data

    const [totalResult, userLikedResult] = await Promise.all([
      safeRedisGetNumber(this.redis, likeKeys.total(id)),
      safeRedisGetString(this.redis, likeKeys.userState(id, userHash))
    ])
    
    const total = totalResult.success ? totalResult.data : 0
    const userLiked = userLikedResult.success ? userLikedResult.data === '1' : false

    return {
      id: metadata.id,
      url: metadata.url,
      total,
      userLiked,
      lastLike: metadata.lastLike || metadata.created,
      firstLike: metadata.created
    }
  }

  // URL+トークンでいいねを検索
  async getLikeByUrl(url: string): Promise<{ id: string; url: string } | null> {
    const id = await this.redis.get(likeKeys.urlMapping(url))
    if (!id) return null

    const metadataStr = await this.redis.get(likeKeys.metadata(id))
    if (!metadataStr) return null
    
    const metadataResult = safeParseRedisData(LikeMetadataSchema, metadataStr)
    if (!metadataResult.success) {
      console.error(`Like metadata validation failed for ${id}:`, metadataResult.error)
      return null
    }
    const metadata = metadataResult.data

    return { id, url: metadata.url }
  }

  // 新規いいね作成
  async createLike(url: string, token: string): Promise<{ id: string; likeData: LikeData }> {
    const id = generatePublicId(url)
    const now = new Date()
    const ownershipManager = createOwnershipManager('like', this.getLikeByUrl.bind(this))
    
    const metadata: LikeMetadata = {
      id,
      url,
      created: now
    }
    
    // 安全なRedis書き込み
    const metadataResult = await safeRedisSet(this.redis, likeKeys.metadata(id), LikeMetadataSchema, metadata)
    const totalResult = await safeRedisSetNumber(this.redis, likeKeys.total(id), 0)
    
    if (!metadataResult.success) {
      throw new Error(`Failed to save like metadata: ${metadataResult.error}`)
    }
    if (!totalResult.success) {
      throw new Error(`Failed to save like total: ${totalResult.error}`)
    }
    
    await Promise.all([
      ownershipManager.set(id, token),
      this.redis.set(likeKeys.urlMapping(url), id)
    ])
    
    const likeData: LikeData = {
      id,
      url,
      total: 0,
      userLiked: false,
      lastLike: now,
      firstLike: now
    }
    
    return { id, likeData }
  }

  // いいねの切り替え（いいね/取り消し）
  async toggleLike(id: string, userHash: string): Promise<LikeData | null> {
    const metadataStr = await this.redis.get(likeKeys.metadata(id))
    if (!metadataStr) return null
    
    const now = new Date()
    const userLikeKey = likeKeys.userState(id, userHash)
    const userLikedResult = await safeRedisGetString(this.redis, userLikeKey)
    const userLiked = userLikedResult.success ? userLikedResult.data : null
    
    // メタデータを更新（lastLikeタイムスタンプ）
    const metadataResult = safeParseRedisData(LikeMetadataSchema, metadataStr)
    if (!metadataResult.success) {
      console.error(`Like metadata validation failed for ${id}:`, metadataResult.error)
      return null
    }
    const metadata = metadataResult.data
    metadata.lastLike = now
    
    if (userLiked === '1') {
      // いいねを取り消し
      const currentTotalResult = await safeRedisGetNumber(this.redis, likeKeys.total(id))
      const currentTotal = currentTotalResult.success ? currentTotalResult.data : 0
      const newTotal = Math.max(0, currentTotal - 1)
      
      const totalResult = await safeRedisSetNumber(this.redis, likeKeys.total(id), newTotal)
      const metadataResult = await safeRedisSet(this.redis, likeKeys.metadata(id), LikeMetadataSchema, metadata)
      
      if (!totalResult.success || !metadataResult.success) {
        console.error('Failed to update like data:', { totalResult, metadataResult })
        return null
      }
      
      await this.redis.set(userLikeKey, '0')
      
    } else {
      // いいねを追加
      const metadataResult = await safeRedisSet(this.redis, likeKeys.metadata(id), LikeMetadataSchema, metadata)
      
      if (!metadataResult.success) {
        console.error('Failed to update like metadata:', metadataResult.error)
        return null
      }
      
      await Promise.all([
        this.redis.set(userLikeKey, '1'),
        this.redis.incr(likeKeys.total(id))
      ])
    }
    
    // TTLを設定（ユーザーのいいね状態は30日で自動削除）
    await this.redis.expire(userLikeKey, TTL.USER_STATE)
    
    return await this.getLikeById(id, userHash)
  }
  
  // オーナートークンの検証
  async verifyOwnership(url: string, token: string): Promise<boolean> {
    const ownershipManager = createOwnershipManager('like', this.getLikeByUrl.bind(this))
    return ownershipManager.verify(url, token)
  }
  
  // いいねの値を設定
  async setLikeValue(url: string, token: string, total: number): Promise<boolean> {
    const isOwner = await this.verifyOwnership(url, token)
    if (!isOwner) return false
    
    const result = await this.getLikeByUrl(url)
    if (!result) return false
    
    const setResult = await safeRedisSetNumber(this.redis, likeKeys.total(result.id), total)
    if (!setResult.success) {
      throw new Error(`Failed to set like value: ${setResult.error}`)
    }
    return true
  }
  
  // ユーザーハッシュ生成（IP+UserAgentベース）
  generateUserHash(ip: string, userAgent: string): string {
    return generateUserHash(ip, userAgent)
  }
}

export const likeService = new LikeService()