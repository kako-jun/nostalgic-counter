/**
 * 自動削除機能
 * 365日間非アクティブなサービスを自動削除
 */

import { getRedis } from './db'
import { counterService } from '@/domain/counter/counter.service'
import { likeService } from '@/domain/like/like.service'
import { rankingService } from '@/domain/ranking/ranking.service'
import { bbsService } from '@/domain/bbs/bbs.service'

const CLEANUP_PROBABILITY = 0.01 // 1%の確率で実行
const EXPIRY_DAYS = 365 // 365日で期限切れ

interface ServiceInfo {
  id: string
  url: string
  ownerToken: string
  lastActivity: Date
  created: Date
  type: 'counter' | 'like' | 'ranking' | 'bbs'
}

/**
 * 自動クリーンアップを実行（確率的）
 */
export async function maybeRunAutoCleanup(): Promise<void> {
  if (Math.random() >= CLEANUP_PROBABILITY) {
    return // 99%の確率でスキップ
  }
  
  console.log('🧹 Running auto-cleanup check...')
  await runAutoCleanup()
}

/**
 * 自動クリーンアップを強制実行
 */
export async function runAutoCleanup(): Promise<{
  deleted: ServiceInfo[]
  errors: string[]
}> {
  const redis = getRedis() as any
  const deleted: ServiceInfo[] = []
  const errors: string[] = []
  
  try {
    // 期限切れサービスを検出
    const expiredServices = await findExpiredServices()
    
    console.log(`Found ${expiredServices.length} expired services`)
    
    // 各サービスを削除
    for (const service of expiredServices) {
      try {
        console.log(`Deleting expired ${service.type}: ${service.id}`)
        
        let deleteResult
        switch (service.type) {
          case 'counter':
            deleteResult = await counterService.delete(service.url, service.ownerToken)
            break
          case 'like':
            deleteResult = await likeService.delete(service.url, service.ownerToken)
            break
          case 'ranking':
            deleteResult = await rankingService.delete(service.url, service.ownerToken)
            break
          case 'bbs':
            deleteResult = await bbsService.delete(service.url, service.ownerToken)
            break
        }
        
        if (deleteResult?.success) {
          deleted.push(service)
          console.log(`✅ Deleted expired ${service.type}: ${service.id}`)
        } else {
          const error = `Failed to delete ${service.type} ${service.id}: ${deleteResult?.error?.message || 'Unknown error'}`
          errors.push(error)
          console.error(`❌ ${error}`)
        }
        
      } catch (error: any) {
        const errorMsg = `Error deleting ${service.type} ${service.id}: ${error.message}`
        errors.push(errorMsg)
        console.error(`❌ ${errorMsg}`)
      }
    }
    
    console.log(`🧹 Auto-cleanup completed: ${deleted.length} deleted, ${errors.length} errors`)
    
  } catch (error: any) {
    console.error('❌ Auto-cleanup failed:', error.message)
    errors.push(`Auto-cleanup failed: ${error.message}`)
  }
  
  return { deleted, errors }
}

/**
 * 期限切れサービスを検出
 */
async function findExpiredServices(): Promise<ServiceInfo[]> {
  const redis = getRedis() as any
  const expiredServices: ServiceInfo[] = []
  const now = new Date()
  const cutoffDate = new Date(now.getTime() - (EXPIRY_DAYS * 24 * 60 * 60 * 1000))
  
  // 全キーを検索
  const keys = await redis.keys('*')
  const serviceMap = new Map<string, Partial<ServiceInfo>>()
  
  // サービス情報を収集
  for (const key of keys) {
    const keyParts = key.split(':')
    
    if (keyParts.length >= 2) {
      const [serviceType, serviceId] = keyParts
      
      if (['counter', 'like', 'ranking', 'bbs'].includes(serviceType)) {
        if (!serviceMap.has(serviceId)) {
          serviceMap.set(serviceId, { id: serviceId, type: serviceType as any })
        }
        
        const serviceInfo = serviceMap.get(serviceId)!
        
        // メタデータを取得
        if (key === `${serviceType}:${serviceId}` || key === serviceId) {
          try {
            const metadata = JSON.parse(await redis.get(key) || '{}')
            if (metadata.url && metadata.created) {
              serviceInfo.url = metadata.url
              serviceInfo.created = new Date(metadata.created)
            }
          } catch (e) {
            // JSON parse error - skip
          }
        }
        
        // オーナートークンを取得
        if (key === `${serviceType}:${serviceId}:owner`) {
          serviceInfo.ownerToken = await redis.get(key)
        }
        
        // カウンターの場合は最終アクティビティを日別データから取得
        if (serviceType === 'counter' && key.includes(':daily:')) {
          const datePart = key.split(':daily:')[1]
          if (datePart) {
            const activityDate = new Date(datePart)
            if (!serviceInfo.lastActivity || activityDate > serviceInfo.lastActivity) {
              serviceInfo.lastActivity = activityDate
            }
          }
        }
      }
    }
  }
  
  // 期限切れサービスを判定
  for (const [serviceId, info] of serviceMap) {
    if (info.url && info.created && info.ownerToken) {
      let isExpired = false
      
      if (info.type === 'counter' && info.lastActivity) {
        // カウンター：最終アクティビティから365日経過
        isExpired = info.lastActivity < cutoffDate
      } else if (info.created) {
        // その他：作成から365日経過
        isExpired = info.created < cutoffDate
      }
      
      if (isExpired) {
        expiredServices.push(info as ServiceInfo)
      }
    }
  }
  
  return expiredServices
}