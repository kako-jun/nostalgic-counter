import { createHash } from 'crypto'

/**
 * 公開ID生成（ドメイン-ハッシュ8桁）
 */
export function generatePublicId(url: string): string {
  const urlObject = new URL(url)
  const domain = urlObject.hostname.replace(/^www\./, '').split('.')[0]
  const hash = createHash('sha256').update(url).digest('hex').substring(0, 8)
  return `${domain}-${hash}`
}