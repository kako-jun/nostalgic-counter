import { NextRequest, NextResponse } from 'next/server'
import { counterDB } from '@/lib/db'
import { validateURL, isValidAdminToken } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const token = searchParams.get('token')
    const url = searchParams.get('url')
    
    // 管理者トークンの検証
    if (!token || !isValidAdminToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (!action) {
      return NextResponse.json({ error: 'Action parameter is required' }, { status: 400 })
    }
    
    switch (action) {
      case 'reset':
        if (!url) {
          return NextResponse.json({ error: 'URL parameter is required for reset' }, { status: 400 })
        }
        
        if (!validateURL(url)) {
          return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
        }
        
        const startValue = parseInt(searchParams.get('start') || '0')
        await counterDB.resetCounter(url, startValue)
        
        return NextResponse.json({ 
          success: true, 
          message: `Counter for ${url} has been reset to ${startValue}` 
        })
      
      case 'get':
        if (!url) {
          return NextResponse.json({ error: 'URL parameter is required for get' }, { status: 400 })
        }
        
        if (!validateURL(url)) {
          return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
        }
        
        const counterData = await counterDB.getCounter(url)
        
        return NextResponse.json({
          success: true,
          data: counterData || { url, total: 0, today: 0, yesterday: 0, week: 0, month: 0 }
        })
      
      case 'set':
        if (!url) {
          return NextResponse.json({ error: 'URL parameter is required for set' }, { status: 400 })
        }
        
        if (!validateURL(url)) {
          return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
        }
        
        const total = parseInt(searchParams.get('total') || '0')
        const today = parseInt(searchParams.get('today') || '0')
        const yesterday = parseInt(searchParams.get('yesterday') || '0')
        const week = parseInt(searchParams.get('week') || '0')
        const month = parseInt(searchParams.get('month') || '0')
        
        const now = new Date()
        const newData = {
          url,
          total,
          today,
          yesterday,
          week,
          month,
          lastVisit: now,
          firstVisit: now
        }
        
        await counterDB.setCounter(url, newData)
        
        return NextResponse.json({
          success: true,
          message: `Counter for ${url} has been updated`,
          data: newData
        })
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Error in admin API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 管理者用の情報取得（GET）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    // 管理者トークンの検証
    if (!token || !isValidAdminToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Admin API is working',
      actions: [
        'reset - カウンターをリセット (POST ?action=reset&token=xxx&url=xxx&start=0)',
        'get - カウンター情報を取得 (POST ?action=get&token=xxx&url=xxx)',
        'set - カウンター値を設定 (POST ?action=set&token=xxx&url=xxx&total=xxx&today=xxx&yesterday=xxx&week=xxx&month=xxx)'
      ]
    })
    
  } catch (error) {
    console.error('Error in admin API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}