/**
 * URL形式の検証
 */
export function validateURL(url: string): boolean {
  try {
    const urlObject = new URL(url)
    return urlObject.protocol === 'http:' || urlObject.protocol === 'https:'
  } catch {
    return false
  }
}