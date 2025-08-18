import { NextRequest, NextResponse } from 'next/server'
import { bbsService } from '@/lib/services/bbs'
import { getClientIP, getUserAgent } from '@/lib/utils/request'
import { validateURL } from '@/lib/utils/validation'
import { validateOwnerToken } from '@/lib/core/auth'
import { BBSOptions } from '@/types/bbs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    if (!action) {
      return NextResponse.json({ 
        error: 'action parameter is required' 
      }, { status: 400 })
    }
    
    switch (action) {
      case 'create':
        return handleCreate(searchParams)
      
      case 'post':
        return handlePost(request, searchParams)
      
      case 'get':
        return handleGet(searchParams)
      
      case 'remove':
        return handleRemove(request, searchParams)
      
      case 'clear':
        return handleClear(searchParams)
      
      case 'update':
        return handleUpdate(request, searchParams)
      
      default:
        return NextResponse.json({ 
          error: 'Invalid action. Valid actions are: create, post, get, remove, clear, update' 
        }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Error in BBS API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleCreate(searchParams: URLSearchParams) {
  const url = searchParams.get('url')
  const token = searchParams.get('token')
  const maxMessages = parseInt(searchParams.get('max') || '1000')
  const messagesPerPage = parseInt(searchParams.get('perPage') || '10')
  
  if (!url || !token) {
    return NextResponse.json({ 
      error: 'url and token parameters are required for create action' 
    }, { status: 400 })
  }
  
  if (!validateURL(url)) {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
  }
  
  if (!validateOwnerToken(token)) {
    return NextResponse.json({ 
      error: 'Token must be 8-16 characters long' 
    }, { status: 400 })
  }
  
  if (maxMessages < 1 || maxMessages > 10000) {
    return NextResponse.json({ 
      error: 'max parameter must be between 1 and 10000' 
    }, { status: 400 })
  }
  
  // オプション設定の解析
  const options: BBSOptions = {}
  
  // アイコン設定
  const icons = searchParams.get('icons')
  if (icons) {
    options.availableIcons = icons.split(',').slice(0, 20) // 最大20個
  }
  
  // ドロップダウン設定
  for (let i = 1; i <= 3; i++) {
    const label = searchParams.get(`select${i}Label`)
    const values = searchParams.get(`select${i}Values`)
    const required = searchParams.get(`select${i}Required`) === 'true'
    
    if (label && values) {
      const selectOption = {
        label: label.substring(0, 50),
        values: values.split(',').slice(0, 50), // 最大50個の選択肢
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
      return NextResponse.json({ error: 'Invalid token for this URL' }, { status: 403 })
    }
    
    return NextResponse.json({
      id: existing.id,
      url: existing.url,
      message: 'BBS already exists'
    })
  }
  
  // 新規作成
  const { id: newId, bbsData } = await bbsService.createBBS(url, token, maxMessages, messagesPerPage, options)
  
  return NextResponse.json({ 
    ...bbsData,
    message: 'BBS created successfully'
  })
}

async function handlePost(request: NextRequest, searchParams: URLSearchParams) {
  const url = searchParams.get('url')
  const token = searchParams.get('token')
  const author = searchParams.get('author') || '名無しさん'
  const message = searchParams.get('message')
  
  if (!url || !token || !message) {
    return NextResponse.json({ 
      error: 'url, token, and message parameters are required for post action' 
    }, { status: 400 })
  }
  
  if (!validateURL(url)) {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
  }
  
  if (!validateOwnerToken(token)) {
    return NextResponse.json({ 
      error: 'Token must be 8-16 characters long' 
    }, { status: 400 })
  }
  
  if (message.length > 1000) {
    return NextResponse.json({ 
      error: 'Message must be 1000 characters or less' 
    }, { status: 400 })
  }
  
  // オーナー確認
  if (!await bbsService.verifyOwnership(url, token)) {
    return NextResponse.json({ error: 'Invalid token for this URL' }, { status: 403 })
  }
  
  // BBS取得
  const bbs = await bbsService.getBBSByUrl(url)
  if (!bbs) {
    return NextResponse.json({ error: 'BBS not found' }, { status: 404 })
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
    return NextResponse.json({ error: 'Failed to post message' }, { status: 500 })
  }
  
  return NextResponse.json({
    message: 'Message posted successfully',
    data: newMessage
  })
}

async function handleGet(searchParams: URLSearchParams) {
  const id = searchParams.get('id')
  const page = parseInt(searchParams.get('page') || '1')
  
  if (!id) {
    return NextResponse.json({ 
      error: 'id parameter is required for get action' 
    }, { status: 400 })
  }
  
  if (page < 1) {
    return NextResponse.json({ 
      error: 'page parameter must be 1 or greater' 
    }, { status: 400 })
  }
  
  // BBSデータを取得
  const bbsData = await bbsService.getBBSById(id, page)
  
  if (!bbsData) {
    return NextResponse.json({ 
      error: 'BBS not found' 
    }, { status: 404 })
  }
  
  return NextResponse.json(bbsData)
}

async function handleRemove(request: NextRequest, searchParams: URLSearchParams) {
  const url = searchParams.get('url')
  const token = searchParams.get('token')
  const messageId = searchParams.get('messageId')
  
  if (!url || !messageId) {
    return NextResponse.json({ 
      error: 'url and messageId parameters are required for remove action' 
    }, { status: 400 })
  }
  
  if (!validateURL(url)) {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
  }
  
  // BBS取得
  const bbs = await bbsService.getBBSByUrl(url)
  if (!bbs) {
    return NextResponse.json({ error: 'BBS not found' }, { status: 404 })
  }
  
  // ユーザーハッシュ生成（投稿者確認用）
  const userHash = `${getClientIP(request)}:${getUserAgent(request)}`
  
  // メッセージ削除（オーナーまたは投稿者）
  const success = await bbsService.removeMessage(bbs.id, messageId, userHash, token || undefined, url)
  
  if (!success) {
    return NextResponse.json({ 
      error: 'Message not found or you are not authorized to remove it' 
    }, { status: 403 })
  }
  
  return NextResponse.json({
    success: true,
    message: 'Message removed successfully'
  })
}

async function handleClear(searchParams: URLSearchParams) {
  const url = searchParams.get('url')
  const token = searchParams.get('token')
  
  if (!url || !token) {
    return NextResponse.json({ 
      error: 'url and token parameters are required for clear action' 
    }, { status: 400 })
  }
  
  if (!validateURL(url)) {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
  }
  
  const success = await bbsService.clearBBS(url, token)
  
  if (!success) {
    return NextResponse.json({ 
      error: 'Invalid token or BBS not found' 
    }, { status: 403 })
  }
  
  return NextResponse.json({
    success: true,
    message: `BBS for ${url} has been cleared`
  })
}

async function handleUpdate(request: NextRequest, searchParams: URLSearchParams) {
  const url = searchParams.get('url')
  const messageId = searchParams.get('messageId')
  const newMessage = searchParams.get('message')
  
  if (!url || !messageId || !newMessage) {
    return NextResponse.json({ 
      error: 'url, messageId, and message parameters are required for update action' 
    }, { status: 400 })
  }
  
  if (!validateURL(url)) {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
  }
  
  if (newMessage.length > 1000) {
    return NextResponse.json({ 
      error: 'Message must be 1000 characters or less' 
    }, { status: 400 })
  }
  
  // BBS取得
  const bbs = await bbsService.getBBSByUrl(url)
  if (!bbs) {
    return NextResponse.json({ error: 'BBS not found' }, { status: 404 })
  }
  
  // ユーザーハッシュ生成（投稿者確認用）
  const userHash = `${getClientIP(request)}:${getUserAgent(request)}`
  
  // メッセージ更新
  const success = await bbsService.updateMessage(bbs.id, messageId, newMessage, userHash)
  
  if (!success) {
    return NextResponse.json({ 
      error: 'Message not found or you are not the author' 
    }, { status: 403 })
  }
  
  return NextResponse.json({
    success: true,
    message: 'Message updated successfully'
  })
}

export async function POST(request: NextRequest) {
  return GET(request)
}