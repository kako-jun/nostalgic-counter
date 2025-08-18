import { NextRequest, NextResponse } from 'next/server'
import { counterService } from '@/lib/services/counter'
import { generateCounterSVG } from '@/lib/image-generator'
import { 
  validateAction,
  createApiSuccessResponse,
  createApiErrorResponse,
  handleApiError,
  createOptionsResponse,
  getClientIP,
  getUserAgent
} from '@/lib/utils/api'
import { 
  createValidatedApiResponse,
  createValidatedSpecialResponse,
  DisplayDataSchema
} from '@/lib/validation/response-validation'
import { z } from 'zod'
import { COUNTER_LIMITS, CACHE_SETTINGS } from '@/lib/utils/service-constants'
import {
  CreateParamsSchema,
  CounterIncrementParamsSchema,
  CounterDisplayParamsSchema,
  CounterSetParamsSchema,
  CounterDataSchema
} from '@/lib/validation/schemas'
import { CounterType } from '@/types/counter'
import { validateApiParams } from '@/lib/utils/api-validation'

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
  const validation = validateApiParams(CreateParamsSchema, searchParams)
  if (!validation.success) {
    return validation.response
  }
  
  const { url, token } = validation.data
  
  // 既存カウンターを検索
  const existing = await counterService.getCounterByUrl(url)
  
  if (existing) {
    // 既存カウンター：オーナー確認
    if (!await counterService.verifyOwnership(url, token)) {
      return createApiErrorResponse('Invalid token for this URL', 403)
    }
    
    return createValidatedApiResponse(
      z.object({ id: z.string(), url: z.string() }),
      { id: existing.id, url: existing.url },
      'Counter already exists'
    )
  }
  
  // 新規作成
  const { id: newId, counterData } = await counterService.createCounter(url, token)
  
  // 最初の訪問として記録
  const clientIP = getClientIP(request)
  const userAgent = getUserAgent(request)
  await counterService.checkDuplicateVisit(newId, clientIP, userAgent)
  
  return createValidatedApiResponse(
    CounterDataSchema,
    counterData,
    'Counter created successfully'
  )
}

async function handleIncrement(request: NextRequest, searchParams: URLSearchParams) {
  const validation = validateApiParams(CounterIncrementParamsSchema, searchParams)
  if (!validation.success) {
    return validation.response
  }
  
  const { id } = validation.data
  
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
    return createValidatedApiResponse(
      CounterDataSchema,
      counterData
    )
  }
  
  // カウントアップ
  const counterData = await counterService.incrementCounterById(id)
  if (!counterData) {
    return createApiErrorResponse('Counter not found', 404)
  }
  
  return createValidatedApiResponse(
    CounterDataSchema,
    counterData
  )
}

async function handleDisplay(searchParams: URLSearchParams) {
  const validation = validateApiParams(CounterDisplayParamsSchema, searchParams)
  if (!validation.success) {
    return validation.response
  }
  
  const { id, type, theme, digits, format } = validation.data
  const counterType = type
  
  // カウンターデータを取得
  const counterData = await counterService.getCounterById(id)
  
  if (!counterData) {
    // カウンターが存在しない場合
    if (format === 'text') {
      return createValidatedSpecialResponse(
        z.number().int().min(0),
        0,
        (val) => val.toString(),
        CACHE_SETTINGS.CONTENT_TYPES.TEXT,
        `public, max-age=${CACHE_SETTINGS.DISPLAY_MAX_AGE}`
      )
    }
    
    const displayData = { value: 0, type: counterType, theme, digits }
    return createValidatedSpecialResponse(
      DisplayDataSchema,
      displayData,
      (data) => generateCounterSVG({
        value: data.value,
        type: data.type,
        style: data.theme,
        digits: data.digits
      }),
      CACHE_SETTINGS.CONTENT_TYPES.SVG,
      `public, max-age=${CACHE_SETTINGS.DISPLAY_MAX_AGE}`
    )
  }
  
  // 指定されたタイプの値を取得
  const value = counterData[counterType]
  
  // フォーマットに応じてレスポンス
  if (format === 'text') {
    return createValidatedSpecialResponse(
      z.number().int().min(0),
      value,
      (val) => val.toString(),
      'text/plain',
      'public, max-age=60'
    )
  }
  
  // SVG画像を生成用のデータ検証
  const displayData = { value, type: counterType, theme, digits }
  return createValidatedSpecialResponse(
    DisplayDataSchema,
    displayData,
    (data) => generateCounterSVG({
      value: data.value,
      type: data.type,
      style: data.theme,
      digits: data.digits
    }),
    CACHE_SETTINGS.CONTENT_TYPES.SVG,
    `public, max-age=${CACHE_SETTINGS.DISPLAY_MAX_AGE}`
  )
}

async function handleSet(searchParams: URLSearchParams) {
  const validation = validateApiParams(CounterSetParamsSchema, searchParams)
  if (!validation.success) {
    return validation.response
  }
  
  const { url, token, total } = validation.data
  
  const success = await counterService.setCounterValue(url, token, total)
  
  if (!success) {
    return createApiErrorResponse('Invalid token or counter not found', 403)
  }
  
  return createValidatedApiResponse(
    z.object({ success: z.literal(true) }),
    { success: true },
    `Counter for ${url} has been set to ${total}`
  )
}

export async function POST(request: NextRequest) {
  return GET(request)
}