import { NextRequest } from 'next/server'

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return request.ip || 'unknown'
}

export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown'
}

export function validateURL(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function generateCounterKey(url: string, ip: string, userAgent: string): string {
  // 重複防止用のキー生成（24時間有効）
  const date = new Date().toISOString().split('T')[0]
  return `${url}:${ip}:${userAgent}:${date}`
}

export function isValidAdminToken(token: string): boolean {
  // 管理者用トークンの検証
  const adminToken = process.env.ADMIN_TOKEN
  return adminToken && token === adminToken
}