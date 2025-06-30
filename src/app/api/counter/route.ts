import { NextRequest, NextResponse } from 'next/server'
import { counterDB } from '@/lib/db'
import { validateURL } from '@/lib/utils'
import { generateCounterSVG } from '@/lib/image-generator'
import { CounterType } from '@/types/counter'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    const type = (searchParams.get('type') || 'total') as CounterType
    const style = searchParams.get('style') || 'classic'
    const digits = parseInt(searchParams.get('digits') || '6')
    
    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
    }
    
    if (!validateURL(url)) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }
    
    if (!['total', 'today', 'yesterday', 'week', 'month'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
    
    if (!['classic', 'modern', 'retro'].includes(style)) {
      return NextResponse.json({ error: 'Invalid style parameter' }, { status: 400 })
    }
    
    // カウンターデータを取得
    const counterData = await counterDB.getCounter(url)
    
    if (!counterData) {
      // カウンターが存在しない場合は0を表示
      const svg = generateCounterSVG({
        value: 0,
        type,
        style: style as 'classic' | 'modern' | 'retro',
        digits
      })
      
      return new NextResponse(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=60', // 1分キャッシュ
        },
      })
    }
    
    // 指定されたタイプの値を取得
    const value = counterData[type]
    
    // SVG画像を生成
    const svg = generateCounterSVG({
      value,
      type,
      style: style as 'classic' | 'modern' | 'retro',
      digits
    })
    
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=60', // 1分キャッシュ
      },
    })
    
  } catch (error) {
    console.error('Error in counter API:', error)
    
    // エラー時はエラー画像を返す
    const errorSvg = generateCounterSVG({
      value: 0,
      type: 'total',
      style: 'classic',
      digits: 6
    })
    
    return new NextResponse(errorSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache',
      },
      status: 500
    })
  }
}