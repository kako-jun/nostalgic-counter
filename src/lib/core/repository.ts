/**
 * Repository パターン - Redis操作の完全抽象化
 */

import { z } from 'zod'
import { Result, Ok, Err, StorageError, NotFoundError, ValidationError } from './result'
import { ValidationFramework } from './validation'
import { getRedis } from './db'

/**
 * Redis Repository の基底クラス
 */
export abstract class BaseRepository<TEntity, TId = string> {
  protected readonly redis = getRedis()
  
  constructor(
    protected readonly entitySchema: z.ZodType<TEntity>,
    protected readonly keyPrefix: string
  ) {}

  /**
   * エンティティの保存
   */
  async save(id: TId, entity: TEntity): Promise<Result<void, StorageError | ValidationError>> {
    const serializationResult = ValidationFramework.storage(this.entitySchema, entity)
    
    if (!serializationResult.success) {
      return serializationResult
    }

    try {
      await this.redis.set(this.buildKey(id), serializationResult.data)
      return Ok(undefined)
    } catch (error) {
      return Err(new StorageError('save', error instanceof Error ? error.message : String(error)))
    }
  }

  /**
   * エンティティの取得
   */
  async get(id: TId): Promise<Result<TEntity, StorageError | ValidationError | NotFoundError>> {
    try {
      const serialized = await this.redis.get(this.buildKey(id))
      
      if (serialized === null) {
        return Err(new NotFoundError(this.keyPrefix, String(id)))
      }

      return ValidationFramework.fromStorage(this.entitySchema, serialized)
    } catch (error) {
      return Err(new StorageError('get', error instanceof Error ? error.message : String(error)))
    }
  }

  /**
   * エンティティの存在確認
   */
  async exists(id: TId): Promise<Result<boolean, StorageError>> {
    try {
      const key = this.buildKey(id)
      const result = await this.redis.exists(key)
      return Ok(result === 1)
    } catch (error) {
      return Err(new StorageError('exists', error instanceof Error ? error.message : String(error)))
    }
  }

  /**
   * エンティティの削除
   */
  async delete(id: TId): Promise<Result<boolean, StorageError>> {
    try {
      const result = await this.redis.del(this.buildKey(id))
      return Ok(result === 1)
    } catch (error) {
      return Err(new StorageError('delete', error instanceof Error ? error.message : String(error)))
    }
  }

  /**
   * TTL設定付き保存
   */
  async saveWithTTL(
    id: TId, 
    entity: TEntity, 
    ttlSeconds: number
  ): Promise<Result<void, StorageError | ValidationError>> {
    const serializationResult = ValidationFramework.storage(this.entitySchema, entity)
    
    if (!serializationResult.success) {
      return serializationResult
    }

    try {
      await this.redis.setex(this.buildKey(id), ttlSeconds, serializationResult.data)
      return Ok(undefined)
    } catch (error) {
      return Err(new StorageError('saveWithTTL', error instanceof Error ? error.message : String(error)))
    }
  }

  /**
   * アトミックな設定（キーが存在しない場合のみ）
   */
  async setIfNotExists(
    id: TId, 
    entity: TEntity, 
    ttlSeconds: number
  ): Promise<Result<boolean, StorageError | ValidationError>> {
    const serializationResult = ValidationFramework.storage(this.entitySchema, entity)
    
    if (!serializationResult.success) {
      return serializationResult
    }

    try {
      // Redis SET key value NX EX ttl コマンド（ioredis形式）
      const result = await this.redis.set(
        this.buildKey(id), 
        serializationResult.data, 
        'NX',
        'EX',
        ttlSeconds
      )
      // 'OK' = 設定成功（新規）、null = キーが既に存在
      return Ok(result === 'OK')
    } catch (error) {
      return Err(new StorageError('setIfNotExists', error instanceof Error ? error.message : String(error)))
    }
  }

  /**
   * キーの構築（サブクラスでオーバーライド可能）
   */
  protected buildKey(id: TId): string {
    return `${this.keyPrefix}:${String(id)}`
  }
}

/**
 * 数値を扱うRedis Repository
 */
export class NumberRepository {
  private readonly redis = getRedis()

  constructor(private readonly keyPrefix: string) {}

  async get(key: string): Promise<Result<number, StorageError | ValidationError>> {
    try {
      const value = await this.redis.get(this.buildKey(key))
      return ValidationFramework.parseNumber(value, 0)
    } catch (error) {
      return Err(new StorageError('get number', error instanceof Error ? error.message : String(error)))
    }
  }

