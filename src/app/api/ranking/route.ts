import { NextRequest, NextResponse } from 'next/server'
import { rankingService } from '@/lib/services/ranking'
import { 
  validateAction,
  validateCreateParams,
  validateURL,
  validateOwnerToken,
  createApiSuccessResponse,
  createApiErrorResponse,
  handleApiError,
  createOptionsResponse
} from '@/lib/utils/api'
import { RANKING_LIMITS } from '@/lib/utils/service-constants'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    const validActions = ['create', 'submit', 'get', 'clear', 'remove', 'update']
    const actionValidation = validateAction(action, validActions)
    if (!actionValidation.isValid) {
      return createApiErrorResponse(actionValidation.error!, 400)
    }
    
    switch (action) {
      case 'create':
        return await handleCreate(searchParams)
      
      case 'submit':
        return await handleSubmit(searchParams)
      
      case 'get':
        return await handleGet(searchParams)
      
      case 'clear':
        return await handleClear(searchParams)
      
      case 'remove':
        return await handleRemove(searchParams)
      
      case 'update':
        return await handleUpdate(searchParams)
      
      default:
        return createApiErrorResponse('Invalid action', 400)
    }
    
  } catch (error) {
    return handleApiError(error, 'ranking')
  }
}

export async function OPTIONS() {
  return createOptionsResponse()
}

async function handleCreate(searchParams: URLSearchParams) {
  const validation = validateCreateParams(searchParams)
  if (!validation.isValid) {
    return createApiErrorResponse(validation.error!, 400)
  }
  
  const { url, token } = validation.params!
  const maxEntries = parseInt(searchParams.get('max') || RANKING_LIMITS.DEFAULT_MAX_ENTRIES.toString())
  
  if (maxEntries < RANKING_LIMITS.MIN_ENTRIES || maxEntries > RANKING_LIMITS.MAX_ENTRIES_LIMIT) {
    return createApiErrorResponse(`max parameter must be between ${RANKING_LIMITS.MIN_ENTRIES} and ${RANKING_LIMITS.MAX_ENTRIES_LIMIT}`, 400)
  }
  
  // 既存ランキングを検索
  const existing = await rankingService.getRankingByUrl(url)
  
  if (existing) {
    // 既存ランキング：オーナー確認
    if (!await rankingService.verifyOwnership(url, token)) {
      return createApiErrorResponse('Invalid token for this URL', 403)
    }
    
    return createApiSuccessResponse({
      id: existing.id,
      url: existing.url
    }, 'Ranking already exists')
  }
  
  // 新規作成
  const { id: newId, rankingData } = await rankingService.createRanking(url, token, maxEntries)
  
  return createApiSuccessResponse(rankingData, 'Ranking created successfully')
}

async function handleSubmit(searchParams: URLSearchParams) {
  const url = searchParams.get('url')
  const token = searchParams.get('token')
  const name = searchParams.get('name')
  const score = parseInt(searchParams.get('score') || '0')
  
  if (!url || !token || !name) {
    return createApiErrorResponse('url, token, and name parameters are required for submit action', 400)
  }
  
  if (!validateURL(url)) {
    return createApiErrorResponse('Invalid URL format', 400)
  }
  
  if (!validateOwnerToken(token)) {
    return createApiErrorResponse('Token must be 8-16 characters long', 400)
  }
  
  if (name.length > RANKING_LIMITS.MAX_NAME_LENGTH) {
    return createApiErrorResponse(`Name must be ${RANKING_LIMITS.MAX_NAME_LENGTH} characters or less`, 400)
  }
  
  // オーナー確認
  if (!await rankingService.verifyOwnership(url, token)) {
    return createApiErrorResponse('Invalid token for this URL', 403)
  }
  
  // ランキング取得
  const ranking = await rankingService.getRankingByUrl(url)
  if (!ranking) {
    return createApiErrorResponse('Ranking not found', 404)
  }
  
  // スコア送信
  const rankingData = await rankingService.submitScore(ranking.id, name, score)
  if (!rankingData) {
    return createApiErrorResponse('Failed to submit score', 500)
  }
  
  return createApiSuccessResponse(rankingData, 'Score submitted successfully')
}

async function handleGet(searchParams: URLSearchParams) {
  const id = searchParams.get('id')
  const limit = parseInt(searchParams.get('limit') || RANKING_LIMITS.DEFAULT_GET_LIMIT.toString())
  
  if (!id) {
    return createApiErrorResponse('id parameter is required for get action', 400)
  }
  
  if (limit < RANKING_LIMITS.MIN_GET_LIMIT || limit > RANKING_LIMITS.MAX_GET_LIMIT) {
    return createApiErrorResponse(`limit parameter must be between ${RANKING_LIMITS.MIN_GET_LIMIT} and ${RANKING_LIMITS.MAX_GET_LIMIT}`, 400)
  }
  
  // ランキングデータを取得
  const rankingData = await rankingService.getRankingById(id, limit)
  
  if (!rankingData) {
    return createApiErrorResponse('Ranking not found', 404)
  }
  
  return createApiSuccessResponse(rankingData)
}

async function handleClear(searchParams: URLSearchParams) {
  const url = searchParams.get('url')
  const token = searchParams.get('token')
  
  if (!url || !token) {
    return createApiErrorResponse('url and token parameters are required for clear action', 400)
  }
  
  if (!validateURL(url)) {
    return createApiErrorResponse('Invalid URL format', 400)
  }
  
  const success = await rankingService.clearRanking(url, token)
  
  if (!success) {
    return createApiErrorResponse('Invalid token or ranking not found', 403)
  }
  
  return createApiSuccessResponse({ success: true }, `Ranking for ${url} has been cleared`)
}

async function handleRemove(searchParams: URLSearchParams) {
  const url = searchParams.get('url')
  const token = searchParams.get('token')
  const name = searchParams.get('name')
  
  if (!url || !token || !name) {
    return createApiErrorResponse('url, token, and name parameters are required for remove action', 400)
  }
  
  if (!validateURL(url)) {
    return createApiErrorResponse('Invalid URL format', 400)
  }
  
  const success = await rankingService.removeScore(url, token, name)
  
  if (!success) {
    return createApiErrorResponse('Invalid token, ranking not found, or name not found', 403)
  }
  
  return createApiSuccessResponse({ success: true }, `Score for ${name} has been removed`)
}

async function handleUpdate(searchParams: URLSearchParams) {
  const url = searchParams.get('url')
  const token = searchParams.get('token')
  const name = searchParams.get('name')
  const score = parseInt(searchParams.get('score') || '0')
  
  if (!url || !token || !name) {
    return createApiErrorResponse('url, token, and name parameters are required for update action', 400)
  }
  
  if (!validateURL(url)) {
    return createApiErrorResponse('Invalid URL format', 400)
  }
  
  if (!validateOwnerToken(token)) {
    return createApiErrorResponse('Token must be 8-16 characters long', 400)
  }
  
  if (name.length > RANKING_LIMITS.MAX_NAME_LENGTH) {
    return createApiErrorResponse(`Name must be ${RANKING_LIMITS.MAX_NAME_LENGTH} characters or less`, 400)
  }
  
  const success = await rankingService.updateScore(url, token, name, score)
  
  if (!success) {
    return createApiErrorResponse('Invalid token, ranking not found, or name not found', 403)
  }
  
  return createApiSuccessResponse({ success: true }, `Score for ${name} has been updated to ${score}`)
}

export async function POST(request: NextRequest) {
  return GET(request)
}