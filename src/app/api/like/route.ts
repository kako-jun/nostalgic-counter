import { NextRequest, NextResponse } from 'next/server'
import { likeService } from '@/lib/services/like'
import { getClientIP, getUserAgent } from '@/lib/utils/request'
import { validateURL } from '@/lib/utils/validation'
import { validateOwnerToken } from '@/lib/core/auth'
import { generateCounterSVG } from '@/lib/image-generator'
import { LikeType } from '@/types/like'

import { addCorsHeaders, createCorsOptionsResponse } from '@/lib/utils/cors'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    if (!action) {
      return addCorsHeaders(NextResponse.json({ 
        error: 'action parameter is required' 
      }, { status: 400 }))
    }
    
    let response: NextResponse
    
    switch (action) {
      case 'create':
        response = await handleCreate(request, searchParams)
        break
      
      case 'toggle':
        response = await handleToggle(request, searchParams)
        break
      
      case 'display':
        response = await handleDisplay(request, searchParams)
        break
      
      case 'set':
        response = await handleSet(searchParams)
        break
      
      default:
        response = NextResponse.json({ 
          error: 'Invalid action. Valid actions are: create, toggle, display, set' 
        }, { status: 400 })
        break
    }
    
    return addCorsHeaders(response)
    
  } catch (error) {
    console.error('Error in like API:', error)
    return addCorsHeaders(NextResponse.json({ error: 'Internal server error' }, { status: 500 }))
  }
}

export async function OPTIONS() {
  return createCorsOptionsResponse()
}

async function handleCreate(request: NextRequest, searchParams: URLSearchParams) {
  const url = searchParams.get('url')
  const token = searchParams.get('token')
  
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
  
  // 既存いいねを検索
  const existing = await likeService.getLikeByUrl(url)
  
  if (existing) {
    // 既存いいね：オーナー確認
    if (!await likeService.verifyOwnership(url, token)) {
      return NextResponse.json({ error: 'Invalid token for this URL' }, { status: 403 })
    }
    
    return NextResponse.json({
      id: existing.id,
      url: existing.url,
      message: 'Like already exists'
    })
  }
  
  // 新規作成
  const { id: newId, likeData } = await likeService.createLike(url, token)
  
  return NextResponse.json({ 
    ...likeData,
    message: 'Like created successfully'
  })
}

async function handleToggle(request: NextRequest, searchParams: URLSearchParams) {
  const id = searchParams.get('id')
  
  if (!id) {
    return NextResponse.json({ 
      error: 'id parameter is required for toggle action' 
    }, { status: 400 })
  }
  
  const clientIP = getClientIP(request)
  const userAgent = getUserAgent(request)
  const userHash = likeService.generateUserHash(clientIP, userAgent)
  
  // いいねの切り替え
  const likeData = await likeService.toggleLike(id, userHash)
  if (!likeData) {
    return NextResponse.json({ error: 'Like not found' }, { status: 404 })
  }
  
  return NextResponse.json(likeData)
}

async function handleDisplay(request: NextRequest, searchParams: URLSearchParams) {
  const id = searchParams.get('id')
  const theme = searchParams.get('theme') || searchParams.get('style') || 'classic'
  const digits = parseInt(searchParams.get('digits') || '6')
  const format = searchParams.get('format') || 'image'
  
  if (!id) {
    return NextResponse.json({ error: 'id parameter is required' }, { status: 400 })
  }
  
  if (!['classic', 'modern', 'retro'].includes(theme)) {
    return NextResponse.json({ error: 'Invalid theme parameter' }, { status: 400 })
  }
  
  const clientIP = getClientIP(request)
  const userAgent = getUserAgent(request)
  const userHash = likeService.generateUserHash(clientIP, userAgent)
  
  // いいねデータを取得
  const likeData = await likeService.getLikeById(id, userHash)
  
  if (!likeData) {
    // いいねが存在しない場合
    if (format === 'text') {
      return new NextResponse('0', {
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'public, max-age=60',
        },
      })
    }
    
    const svg = generateCounterSVG({
      value: 0,
      type: 'total',
      style: theme as 'classic' | 'modern' | 'retro',
      digits
    })
    
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=60',
      },
    })
  }
  
  // フォーマットに応じてレスポンス
  if (format === 'text') {
    return new NextResponse(likeData.total.toString(), {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=60',
      },
    })
  }
  
  if (format === 'json') {
    return NextResponse.json(likeData)
  }
  
  // SVG画像を生成（いいねアイコン付き）
  const svg = generateLikeSVG({
    value: likeData.total,
    userLiked: likeData.userLiked,
    style: theme as 'classic' | 'modern' | 'retro',
    digits
  })
  
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=60',
    },
  })
}

async function handleSet(searchParams: URLSearchParams) {
  const url = searchParams.get('url')
  const token = searchParams.get('token')
  const total = parseInt(searchParams.get('total') || '0')
  
  if (!url || !token) {
    return NextResponse.json({ 
      error: 'url and token parameters are required for set action' 
    }, { status: 400 })
  }
  
  if (!validateURL(url)) {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
  }
  
  const success = await likeService.setLikeValue(url, token, total)
  
  if (!success) {
    return NextResponse.json({ 
      error: 'Invalid token or like not found' 
    }, { status: 403 })
  }
  
  return NextResponse.json({
    success: true,
    message: `Like for ${url} has been set to ${total}`
  })
}

// いいね専用のSVG生成関数
function generateLikeSVG({
  value,
  userLiked,
  style,
  digits
}: {
  value: number
  userLiked: boolean
  style: 'classic' | 'modern' | 'retro'
  digits: number
}) {
  const heartColor = userLiked ? '#ff4757' : '#ddd'
  const heartIcon = userLiked ? '♥' : '♡'
  
  // 基本のカウンターSVGを取得して、ハートアイコンを追加
  const baseSvg = generateCounterSVG({
    value,
    type: 'total',
    style,
    digits
  })
  
  // SVGにハートアイコンを追加
  const modifiedSvg = baseSvg.replace(
    '</svg>',
    `<text x="10" y="15" fill="${heartColor}" font-size="12" font-family="Arial">${heartIcon}</text></svg>`
  )
  
  return modifiedSvg
}

export async function POST(request: NextRequest) {
  return GET(request)
}