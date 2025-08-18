import { NextRequest, NextResponse } from 'next/server'
import { bbsService } from '@/lib/services/bbs'
import { BBSOptions } from '@/types/bbs'
import { 
  validateAction,
  validateCreateParams,
  validateURL,
  validateOwnerToken,
  createApiSuccessResponse,
  createApiErrorResponse,
  handleApiError,
  createOptionsResponse,
  getClientIP,
  getUserAgent
} from '@/lib/utils/api'
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
  const validation = validateCreateParams(searchParams)
  if (!validation.isValid) {
    return createApiErrorResponse(validation.error!, 400)
  }
  
  const { url, token } = validation.params!
  const maxMessages = parseInt(searchParams.get('max') || BBS_LIMITS.DEFAULT_MAX_MESSAGES.toString())
  const messagesPerPage = parseInt(searchParams.get('perPage') || BBS_LIMITS.DEFAULT_MESSAGES_PER_PAGE.toString())
  
  if (maxMessages < BBS_LIMITS.MIN_MESSAGES || maxMessages > BBS_LIMITS.MAX_MESSAGES_LIMIT) {
    return createApiErrorResponse(`max parameter must be between ${BBS_LIMITS.MIN_MESSAGES} and ${BBS_LIMITS.MAX_MESSAGES_LIMIT}`, 400)
  }
  
  // オプション設定の解析
  const options: BBSOptions = {}
  
  // アイコン設定
  const icons = searchParams.get('icons')
  if (icons) {
    options.availableIcons = icons.split(',').slice(0, BBS_LIMITS.MAX_ICONS) // 最大アイコン数
  }
  
  // ドロップダウン設定
  for (let i = 1; i <= 3; i++) {
    const label = searchParams.get(`select${i}Label`)
    const values = searchParams.get(`select${i}Values`)
    const required = searchParams.get(`select${i}Required`) === 'true'
    
    if (label && values) {
      const selectOption = {
        label: label.substring(0, BBS_LIMITS.MAX_SELECT_LABEL_LENGTH),
        values: values.split(',').slice(0, BBS_LIMITS.MAX_SELECT_VALUES), // 最大選択肢数
        required
      }
      
      if (i === 1) options.select1 = selectOption
      else if (i === 2) options.select2 = selectOption
      else if (i === 3) options.select3 = selectOption
    }
  }
  
  // 既存BBSを検索
  const existing = await bbsService.getBBSByUrl(url)
  
  if (existing) {
    // 既存BBS：オーナー確認
    if (!await bbsService.verifyOwnership(url, token)) {
      return createApiErrorResponse('Invalid token for this URL', 403)
    }
    
    return createApiSuccessResponse({
      id: existing.id,
      url: existing.url
    }, 'BBS already exists')
  }
  
  // 新規作成
  const { id: newId, bbsData } = await bbsService.createBBS(url, token, maxMessages, messagesPerPage, options)
  
  return createApiSuccessResponse(bbsData, 'BBS created successfully')
}

async function handlePost(request: NextRequest, searchParams: URLSearchParams) {
  const url = searchParams.get('url')
  const token = searchParams.get('token')
  const author = searchParams.get('author') || BBS_LIMITS.DEFAULT_AUTHOR
  const message = searchParams.get('message')
  
  if (!url || !token || !message) {
    return createApiErrorResponse('url, token, and message parameters are required for post action', 400)
  }
  
  if (!validateURL(url)) {
    return createApiErrorResponse('Invalid URL format', 400)
  }
  
  if (!validateOwnerToken(token)) {
    return createApiErrorResponse('Token must be 8-16 characters long', 400)
  }
  
  if (message.length > BBS_LIMITS.MAX_MESSAGE_LENGTH) {
    return createApiErrorResponse(`Message must be ${BBS_LIMITS.MAX_MESSAGE_LENGTH} characters or less`, 400)
  }
  
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
    icon: searchParams.get('icon') || undefined,
    select1: searchParams.get('select1') || undefined,
    select2: searchParams.get('select2') || undefined,
    select3: searchParams.get('select3') || undefined,
    ipAddress: getClientIP(request),
    userAgent: getUserAgent(request)
  }
  
  // メッセージ投稿
  const newMessage = await bbsService.postMessage(bbs.id, author, message, options)
  if (!newMessage) {
    return createApiErrorResponse('Failed to post message', 500)
  }
  
  return createApiSuccessResponse(newMessage, 'Message posted successfully')
}

async function handleGet(searchParams: URLSearchParams) {
  const id = searchParams.get('id')
  const page = parseInt(searchParams.get('page') || '1')
  
  if (!id) {
    return createApiErrorResponse('id parameter is required for get action', 400)
  }
  
  if (page < BBS_LIMITS.MIN_PAGE) {
    return createApiErrorResponse(`page parameter must be ${BBS_LIMITS.MIN_PAGE} or greater`, 400)
  }
  
  // BBSデータを取得
  const bbsData = await bbsService.getBBSById(id, page)
  
  if (!bbsData) {
    return createApiErrorResponse('BBS not found', 404)
  }
  
  return createApiSuccessResponse(bbsData)
}

async function handleRemove(request: NextRequest, searchParams: URLSearchParams) {
  const url = searchParams.get('url')
  const token = searchParams.get('token')
  const messageId = searchParams.get('messageId')
  
  if (!url || !messageId) {
    return createApiErrorResponse('url and messageId parameters are required for remove action', 400)
  }
  
  if (!validateURL(url)) {
    return createApiErrorResponse('Invalid URL format', 400)
  }
  
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
  
  return createApiSuccessResponse({ success: true }, 'Message removed successfully')
}

async function handleClear(searchParams: URLSearchParams) {
  const url = searchParams.get('url')
  const token = searchParams.get('token')
  
  if (!url || !token) {
    return createApiErrorResponse('url and token parameters are required for clear action', 400)
  }
  
  if (!validateURL(url)) {
    return createApiErrorResponse('Invalid URL format', 400)
  }
  
  const success = await bbsService.clearBBS(url, token)
  
  if (!success) {
    return createApiErrorResponse('Invalid token or BBS not found', 403)
  }
  
  return createApiSuccessResponse({ success: true }, `BBS for ${url} has been cleared`)
}

async function handleUpdate(request: NextRequest, searchParams: URLSearchParams) {
  const url = searchParams.get('url')
  const messageId = searchParams.get('messageId')
  const newMessage = searchParams.get('message')
  
  if (!url || !messageId || !newMessage) {
    return createApiErrorResponse('url, messageId, and message parameters are required for update action', 400)
  }
  
  if (!validateURL(url)) {
    return createApiErrorResponse('Invalid URL format', 400)
  }
  
  if (newMessage.length > 1000) {
    return createApiErrorResponse('Message must be 1000 characters or less', 400)
  }
  
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
  
  return createApiSuccessResponse({ success: true }, 'Message updated successfully')
}

export async function POST(request: NextRequest) {
  return GET(request)
}