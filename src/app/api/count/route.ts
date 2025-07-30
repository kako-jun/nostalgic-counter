import { NextRequest, NextResponse } from 'next/server'
import { counterDB } from '@/lib/db'
import { getClientIP, getUserAgent, validateURL, validateOwnerToken } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    const token = searchParams.get('token')
    const id = searchParams.get('id')
    
    const clientIP = getClientIP(request)
    const userAgent = getUserAgent(request)
    
    // パターン1: URL+トークン（新規作成・ID取得）
    if (url && token) {
      if (!validateURL(url)) {
        return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
      }
      
      if (!validateOwnerToken(token)) {
        return NextResponse.json({ 
          error: 'Token must be 8-16 characters long' 
        }, { status: 400 })
      }
      
      // 既存カウンターを検索
      const existing = await counterDB.getCounterByUrl(url)
      
      if (existing) {
        // 既存カウンター：オーナー確認してカウントアップ
        if (!await counterDB.verifyOwnership(url, token)) {
          return NextResponse.json({ error: 'Invalid token for this URL' }, { status: 403 })
        }
        
        // 重複チェック
        const isDuplicate = await counterDB.checkDuplicateVisit(existing.id, clientIP, userAgent)
        if (isDuplicate) {
          // 重複の場合は現在値を返す（カウントアップしない）
          const counterData = await counterDB.getCounterById(existing.id)
          return NextResponse.json({ ...counterData, id: existing.id })
        }
        
        // カウントアップ
        const counterData = await counterDB.incrementCounterById(existing.id)
        return NextResponse.json({ ...counterData, id: existing.id })
      } else {
        // 新規作成
        const { id: newId, counterData } = await counterDB.createCounter(url, token)
        
        // 最初の訪問として記録
        await counterDB.checkDuplicateVisit(newId, clientIP, userAgent)
        
        return NextResponse.json({ ...counterData, id: newId })
      }
    }
    
    // パターン2: 公開ID（通常のカウントアップ）
    if (id) {
      // 重複チェック
      const isDuplicate = await counterDB.checkDuplicateVisit(id, clientIP, userAgent)
      if (isDuplicate) {
        // 重複の場合は現在値を返す
        const counterData = await counterDB.getCounterById(id)
        return NextResponse.json(counterData || { error: 'Counter not found' })
      }
      
      // カウントアップ
      const counterData = await counterDB.incrementCounterById(id)
      if (!counterData) {
        return NextResponse.json({ error: 'Counter not found' }, { status: 404 })
      }
      
      return NextResponse.json(counterData)
    }
    
    return NextResponse.json({ 
      error: 'Either url+token or id parameter is required' 
    }, { status: 400 })
    
  } catch (error) {
    console.error('Error in count API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return GET(request) // POST も GET と同じ処理
}