  async set(key: string, value: number): Promise<Result<void, StorageError>> {
    try {
      await this.redis.set(this.buildKey(key), value.toString())
      return Ok(undefined)
    } catch (error) {
      return Err(new StorageError('set number', error instanceof Error ? error.message : String(error)))
    }
  }

  async increment(key: string, by: number = 1): Promise<Result<number, StorageError>> {
    try {
      const newValue = await this.redis.incrby(this.buildKey(key), by)
      return Ok(newValue)
    } catch (error) {
      return Err(new StorageError('increment', error instanceof Error ? error.message : String(error)))
    }
  }

  async decrement(key: string, by: number = 1): Promise<Result<number, StorageError>> {
    try {
      const newValue = await this.redis.decrby(this.buildKey(key), by)
      return Ok(Math.max(0, newValue)) // 負の値を避ける
    } catch (error) {
      return Err(new StorageError('decrement', error instanceof Error ? error.message : String(error)))
    }
  }

  private buildKey(key: string): string {
    return `${this.keyPrefix}:${key}`
  }
}

/**
 * リストを扱うRedis Repository
 */
export class ListRepository<T> {
  private readonly redis = getRedis()

  constructor(
    private readonly itemSchema: z.ZodType<T>,
    private readonly keyPrefix: string
  ) {}

  async push(key: string, items: T[]): Promise<Result<number, StorageError | ValidationError>> {
    const serializedItems: string[] = []
    
    // 全アイテムを事前にシリアライズして検証
    for (const item of items) {
      const serializationResult = ValidationFramework.storage(this.itemSchema, item)
      if (!serializationResult.success) {
        return serializationResult
      }
      serializedItems.push(serializationResult.data)
    }

    try {
      const length = await this.redis.lpush(this.buildKey(key), ...serializedItems)
      return Ok(length)
    } catch (error) {
      return Err(new StorageError('list push', error instanceof Error ? error.message : String(error)))
    }
  }


  async range(
    key: string, 
    start: number = 0, 
    end: number = -1
  ): Promise<Result<T[], StorageError | ValidationError>> {
    try {
      const serializedItems = await this.redis.lrange(this.buildKey(key), start, end)
      return ValidationFramework.fromStringArray(this.itemSchema, serializedItems)
    } catch (error) {
      return Err(new StorageError('list range', error instanceof Error ? error.message : String(error)))
    }
  }

  async length(key: string): Promise<Result<number, StorageError>> {
    try {
      const length = await this.redis.llen(this.buildKey(key))
      return Ok(length)
    } catch (error) {
      return Err(new StorageError('list length', error instanceof Error ? error.message : String(error)))
    }
  }

  async trim(key: string, start: number, end: number): Promise<Result<void, StorageError>> {
    try {
      await this.redis.ltrim(this.buildKey(key), start, end)
      return Ok(undefined)
    } catch (error) {
      return Err(new StorageError('list trim', error instanceof Error ? error.message : String(error)))
    }
  }

  async clear(key: string): Promise<Result<void, StorageError>> {
    try {
      await this.redis.del(this.buildKey(key))
      return Ok(undefined)
    } catch (error) {
      return Err(new StorageError('list clear', error instanceof Error ? error.message : String(error)))
    }
  }

  private buildKey(key: string): string {
    return `${this.keyPrefix}:${key}`
  }
}

/**
 * ソートセットを扱うRedis Repository（ランキング用）
 */
export class SortedSetRepository {
  private readonly redis = getRedis()

  constructor(private readonly keyPrefix: string) {}

  async add(key: string, member: string, score: number): Promise<Result<boolean, StorageError>> {
    try {
      const added = await this.redis.zadd(this.buildKey(key), score, member)
      return Ok(added === 1)
    } catch (error) {
      return Err(new StorageError('sorted set add', error instanceof Error ? error.message : String(error)))
    }
  }

  async remove(key: string, member: string): Promise<Result<boolean, StorageError>> {
    try {
      const removed = await this.redis.zrem(this.buildKey(key), member)
      return Ok(removed === 1)
    } catch (error) {
      return Err(new StorageError('sorted set remove', error instanceof Error ? error.message : String(error)))
    }
  }

