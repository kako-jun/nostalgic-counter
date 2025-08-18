import { NextRequest, NextResponse } from 'next/server'
import { bbsService } from '@/lib/services/bbs'
import { BBSOptions } from '@/types/bbs'
import { 
  validateAction,
  createApiSuccessResponse,
  createApiErrorResponse,
  handleApiError,
  createOptionsResponse,
  getClientIP,
  getUserAgent
} from '@/lib/utils/api'
import { 
  createValidatedApiResponse
} from '@/lib/validation/response-validation'
import { z } from 'zod'
import {
  BBSCreateParamsSchema,
  BBSPostParamsSchema,
  BBSGetParamsSchema,
  BBSRemoveParamsSchema,
  BBSClearParamsSchema,
  BBSUpdateParamsSchema,
  BBSDataSchema,
  BBSMessageSchema
} from '@/lib/validation/schemas'
import { validateApiParams } from '@/lib/utils/api-validation'
import { BBS_LIMITS } from '@/lib/utils/service-constants'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    const validActions = ['create', 'post', 'get', 'remove', 'clear', 'update']
    const actionValidation = validateAction(action, validActions)
    if (!actionValidation.isValid) {
      return createApiErrorResponse(actionValidation.error!, 400)
    }
    
    switch (action) {
      case 'create':
        return await handleCreate(searchParams)
      
      case 'post':
        return await handlePost(request, searchParams)
      
      case 'get':
        return await handleGet(searchParams)
      
      case 'remove':
        return await handleRemove(request, searchParams)
      
      case 'clear':
        return await handleClear(searchParams)
      
      case 'update':
        return await handleUpdate(request, searchParams)
      
      default:
        return createApiErrorResponse('Invalid action', 400)
    }
    
  } catch (error) {
    return handleApiError(error, 'bbs')
  }
}

export async function OPTIONS() {
  return createOptionsResponse()
}

async function handleCreate(searchParams: URLSearchParams) {
  const validation = validateApiParams(BBSCreateParamsSchema, searchParams)
  if (!validation.success) {
    return validation.response
  }
  
  const { url, token, max, perPage, icons, select1Label, select1Values, select1Required, select2Label, select2Values, select2Required, select3Label, select3Values, select3Required } = validation.data
  const maxMessages = max
  const messagesPerPage = perPage
  
  // オプション設定の解析
  const options: BBSOptions = {}
  
  // アイコン設定
  if (icons) {
    options.availableIcons = icons.split(',').slice(0, BBS_LIMITS.MAX_ICONS) // 最大アイコン数
  }
  
  // ドロップダウン設定
  if (select1Label && select1Values) {
    options.select1 = {
      label: select1Label.substring(0, BBS_LIMITS.MAX_SELECT_LABEL_LENGTH),
      values: select1Values.split(',').slice(0, BBS_LIMITS.MAX_SELECT_VALUES),
      required: select1Required === 'true'
    }
  }
  
  if (select2Label && select2Values) {
    options.select2 = {
      label: select2Label.substring(0, BBS_LIMITS.MAX_SELECT_LABEL_LENGTH),
      values: select2Values.split(',').slice(0, BBS_LIMITS.MAX_SELECT_VALUES),
      required: select2Required === 'true'
    }
  }
  
  if (select3Label && select3Values) {
    options.select3 = {
      label: select3Label.substring(0, BBS_LIMITS.MAX_SELECT_LABEL_LENGTH),
      values: select3Values.split(',').slice(0, BBS_LIMITS.MAX_SELECT_VALUES),
      required: select3Required === 'true'
    }
  }
  
  // 既存BBSを検索
  const existing = await bbsService.getBBSByUrl(url)
  
  if (existing) {
    // 既存BBS：オーナー確認
    if (!await bbsService.verifyOwnership(url, token)) {
      return createApiErrorResponse('Invalid token for this URL', 403)
    }
    
    return createValidatedApiResponse(
      z.object({ id: z.string(), url: z.string() }),
      { id: existing.id, url: existing.url },
      'BBS already exists'
    )
  }
  
  // 新規作成
  const { id: newId, bbsData } = await bbsService.createBBS(url, token, maxMessages, messagesPerPage, options)
  
  return createValidatedApiResponse(
    BBSDataSchema,
    bbsData,
    'BBS created successfully'
  )
}

