import { NextRequest, NextResponse } from 'next/server'
import { likeService } from '@/lib/services/like'
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
import { LIKE_LIMITS, CACHE_SETTINGS } from '@/lib/utils/service-constants'
import {
  CreateParamsSchema,
  LikeToggleParamsSchema,
  LikeDisplayParamsSchema,
  LikeSetParamsSchema,
  LikeType,
  LikeDataSchema
} from '@/lib/validation/schemas'
import { validateApiParams } from '@/lib/utils/api-validation'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    const validActions = ['create', 'toggle', 'display', 'set']
    const actionValidation = validateAction(action, validActions)
    if (!actionValidation.isValid) {
      return createApiErrorResponse(actionValidation.error!, 400)
    }
    
    switch (action) {
      case 'create':
        return await handleCreate(request, searchParams)
      
      case 'toggle':
        return await handleToggle(request, searchParams)
      
      case 'display':
        return await handleDisplay(request, searchParams)
      
      case 'set':
        return await handleSet(searchParams)
      
      default:
        return createApiErrorResponse('Invalid action', 400)
    }
    
  } catch (error) {
    return handleApiError(error, 'like')
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
  
  // 既存いいねを検索
  const existing = await likeService.getLikeByUrl(url)
  
  if (existing) {
    // 既存いいね：オーナー確認
    if (!await likeService.verifyOwnership(url, token)) {
      return createApiErrorResponse('Invalid token for this URL', 403)
    }
    
    return createValidatedApiResponse(
      z.object({ id: z.string(), url: z.string() }),
      { id: existing.id, url: existing.url },
      'Like already exists'
    )
  }
  
  // 新規作成
  const { id: newId, likeData } = await likeService.createLike(url, token)
  
  return createValidatedApiResponse(
    LikeDataSchema,
    likeData,
    'Like created successfully'
  )
}

async function handleToggle(request: NextRequest, searchParams: URLSearchParams) {
  // toggleアクションは実際にはurl/tokenを必要とします
  const validation = validateApiParams(LikeToggleParamsSchema, searchParams)
  if (!validation.success) {
    return validation.response
  }
  
  const { url, token } = validation.data
  
  // オーナー確認
  if (!await likeService.verifyOwnership(url, token)) {
    return createApiErrorResponse('Invalid token for this URL', 403)
  }
  
  // Like取得
  const like = await likeService.getLikeByUrl(url)
  if (!like) {
    return createApiErrorResponse('Like not found', 404)
  }
  
  const clientIP = getClientIP(request)
  const userAgent = getUserAgent(request)
  const userHash = likeService.generateUserHash(clientIP, userAgent)
  
  // いいねの切り替え
  const likeData = await likeService.toggleLike(like.id, userHash)
  if (!likeData) {
    return createApiErrorResponse('Failed to toggle like', 500)
  }
  
  return createValidatedApiResponse(
    LikeDataSchema,
    likeData
  )
}

async function handleDisplay(request: NextRequest, searchParams: URLSearchParams) {
  const validation = validateApiParams(LikeDisplayParamsSchema, searchParams)
  if (!validation.success) {
    return validation.response
  }
  
  const { id, theme, digits, format } = validation.data
  
  const clientIP = getClientIP(request)
  const userAgent = getUserAgent(request)
  const userHash = likeService.generateUserHash(clientIP, userAgent)
  
  // いいねデータを取得
  const likeData = await likeService.getLikeById(id, userHash)
  
  if (!likeData) {
    // いいねが存在しない場合
    if (format === 'text') {
      return createValidatedSpecialResponse(
        z.number().int().min(0),
        0,
        (val) => val.toString(),
        CACHE_SETTINGS.CONTENT_TYPES.TEXT,
        `public, max-age=${CACHE_SETTINGS.DISPLAY_MAX_AGE}`
      )
    }
    
    const displayData = { value: 0, type: 'total', theme, digits }
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
  
  // フォーマットに応じてレスポンス
  if (format === 'text') {
    return createValidatedSpecialResponse(
      z.number().int().min(0),
      likeData.total,
      (val) => val.toString(),
      CACHE_SETTINGS.CONTENT_TYPES.TEXT,
      `public, max-age=${CACHE_SETTINGS.DISPLAY_MAX_AGE}`
    )
  }
  
  if (format === 'json') {
    return createValidatedApiResponse(
      LikeDataSchema,
      likeData
    )
  }
  
  // SVG画像を生成（いいねアイコン付き）
  const likeDisplayData = {
    value: likeData.total,
    userLiked: likeData.userLiked,
    theme,
    digits
  }
  
  return createValidatedSpecialResponse(
    z.object({
      value: z.number().int().min(0),
      userLiked: z.boolean(),
      theme: z.enum(['classic', 'modern', 'retro']),
      digits: z.number().int().min(1).max(10)
    }),
    likeDisplayData,
    (data) => generateLikeSVG({
      value: data.value,
      userLiked: data.userLiked,
      style: data.theme,
      digits: data.digits
    }),
    CACHE_SETTINGS.CONTENT_TYPES.SVG,
    `public, max-age=${CACHE_SETTINGS.DISPLAY_MAX_AGE}`
  )
}

async function handleSet(searchParams: URLSearchParams) {
  const validation = validateApiParams(LikeSetParamsSchema, searchParams)
  if (!validation.success) {
    return validation.response
  }
  
  const { url, token, total } = validation.data
  
  const success = await likeService.setLikeValue(url, token, total)
  
  if (!success) {
    return createApiErrorResponse('Invalid token or like not found', 403)
  }
  
  return createValidatedApiResponse(
    z.object({ success: z.literal(true) }),
    { success: true },
    `Like for ${url} has been set to ${total}`
  )
}

// いいね専用のSVG生成関数
function generateLikeSVG({
  value,
  userLiked,
  style,
  digits
}: {
  value: number
  userLiked: boolean
  style: 'classic' | 'modern' | 'retro'
  digits: number
}) {
  const heartColor = userLiked ? '#ff4757' : '#ddd'
  const heartIcon = userLiked ? '♥' : '♡'
  
  // 基本のカウンターSVGを取得して、ハートアイコンを追加
  const baseSvg = generateCounterSVG({
    value,
    type: 'total',
    style,
    digits
  })
  
  // SVGにハートアイコンを追加
  const modifiedSvg = baseSvg.replace(
    '</svg>',
    `<text x="10" y="15" fill="${heartColor}" font-size="12" font-family="Arial">${heartIcon}</text></svg>`
  )
  
  return modifiedSvg
}

export async function POST(request: NextRequest) {
  return GET(request)
}