  async getScore(key: string, member: string): Promise<Result<number | null, StorageError>> {
    try {
      const score = await this.redis.zscore(this.buildKey(key), member)
      return Ok(score ? parseFloat(score) : null)
    } catch (error) {
      return Err(new StorageError('sorted set get score', error instanceof Error ? error.message : String(error)))
    }
  }

  async getRangeWithScores(
    key: string, 
    start: number = 0, 
    end: number = -1
  ): Promise<Result<Array<{member: string, score: number}>, StorageError | ValidationError>> {
    try {
      const rawEntries = await this.redis.zrevrange(this.buildKey(key), start, end, 'WITHSCORES')
      
      if (!Array.isArray(rawEntries)) {
        return Err(new StorageError('sorted set range', 'Invalid response format'))
      }

      if (rawEntries.length % 2 !== 0) {
        return Err(new StorageError('sorted set range', 'Odd number of elements in response'))
      }

      const entries: Array<{member: string, score: number}> = []
      
      for (let i = 0; i < rawEntries.length; i += 2) {
        const member = rawEntries[i]
        const scoreStr = rawEntries[i + 1]
        
        if (typeof member !== 'string') {
          return Err(new ValidationError(`Invalid member at index ${i}: not a string`))
        }
        
        const scoreResult = ValidationFramework.parseNumber(scoreStr)
        if (!scoreResult.success) {
          return scoreResult
        }
        
        entries.push({ member, score: scoreResult.data })
      }
      
      return Ok(entries)
    } catch (error) {
      return Err(new StorageError('sorted set range', error instanceof Error ? error.message : String(error)))
    }
  }

  async count(key: string): Promise<Result<number, StorageError>> {
    try {
      const count = await this.redis.zcard(this.buildKey(key))
      return Ok(count)
    } catch (error) {
      return Err(new StorageError('sorted set count', error instanceof Error ? error.message : String(error)))
    }
  }

  async removeRange(key: string, start: number, end: number): Promise<Result<number, StorageError>> {
    try {
      const removed = await this.redis.zremrangebyrank(this.buildKey(key), start, end)
      return Ok(removed)
    } catch (error) {
      return Err(new StorageError('sorted set remove range', error instanceof Error ? error.message : String(error)))
    }
  }

  async clear(key: string): Promise<Result<void, StorageError>> {
    try {
      await this.redis.del(this.buildKey(key))
      return Ok(undefined)
    } catch (error) {
      return Err(new StorageError('sorted set clear', error instanceof Error ? error.message : String(error)))
    }
  }

  private buildKey(key: string): string {
    return `${this.keyPrefix}:${key}`
  }
}

/**
 * URL → ID のマッピングを扱うRepository
 */
export class UrlMappingRepository {
  private readonly redis = getRedis()

  constructor(private readonly keyPrefix: string) {}

  async set(url: string, id: string): Promise<Result<void, StorageError>> {
    try {
      await this.redis.set(this.buildKey(url), id)
      return Ok(undefined)
    } catch (error) {
      return Err(new StorageError('url mapping set', error instanceof Error ? error.message : String(error)))
    }
  }

  async get(url: string): Promise<Result<string | null, StorageError>> {
    try {
      const id = await this.redis.get(this.buildKey(url))
      return Ok(id)
    } catch (error) {
      return Err(new StorageError('url mapping get', error instanceof Error ? error.message : String(error)))
    }
  }

  async delete(url: string): Promise<Result<boolean, StorageError>> {
    try {
      const deleted = await this.redis.del(this.buildKey(url))
      return Ok(deleted === 1)
    } catch (error) {
      return Err(new StorageError('url mapping delete', error instanceof Error ? error.message : String(error)))
    }
  }

  private buildKey(url: string): string {
    return `url:${this.keyPrefix}:${encodeURIComponent(url)}`
  }
}

/**
 * Repository Factory - サービス毎にRepositoryを作成
 */
export class RepositoryFactory {
  static createEntity<T>(
    schema: z.ZodType<T>, 
    service: string
  ): BaseRepository<T> {
    return new (class extends BaseRepository<T> {
      constructor() {
        super(schema, service)
      }
    })()
  }

  static createNumber(service: string): NumberRepository {
    return new NumberRepository(service)
  }

  static createList<T>(schema: z.ZodType<T>, service: string): ListRepository<T> {
    return new ListRepository(schema, service)
  }

  static createSortedSet(service: string): SortedSetRepository {
    return new SortedSetRepository(service)
  }

  static createUrlMapping(service: string): UrlMappingRepository {
    return new UrlMappingRepository(service)
  }
}