async function handlePost(request: NextRequest, searchParams: URLSearchParams) {
  const validation = validateApiParams(BBSPostParamsSchema, searchParams)
  if (!validation.success) {
    return validation.response
  }
  
  const { url, token, author, message, icon, select1, select2, select3 } = validation.data
  
  // オーナー確認
  if (!await bbsService.verifyOwnership(url, token)) {
    return createApiErrorResponse('Invalid token for this URL', 403)
  }
  
  // BBS取得
  const bbs = await bbsService.getBBSByUrl(url)
  if (!bbs) {
    return createApiErrorResponse('BBS not found', 404)
  }
  
  // 投稿オプション
  const options = {
    icon: icon || undefined,
    select1: select1 || undefined,
    select2: select2 || undefined,
    select3: select3 || undefined,
    ipAddress: getClientIP(request),
    userAgent: getUserAgent(request)
  }
  
  // メッセージ投稿
  const newMessage = await bbsService.postMessage(bbs.id, author, message, options)
  if (!newMessage) {
    return createApiErrorResponse('Failed to post message', 500)
  }
  
  return createValidatedApiResponse(
    BBSMessageSchema,
    newMessage,
    'Message posted successfully'
  )
}

async function handleGet(searchParams: URLSearchParams) {
  const validation = validateApiParams(BBSGetParamsSchema, searchParams)
  if (!validation.success) {
    return validation.response
  }
  
  const { id, page } = validation.data
  
  // BBSデータを取得
  const bbsData = await bbsService.getBBSById(id, page)
  
  if (!bbsData) {
    return createApiErrorResponse('BBS not found', 404)
  }
  
  return createValidatedApiResponse(
    BBSDataSchema,
    bbsData
  )
}

async function handleRemove(request: NextRequest, searchParams: URLSearchParams) {
  const validation = validateApiParams(BBSRemoveParamsSchema, searchParams)
  if (!validation.success) {
    return validation.response
  }
  
  const { url, messageId, token } = validation.data
  
  // BBS取得
  const bbs = await bbsService.getBBSByUrl(url)
  if (!bbs) {
    return createApiErrorResponse('BBS not found', 404)
  }
  
  // ユーザーハッシュ生成（投稿者確認用）
  const userHash = `${getClientIP(request)}:${getUserAgent(request)}`
  
  // メッセージ削除（オーナーまたは投稿者）
  const success = await bbsService.removeMessage(bbs.id, messageId, userHash, token || undefined, url)
  
  if (!success) {
    return createApiErrorResponse('Message not found or you are not authorized to remove it', 403)
  }
  
  return createValidatedApiResponse(
    z.object({ success: z.literal(true) }),
    { success: true },
    'Message removed successfully'
  )
}

async function handleClear(searchParams: URLSearchParams) {
  const validation = validateApiParams(BBSClearParamsSchema, searchParams)
  if (!validation.success) {
    return validation.response
  }
  
  const { url, token } = validation.data
  
  const success = await bbsService.clearBBS(url, token)
  
  if (!success) {
    return createApiErrorResponse('Invalid token or BBS not found', 403)
  }
  
  return createValidatedApiResponse(
    z.object({ success: z.literal(true) }),
    { success: true },
    `BBS for ${url} has been cleared`
  )
}

async function handleUpdate(request: NextRequest, searchParams: URLSearchParams) {
  const validation = validateApiParams(BBSUpdateParamsSchema, searchParams)
  if (!validation.success) {
    return validation.response
  }
  
  const { url, messageId, message: newMessage } = validation.data
  
  // BBS取得
  const bbs = await bbsService.getBBSByUrl(url)
  if (!bbs) {
    return createApiErrorResponse('BBS not found', 404)
  }
  
  // ユーザーハッシュ生成（投稿者確認用）
  const userHash = `${getClientIP(request)}:${getUserAgent(request)}`
  
  // メッセージ更新
  const success = await bbsService.updateMessage(bbs.id, messageId, newMessage, userHash)
  
  if (!success) {
    return createApiErrorResponse('Message not found or you are not the author', 403)
  }
  
  return createValidatedApiResponse(
    z.object({ success: z.literal(true) }),
    { success: true },
    'Message updated successfully'
  )
}

export async function POST(request: NextRequest) {
  return GET(request)
}