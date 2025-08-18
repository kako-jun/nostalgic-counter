import { NextRequest, NextResponse } from 'next/server'
import { rankingService } from '@/lib/services/ranking'
import { 
  validateAction,
  createApiSuccessResponse,
  createApiErrorResponse,
  handleApiError,
  createOptionsResponse
} from '@/lib/utils/api'
import {
  RankingCreateParamsSchema,
  RankingSubmitParamsSchema,
  RankingGetParamsSchema,
  RankingClearParamsSchema,
  RankingRemoveParamsSchema,
  RankingUpdateParamsSchema
} from '@/lib/validation/schemas'
import { validateApiParams } from '@/lib/utils/api-validation'
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
  const validation = validateApiParams(RankingCreateParamsSchema, searchParams)
  if (!validation.success) {
    return validation.response
  }
  
  const { url, token, max } = validation.data
  const maxEntries = max
  
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
  const validation = validateApiParams(RankingSubmitParamsSchema, searchParams)
  if (!validation.success) {
    return validation.response
  }
  
  const { url, token, name, score } = validation.data
  
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
  const validation = validateApiParams(RankingGetParamsSchema, searchParams)
  if (!validation.success) {
    return validation.response
  }
  
  const { id, limit } = validation.data
  
  // ランキングデータを取得
  const rankingData = await rankingService.getRankingById(id, limit)
  
  if (!rankingData) {
    return createApiErrorResponse('Ranking not found', 404)
  }
  
  return createApiSuccessResponse(rankingData)
}

async function handleClear(searchParams: URLSearchParams) {
  const validation = validateApiParams(RankingClearParamsSchema, searchParams)
  if (!validation.success) {
    return validation.response
  }
  
  const { url, token } = validation.data
  
  const success = await rankingService.clearRanking(url, token)
  
  if (!success) {
    return createApiErrorResponse('Invalid token or ranking not found', 403)
  }
  
  return createApiSuccessResponse({ success: true }, `Ranking for ${url} has been cleared`)
}

async function handleRemove(searchParams: URLSearchParams) {
  const validation = validateApiParams(RankingRemoveParamsSchema, searchParams)
  if (!validation.success) {
    return validation.response
  }
  
  const { url, token, name } = validation.data
  
  const success = await rankingService.removeScore(url, token, name)
  
  if (!success) {
    return createApiErrorResponse('Invalid token, ranking not found, or name not found', 403)
  }
  
  return createApiSuccessResponse({ success: true }, `Score for ${name} has been removed`)
}

async function handleUpdate(searchParams: URLSearchParams) {
  const validation = validateApiParams(RankingUpdateParamsSchema, searchParams)
  if (!validation.success) {
    return validation.response
  }
  
  const { url, token, name, score } = validation.data
  
  const success = await rankingService.updateScore(url, token, name, score)
  
  if (!success) {
    return createApiErrorResponse('Invalid token, ranking not found, or name not found', 403)
  }
  
  return createApiSuccessResponse({ success: true }, `Score for ${name} has been updated to ${score}`)
}

export async function POST(request: NextRequest) {
  return GET(request)
}