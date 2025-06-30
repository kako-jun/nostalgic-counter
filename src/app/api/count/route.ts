import { NextRequest, NextResponse } from 'next/server'
import { counterDB } from '@/lib/db'
import { getClientIP, getUserAgent, validateURL, generateCounterKey } from '@/lib/utils'

// 重複訪問防止用のメモリキャッシュ（本番環境ではRedisなどを使用）
const visitCache = new Map<string, number>()
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24時間

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    
    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
    }
    
    if (!validateURL(url)) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }
    
    const clientIP = getClientIP(request)
    const userAgent = getUserAgent(request)
    const cacheKey = generateCounterKey(url, clientIP, userAgent)
    
    // 重複訪問チェック
    const now = Date.now()
    const lastVisit = visitCache.get(cacheKey)
    
    if (lastVisit && (now - lastVisit) < CACHE_DURATION) {
      // 24時間以内の重複訪問は無視
      const existingData = await counterDB.getCounter(url)
      return NextResponse.json(existingData || { url, total: 0, today: 0, yesterday: 0, week: 0, month: 0 })
    }
    
    // カウンターをインクリメント
    const counterData = await counterDB.incrementCounter(url)
    
    // 訪問キャッシュを更新
    visitCache.set(cacheKey, now)
    
    // 古いキャッシュエントリを定期的にクリーンアップ
    if (Math.random() < 0.01) { // 1%の確率でクリーンアップ
      const cutoff = now - CACHE_DURATION
      for (const [key, timestamp] of visitCache.entries()) {
        if (timestamp < cutoff) {
          visitCache.delete(key)
        }
      }
    }
    
    return NextResponse.json(counterData)
    
  } catch (error) {
    console.error('Error in count API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return GET(request) // POST も GET と同じ処理
}