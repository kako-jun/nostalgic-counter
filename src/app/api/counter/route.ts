import { NextRequest, NextResponse } from 'next/server'
import { counterService } from '@/lib/services/counter'
import { getClientIP, getUserAgent } from '@/lib/utils/request'
import { validateURL } from '@/lib/utils/validation'
import { validateOwnerToken } from '@/lib/core/auth'
import { generateCounterSVG } from '@/lib/image-generator'
import { CounterType } from '@/types/counter'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    if (!action) {
      return NextResponse.json({ 
        error: 'action parameter is required' 
      }, { status: 400 })
    }
    
    switch (action) {
      case 'create':
        return handleCreate(request, searchParams)
      
      case 'increment':
        return handleIncrement(request, searchParams)
      
      case 'display':
        return handleDisplay(searchParams)
      
      case 'set':
        return handleSet(searchParams)
      
      default:
        return NextResponse.json({ 
          error: 'Invalid action. Valid actions are: create, increment, display, set' 
        }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Error in counter API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleCreate(request: NextRequest, searchParams: URLSearchParams) {
  const url = searchParams.get('url')
  const token = searchParams.get('token')
  
  if (!url || !token) {
    return NextResponse.json({ 
      error: 'url and token parameters are required for create action' 
    }, { status: 400 })
  }
  
  if (!validateURL(url)) {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
  }
  
  if (!validateOwnerToken(token)) {
    return NextResponse.json({ 
      error: 'Token must be 8-16 characters long' 
    }, { status: 400 })
  }
  
  // 既存カウンターを検索
  const existing = await counterService.getCounterByUrl(url)
  
  if (existing) {
    // 既存カウンター：オーナー確認
    if (!await counterService.verifyOwnership(url, token)) {
      return NextResponse.json({ error: 'Invalid token for this URL' }, { status: 403 })
    }
    
    return NextResponse.json({
      id: existing.id,
      url: existing.url,
      message: 'Counter already exists'
    })
  }
  
  // 新規作成
  const { id: newId, counterData } = await counterService.createCounter(url, token)
  
  // 最初の訪問として記録
  const clientIP = getClientIP(request)
  const userAgent = getUserAgent(request)
  await counterService.checkDuplicateVisit(newId, clientIP, userAgent)
  
  return NextResponse.json({ 
    ...counterData,
    message: 'Counter created successfully'
  })
}

async function handleIncrement(request: NextRequest, searchParams: URLSearchParams) {
  const id = searchParams.get('id')
  
  if (!id) {
    return NextResponse.json({ 
      error: 'id parameter is required for increment action' 
    }, { status: 400 })
  }
  
  const clientIP = getClientIP(request)
  const userAgent = getUserAgent(request)
  
  // 重複チェック
  const isDuplicate = await counterService.checkDuplicateVisit(id, clientIP, userAgent)
  if (isDuplicate) {
    // 重複の場合は現在値を返す
    const counterData = await counterService.getCounterById(id)
    if (!counterData) {
      return NextResponse.json({ error: 'Counter not found' }, { status: 404 })
    }
    return NextResponse.json(counterData)
  }
  
  // カウントアップ
  const counterData = await counterService.incrementCounterById(id)
  if (!counterData) {
    return NextResponse.json({ error: 'Counter not found' }, { status: 404 })
  }
  
  return NextResponse.json(counterData)
}

async function handleDisplay(searchParams: URLSearchParams) {
  const id = searchParams.get('id')
  const type = (searchParams.get('type') || 'total') as CounterType
  const theme = searchParams.get('theme') || searchParams.get('style') || 'classic'
  const digits = parseInt(searchParams.get('digits') || '6')
  const format = searchParams.get('format') || 'image'
  
  if (!id) {
    return NextResponse.json({ error: 'id parameter is required' }, { status: 400 })
  }
  
  if (!['total', 'today', 'yesterday', 'week', 'month'].includes(type)) {
    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
  }
  
  if (!['classic', 'modern', 'retro'].includes(theme)) {
    return NextResponse.json({ error: 'Invalid theme parameter' }, { status: 400 })
  }
  
  // カウンターデータを取得
  const counterData = await counterService.getCounterById(id)
  
  if (!counterData) {
    // カウンターが存在しない場合
    if (format === 'text') {
      return new NextResponse('0', {
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'public, max-age=60',
        },
      })
    }
    
    const svg = generateCounterSVG({
      value: 0,
      type,
      style: theme as 'classic' | 'modern' | 'retro',
      digits
    })
    
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=60',
      },
    })
  }
  
  // 指定されたタイプの値を取得
  const value = counterData[type]
  
  // フォーマットに応じてレスポンス
  if (format === 'text') {
    return new NextResponse(value.toString(), {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=60',
      },
    })
  }
  
  // SVG画像を生成
  const svg = generateCounterSVG({
    value,
    type,
    style: theme as 'classic' | 'modern' | 'retro',
    digits
  })
  
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=60',
    },
  })
}

async function handleSet(searchParams: URLSearchParams) {
  const url = searchParams.get('url')
  const token = searchParams.get('token')
  const total = parseInt(searchParams.get('total') || '0')
  
  if (!url || !token) {
    return NextResponse.json({ 
      error: 'url and token parameters are required for set action' 
    }, { status: 400 })
  }
  
  if (!validateURL(url)) {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
  }
  
  const success = await counterService.setCounterValue(url, token, total)
  
  if (!success) {
    return NextResponse.json({ 
      error: 'Invalid token or counter not found' 
    }, { status: 403 })
  }
  
  return NextResponse.json({
    success: true,
    message: `Counter for ${url} has been set to ${total}`
  })
}

export async function POST(request: NextRequest) {
  return GET(request)
}