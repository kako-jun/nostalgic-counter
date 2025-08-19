/**
 * 管理者用クリーンアップAPI
 * 古いフォーマットのインスタンスを削除するための特別なエンドポイント
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { ApiHandler } from '@/lib/core/api-handler'
import { Ok, Err, ValidationError } from '@/lib/core/result'
import { getRedis } from '@/lib/core/db'

const OLD_INSTANCE_IDS = [
  'llll-ll-3f2d5e94',
  '"llll-ll-3f2d5e94"',
  'demo-562a8fd7',
  '"demo-562a8fd7"',
  'nostalgi-5e343478',
  '"nostalgi-5e343478"'
]

/**
 * インスタンスのクリーンアップ
 */
const cleanupHandler = ApiHandler.create({
  paramsSchema: z.object({
    adminToken: z.string(),
    targetId: z.string().optional()
  }),
  resultSchema: z.object({
    success: z.literal(true),
    deletedKeys: z.array(z.string()),
    totalDeleted: z.number()
  }),
  handler: async ({ adminToken, targetId }) => {
    // 管理者トークンの検証（環境変数から取得）
    const expectedToken = process.env.ADMIN_CLEANUP_TOKEN
    if (!expectedToken || adminToken !== expectedToken) {
      return Err(new ValidationError('Invalid admin token'))
    }

    const redis = getRedis() as any
    const deletedKeys: string[] = []
    
    try {
      // 削除対象のIDリスト（targetIdが指定されていない場合は古いIDリストを使用）
      const idsToDelete = targetId ? [targetId] : OLD_INSTANCE_IDS
      
      for (const id of idsToDelete) {
        console.log(`🧹 Cleaning up instance: ${id}`)
        
        // パターンマッチで関連するすべてのキーを検索
        const patterns = [
          `*${id}*`,
          `counter:${id}:*`,
          `like:${id}:*`,
          `ranking:${id}:*`,
          `bbs:${id}:*`,
          `visit:*:${id}:*`
        ]
        
        // URLマッピングも検索・削除
        const allUrlKeys = await redis.keys('url:*')
        for (const urlKey of allUrlKeys) {
          const mappedId = await redis.get(urlKey)
          if (mappedId === id || mappedId === `"${id}"` || mappedId === `${id}`) {
            deletedKeys.push(urlKey)
            await redis.del(urlKey)
          }
        }
        
        for (const pattern of patterns) {
          const keys = await redis.keys(pattern)
          if (keys.length > 0) {
            deletedKeys.push(...keys)
            await redis.del(...keys)
          }
        }
      }
      
      return Ok({
        success: true as const,
        deletedKeys,
        totalDeleted: deletedKeys.length
      })
      
    } catch (error: any) {
      return Err(new ValidationError('Cleanup failed', { 
        error: error.message,
        deletedSoFar: deletedKeys
      }))
    }
  }
})

/**
 * 特定のURLパターンに関連するインスタンスをクリーンアップ
 */
const cleanupByUrlHandler = ApiHandler.create({
  paramsSchema: z.object({
    adminToken: z.string(),
    urlPattern: z.string()
  }),
  resultSchema: z.object({
    success: z.literal(true),
    foundInstances: z.array(z.string()),
    deletedKeys: z.array(z.string()),
    totalDeleted: z.number()
  }),
  handler: async ({ adminToken, urlPattern }) => {
    // 管理者トークンの検証
    const expectedToken = process.env.ADMIN_CLEANUP_TOKEN
    if (!expectedToken || adminToken !== expectedToken) {
      return Err(new ValidationError('Invalid admin token'))
    }

    const redis = getRedis() as any
    const deletedKeys: string[] = []
    const foundInstances: string[] = []
    
    try {
      // URLパターンに一致するインスタンスを検索
      const urlKeys = await redis.keys(`url:${urlPattern}:*`)
      
      for (const urlKey of urlKeys) {
        const instanceId = await redis.get(urlKey)
        if (instanceId) {
          foundInstances.push(instanceId)
          
          // インスタンスに関連するすべてのキーを削除
          const patterns = [
            `*${instanceId}*`,
            `counter:${instanceId}:*`,
            `like:${instanceId}:*`,
            `ranking:${instanceId}:*`,
            `bbs:${instanceId}:*`,
            `visit:*:${instanceId}:*`
          ]
          
          for (const pattern of patterns) {
            const keys = await redis.keys(pattern)
            if (keys.length > 0) {
              deletedKeys.push(...keys)
              await redis.del(...keys)
            }
          }
          
          // URLマッピングも削除
          deletedKeys.push(urlKey)
          await redis.del(urlKey)
        }
      }
      
      return Ok({
        success: true as const,
        foundInstances,
        deletedKeys,
        totalDeleted: deletedKeys.length
      })
      
    } catch (error: any) {
      return Err(new ValidationError('Cleanup failed', { 
        error: error.message,
        foundInstances,
        deletedSoFar: deletedKeys
      }))
    }
  }
})

// HTTPメソッドハンドラー
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  
  switch (action) {
    case 'cleanup':
      return await cleanupHandler(request)
    case 'cleanupByUrl':
      return await cleanupByUrlHandler(request)
    default:
      return ApiHandler.create({
        paramsSchema: z.object({ action: z.string() }),
        resultSchema: z.object({ error: z.string() }),
        handler: async ({ action }) => {
          throw new ValidationError(`Invalid action: ${action}`)
        }
      })(request)
  }
}