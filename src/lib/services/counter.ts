import { CounterData, CounterMetadata } from '@/types/counter'
import { getRedis } from '@/lib/core/db'
import { generatePublicId } from '@/lib/core/id'
import { counterKeys } from '@/lib/utils/redis-keys'
import { createUserIdentification } from '@/lib/utils/user-identification'
import { createOwnershipManager } from '@/lib/utils/ownership'
import { TTL } from '@/lib/utils/ttl-constants'

export class CounterService {
  private get redis() {
    return getRedis()
  }

  // 公開IDでカウンターデータを取得
  async getCounterById(id: string): Promise<CounterData | null> {
    const metadataStr = await this.redis.get(counterKeys.metadata(id))
    if (!metadataStr) return null
    const metadata: CounterMetadata = JSON.parse(metadataStr)

    const [totalStr, today, yesterday, lastVisitStr] = await Promise.all([
      this.redis.get(counterKeys.total(id)),
      this.getTodayCount(id),
      this.getYesterdayCount(id),
      this.redis.get(counterKeys.lastVisit(id))
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
    const id = await this.redis.get(counterKeys.urlMapping(url))
    if (!id) return null

    const metadataStr = await this.redis.get(counterKeys.metadata(id))
    if (!metadataStr) return null
    const metadata: CounterMetadata = JSON.parse(metadataStr)

    return { id, url: metadata.url }
  }

  // 新規カウンター作成
  async createCounter(url: string, token: string): Promise<{ id: string; counterData: CounterData }> {
    const id = generatePublicId(url)
    const now = new Date()
    const ownershipManager = createOwnershipManager('counter', this.getCounterByUrl.bind(this))
    
    const metadata: CounterMetadata = {
      id,
      url,
      created: now
    }
    
    await Promise.all([
      this.redis.set(counterKeys.metadata(id), JSON.stringify(metadata)),
      this.redis.set(counterKeys.total(id), '0'),
      ownershipManager.set(id, token),
      this.redis.set(counterKeys.urlMapping(url), id)
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
    const metadataStr = await this.redis.get(counterKeys.metadata(id))
    if (!metadataStr) return null
    
    const now = new Date().toISOString()
    const today = now.split('T')[0]
    
    await Promise.all([
      this.redis.incr(counterKeys.total(id)),
      this.redis.incr(counterKeys.daily(id, today)),
      this.redis.set(counterKeys.lastVisit(id), now)
    ])
    
    await this.redis.expire(counterKeys.daily(id, today), TTL.DAILY_STATS)
    
    return await this.getCounterById(id)
  }
  
  // オーナートークンの検証
  async verifyOwnership(url: string, token: string): Promise<boolean> {
    const ownershipManager = createOwnershipManager('counter', this.getCounterByUrl.bind(this))
    return ownershipManager.verify(url, token)
  }
  
  // カウンターの値を設定
  async setCounterValue(url: string, token: string, total: number): Promise<boolean> {
    const isOwner = await this.verifyOwnership(url, token)
    if (!isOwner) return false
    
    const result = await this.getCounterByUrl(url)
    if (!result) return false
    
    await this.redis.set(counterKeys.total(result.id), total.toString())
    return true
  }
  
  // 重複チェック
  async checkDuplicateVisit(id: string, ip: string, userAgent: string): Promise<boolean> {
    const userIdent = createUserIdentification(ip, userAgent)
    const visitHash = userIdent.getDailyHash()
    
    const visitKey = counterKeys.visitCheck(id, visitHash)
    const hasVisited = await this.redis.get(visitKey)
    
    if (hasVisited) {
      return true
    }
    
    await this.redis.setex(visitKey, TTL.DUPLICATE_PREVENTION, '1')
    return false
  }

  // Private methods
  private async getTodayCount(id: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0]
    const count = await this.redis.get(counterKeys.daily(id, today))
    return count ? parseInt(count) : 0
  }

  private async getYesterdayCount(id: string): Promise<number> {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const count = await this.redis.get(counterKeys.daily(id, yesterday))
    return count ? parseInt(count) : 0
  }

  private async getPeriodCount(id: string, days: number): Promise<number> {
    const promises: Promise<number>[] = []
    const now = new Date()
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      promises.push(this.redis.get(counterKeys.daily(id, dateStr)).then(count => count ? parseInt(count) : 0))
    }
    
    const counts = await Promise.all(promises)
    return counts.reduce((sum, count) => sum + count, 0)
  }
}

export const counterService = new CounterService()