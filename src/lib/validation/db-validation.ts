import { z } from 'zod'

/**
 * Redisへの書き込み前にデータを安全に検証・シリアライズ
 */
export function safeStringifyForRedis<T>(
  schema: z.ZodType<T>,
  data: T
): { success: true; serialized: string } | { success: false; error: string } {
  try {
    // Zodスキーマで検証
    const validatedData = schema.parse(data)
    
    // 検証済みデータをJSON文字列化
    const serialized = JSON.stringify(validatedData)
    
    return { success: true, serialized }
  } catch (error) {
    const errorMessage = error instanceof z.ZodError 
      ? `Validation failed: ${error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')}`
      : `Serialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    
    return { success: false, error: errorMessage }
  }
}

/**
 * Redisへの数値書き込み前に検証
 */
export function safeStringifyNumber(
  value: unknown
): { success: true; serialized: string } | { success: false; error: string } {
  const NumberSchema = z.number().int().min(0)
  
  try {
    const validatedNumber = NumberSchema.parse(value)
    return { success: true, serialized: validatedNumber.toString() }
  } catch (error) {
    return { 
      success: false, 
      error: `Invalid number: ${error instanceof z.ZodError ? error.message : 'Unknown error'}` 
    }
  }
}

/**
 * Redis書き込み操作のログ記録
 */
export function logRedisWrite(
  operation: string,
  key: string,
  success: boolean,
  error?: string
): void {
  if (!success && error) {
    console.error(`Redis write failed [${operation}] ${key}:`, error)
  }
}

/**
 * 安全なRedis書き込みヘルパー
 */
export async function safeRedisSet<T>(
  redis: any,
  key: string,
  schema: z.ZodType<T>,
  data: T
): Promise<{ success: boolean; error?: string }> {
  const result = safeStringifyForRedis(schema, data)
  
  if (!result.success) {
    logRedisWrite('SET', key, false, result.error)
    return { success: false, error: result.error }
  }
  
  try {
    await redis.set(key, result.serialized)
    return { success: true }
  } catch (error) {
    const errorMessage = `Redis set failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    logRedisWrite('SET', key, false, errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * 安全なRedis数値書き込みヘルパー
 */
export async function safeRedisSetNumber(
  redis: any,
  key: string,
  value: unknown
): Promise<{ success: boolean; error?: string }> {
  const result = safeStringifyNumber(value)
  
  if (!result.success) {
    logRedisWrite('SET_NUMBER', key, false, result.error)
    return { success: false, error: result.error }
  }
  
  try {
    await redis.set(key, result.serialized)
    return { success: true }
  } catch (error) {
    const errorMessage = `Redis set number failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    logRedisWrite('SET_NUMBER', key, false, errorMessage)
    return { success: false, error: errorMessage }
  }
}