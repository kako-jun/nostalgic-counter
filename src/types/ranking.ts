export interface RankingEntry {
  name: string
  score: number
  rank: number
  timestamp: Date
}

export interface RankingData {
  id: string
  url: string
  entries: RankingEntry[]
  totalEntries: number
}

export interface RankingMetadata {
  id: string
  url: string
  created: Date
  maxEntries: number // ランキングに保持する最大エントリー数
}