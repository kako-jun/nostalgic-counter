import { z } from 'zod'

/**
 * Redis JSON データの安全なパース
 */
export function safeParseRedisData<T>(
  schema: z.ZodType<T>,
  data: string | null
): { success: true; data: T } | { success: false; error: string } {
  if (!data) {
    return { success: false, error: 'Data is null or empty' }
  }

  try {
    const parsed = JSON.parse(data)
    const result = schema.safeParse(parsed)
    
    if (result.success) {
      return { success: true, data: result.data }
    } else {
      return { 
        success: false, 
        error: `Validation failed: ${result.error.message}` 
      }
    }
  } catch (error) {
    return { 
      success: false, 
      error: `JSON parse failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

/**
 * Redis JSON 配列データの安全なパース
 */
export function safeParseRedisArray<T>(
  schema: z.ZodType<T>,
  dataArray: string[]
): { success: true; data: T[] } | { success: false; error: string } {
  try {
    const results: T[] = []
    
    for (let i = 0; i < dataArray.length; i++) {
      const result = safeParseRedisData(schema, dataArray[i])
      if (!result.success) {
        return { 
          success: false, 
          error: `Item ${i}: ${result.error}` 
        }
      }
      results.push(result.data)
    }
    
    return { success: true, data: results }
  } catch (error) {
    return { 
      success: false, 
      error: `Array parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

/**
 * URLSearchParams の安全なパース
 */
export function safeParseSearchParams<T>(
  schema: z.ZodType<T>,
  searchParams: URLSearchParams
): { success: true; data: T } | { success: false; error: string } {
  try {
    // URLSearchParams を Plain Object に変換
    const params: Record<string, string> = {}
    for (const [key, value] of searchParams.entries()) {
      params[key] = value
    }
    
    const result = schema.safeParse(params)
    
    if (result.success) {
      return { success: true, data: result.data }
    } else {
      return { 
        success: false, 
        error: `Parameter validation failed: ${result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')}` 
      }
    }
  } catch (error) {
    return { 
      success: false, 
      error: `Parameter parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

/**
 * 数値の安全なパース（parseInt の代替）
 */
export function safeParseInt(
  value: string | null, 
  defaultValue: number = 0
): number {
  if (!value) return defaultValue
  
  const result = z.coerce.number().int().safeParse(value)
  return result.success ? result.data : defaultValue
}

/**
 * 日付の安全なパース
 */
export function safeParseDate(
  value: string | null
): { success: true; data: Date } | { success: false; error: string } {
  if (!value) {
    return { success: false, error: 'Date value is null or empty' }
  }

  const result = z.coerce.date().safeParse(value)
  
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { 
      success: false, 
      error: `Invalid date format: ${value}` 
    }
  }
}