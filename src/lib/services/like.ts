import { LikeData, LikeMetadata } from '@/types/like'
import { getRedis } from '@/lib/core/db'
import { generatePublicId } from '@/lib/core/id'
import { likeKeys } from '@/lib/utils/redis-keys'
import { generateUserHash } from '@/lib/utils/user-identification'
import { createOwnershipManager } from '@/lib/utils/ownership'
import { TTL } from '@/lib/utils/ttl-constants'

export class LikeService {
  private get redis() {
    return getRedis()
  }

  // 公開IDでいいねデータを取得
  async getLikeById(id: string, userHash: string): Promise<LikeData | null> {
    const metadataStr = await this.redis.get(likeKeys.metadata(id))
    if (!metadataStr) return null
    const metadata: LikeMetadata = JSON.parse(metadataStr)

    const [totalStr, userLikedStr] = await Promise.all([
      this.redis.get(likeKeys.total(id)),
      this.redis.get(likeKeys.userState(id, userHash))
    ])
    
    const total = totalStr ? parseInt(totalStr) : 0
    const userLiked = userLikedStr === '1'

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
    const metadata: LikeMetadata = JSON.parse(metadataStr)

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
    
    await Promise.all([
      this.redis.set(likeKeys.metadata(id), JSON.stringify(metadata)),
      this.redis.set(likeKeys.total(id), '0'),
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
    const userLiked = await this.redis.get(userLikeKey)
    
    // メタデータを更新（lastLikeタイムスタンプ）
    const metadata: LikeMetadata = JSON.parse(metadataStr)
    metadata.lastLike = now
    
    if (userLiked === '1') {
      // いいねを取り消し
      const currentTotal = await this.redis.get(likeKeys.total(id))
      const newTotal = Math.max(0, parseInt(currentTotal || '0') - 1)
      
      await Promise.all([
        this.redis.set(userLikeKey, '0'),
        this.redis.set(likeKeys.total(id), newTotal.toString()),
        this.redis.set(likeKeys.metadata(id), JSON.stringify(metadata))
      ])
      
    } else {
      // いいねを追加
      await Promise.all([
        this.redis.set(userLikeKey, '1'),
        this.redis.incr(likeKeys.total(id)),
        this.redis.set(likeKeys.metadata(id), JSON.stringify(metadata))
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
    
    await this.redis.set(likeKeys.total(result.id), total.toString())
    return true
  }
  
  // ユーザーハッシュ生成（IP+UserAgentベース）
  generateUserHash(ip: string, userAgent: string): string {
    return generateUserHash(ip, userAgent)
  }
}

export const likeService = new LikeService()