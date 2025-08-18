/**
 * TTL (Time To Live) constants for Redis keys
 * All values are in seconds
 */

export const TTL = {
  /**
   * Duplicate prevention for counter visits
   * 24 hours = 86400 seconds
   */
  DUPLICATE_PREVENTION: 24 * 60 * 60,

  /**
   * User state persistence for like service
   * 30 days = 2592000 seconds
   */
  USER_STATE: 30 * 24 * 60 * 60,

  /**
   * Daily statistics retention for counters
   * 90 days = 7776000 seconds
   */
  DAILY_STATS: 90 * 24 * 60 * 60,

  /**
   * Session-based temporary data
   * 1 hour = 3600 seconds
   */
  SESSION: 60 * 60,

  /**
   * Cache for API responses
   * 5 minutes = 300 seconds
   */
  CACHE_SHORT: 5 * 60,

  /**
   * Cache for display images/data
   * 1 hour = 3600 seconds
   */
  CACHE_MEDIUM: 60 * 60,

  /**
   * Cache for static data
   * 24 hours = 86400 seconds
   */
  CACHE_LONG: 24 * 60 * 60,

  /**
   * Rate limiting window
   * 1 minute = 60 seconds
   */
  RATE_LIMIT: 60,

  /**
   * Temporary locks for atomic operations
   * 10 seconds
   */
  LOCK: 10,

  /**
   * BBS post edit window
   * 5 minutes = 300 seconds
   */
  EDIT_WINDOW: 5 * 60,
} as const

/**
 * TTL values in minutes for easier readability
 */
export const TTL_MINUTES = {
  DUPLICATE_PREVENTION: TTL.DUPLICATE_PREVENTION / 60,
  USER_STATE: TTL.USER_STATE / 60,
  DAILY_STATS: TTL.DAILY_STATS / 60,
  SESSION: TTL.SESSION / 60,
  CACHE_SHORT: TTL.CACHE_SHORT / 60,
  CACHE_MEDIUM: TTL.CACHE_MEDIUM / 60,
  CACHE_LONG: TTL.CACHE_LONG / 60,
  RATE_LIMIT: TTL.RATE_LIMIT / 60,
  LOCK: TTL.LOCK / 60,
  EDIT_WINDOW: TTL.EDIT_WINDOW / 60,
} as const

/**
 * TTL values in hours for easier readability
 */
export const TTL_HOURS = {
  DUPLICATE_PREVENTION: TTL.DUPLICATE_PREVENTION / 3600,
  USER_STATE: TTL.USER_STATE / 3600,
  DAILY_STATS: TTL.DAILY_STATS / 3600,
  SESSION: TTL.SESSION / 3600,
  CACHE_SHORT: TTL.CACHE_SHORT / 3600,
  CACHE_MEDIUM: TTL.CACHE_MEDIUM / 3600,
  CACHE_LONG: TTL.CACHE_LONG / 3600,
  RATE_LIMIT: TTL.RATE_LIMIT / 3600,
  LOCK: TTL.LOCK / 3600,
  EDIT_WINDOW: TTL.EDIT_WINDOW / 3600,
} as const

/**
 * TTL values in days for easier readability
 */
export const TTL_DAYS = {
  DUPLICATE_PREVENTION: TTL.DUPLICATE_PREVENTION / 86400,
  USER_STATE: TTL.USER_STATE / 86400,
  DAILY_STATS: TTL.DAILY_STATS / 86400,
  SESSION: TTL.SESSION / 86400,
  CACHE_SHORT: TTL.CACHE_SHORT / 86400,
  CACHE_MEDIUM: TTL.CACHE_MEDIUM / 86400,
  CACHE_LONG: TTL.CACHE_LONG / 86400,
  RATE_LIMIT: TTL.RATE_LIMIT / 86400,
  LOCK: TTL.LOCK / 86400,
  EDIT_WINDOW: TTL.EDIT_WINDOW / 86400,
} as const

/**
 * Service-specific TTL configurations
 */
export const SERVICE_TTL = {
  counter: {
    duplicatePrevention: TTL.DUPLICATE_PREVENTION,
    dailyStats: TTL.DAILY_STATS,
    display: TTL.CACHE_MEDIUM,
  },
  like: {
    userState: TTL.USER_STATE,
    display: TTL.CACHE_MEDIUM,
  },
  ranking: {
    display: TTL.CACHE_SHORT, // Rankings change frequently
    cache: TTL.CACHE_MEDIUM,
  },
  bbs: {
    editWindow: TTL.EDIT_WINDOW,
    cache: TTL.CACHE_SHORT, // Messages change frequently
  },
} as const

/**
 * Gets TTL value for a specific service and purpose
 */
export function getServiceTTL(
  service: keyof typeof SERVICE_TTL,
  purpose: string
): number {
  const serviceTTL = SERVICE_TTL[service] as Record<string, number>
  return serviceTTL[purpose] || TTL.CACHE_MEDIUM
}

/**
 * Formats TTL duration as human-readable string
 */
export function formatTTL(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} seconds`
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600)
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  } else {
    const days = Math.floor(seconds / 86400)
    return `${days} day${days !== 1 ? 's' : ''}`
  }
}

/**
 * Calculates expiration timestamp
 */
export function getExpirationTime(ttlSeconds: number): Date {
  return new Date(Date.now() + ttlSeconds * 1000)
}

/**
 * Checks if a timestamp has expired
 */
export function isExpired(timestamp: Date | string | number): boolean {
  const expTime = typeof timestamp === 'string' || typeof timestamp === 'number' 
    ? new Date(timestamp) 
    : timestamp
  return expTime.getTime() < Date.now()
}