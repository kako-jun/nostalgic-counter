import { createHash } from 'crypto'

/**
 * トークンをハッシュ化（SHA256）
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/**
 * オーナートークンの検証（8-16文字）
 */
export function validateOwnerToken(token: string): boolean {
  return token.length >= 8 && token.length <= 16
}