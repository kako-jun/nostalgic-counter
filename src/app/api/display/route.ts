import { NextRequest, NextResponse } from 'next/server'
import { counterDB } from '@/lib/db'
import { validateURL } from '@/lib/utils'
import { generateCounterSVG } from '@/lib/image-generator'
import { CounterType } from '@/types/counter'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const type = (searchParams.get('type') || 'total') as CounterType
    const theme = searchParams.get('theme') || searchParams.get('style') || 'classic' // 後方互換性のためstyleも残す
    const digits = parseInt(searchParams.get('digits') || '6')
    const format = searchParams.get('format') || 'image'
    
    if (!id) {
      return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 })
    }
    
    if (!['total', 'today', 'yesterday', 'week', 'month'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
    
    if (!['classic', 'modern', 'retro'].includes(theme)) {
      return NextResponse.json({ error: 'Invalid theme parameter' }, { status: 400 })
    }
    
    // カウンターデータを取得
    const counterData = await counterDB.getCounterById(id)
    
    if (!counterData) {
      // カウンターが存在しない場合
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
        type,
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
    
    // 指定されたタイプの値を取得
    const value = counterData[type]
    
    // フォーマットに応じてレスポンス
    if (format === 'text') {
      return new NextResponse(value.toString(), {
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'public, max-age=60',
        },
      })
    }
    
    // SVG画像を生成
    const svg = generateCounterSVG({
      value,
      type,
      style: theme as 'classic' | 'modern' | 'retro',
      digits
    })
    
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=60',
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