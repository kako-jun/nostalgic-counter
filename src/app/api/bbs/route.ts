/**
 * BBS API - 新アーキテクチャ版
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { ApiHandler } from '@/lib/core/api-handler'
import { Ok, map } from '@/lib/core/result'
import { bbsService } from '@/domain/bbs/bbs.service'
import { getClientIP, getUserAgent } from '@/lib/utils/api'
import { BBSDataSchema, BBSMessageDataSchema } from '@/domain/bbs/bbs.entity'

/**
 * CREATE アクション
 */
const createHandler = ApiHandler.create({
  paramsSchema: z.object({
    action: z.literal('create'),
    url: z.string().url(),
    token: z.string().min(8).max(16),
    messagesPerPage: z.coerce.number().int().min(1).max(50).default(10),
    maxMessages: z.coerce.number().int().min(1).max(1000).default(100),
    enableIcons: z.coerce.boolean().default(true),
    enableSelects: z.coerce.boolean().default(false)
  }),
  resultSchema: z.object({
    id: z.string(),
    url: z.string()
  }),
  handler: async ({ url, token, messagesPerPage, maxMessages, enableIcons, enableSelects }, request) => {
    const createResult = await bbsService.create(url, token, {
      messagesPerPage,
      maxMessages,
      settings: {
        enableIcons,
        iconOptions: ['smile', 'wink', 'cool', 'angry', 'sad', 'surprised'],
        enableSelects,
        selectOptions: {
          select1: { label: '地域', options: ['東京', '大阪', '名古屋', '福岡', 'その他'] },
          select2: { label: '天気', options: ['晴れ', '曇り', '雨', '雪'] },
          select3: { label: '気分', options: ['楽しい', '普通', 'つまらない'] }
        }
      }
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
    id: z.string().regex(/^[a-z0-9-]+-[a-f0-9]{8}$/),
    author: z.string().min(1).max(50),
    message: z.string().min(1).max(1000),
    icon: z.string().optional(),
    select1: z.string().optional(),
    select2: z.string().optional(),
    select3: z.string().optional()
  }),
  resultSchema: BBSMessageDataSchema,
  handler: async ({ id, author, message, icon, select1, select2, select3 }, request) => {
    const clientIP = getClientIP(request)
    const userAgent = getUserAgent(request)

    const selects: Record<string, string> = {}
    if (select1) selects.select1 = select1
    if (select2) selects.select2 = select2
    if (select3) selects.select3 = select3

    return await bbsService.postMessage(id, {
      author,
      message,
      icon,
      selects: Object.keys(selects).length > 0 ? selects : undefined,
      ipHash: bbsService.generateUserHash(clientIP, userAgent),
      userAgent
    })
  }
})

/**
 * UPDATE アクション
 */
const updateHandler = ApiHandler.create({
  paramsSchema: z.object({
    action: z.literal('update'),
    id: z.string().regex(/^[a-z0-9-]+-[a-f0-9]{8}$/),
    messageId: z.string(),
    message: z.string().min(1).max(1000).optional(),
    icon: z.string().optional(),
    select1: z.string().optional(),
    select2: z.string().optional(),
    select3: z.string().optional()
  }),
  resultSchema: z.object({
    success: z.literal(true)
  }),
  handler: async ({ id, messageId, message, icon, select1, select2, select3 }, request) => {
    const clientIP = getClientIP(request)
    const userAgent = getUserAgent(request)
    const userHash = bbsService.generateUserHash(clientIP, userAgent)

    const updates: Record<string, any> = {}
    if (message !== undefined) updates.message = message
    if (icon !== undefined) updates.icon = icon
    
    const selects: Record<string, string> = {}
    if (select1) selects.select1 = select1
    if (select2) selects.select2 = select2
    if (select3) selects.select3 = select3
    if (Object.keys(selects).length > 0) updates.selects = selects

    const updateResult = await bbsService.updateMessage(id, messageId, updates, userHash)
    
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
    id: z.string().regex(/^[a-z0-9-]+-[a-f0-9]{8}$/),
    messageId: z.string(),
    url: z.string().url().optional(),
    token: z.string().min(8).max(16).optional()
  }),
  resultSchema: z.object({
    success: z.literal(true)
  }),
  handler: async ({ id, messageId, url, token }, request) => {
    let removeResult

    if (url && token) {
      // オーナーによる削除
      removeResult = await bbsService.removeMessage(id, messageId, url, token)
    } else {
      // 投稿者による削除
      const clientIP = getClientIP(request)
      const userAgent = getUserAgent(request)
      const userHash = bbsService.generateUserHash(clientIP, userAgent)
      
      removeResult = await bbsService.removeMessage(id, messageId, undefined, undefined, userHash)
    }
    
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
    const clearResult = await bbsService.clearMessages(url, token)
    
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
    return await bbsService.getMessages(id, page)
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