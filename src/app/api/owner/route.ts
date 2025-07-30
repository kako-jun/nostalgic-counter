import { NextRequest, NextResponse } from 'next/server'
import { counterDB } from '@/lib/db'
import { validateURL } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const token = searchParams.get('token')
    const url = searchParams.get('url')
    
    if (!action || !url || !token) {
      return NextResponse.json({ 
        error: 'action, url, and token parameters are required' 
      }, { status: 400 })
    }
    
    if (!validateURL(url)) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }
    
    switch (action) {
      case 'set':
        const total = parseInt(searchParams.get('total') || '0')
        
        const success = await counterDB.setCounterValue(url, token, total)
        
        if (!success) {
          return NextResponse.json({ 
            error: 'Invalid token or counter not found' 
          }, { status: 403 })
        }
        
        return NextResponse.json({
          success: true,
          message: `Counter for ${url} has been set to ${total}`
        })
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Error in owner API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return GET(request) // POST も GET と同じ処理
}