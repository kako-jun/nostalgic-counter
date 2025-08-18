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
import { LIKE_LIMITS, CACHE_SETTINGS } from '@/lib/utils/service-constants'
import {
  CreateParamsSchema,
  LikeToggleParamsSchema,
  LikeDisplayParamsSchema,
  LikeSetParamsSchema,
  LikeType
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
    
    return createApiSuccessResponse({
      id: existing.id,
      url: existing.url
    }, 'Like already exists')
  }
  
  // 新規作成
  const { id: newId, likeData } = await likeService.createLike(url, token)
  
  return createApiSuccessResponse(likeData, 'Like created successfully')
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
  
  return createApiSuccessResponse(likeData)
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
      return new NextResponse('0', {
        headers: {
          'Content-Type': CACHE_SETTINGS.CONTENT_TYPES.TEXT,
          'Cache-Control': `public, max-age=${CACHE_SETTINGS.DISPLAY_MAX_AGE}`,
        },
      })
    }
    
    const svg = generateCounterSVG({
      value: 0,
      type: 'total',
      style: theme,
      digits
    })
    
    return new NextResponse(svg, {
      headers: {
        'Content-Type': CACHE_SETTINGS.CONTENT_TYPES.SVG,
        'Cache-Control': `public, max-age=${CACHE_SETTINGS.DISPLAY_MAX_AGE}`,
      },
    })
  }
  
  // フォーマットに応じてレスポンス
  if (format === 'text') {
    return new NextResponse(likeData.total.toString(), {
      headers: {
        'Content-Type': CACHE_SETTINGS.CONTENT_TYPES.TEXT,
        'Cache-Control': `public, max-age=${CACHE_SETTINGS.DISPLAY_MAX_AGE}`,
      },
    })
  }
  
  if (format === 'json') {
    return NextResponse.json(likeData)
  }
  
  // SVG画像を生成（いいねアイコン付き）
  const svg = generateLikeSVG({
    value: likeData.total,
    userLiked: likeData.userLiked,
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
  const validation = validateApiParams(LikeSetParamsSchema, searchParams)
  if (!validation.success) {
    return validation.response
  }
  
  const { url, token, total } = validation.data
  
  const success = await likeService.setLikeValue(url, token, total)
  
  if (!success) {
    return createApiErrorResponse('Invalid token or like not found', 403)
  }
  
  return createApiSuccessResponse(
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