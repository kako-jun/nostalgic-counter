import { NextRequest, NextResponse } from 'next/server'
import { counterService } from '@/lib/services/counter'
import { generateCounterSVG } from '@/lib/image-generator'
import { CounterType } from '@/types/counter'
import { 
  validateAction,
  validateCreateParams,
  createApiSuccessResponse,
  createApiErrorResponse,
  handleApiError,
  createOptionsResponse,
  getClientIP,
  getUserAgent
} from '@/lib/utils/api'
import { COUNTER_LIMITS, CACHE_SETTINGS } from '@/lib/utils/service-constants'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    const validActions = ['create', 'increment', 'display', 'set']
    const actionValidation = validateAction(action, validActions)
    if (!actionValidation.isValid) {
      return createApiErrorResponse(actionValidation.error!, 400)
    }
    
    switch (action) {
      case 'create':
        return await handleCreate(request, searchParams)
      
      case 'increment':
        return await handleIncrement(request, searchParams)
      
      case 'display':
        return await handleDisplay(searchParams)
      
      case 'set':
        return await handleSet(searchParams)
      
      default:
        return createApiErrorResponse('Invalid action', 400)
    }
    
  } catch (error) {
    return handleApiError(error, 'counter')
  }
}

export async function OPTIONS() {
  return createOptionsResponse()
}

async function handleCreate(request: NextRequest, searchParams: URLSearchParams) {
  const validation = validateCreateParams(searchParams)
  if (!validation.isValid) {
    return createApiErrorResponse(validation.error!, 400)
  }
  
  const { url, token } = validation.params!
  
  // 既存カウンターを検索
  const existing = await counterService.getCounterByUrl(url)
  
  if (existing) {
    // 既存カウンター：オーナー確認
    if (!await counterService.verifyOwnership(url, token)) {
      return createApiErrorResponse('Invalid token for this URL', 403)
    }
    
    return createApiSuccessResponse({
      id: existing.id,
      url: existing.url
    }, 'Counter already exists')
  }
  
  // 新規作成
  const { id: newId, counterData } = await counterService.createCounter(url, token)
  
  // 最初の訪問として記録
  const clientIP = getClientIP(request)
  const userAgent = getUserAgent(request)
  await counterService.checkDuplicateVisit(newId, clientIP, userAgent)
  
  return createApiSuccessResponse(counterData, 'Counter created successfully')
}

async function handleIncrement(request: NextRequest, searchParams: URLSearchParams) {
  const id = searchParams.get('id')
  
  if (!id) {
    return createApiErrorResponse('id parameter is required for increment action', 400)
  }
  
  const clientIP = getClientIP(request)
  const userAgent = getUserAgent(request)
  
  // 重複チェック
  const isDuplicate = await counterService.checkDuplicateVisit(id, clientIP, userAgent)
  if (isDuplicate) {
    // 重複の場合は現在値を返す
    const counterData = await counterService.getCounterById(id)
    if (!counterData) {
      return createApiErrorResponse('Counter not found', 404)
    }
    return createApiSuccessResponse(counterData)
  }
  
  // カウントアップ
  const counterData = await counterService.incrementCounterById(id)
  if (!counterData) {
    return createApiErrorResponse('Counter not found', 404)
  }
  
  return createApiSuccessResponse(counterData)
}

async function handleDisplay(searchParams: URLSearchParams) {
  const id = searchParams.get('id')
  const type = (searchParams.get('type') || 'total') as CounterType
  const theme = searchParams.get('theme') || searchParams.get('style') || COUNTER_LIMITS.DEFAULT_THEME
  const digits = parseInt(searchParams.get('digits') || COUNTER_LIMITS.DEFAULT_DIGITS.toString())
  const format = searchParams.get('format') || COUNTER_LIMITS.DEFAULT_FORMAT
  
  if (!id) {
    return NextResponse.json({ error: 'id parameter is required' }, { status: 400 })
  }
  
  if (!['total', 'today', 'yesterday', 'week', 'month'].includes(type)) {
    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
  }
  
  if (!COUNTER_LIMITS.THEMES.includes(theme as any)) {
    return NextResponse.json({ error: 'Invalid theme parameter' }, { status: 400 })
  }
  
  // カウンターデータを取得
  const counterData = await counterService.getCounterById(id)
  
  if (!counterData) {
    // カウンターが存在しない場合
    if (format === 'text') {
      return new NextResponse('0', {
        headers: {
          'Content-Type': CACHE_SETTINGS.CONTENT_TYPES.TEXT,
          'Cache-Control': `public, max-age=${CACHE_SETTINGS.DISPLAY_MAX_AGE}`,
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
        'Content-Type': CACHE_SETTINGS.CONTENT_TYPES.SVG,
        'Cache-Control': `public, max-age=${CACHE_SETTINGS.DISPLAY_MAX_AGE}`,
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
      'Content-Type': CACHE_SETTINGS.CONTENT_TYPES.SVG,
      'Cache-Control': `public, max-age=${CACHE_SETTINGS.DISPLAY_MAX_AGE}`,
    },
  })
}

async function handleSet(searchParams: URLSearchParams) {
  const validation = validateCreateParams(searchParams)
  if (!validation.isValid) {
    return createApiErrorResponse(validation.error!, 400)
  }
  
  const { url, token } = validation.params!
  const total = parseInt(searchParams.get('total') || '0')
  
  const success = await counterService.setCounterValue(url, token, total)
  
  if (!success) {
    return createApiErrorResponse('Invalid token or counter not found', 403)
  }
  
  return createApiSuccessResponse(
    { success: true },
    `Counter for ${url} has been set to ${total}`
  )
}

export async function POST(request: NextRequest) {
  return GET(request)
}