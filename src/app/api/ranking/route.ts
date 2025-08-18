/**
 * Ranking API - 新アーキテクチャ版
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { ApiHandler } from '@/lib/core/api-handler'
import { Ok, map } from '@/lib/core/result'
import { rankingService } from '@/domain/ranking/ranking.service'
import { RankingDataSchema } from '@/domain/ranking/ranking.entity'

/**
 * CREATE アクション
 */
const createHandler = ApiHandler.create({
  paramsSchema: z.object({
    action: z.literal('create'),
    url: z.string().url(),
    token: z.string().min(8).max(16),
    maxEntries: z.coerce.number().int().min(1).max(100).default(10),
    orderBy: z.enum(['desc', 'asc']).default('desc')
  }),
  resultSchema: z.object({
    id: z.string(),
    url: z.string()
  }),
  handler: async ({ url, token, maxEntries, orderBy }, request) => {
    const createResult = await rankingService.create(url, token, {
      maxEntries,
      orderBy
    })
    
    if (!createResult.success) {
      return createResult
    }

    return map(createResult, result => ({
      id: result.id,
      url: result.data.url
    }))
  }
})

/**
 * SUBMIT アクション
 */
const submitHandler = ApiHandler.create({
  paramsSchema: z.object({
    action: z.literal('submit'),
    id: z.string().regex(/^[a-z0-9-]+-[a-f0-9]{8}$/),
    name: z.string().min(1).max(50),
    score: z.coerce.number().int()
  }),
  resultSchema: RankingDataSchema,
  handler: async ({ id, name, score }) => {
    return await rankingService.submitScore(id, name, score)
  }
})

/**
 * UPDATE アクション
 */
const updateHandler = ApiHandler.create({
  paramsSchema: z.object({
    action: z.literal('update'),
    url: z.string().url(),
    token: z.string().min(8).max(16),
    name: z.string().min(1).max(50),
    score: z.coerce.number().int()
  }),
  resultSchema: z.object({
    success: z.literal(true)
  }),
  handler: async ({ url, token, name, score }) => {
    const updateResult = await rankingService.updateScore(url, token, name, score)
    
    if (!updateResult.success) {
      return updateResult
    }

    return map(updateResult, () => ({ success: true as const }))
  }
})

/**
 * REMOVE アクション
 */
const removeHandler = ApiHandler.create({
  paramsSchema: z.object({
    action: z.literal('remove'),
    url: z.string().url(),
    token: z.string().min(8).max(16),
    name: z.string().min(1).max(50)
  }),
  resultSchema: z.object({
    success: z.literal(true)
  }),
  handler: async ({ url, token, name }) => {
    const removeResult = await rankingService.removeEntry(url, token, name)
    
    if (!removeResult.success) {
      return removeResult
    }

    return map(removeResult, () => ({ success: true as const }))
  }
})

/**
 * CLEAR アクション
 */
const clearHandler = ApiHandler.create({
  paramsSchema: z.object({
    action: z.literal('clear'),
    url: z.string().url(),
    token: z.string().min(8).max(16)
  }),
  resultSchema: z.object({
    success: z.literal(true)
  }),
  handler: async ({ url, token }) => {
    const clearResult = await rankingService.clearRanking(url, token)
    
    if (!clearResult.success) {
      return clearResult
    }

    return map(clearResult, () => ({ success: true as const }))
  }
})

/**
 * GET アクション
 */
const getHandler = ApiHandler.create({
  paramsSchema: z.object({
    action: z.literal('get'),
    id: z.string().regex(/^[a-z0-9-]+-[a-f0-9]{8}$/),
    limit: z.coerce.number().int().min(1).max(100).default(10)
  }),
  resultSchema: RankingDataSchema,
  handler: async ({ id, limit }) => {
    return await rankingService.getRankingData(id, limit)
  }
})

/**
 * ルーティング関数
 */
async function routeRequest(request: NextRequest) {
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
      
      default:
        return ApiHandler.create({
          paramsSchema: z.object({ action: z.string() }),
          resultSchema: z.object({ error: z.string() }),
          handler: async ({ action }) => {
            throw new Error(`Invalid action: ${action}`)
          }
        })(request)
    }
  } catch (error) {
    console.error('Ranking API routing error:', error)
    return ApiHandler.create({
      paramsSchema: z.object({}),
      resultSchema: z.object({ error: z.string() }),
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