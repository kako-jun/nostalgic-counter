import { CounterData, CounterMetadata } from '@/types/counter'
import { getRedis } from '@/lib/core/db'
import { generatePublicId } from '@/lib/core/id'
import { hashToken } from '@/lib/core/auth'
import { createHash } from 'crypto'

export class CounterService {
  private get redis() {
    return getRedis()
  }

  // 公開IDでカウンターデータを取得
  async getCounterById(id: string): Promise<CounterData | null> {
    const metadataStr = await this.redis.get(`counter:${id}`)
    if (!metadataStr) return null
    const metadata: CounterMetadata = JSON.parse(metadataStr)

    const [totalStr, today, yesterday, lastVisitStr] = await Promise.all([
      this.redis.get(`counter:${id}:total`),
      this.getTodayCount(id),
      this.getYesterdayCount(id),
      this.redis.get(`counter:${id}:lastVisit`)
    ])
    
    const total = totalStr ? parseInt(totalStr) : 0

    const week = await this.getPeriodCount(id, 7)
    const month = await this.getPeriodCount(id, 30)

    return {
      id: metadata.id,
      url: metadata.url,
      total,
      today,
      yesterday,
      week,
      month,
      lastVisit: lastVisitStr ? new Date(lastVisitStr) : metadata.created,
      firstVisit: metadata.created
    }
  }

  // URL+トークンでカウンターを検索
  async getCounterByUrl(url: string): Promise<{ id: string; url: string } | null> {
    const id = await this.redis.get(`url:counter:${encodeURIComponent(url)}`)
    if (!id) return null

    const metadataStr = await this.redis.get(`counter:${id}`)
    if (!metadataStr) return null
    const metadata: CounterMetadata = JSON.parse(metadataStr)

    return { id, url: metadata.url }
  }

  // 新規カウンター作成
  async createCounter(url: string, token: string): Promise<{ id: string; counterData: CounterData }> {
    const id = generatePublicId(url)
    const now = new Date()
    const hashedToken = hashToken(token)
    
    const metadata: CounterMetadata = {
      id,
      url,
      created: now,
      ownerTokenHash: hashedToken
    }
    
    await Promise.all([
      this.redis.set(`counter:${id}`, JSON.stringify(metadata)),
      this.redis.set(`counter:${id}:total`, '0'),
      this.redis.set(`counter:${id}:owner`, hashedToken),
      this.redis.set(`url:counter:${encodeURIComponent(url)}`, id)
    ])
    
    const counterData: CounterData = {
      id,
      url,
      total: 0,
      today: 0,
      yesterday: 0,
      week: 0,
      month: 0,
      lastVisit: now,
      firstVisit: now
    }
    
    return { id, counterData }
  }

  // カウンターのインクリメント
  async incrementCounterById(id: string): Promise<CounterData | null> {
    const metadataStr = await this.redis.get(`counter:${id}`)
    if (!metadataStr) return null
    
    const now = new Date().toISOString()
    const today = now.split('T')[0]
    
    await Promise.all([
      this.redis.incr(`counter:${id}:total`),
      this.redis.incr(`counter:${id}:daily:${today}`),
      this.redis.set(`counter:${id}:lastVisit`, now)
    ])
    
    await this.redis.expire(`counter:${id}:daily:${today}`, 90 * 24 * 60 * 60)
    
    return await this.getCounterById(id)
  }
  
  // オーナートークンの検証
  async verifyOwnership(url: string, token: string): Promise<boolean> {
    const result = await this.getCounterByUrl(url)
    if (!result) return false
    
    const storedHash = await this.redis.get(`counter:${result.id}:owner`)
    if (!storedHash) return false
    
    return hashToken(token) === storedHash
  }
  
  // カウンターの値を設定
  async setCounterValue(url: string, token: string, total: number): Promise<boolean> {
    const isOwner = await this.verifyOwnership(url, token)
    if (!isOwner) return false
    
    const result = await this.getCounterByUrl(url)
    if (!result) return false
    
    await this.redis.set(`counter:${result.id}:total`, total.toString())
    return true
  }
  
  // 重複チェック
  async checkDuplicateVisit(id: string, ip: string, userAgent: string): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0]
    const visitHash = createHash('sha256')
      .update(`${ip}:${userAgent}:${today}`)
      .digest('hex')
      .substring(0, 16)
    
    const visitKey = `visit:counter:${id}:${visitHash}`
    const hasVisited = await this.redis.get(visitKey)
    
    if (hasVisited) {
      return true
    }
    
    await this.redis.setex(visitKey, 24 * 60 * 60, '1')
    return false
  }

  // Private methods
  private async getTodayCount(id: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0]
    const count = await this.redis.get(`counter:${id}:daily:${today}`)
    return count ? parseInt(count) : 0
  }

  private async getYesterdayCount(id: string): Promise<number> {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const count = await this.redis.get(`counter:${id}:daily:${yesterday}`)
    return count ? parseInt(count) : 0
  }

  private async getPeriodCount(id: string, days: number): Promise<number> {
    const promises: Promise<number>[] = []
    const now = new Date()
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      promises.push(this.redis.get(`counter:${id}:daily:${dateStr}`).then(count => count ? parseInt(count) : 0))
    }
    
    const counts = await Promise.all(promises)
    return counts.reduce((sum, count) => sum + count, 0)
  }
}

export const counterService = new CounterService()