import { LikeData, LikeMetadata } from '@/types/like'
import { getRedis } from '@/lib/core/db'
import { generatePublicId } from '@/lib/core/id'
import { hashToken } from '@/lib/core/auth'
import { createHash } from 'crypto'

export class LikeService {
  private get redis() {
    return getRedis()
  }

  // 公開IDでいいねデータを取得
  async getLikeById(id: string, userHash: string): Promise<LikeData | null> {
    const metadataStr = await this.redis.get(`like:${id}`)
    if (!metadataStr) return null
    const metadata: LikeMetadata = JSON.parse(metadataStr)

    const [totalStr, userLikedStr, lastLikeStr] = await Promise.all([
      this.redis.get(`like:${id}:total`),
      this.redis.get(`like:${id}:user:${userHash}`),
      this.redis.get(`like:${id}:lastLike`)
    ])
    
    const total = totalStr ? parseInt(totalStr) : 0
    const userLiked = userLikedStr === '1'

    return {
      id: metadata.id,
      url: metadata.url,
      total,
      userLiked,
      lastLike: lastLikeStr ? new Date(lastLikeStr) : metadata.created,
      firstLike: metadata.created
    }
  }

  // URL+トークンでいいねを検索
  async getLikeByUrl(url: string): Promise<{ id: string; url: string } | null> {
    const id = await this.redis.get(`url:like:${encodeURIComponent(url)}`)
    if (!id) return null

    const metadataStr = await this.redis.get(`like:${id}`)
    if (!metadataStr) return null
    const metadata: LikeMetadata = JSON.parse(metadataStr)

    return { id, url: metadata.url }
  }

  // 新規いいね作成
  async createLike(url: string, token: string): Promise<{ id: string; likeData: LikeData }> {
    const id = generatePublicId(url)
    const now = new Date()
    const hashedToken = hashToken(token)
    
    const metadata: LikeMetadata = {
      id,
      url,
      created: now,
      ownerTokenHash: hashedToken
    }
    
    await Promise.all([
      this.redis.set(`like:${id}`, JSON.stringify(metadata)),
      this.redis.set(`like:${id}:total`, '0'),
      this.redis.set(`like:${id}:owner`, hashedToken),
      this.redis.set(`url:like:${encodeURIComponent(url)}`, id)
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
    const metadataStr = await this.redis.get(`like:${id}`)
    if (!metadataStr) return null
    
    const now = new Date().toISOString()
    const userLikeKey = `like:${id}:user:${userHash}`
    const userLiked = await this.redis.get(userLikeKey)
    
    if (userLiked === '1') {
      // いいねを取り消し
      const currentTotal = await this.redis.get(`like:${id}:total`)
      const newTotal = Math.max(0, parseInt(currentTotal || '0') - 1)
      
      await Promise.all([
        this.redis.set(userLikeKey, '0'),
        this.redis.set(`like:${id}:total`, newTotal.toString()),
        this.redis.set(`like:${id}:lastLike`, now)
      ])
      
    } else {
      // いいねを追加
      await Promise.all([
        this.redis.set(userLikeKey, '1'),
        this.redis.incr(`like:${id}:total`),
        this.redis.set(`like:${id}:lastLike`, now)
      ])
    }
    
    // TTLを設定（ユーザーのいいね状態は30日で自動削除）
    await this.redis.expire(userLikeKey, 30 * 24 * 60 * 60)
    
    return await this.getLikeById(id, userHash)
  }
  
  // オーナートークンの検証
  async verifyOwnership(url: string, token: string): Promise<boolean> {
    const result = await this.getLikeByUrl(url)
    if (!result) return false
    
    const storedHash = await this.redis.get(`like:${result.id}:owner`)
    if (!storedHash) return false
    
    return hashToken(token) === storedHash
  }
  
  // いいねの値を設定
  async setLikeValue(url: string, token: string, total: number): Promise<boolean> {
    const isOwner = await this.verifyOwnership(url, token)
    if (!isOwner) return false
    
    const result = await this.getLikeByUrl(url)
    if (!result) return false
    
    await this.redis.set(`like:${result.id}:total`, total.toString())
    return true
  }
  
  // ユーザーハッシュ生成（IP+UserAgentベース）
  generateUserHash(ip: string, userAgent: string): string {
    return createHash('sha256')
      .update(`${ip}:${userAgent}`)
      .digest('hex')
      .substring(0, 16)
  }
}

export const likeService = new LikeService()