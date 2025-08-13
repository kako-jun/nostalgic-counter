import { NextRequest, NextResponse } from 'next/server'
import { rankingService } from '@/lib/services/ranking'
import { validateURL } from '@/lib/utils/validation'
import { validateOwnerToken } from '@/lib/core/auth'

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
      
      case 'submit':
        return handleSubmit(searchParams)
      
      case 'get':
        return handleGet(searchParams)
      
      case 'clear':
        return handleClear(searchParams)
      
      case 'remove':
        return handleRemove(searchParams)
      
      case 'update':
        return handleUpdate(searchParams)
      
      default:
        return NextResponse.json({ 
          error: 'Invalid action. Valid actions are: create, submit, get, clear, remove, update' 
        }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Error in ranking API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleCreate(searchParams: URLSearchParams) {
  const url = searchParams.get('url')
  const token = searchParams.get('token')
  const maxEntries = parseInt(searchParams.get('max') || '100')
  
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
  
  if (maxEntries < 1 || maxEntries > 1000) {
    return NextResponse.json({ 
      error: 'max parameter must be between 1 and 1000' 
    }, { status: 400 })
  }
  
  // 既存ランキングを検索
  const existing = await rankingService.getRankingByUrl(url)
  
  if (existing) {
    // 既存ランキング：オーナー確認
    if (!await rankingService.verifyOwnership(url, token)) {
      return NextResponse.json({ error: 'Invalid token for this URL' }, { status: 403 })
    }
    
    return NextResponse.json({
      id: existing.id,
      url: existing.url,
      message: 'Ranking already exists'
    })
  }
  
  // 新規作成
  const { id: newId, rankingData } = await rankingService.createRanking(url, token, maxEntries)
  
  return NextResponse.json({ 
    ...rankingData,
    message: 'Ranking created successfully'
  })
}

async function handleSubmit(searchParams: URLSearchParams) {
  const url = searchParams.get('url')
  const token = searchParams.get('token')
  const name = searchParams.get('name')
  const score = parseInt(searchParams.get('score') || '0')
  
  if (!url || !token || !name) {
    return NextResponse.json({ 
      error: 'url, token, and name parameters are required for submit action' 
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
  
  if (name.length > 20) {
    return NextResponse.json({ 
      error: 'Name must be 20 characters or less' 
    }, { status: 400 })
  }
  
  // オーナー確認
  if (!await rankingService.verifyOwnership(url, token)) {
    return NextResponse.json({ error: 'Invalid token for this URL' }, { status: 403 })
  }
  
  // ランキング取得
  const ranking = await rankingService.getRankingByUrl(url)
  if (!ranking) {
    return NextResponse.json({ error: 'Ranking not found' }, { status: 404 })
  }
  
  // スコア送信
  const rankingData = await rankingService.submitScore(ranking.id, name, score)
  if (!rankingData) {
    return NextResponse.json({ error: 'Failed to submit score' }, { status: 500 })
  }
  
  return NextResponse.json({
    ...rankingData,
    message: 'Score submitted successfully'
  })
}

async function handleGet(searchParams: URLSearchParams) {
  const id = searchParams.get('id')
  const limit = parseInt(searchParams.get('limit') || '10')
  
  if (!id) {
    return NextResponse.json({ 
      error: 'id parameter is required for get action' 
    }, { status: 400 })
  }
  
  if (limit < 1 || limit > 100) {
    return NextResponse.json({ 
      error: 'limit parameter must be between 1 and 100' 
    }, { status: 400 })
  }
  
  // ランキングデータを取得
  const rankingData = await rankingService.getRankingById(id, limit)
  
  if (!rankingData) {
    return NextResponse.json({ 
      error: 'Ranking not found' 
    }, { status: 404 })
  }
  
  return NextResponse.json(rankingData)
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
  
  const success = await rankingService.clearRanking(url, token)
  
  if (!success) {
    return NextResponse.json({ 
      error: 'Invalid token or ranking not found' 
    }, { status: 403 })
  }
  
  return NextResponse.json({
    success: true,
    message: `Ranking for ${url} has been cleared`
  })
}

async function handleRemove(searchParams: URLSearchParams) {
  const url = searchParams.get('url')
  const token = searchParams.get('token')
  const name = searchParams.get('name')
  
  if (!url || !token || !name) {
    return NextResponse.json({ 
      error: 'url, token, and name parameters are required for remove action' 
    }, { status: 400 })
  }
  
  if (!validateURL(url)) {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
  }
  
  const success = await rankingService.removeScore(url, token, name)
  
  if (!success) {
    return NextResponse.json({ 
      error: 'Invalid token, ranking not found, or name not found' 
    }, { status: 403 })
  }
  
  return NextResponse.json({
    success: true,
    message: `Score for ${name} has been removed`
  })
}

async function handleUpdate(searchParams: URLSearchParams) {
  const url = searchParams.get('url')
  const token = searchParams.get('token')
  const name = searchParams.get('name')
  const score = parseInt(searchParams.get('score') || '0')
  
  if (!url || !token || !name) {
    return NextResponse.json({ 
      error: 'url, token, and name parameters are required for update action' 
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
  
  if (name.length > 20) {
    return NextResponse.json({ 
      error: 'Name must be 20 characters or less' 
    }, { status: 400 })
  }
  
  const success = await rankingService.updateScore(url, token, name, score)
  
  if (!success) {
    return NextResponse.json({ 
      error: 'Invalid token, ranking not found, or name not found' 
    }, { status: 403 })
  }
  
  return NextResponse.json({
    success: true,
    message: `Score for ${name} has been updated to ${score}`
  })
}

export async function POST(request: NextRequest) {
  return GET(request)
}