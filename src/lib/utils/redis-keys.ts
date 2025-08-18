/**
 * Redis key builder utility for consistent key generation across services
 */
export class RedisKeyBuilder {
  constructor(protected service: string) {}

  /**
   * Service metadata key: {service}:{id}
   */
  metadata(id: string): string {
    return `${this.service}:${id}`
  }

  /**
   * Owner token hash key: {service}:{id}:owner
   */
  owner(id: string): string {
    return `${this.service}:${id}:owner`
  }

  /**
   * URL to ID mapping key: url:{service}:{encodedUrl}
   */
  urlMapping(url: string): string {
    return `url:${this.service}:${encodeURIComponent(url)}`
  }

  /**
   * Service-specific data key: {service}:{id}:{dataType}
   */
  data(id: string, dataType: string): string {
    return `${this.service}:${id}:${dataType}`
  }
}

/**
 * Counter-specific Redis key builder
 */
export class CounterRedisKeys extends RedisKeyBuilder {
  constructor() {
    super('counter')
  }

  /**
   * Total count key: counter:{id}:total
   */
  total(id: string): string {
    return this.data(id, 'total')
  }

  /**
   * Daily count key: counter:{id}:daily:{date}
   */
  daily(id: string, date: string): string {
    return `${this.service}:${id}:daily:${date}`
  }

  /**
   * Last visit timestamp key: counter:{id}:lastVisit
   */
  lastVisit(id: string): string {
    return this.data(id, 'lastVisit')
  }

  /**
   * Visit duplicate prevention key: visit:counter:{id}:{userHash}
   */
  visitCheck(id: string, userHash: string): string {
    return `visit:${this.service}:${id}:${userHash}`
  }
}

/**
 * Like-specific Redis key builder
 */
export class LikeRedisKeys extends RedisKeyBuilder {
  constructor() {
    super('like')
  }

  /**
   * Total likes key: like:{id}:total
   */
  total(id: string): string {
    return this.data(id, 'total')
  }

  /**
   * User state key: like:{id}:users:{userHash}
   */
  userState(id: string, userHash: string): string {
    return `${this.service}:${id}:users:${userHash}`
  }
}

/**
 * Ranking-specific Redis key builder
 */
export class RankingRedisKeys extends RedisKeyBuilder {
  constructor() {
    super('ranking')
  }

  /**
   * Scores sorted set key: ranking:{id}:scores
   */
  scores(id: string): string {
    return this.data(id, 'scores')
  }

  /**
   * Metadata key: ranking:{id}:meta
   */
  meta(id: string): string {
    return this.data(id, 'meta')
  }
}

/**
 * BBS-specific Redis key builder
 */
export class BBSRedisKeys extends RedisKeyBuilder {
  constructor() {
    super('bbs')
  }

  /**
   * Messages list key: bbs:{id}:messages
   */
  messages(id: string): string {
    return this.data(id, 'messages')
  }
}

// Export singleton instances
export const counterKeys = new CounterRedisKeys()
export const likeKeys = new LikeRedisKeys()
export const rankingKeys = new RankingRedisKeys()
export const bbsKeys = new BBSRedisKeys()

/**
 * Get Redis key builder for a specific service
 */
export function getRedisKeys(service: string): RedisKeyBuilder {
  switch (service) {
    case 'counter':
      return counterKeys
    case 'like':
      return likeKeys
    case 'ranking':
      return rankingKeys
    case 'bbs':
      return bbsKeys
    default:
      return new RedisKeyBuilder(service)
  }
}