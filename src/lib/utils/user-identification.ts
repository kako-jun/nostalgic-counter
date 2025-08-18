import crypto from 'crypto'

/**
 * Generates a user hash from IP and User-Agent
 * Used for like service user identification
 */
export function generateUserHash(ip: string, userAgent: string): string {
  const combined = `${ip}:${userAgent}`
  return crypto.createHash('sha256').update(combined).digest('hex').substring(0, 16)
}

/**
 * Generates a daily user hash from IP, User-Agent, and date
 * Used for counter service duplicate prevention (24h window)
 */
export function generateDailyUserHash(ip: string, userAgent: string, date?: Date): string {
  const targetDate = date || new Date()
  const dateStr = targetDate.toISOString().split('T')[0] // YYYY-MM-DD format
  const combined = `${ip}:${userAgent}:${dateStr}`
  return crypto.createHash('sha256').update(combined).digest('hex').substring(0, 16)
}

/**
 * Generates a simple IP hash
 * Used for basic IP-based identification
 */
export function generateIPHash(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 12)
}

/**
 * Generates an author hash for BBS posts
 * Combines IP, User-Agent, and additional entropy for post identification
 */
export function generateAuthorHash(ip: string, userAgent: string, timestamp?: number): string {
  const time = timestamp || Date.now()
  const combined = `${ip}:${userAgent}:${time}`
  return crypto.createHash('sha256').update(combined).digest('hex').substring(0, 12)
}

/**
 * Validates if a hash matches the expected format
 */
export function isValidHash(hash: string, expectedLength: number = 16): boolean {
  if (typeof hash !== 'string') return false
  if (hash.length !== expectedLength) return false
  return /^[a-f0-9]+$/.test(hash)
}

/**
 * Generates a session-based hash for temporary identification
 * Used for preventing rapid duplicate actions within a session
 */
export function generateSessionHash(ip: string, userAgent: string, sessionKey?: string): string {
  const session = sessionKey || 'default'
  const combined = `${ip}:${userAgent}:${session}`
  return crypto.createHash('sha256').update(combined).digest('hex').substring(0, 8)
}

/**
 * User identification utility class
 * Provides consistent user identification across services
 */
export class UserIdentification {
  constructor(
    private ip: string,
    private userAgent: string
  ) {}

  /**
   * Get standard user hash (for likes, persistent user state)
   */
  getUserHash(): string {
    return generateUserHash(this.ip, this.userAgent)
  }

  /**
   * Get daily user hash (for 24h duplicate prevention)
   */
  getDailyHash(date?: Date): string {
    return generateDailyUserHash(this.ip, this.userAgent, date)
  }

  /**
   * Get IP hash (for IP-based tracking)
   */
  getIPHash(): string {
    return generateIPHash(this.ip)
  }

  /**
   * Get author hash (for BBS posts)
   */
  getAuthorHash(timestamp?: number): string {
    return generateAuthorHash(this.ip, this.userAgent, timestamp)
  }

  /**
   * Get session hash (for temporary session tracking)
   */
  getSessionHash(sessionKey?: string): string {
    return generateSessionHash(this.ip, this.userAgent, sessionKey)
  }
}

/**
 * Creates a UserIdentification instance from IP and User-Agent
 */
export function createUserIdentification(ip: string, userAgent: string): UserIdentification {
  return new UserIdentification(ip, userAgent)
}