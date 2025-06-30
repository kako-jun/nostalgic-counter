import { CounterData, DailyCount } from '@/types/counter'

// Vercel KVを使用する場合は、@vercel/kvをインストールして使用
// 開発環境では、メモリ内ストレージを使用
class CounterDB {
  private data: Map<string, CounterData> = new Map()
  private dailyCounts: Map<string, DailyCount[]> = new Map()

  async getCounter(url: string): Promise<CounterData | null> {
    // 本番環境ではVercel KVから取得
    // 開発環境ではメモリから取得
    return this.data.get(url) || null
  }

  async setCounter(url: string, data: CounterData): Promise<void> {
    // 本番環境ではVercel KVに保存
    // 開発環境ではメモリに保存
    this.data.set(url, data)
  }

  async getDailyCounts(url: string): Promise<DailyCount[]> {
    return this.dailyCounts.get(url) || []
  }

  async setDailyCounts(url: string, counts: DailyCount[]): Promise<void> {
    this.dailyCounts.set(url, counts)
  }

  async incrementCounter(url: string): Promise<CounterData> {
    const existing = await this.getCounter(url)
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    
    if (!existing) {
      // 新規カウンター
      const newData: CounterData = {
        url,
        total: 1,
        today: 1,
        yesterday: 0,
        week: 1,
        month: 1,
        lastVisit: now,
        firstVisit: now
      }
      
      await this.setCounter(url, newData)
      await this.setDailyCounts(url, [{ date: today, count: 1 }])
      
      return newData
    }

    // 既存カウンターの更新
    const lastVisitDate = existing.lastVisit.toISOString().split('T')[0]
    const dailyCounts = await this.getDailyCounts(url)
    
    // 日付が変わっている場合の処理
    if (lastVisitDate !== today) {
      // 昨日のカウントを更新
      existing.yesterday = existing.today
      existing.today = 1
    } else {
      existing.today++
    }
    
    existing.total++
    existing.lastVisit = now
    
    // 週間・月間カウントの計算
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    existing.week = this.calculatePeriodCount(dailyCounts, weekAgo)
    existing.month = this.calculatePeriodCount(dailyCounts, monthAgo)
    
    // 日別カウントの更新
    const todayCount = dailyCounts.find(d => d.date === today)
    if (todayCount) {
      todayCount.count++
    } else {
      dailyCounts.push({ date: today, count: 1 })
    }
    
    await this.setCounter(url, existing)
    await this.setDailyCounts(url, dailyCounts)
    
    return existing
  }

  private calculatePeriodCount(dailyCounts: DailyCount[], fromDate: Date): number {
    const fromDateStr = fromDate.toISOString().split('T')[0]
    return dailyCounts
      .filter(d => d.date >= fromDateStr)
      .reduce((sum, d) => sum + d.count, 0)
  }

  async resetCounter(url: string, startValue: number = 0): Promise<void> {
    const existing = await this.getCounter(url)
    if (existing) {
      existing.total = startValue
      existing.today = 0
      existing.yesterday = 0
      existing.week = 0
      existing.month = 0
      await this.setCounter(url, existing)
      await this.setDailyCounts(url, [])
    }
  }
}

export const counterDB = new CounterDB()