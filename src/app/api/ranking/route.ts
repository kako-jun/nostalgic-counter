/**
 * Ranking API - 新アーキテクチャ版
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { ApiHandler } from '@/lib/core/api-handler'
import { Ok, map } from '@/lib/core/result'
import { rankingService } from '@/domain/ranking/ranking.service'
import { generatePublicId } from '@/lib/core/id'
import { maybeRunAutoCleanup } from '@/lib/core/auto-cleanup'
import { getClientIP } from '@/lib/utils/api'
import { createHash } from 'crypto'
import {
  RankingSchemas,
  UnifiedAPISchemas,
  CommonResponseSchemas
} from '@/lib/validation/service-schemas'

/**
 * CREATE アクション
 */
const createHandler = ApiHandler.create({
  paramsSchema: RankingSchemas.create,
  resultSchema: UnifiedAPISchemas.createSuccess,
  handler: async ({ url, token, max }, request) => {
    const createResult = await rankingService.create(url, token, {
      maxEntries: max
    })
    
    if (!createResult.success) {
      return createResult
    }

    return map(createResult, result => ({
      success: true as const,
      id: result.id,
      url: result.data.url
    }))
  }
})

/**
 * SUBMIT アクション
 */
const submitHandler = ApiHandler.create({
  paramsSchema: RankingSchemas.submit,
  resultSchema: RankingSchemas.data,
  handler: async ({ id, name, score }, request) => {
    const clientIP = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || ''
    const userHash = createHash('sha256').update(`${clientIP}:${userAgent}:${new Date().toDateString()}`).digest('hex').slice(0, 8)
    
    return await rankingService.submitScoreById(id, { name, score }, userHash)
  }
})

/**
 * UPDATE アクション
 */
const updateHandler = ApiHandler.create({
  paramsSchema: RankingSchemas.update,
  resultSchema: RankingSchemas.data,
  handler: async ({ url, token, name, score }) => {
    return await rankingService.updateScore(url, token, { name, score })
  }
})

/**
 * REMOVE アクション
 */
const removeHandler = ApiHandler.create({
  paramsSchema: RankingSchemas.remove,
  resultSchema: RankingSchemas.data,
  handler: async ({ url, token, name }) => {
    return await rankingService.removeEntry(url, token, { name })
  }
})

/**
 * CLEAR アクション
 */
const clearHandler = ApiHandler.create({
  paramsSchema: RankingSchemas.clear,
  resultSchema: RankingSchemas.data,
  handler: async ({ url, token }) => {
    return await rankingService.clearRanking(url, token)
  }
})

/**
 * GET アクション
 */
const getHandler = ApiHandler.create({
  paramsSchema: RankingSchemas.get,
  resultSchema: RankingSchemas.data,
  handler: async ({ id, limit }) => {
    return await rankingService.getRankingData(id, limit)
  }
})

/**
 * DISPLAY アクション (Web Components用)
 */
const displayHandler = ApiHandler.create({
  paramsSchema: RankingSchemas.display,
  resultSchema: RankingSchemas.data,
  handler: async ({ id, limit }) => {
    return await rankingService.getRankingData(id, limit)
  }
})

/**
 * DELETE アクション
 */
const deleteHandler = ApiHandler.create({
  paramsSchema: RankingSchemas.delete,
  resultSchema: UnifiedAPISchemas.deleteSuccess,
  handler: async ({ url, token }) => {
    const publicId = generatePublicId(url)
    const deleteResult = await rankingService.delete(url, token)
    
    if (!deleteResult.success) {
      return deleteResult
    }

    return Ok({ success: true as const, message: 'Ranking deleted successfully', id: publicId })
  }
})

/**
 * ルーティング関数
 */
async function routeRequest(request: NextRequest) {
  // 1%の確率で自動クリーンアップを実行
  await maybeRunAutoCleanup()
  
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'create':
        return await createHandler(request)
      
      case 'submit':
        return await submitHandler(request)
      
      case 'update':
        return await updateHandler(request)
      
      case 'remove':
        return await removeHandler(request)
      
      case 'clear':
        return await clearHandler(request)
      
      case 'get':
        return await getHandler(request)
      
      case 'display':
        return await displayHandler(request)
      
      case 'delete':
        return await deleteHandler(request)
      
      default:
        return ApiHandler.create({
          paramsSchema: CommonResponseSchemas.errorAction,
          resultSchema: CommonResponseSchemas.errorResponse,
          handler: async ({ action }) => {
            throw new Error(`Invalid action: ${action}`)
          }
        })(request)
    }
  } catch (error) {
    console.error('Ranking API routing error:', error)
    return ApiHandler.create({
      paramsSchema: CommonResponseSchemas.emptyParams,
      resultSchema: CommonResponseSchemas.errorResponse,
      handler: async () => {
        throw new Error('Internal server error')
      }
    })(request)
  }
}

// HTTP メソッドハンドラー
export async function GET(request: NextRequest) {
  return await routeRequest(request)
}