import { z } from 'zod'
import { safeParseRedisData } from '@/lib/validation/safe-parse'

/**
 * Redis操作の完全Zod化ユーティリティ
 */

/**
 * 安全なRedis GET操作（文字列値用）
 */
export async function safeRedisGetString(
  redis: { get: (key: string) => Promise<string | null> },
  key: string
): Promise<{ success: true; data: string } | { success: false; error: string }> {
  try {
    const value = await redis.get(key)
    
    if (value === null) {
      return { success: false, error: 'Key not found' }
    }
    
    if (typeof value !== 'string') {
      return { success: false, error: 'Value is not a string' }
    }
    
    return { success: true, data: value }
  } catch (error) {
    return { 
      success: false, 
      error: `Redis get failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

/**
 * 安全なRedis GET操作（数値用）
 */
export async function safeRedisGetNumber(
  redis: { get: (key: string) => Promise<string | null> },
  key: string
): Promise<{ success: true; data: number } | { success: false; error: string }> {
  const NumberSchema = z.coerce.number().int().min(0)
  
  try {
    const value = await redis.get(key)
    
    if (value === null) {
      return { success: false, error: 'Key not found' }
    }
    
    const result = NumberSchema.safeParse(value)
    if (!result.success) {
      return { 
        success: false, 
        error: `Invalid number format: ${result.error.message}` 
      }
    }
    
    return { success: true, data: result.data }
  } catch (error) {
    return { 
      success: false, 
      error: `Redis get number failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

/**
 * 安全なRedis GET操作（JSON用）
 */
export async function safeRedisGetJson<T>(
  redis: { get: (key: string) => Promise<string | null> },
  key: string,
  schema: z.ZodType<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const value = await redis.get(key)
    
    if (value === null) {
      return { success: false, error: 'Key not found' }
    }
    
    return safeParseRedisData(schema, value)
  } catch (error) {
    return { 
      success: false, 
      error: `Redis get JSON failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

/**
 * 安全なRedis LRANGE操作
 */
export async function safeRedisLRange<T>(
  redis: { lrange: (key: string, start: number, end: number) => Promise<string[]> },
  key: string,
  start: number,
  end: number,
  itemSchema: z.ZodType<T>
): Promise<{ success: true; data: T[] } | { success: false; error: string }> {
  try {
    const values = await redis.lrange(key, start, end)
    
    if (!Array.isArray(values)) {
      return { success: false, error: 'LRANGE result is not an array' }
    }
    
    const validatedItems: T[] = []
    
    for (let i = 0; i < values.length; i++) {
      const result = safeParseRedisData(itemSchema, values[i])
      if (!result.success) {
        return { 
          success: false, 
          error: `Item ${i} validation failed: ${result.error}` 
        }
      }
      validatedItems.push(result.data)
    }
    
    return { success: true, data: validatedItems }
  } catch (error) {
    return { 
      success: false, 
      error: `Redis LRANGE failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

/**
 * 安全なRedis ZREVRANGE操作（スコア付き）
 */
export async function safeRedisZRevRangeWithScores(
  redis: { zrevrange: (key: string, start: number, end: number, withScores: string) => Promise<string[]> },
  key: string,
  start: number,
  end: number
): Promise<{ success: true; data: Array<{name: string, score: number}> } | { success: false; error: string }> {
  try {
    const rawEntries = await redis.zrevrange(key, start, end, 'WITHSCORES')
    
    if (!Array.isArray(rawEntries)) {
      return { success: false, error: 'ZREVRANGE result is not an array' }
    }
    
    if (rawEntries.length % 2 !== 0) {
      return { success: false, error: 'ZREVRANGE result has odd number of elements' }
    }
    
    const entries: Array<{name: string, score: number}> = []
    
    for (let i = 0; i < rawEntries.length; i += 2) {
      const name = rawEntries[i]
      const scoreStr = rawEntries[i + 1]
      
      if (typeof name !== 'string') {
        return { success: false, error: `Invalid name at index ${i}: not a string` }
      }
      
      const scoreResult = z.coerce.number().int().safeParse(scoreStr)
      if (!scoreResult.success) {
        return { 
          success: false, 
          error: `Invalid score at index ${i + 1}: ${scoreResult.error.message}` 
        }
      }
      
      entries.push({ name, score: scoreResult.data })
    }
    
    return { success: true, data: entries }
  } catch (error) {
    return { 
      success: false, 
      error: `Redis ZREVRANGE failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

/**
 * 安全なRedis操作結果のログ記録
 */
export function logRedisOperation(
  operation: string,
  key: string,
  success: boolean,
  error?: string,
  dataLength?: number
): void {
  if (success) {
    console.log(`Redis ${operation} success: ${key}${dataLength !== undefined ? ` (${dataLength} items)` : ''}`)
  } else {
    console.error(`Redis ${operation} failed: ${key} - ${error}`)
  }
}