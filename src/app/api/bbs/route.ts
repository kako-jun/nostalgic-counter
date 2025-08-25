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
import {
  BBSSchemas,
  UnifiedAPISchemas,
  CommonResponseSchemas
} from '@/lib/validation/service-schemas'

/**
 * CREATE アクション
 */
const createHandler = ApiHandler.create({
  paramsSchema: BBSSchemas.create,
  resultSchema: UnifiedAPISchemas.createSuccess,
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
      success: true as const,
      id: result.id,
      url: result.data.url
    }))
  }
})

/**
 * POST アクション
 */
const postHandler = ApiHandler.create({
  paramsSchema: BBSSchemas.post,
  resultSchema: BBSSchemas.postResult,
  handler: async ({ id, author, message, icon, select1, select2, select3 }, request) => {
    const clientIP = getClientIP(request)
    const userAgent = getUserAgent(request)

    const selects: string[] = []
    if (select1) selects.push(select1)
    if (select2) selects.push(select2)
    if (select3) selects.push(select3)

    const authorHash = bbsService.generateUserHash(clientIP, userAgent)

    const postResult = await bbsService.postMessageById(id, {
      author,
      message,
      icon,
      selects: selects.length > 0 ? selects : undefined,
      authorHash
    })
    
    if (!postResult.success) {
      return postResult
    }

    return Ok({ 
      success: true as const,
      data: postResult.data.data,
      messageId: postResult.data.messageId,
      editToken: postResult.data.editToken
    })
  }
})


/**
 * EDIT_MESSAGE アクション（オーナー権限）
 */
const editMessageHandler = ApiHandler.create({
  paramsSchema: BBSSchemas.editMessage,
  resultSchema: UnifiedAPISchemas.updateSuccess,
  handler: async ({ url, token, messageId, author, message, icon, select1, select2, select3 }, request) => {
    const clientIP = getClientIP(request)
    const userAgent = getUserAgent(request)
    const authorHash = bbsService.generateUserHash(clientIP, userAgent)
    
    const selects: string[] = []
    if (select1) selects.push(select1)
    if (select2) selects.push(select2)
    if (select3) selects.push(select3)

    const editResult = await bbsService.updateMessage(url, token, {
      messageId,
      author,
      message,
      icon,
      selects: selects.length > 0 ? selects : undefined,
      authorHash
    })
    
    if (!editResult.success) {
      return editResult
    }

    return map(editResult, () => ({ success: true as const }))
  }
})

/**
 * EDIT_MESSAGE_BY_ID アクション（投稿者権限）
 */
const editMessageByIdHandler = ApiHandler.create({
  paramsSchema: BBSSchemas.editMessageById,
  resultSchema: UnifiedAPISchemas.updateSuccess,
  handler: async ({ id, messageId, editToken, author, message, icon, select1, select2, select3 }, request) => {
    const selects: string[] = []
    if (select1) selects.push(select1)
    if (select2) selects.push(select2)
    if (select3) selects.push(select3)

    const editResult = await bbsService.editMessageByIdWithToken(id, messageId, editToken, {
      author,
      message,
      icon,
      selects: selects.length > 0 ? selects : undefined
    })
    
    if (!editResult.success) {
      return editResult
    }

    return map(editResult, () => ({ success: true as const }))
  }
})

/**
 * DELETE_MESSAGE_BY_ID アクション（投稿者権限）
 */
const deleteMessageByIdHandler = ApiHandler.create({
  paramsSchema: BBSSchemas.deleteMessageById,
  resultSchema: UnifiedAPISchemas.deleteSuccess,
  handler: async ({ id, messageId, editToken }, request) => {
    const deleteResult = await bbsService.deleteMessageByIdWithToken(id, messageId, editToken)
    
    if (!deleteResult.success) {
      return deleteResult
    }

    return map(deleteResult, () => ({ success: true as const }))
  }
})

/**
 * DELETE_MESSAGE アクション（オーナー権限）
 */
const deleteMessageHandler = ApiHandler.create({
  paramsSchema: BBSSchemas.deleteMessage,
  resultSchema: UnifiedAPISchemas.deleteSuccess,
  handler: async ({ url, token, messageId }, request) => {
    const clientIP = getClientIP(request)
    const userAgent = getUserAgent(request)
    const authorHash = bbsService.generateUserHash(clientIP, userAgent)
    
    const deleteResult = await bbsService.removeMessage(url, token, {
      messageId,
      authorHash
    })
    
    if (!deleteResult.success) {
      return deleteResult
    }

    return map(deleteResult, () => ({ success: true as const }))
  }
})

/**
 * CLEAR アクション
 */
const clearHandler = ApiHandler.create({
  paramsSchema: BBSSchemas.clear,
  resultSchema: UnifiedAPISchemas.clearSuccess,
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
  paramsSchema: BBSSchemas.get,
  resultSchema: BBSSchemas.data,
  handler: async ({ id, page }) => {
    return await bbsService.getBBSData(id, page)
  }
})

/**
 * DISPLAY アクション (Web Components用)
 */
const displayHandler = ApiHandler.create({
  paramsSchema: BBSSchemas.display,
  resultSchema: BBSSchemas.data,
  handler: async ({ id, page }) => {
    return await bbsService.getBBSData(id, page)
  }
})

/**
 * UPDATE_SETTINGS アクション（オーナー限定）
 */
const updateSettingsHandler = ApiHandler.create({
  paramsSchema: BBSSchemas.updateSettings,
  resultSchema: BBSSchemas.data,
  handler: async ({ url, token, ...params }) => {
    return await bbsService.updateSettings(url, token, params)
  }
})

/**
 * DELETE アクション
 */
const deleteHandler = ApiHandler.create({
  paramsSchema: BBSSchemas.delete,
  resultSchema: UnifiedAPISchemas.deleteSuccess,
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
      
      case 'editMessage':
        return await editMessageHandler(request)
      
      case 'deleteMessage':
        return await deleteMessageHandler(request)
      
      case 'editMessageById':
        return await editMessageByIdHandler(request)
      
      case 'deleteMessageById':
        return await deleteMessageByIdHandler(request)
      
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
          paramsSchema: CommonResponseSchemas.errorAction,
          resultSchema: CommonResponseSchemas.errorResponse,
          handler: async ({ action }) => {
            throw new Error(`Invalid action: ${action}`)
          }
        })(request)
    }
  } catch (error) {
    console.error('BBS API routing error:', error)
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