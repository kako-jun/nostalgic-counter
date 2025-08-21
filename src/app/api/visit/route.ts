/**
 * Counter API v2 - 新アーキテクチャ版
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { ApiHandler, ApiHandlerFactory } from '@/lib/core/api-handler'
import { Ok, map, ValidationError } from '@/lib/core/result'
import { counterService } from '@/domain/counter/counter.service'
import { generateCounterSVG } from '@/lib/image-generator'
import { maybeRunAutoCleanup } from '@/lib/core/auto-cleanup'
import { getCacheSettings } from '@/lib/core/config'
import { getClientIP, getUserAgent } from '@/lib/utils/api'
import {
  CounterSchemas,
  CounterActionParams,
  UnifiedAPISchemas,
  type CounterData
} from '@/lib/validation/service-schemas'

/**
 * 統合API パラメータスキーマ - service-schemas から使用
 */
const ApiParamsSchema = CounterActionParams

/**
 * CREATE アクション
 */
const createHandler = ApiHandler.create({
  paramsSchema: CounterSchemas.create,
  resultSchema: UnifiedAPISchemas.createSuccess,
  handler: async ({ url, token }, request) => {
    const createResult = await counterService.create(url, token, { enableDailyStats: true })
    
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
 * INCREMENT アクション
 */
const incrementHandler = ApiHandler.create({
  paramsSchema: CounterSchemas.increment,
  resultSchema: CounterSchemas.data,
  handler: async ({ id }, request) => {
    const clientIP = getClientIP(request)
    const userAgent = getUserAgent(request)
    const userHash = counterService.generateUserHash(clientIP, userAgent)

    return await counterService.incrementCounter(id, userHash)
  }
})

/**
 * SET アクション
 */
const setHandler = ApiHandler.create({
  paramsSchema: CounterSchemas.set,
  resultSchema: UnifiedAPISchemas.setSuccess,
  handler: async ({ url, token, total }) => {
    const setResult = await counterService.setCounterValue(url, token, total)
    
    if (!setResult.success) {
      return setResult
    }

    return map(setResult, () => ({ success: true as const }))
  }
})

/**
 * DISPLAY アクション（特殊レスポンス）
 */
const displayHandler = ApiHandler.createSpecialResponse(
  CounterSchemas.display.extend({
    format: z.enum(['json', 'text', 'image']).default('json')
  }),
  async ({ id, type, format, digits }) => {
    if (format === 'json') {
      return await counterService.getCounterData(id)
    }

    const displayDataResult = await counterService.getDisplayData(id, type)
    if (!displayDataResult.success) {
      return displayDataResult
    }
    
    const displayData = displayDataResult.data
    
    // テキスト形式の場合は指定桁数でパディング
    if (format === 'text' && typeof displayData === 'number') {
      const paddedValue = digits ? String(displayData).padStart(digits, '0') : String(displayData)
      return Ok(paddedValue)
    }
    
    return Ok(displayData)
  },
  {
    schema: z.union([
      CounterSchemas.data, // JSON format
      z.number().int().min(0), // number format
      z.string() // padded text format
    ]),
    formatter: (data) => {
      if (typeof data === 'object') {
        return JSON.stringify(data, null, 2)
      }
      return data.toString()
    },
    contentType: 'text/plain',
    cacheControl: `public, max-age=${getCacheSettings().displayMaxAge}`
  }
)

/**
 * SVG表示専用ハンドラー
 */
const svgHandler = ApiHandler.createSpecialResponse(
  CounterSchemas.display.extend({
    format: z.literal('image')
  }),
  async ({ id, type, theme, digits }) => {
    const displayResult = await counterService.getDisplayData(id, type)
    if (!displayResult.success) {
      return displayResult
    }
    
    return Ok({
      value: displayResult.data,
      type: type,
      theme: theme,
      digits: digits
    })
  },
  {
    schema: z.object({
      value: z.number().int().min(0),
      type: z.enum(['total', 'today', 'yesterday', 'week', 'month']),
      theme: z.enum(['classic', 'modern', 'retro']),
      digits: z.number().int().min(1).max(10).optional()
    }),
    formatter: (data) => generateCounterSVG({
      value: data.value,
      type: data.type,
      style: data.theme,
      digits: data.digits
    }),
    contentType: getCacheSettings().contentTypes.svg,
    cacheControl: `public, max-age=${getCacheSettings().displayMaxAge}`
  }
)

/**
 * DELETE アクション
 */
const deleteHandler = ApiHandler.create({
  paramsSchema: CounterSchemas.delete,
  resultSchema: UnifiedAPISchemas.deleteSuccess,
  handler: async ({ url, token }) => {
    const deleteResult = await counterService.delete(url, token)
    
    if (!deleteResult.success) {
      return deleteResult
    }

    return Ok({ success: true as const, message: 'Counter deleted successfully' })
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
    const format = searchParams.get('format') || 'image'

    switch (action) {
      case 'create':
        return await createHandler(request)
      
      case 'increment':
        return await incrementHandler(request)
      
      case 'set':
        return await setHandler(request)
      
      case 'display':
        if (format === 'image') {
          return await svgHandler(request)
        } else {
          return await displayHandler(request)
        }
      
      case 'delete':
        return await deleteHandler(request)
      
      default:
        return ApiHandler.create({
          paramsSchema: z.object({ action: z.string() }),
          resultSchema: z.object({ error: z.string() }),
          handler: async ({ action }) => {
            throw new ValidationError(`Invalid action: ${action}`)
          }
        })(request)
    }
  } catch (error) {
    console.error('Counter API routing error:', error)
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