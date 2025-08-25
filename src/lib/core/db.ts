import Redis from 'ioredis'

let redis: Redis | null = null

// Redisインターフェース
interface RedisLike {
  get(key: string): Promise<string | null>
  set(key: string, value: string, ...args: (string | number)[]): Promise<any>
  setex(key: string, seconds: number, value: string): Promise<any>
  incr(key: string): Promise<number>
  incrby(key: string, increment: number): Promise<number>
  decrby(key: string, decrement: number): Promise<number>
  exists(key: string): Promise<number>
  expire(key: string, seconds: number): Promise<any>
  del(...keys: string[]): Promise<any>
  keys(pattern: string): Promise<string[]>
  // List operations
  lpush(key: string, ...values: string[]): Promise<number>
  lrange(key: string, start: number, end: number): Promise<string[]>
  llen(key: string): Promise<number>
  ltrim(key: string, start: number, end: number): Promise<any>
  rpush(key: string, ...values: string[]): Promise<any>
  // Sorted Set operations
  zadd(key: string, score: number, member: string): Promise<any>
  zrevrange(key: string, start: number, end: number, withScores?: string): Promise<string[]>
  zcard(key: string): Promise<number>
  zremrangebyrank(key: string, start: number, end: number): Promise<any>
  zrem(key: string, member: string): Promise<number>
  zscore(key: string, member: string): Promise<string | null>
  // Hash operations
  hset(key: string, field: string, value: string): Promise<any>
  hget(key: string, field: string): Promise<string | null>
  hgetall(key: string): Promise<Record<string, string>>
  hdel(key: string, field: string): Promise<number>
}

export function getRedis(): RedisLike {
  if (!redis) {
    if (!process.env.REDIS_URL) {
      throw new Error('REDIS_URL environment variable is required')
    }
    
    redis = new Redis(process.env.REDIS_URL)
    console.log('[DB] Redis connection established')
  }
  
  return redis as unknown as RedisLike
}