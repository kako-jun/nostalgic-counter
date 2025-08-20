/**
 * BBS API - 新アーキテクチャ版
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { ApiHandler } from '@/lib/core/api-handler'
import { Ok, map } from '@/lib/core/result'
import { bbsService } from '@/domain/bbs/bbs.service'
import { maybeRunAutoCleanup } from '@/lib/core/auto-cleanup'
import { getClientIP, getUserAgent } from '@/lib/utils/api'
import { BBSDataSchema, BBSMessageSchema, BBSUpdateSettingsParamsSchema } from '@/domain/bbs/bbs.entity'

/**
 * CREATE アクション
 */
const createHandler = ApiHandler.create({
  paramsSchema: z.object({
    action: z.literal('create'),
    url: z.string().url(),
    token: z.string().min(8).max(16),
    title: z.string().min(1).max(100).default('BBS'),
    messagesPerPage: z.coerce.number().int().min(1).max(50).default(10),
    max: z.coerce.number().int().min(1).max(1000).default(100),
    enableIcons: z.coerce.boolean().default(true),
    enableSelects: z.coerce.boolean().default(false)
  }),
  resultSchema: z.object({
    id: z.string(),
    url: z.string()
  }),
  handler: async ({ url, token, title, messagesPerPage, max, enableIcons, enableSelects }, request) => {
    const icons = enableIcons ? ['😀', '😉', '😎', '😠', '😢', '😮'] : []
    const selects = enableSelects ? [
      { label: '地域', options: ['東京', '大阪', '名古屋', '福岡', 'その他'] },
      { label: '天気', options: ['晴れ', '曇り', '雨', '雪'] },
      { label: '気分', options: ['楽しい', '普通', 'つまらない'] }
    ] : []
    
    const createResult = await bbsService.create(url, token, {
      title,
      messagesPerPage,
      maxMessages: max,
      icons,
      selects
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
 * POST アクション
 */
const postHandler = ApiHandler.create({
  paramsSchema: z.object({
    action: z.literal('post'),
    url: z.string().url(),
    token: z.string().min(8).max(16),
    author: z.string().min(1).max(50).default('名無しさん'),
    message: z.string().min(1).max(1000),
    icon: z.string().optional(),
    select1: z.string().optional(),
    select2: z.string().optional(),
    select3: z.string().optional()
  }),
  resultSchema: z.object({
    success: z.literal(true),
    messageId: z.string()
  }),
  handler: async ({ url, token, author, message, icon, select1, select2, select3 }, request) => {
    const clientIP = getClientIP(request)
    const userAgent = getUserAgent(request)

    const selects: string[] = []
    if (select1) selects.push(select1)
    if (select2) selects.push(select2)
    if (select3) selects.push(select3)

    const postResult = await bbsService.postMessage(url, token, {
      author,
      message,
      icon,
      selects: selects.length > 0 ? selects : undefined,
      authorHash: bbsService.generateUserHash(clientIP, userAgent)
    })
    
    if (!postResult.success) {
      return postResult
    }

    return map(postResult, () => ({ 
      success: true as const,
      messageId: `msg_${Date.now()}`
    }))
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
    messageId: z.string(),
    author: z.string().min(1).max(50),
    message: z.string().min(1).max(1000),
    icon: z.string().optional(),
    select1: z.string().optional(),
    select2: z.string().optional(),
    select3: z.string().optional()
  }),
  resultSchema: z.object({
    success: z.literal(true)
  }),
  handler: async ({ url, token, messageId, author, message, icon, select1, select2, select3 }, request) => {
    const clientIP = getClientIP(request)
    const userAgent = getUserAgent(request)
    const authorHash = bbsService.generateUserHash(clientIP, userAgent)
    
    const selects: string[] = []
    if (select1) selects.push(select1)
    if (select2) selects.push(select2)
    if (select3) selects.push(select3)

    const updateResult = await bbsService.updateMessage(url, token, {
      messageId,
      author,
      message,
      icon,
      selects: selects.length > 0 ? selects : undefined,
      authorHash
    })
    
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
    messageId: z.string()
  }),
  resultSchema: z.object({
    success: z.literal(true)
  }),
  handler: async ({ url, token, messageId }, request) => {
    const clientIP = getClientIP(request)
    const userAgent = getUserAgent(request)
    const authorHash = bbsService.generateUserHash(clientIP, userAgent)
    
    const removeResult = await bbsService.removeMessage(url, token, {
      messageId,
      authorHash
    })
    
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
    const clearResult = await bbsService.clearBBS(url, token)
    
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
    page: z.coerce.number().int().min(1).default(1)
  }),
  resultSchema: BBSDataSchema,
  handler: async ({ id, page }) => {
    return await bbsService.getBBSData(id, page)
  }
})

/**
 * DISPLAY アクション (Web Components用)
 */
const displayHandler = ApiHandler.create({
  paramsSchema: z.object({
    action: z.literal('display'),
    id: z.string().regex(/^[a-z0-9-]+-[a-f0-9]{8}$/),
    page: z.coerce.number().int().min(1).default(1),
    format: z.enum(['json']).default('json')
  }),
  resultSchema: BBSDataSchema,
  handler: async ({ id, page }) => {
    return await bbsService.getBBSData(id, page)
  }
})

/**
 * UPDATE_SETTINGS アクション（オーナー限定）
 */
const updateSettingsHandler = ApiHandler.create({
  paramsSchema: z.object({
    action: z.literal('updateSettings'),
    url: z.string().url(),
    token: z.string().min(8).max(16)
  }).and(BBSUpdateSettingsParamsSchema),
  resultSchema: BBSDataSchema,
  handler: async ({ url, token, ...params }) => {
    return await bbsService.updateSettings(url, token, params)
  }
})

/**
 * DELETE アクション
 */
const deleteHandler = ApiHandler.create({
  paramsSchema: z.object({
    action: z.literal('delete'),
    url: z.string().url(),
    token: z.string().min(8).max(16)
  }),
  resultSchema: z.object({
    success: z.literal(true),
    message: z.string()
  }),
  handler: async ({ url, token }) => {
    const deleteResult = await bbsService.delete(url, token)
    
    if (!deleteResult.success) {
      return deleteResult
    }

    return Ok({ success: true as const, message: 'BBS deleted successfully' })
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
      
      case 'post':
        return await postHandler(request)
      
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
      
      case 'updateSettings':
        return await updateSettingsHandler(request)
      
      case 'delete':
        return await deleteHandler(request)
      
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
    console.error('BBS API routing error:', error)
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