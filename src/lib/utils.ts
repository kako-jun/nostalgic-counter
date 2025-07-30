import { NextRequest } from 'next/server'
import crypto from 'crypto'

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


// 公開ID生成関数
export function generatePublicId(url: string): string {
  try {
    const domain = new URL(url).hostname.replace(/^www\./, '')
    const hash = crypto.createHash('sha256')
      .update(url + Date.now())
      .digest('hex')
      .substring(0, 8)
    
    // ドメインの最初の部分を取得（最大8文字に制限）
    let domainPart = domain.split('.')[0].toLowerCase()
    if (domainPart.length > 8) {
      domainPart = domainPart.substring(0, 8)
    }
    
    // 固定長フォーマット: ドメイン部(最大8) + ハッシュ(8) = 最大17文字
    return `${domainPart}-${hash}`
  } catch {
    // URLが無効な場合のフォールバック
    const hash = crypto.createHash('sha256')
      .update(url + Date.now())
      .digest('hex')
      .substring(0, 8)
    
    return `site-${hash}`
  }
}

// オーナートークンのハッシュ化
export function hashOwnerToken(token: string): string {
  if (token.length < 8) {
    throw new Error('Owner token must be at least 8 characters long')
  }
  return crypto.createHash('sha256').update(token).digest('hex')
}

// オーナートークンの検証（長さチェック付き）
export function validateOwnerToken(token: string): boolean {
  return token && token.length >= 8 && token.length <= 16
}

// オーナートークンの検証
export function verifyOwnerToken(token: string, hashedToken: string): boolean {
  const inputHash = hashOwnerToken(token)
  return inputHash === hashedToken
}

// 重複防止用キー生成（KV用）
export function generateVisitKey(id: string, ip: string, userAgent: string): string {
  const today = new Date().toISOString().split('T')[0]
  const hash = crypto.createHash('sha256')
    .update(`${ip}:${userAgent}:${today}`)
    .digest('hex')
    .substring(0, 16)
  
  return `visit:${id}:${hash}`
}