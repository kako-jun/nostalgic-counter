import { NextRequest } from 'next/server'

/**
 * クライアントIPを取得
 */
export function getClientIP(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) {
    return xff.split(',')[0].trim()
  }
  const xRealIP = request.headers.get('x-real-ip')
  if (xRealIP) {
    return xRealIP
  }
  return '127.0.0.1'
}

/**
 * UserAgentを取得
 */
export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown'
}