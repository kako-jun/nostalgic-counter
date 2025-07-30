import { CounterData, CounterMetadata, DailyCount } from '@/types/counter'
import { kv } from '@vercel/kv'
import { generatePublicId, hashOwnerToken, verifyOwnerToken, generateVisitKey } from './utils'

class CounterDB {

  // 公開IDでカウンターデータを取得
  async getCounterById(id: string): Promise<CounterData | null> {
    const metadata = await kv.get<CounterMetadata>(`counter:${id}`)
    if (!metadata) return null

    const [total, today, yesterday] = await Promise.all([
      kv.get<number>(`counter:${id}:total`) || 0,
      this.getTodayCount(id),
      this.getYesterdayCount(id)
    ])

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
      lastVisit: metadata.created, // 簡易実装
      firstVisit: metadata.created
    }
  }

  // URL+トークンでカウンターを検索
  async getCounterByUrl(url: string): Promise<{ id: string; metadata: CounterMetadata } | null> {
    // URL→ID のマッピングを検索
    const id = await kv.get<string>(`url:${encodeURIComponent(url)}`)
    if (!id) return null

    const metadata = await kv.get<CounterMetadata>(`counter:${id}`)
    if (!metadata) return null

    return { id, metadata }
  }

  // 今日のカウント取得
  private async getTodayCount(id: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0]
    return await kv.get<number>(`counter:${id}:daily:${today}`) || 0
  }

  // 昨日のカウント取得
  private async getYesterdayCount(id: string): Promise<number> {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    return await kv.get<number>(`counter:${id}:daily:${yesterday}`) || 0
  }

  // 期間カウント計算（週間・月間）
  private async getPeriodCount(id: string, days: number): Promise<number> {
    const promises: Promise<number>[] = []
    const now = new Date()
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      promises.push(kv.get<number>(`counter:${id}:daily:${dateStr}`).then(count => count || 0))
    }
    
    const counts = await Promise.all(promises)
    return counts.reduce((sum, count) => sum + count, 0)
  }

  // 新規カウンター作成（URL+トークン）
  async createCounter(url: string, token: string): Promise<{ id: string; counterData: CounterData }> {
    const id = generatePublicId(url)
    const now = new Date()
    const hashedToken = hashOwnerToken(token)
    
    const metadata: CounterMetadata = {
      id,
      url,
      created: now,
      ownerTokenHash: hashedToken
    }
    
    // KVに保存
    await Promise.all([
      kv.set(`counter:${id}`, metadata),
      kv.set(`counter:${id}:total`, 0),
      kv.set(`url:${encodeURIComponent(url)}`, id) // URL→ID マッピング
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

  // カウンターのインクリメント（公開ID）
  async incrementCounterById(id: string): Promise<CounterData | null> {
    const metadata = await kv.get<CounterMetadata>(`counter:${id}`)
    if (!metadata) return null
    
    const today = new Date().toISOString().split('T')[0]
    
    // アトミックにカウントアップ
    const [newTotal, newToday] = await Promise.all([
      kv.incr(`counter:${id}:total`),
      kv.incr(`counter:${id}:daily:${today}`)
    ])
    
    // TTLを設定（日別データは90日で自動削除）
    await kv.expire(`counter:${id}:daily:${today}`, 90 * 24 * 60 * 60)
    
    return await this.getCounterById(id)
  }
  
  // オーナートークンの検証
  async verifyOwnership(url: string, token: string): Promise<boolean> {
    const result = await this.getCounterByUrl(url)
    if (!result) return false
    
    return verifyOwnerToken(token, result.metadata.ownerTokenHash)
  }
  
  // カウンターの値を設定（管理用）
  async setCounterValue(url: string, token: string, total: number): Promise<boolean> {
    const result = await this.getCounterByUrl(url)
    if (!result || !verifyOwnerToken(token, result.metadata.ownerTokenHash)) {
      return false
    }
    
    await kv.set(`counter:${result.id}:total`, total)
    return true
  }
  
  // 重複チェック（24時間以内の同一IP+UserAgent）
  async checkDuplicateVisit(id: string, ip: string, userAgent: string): Promise<boolean> {
    const visitKey = generateVisitKey(id, ip, userAgent)
    const hasVisited = await kv.get(visitKey)
    
    if (hasVisited) {
      return true // 重複
    }
    
    // 24時間のTTLで記録
    await kv.setex(visitKey, 24 * 60 * 60, '1')
    return false // 新規訪問
  }
}

export const counterDB = new CounterDB()