/**
 * 統一ValidationFramework
 * 全てのバリデーション処理を一元化
 */

import { z } from 'zod'
import { Result, Ok, Err, ValidationError, StorageError } from './result'

/**
 * ValidationFramework - 統一されたバリデーション処理
 */
export class ValidationFramework {
  /**
   * 入力データのバリデーション
   */
  static input<T>(schema: z.ZodType<T>, data: unknown): Result<T, ValidationError> {
    try {
      const result = schema.safeParse(data)
      
      if (result.success) {
        return Ok(result.data)
      }
      
      const errors = result.error.issues.map(issue => 
        `${issue.path.join('.')}: ${issue.message}`
      ).join(', ')
      
      return Err(new ValidationError(`Input validation failed: ${errors}`, {
        zodError: result.error,
        input: data
      }))
    } catch (error) {
      return Err(new ValidationError('Schema validation error', {
        originalError: error,
        input: data
      }))
    }
  }

  /**
   * 出力データのバリデーション（レスポンス用）
   */
  static output<T>(schema: z.ZodType<T>, data: T): Result<T, ValidationError> {
    try {
      const result = schema.safeParse(data)
      
      if (result.success) {
        return Ok(result.data)
      }
      
      const errors = result.error.issues.map(issue => 
        `${issue.path.join('.')}: ${issue.message}`
      ).join(', ')
      
      return Err(new ValidationError(`Output validation failed: ${errors}`, {
        zodError: result.error,
        output: data
      }))
    } catch (error) {
      return Err(new ValidationError('Output schema validation error', {
        originalError: error,
        output: data
      }))
    }
  }

  /**
   * ストレージ用データのシリアライゼーション
   */
  static storage<T>(schema: z.ZodType<T>, data: T): Result<string, ValidationError> {
    const validationResult = this.output(schema, data)
    
    if (!validationResult.success) {
      return validationResult
    }

    try {
      const serialized = JSON.stringify(validationResult.data)
      return Ok(serialized)
    } catch (error) {
      return Err(new ValidationError('JSON serialization failed', {
        originalError: error,
        data
      }))
    }
  }

  /**
   * ストレージからのデータ復元
   */
  static fromStorage<T>(schema: z.ZodType<T>, serialized: string | null): Result<T, ValidationError> {
    if (serialized === null) {
      return Err(new ValidationError('Data not found in storage'))
    }

    try {
      const parsed = JSON.parse(serialized)
      return this.input(schema, parsed)
    } catch (error) {
      return Err(new ValidationError('JSON parsing failed', {
        originalError: error,
        serialized
      }))
    }
  }

  /**
   * 数値のパース（parseInt代替）
   */
  static parseNumber(value: string | null, defaultValue: number = 0): Result<number, ValidationError> {
    if (value === null) {
      return Ok(defaultValue)
    }

    const numberSchema = z.coerce.number().int().min(0)
    return this.input(numberSchema, value)
  }

  /**
   * URLSearchParamsからのデータ抽出
   */
  static fromSearchParams<T>(
    schema: z.ZodType<T>, 
    searchParams: URLSearchParams
  ): Result<T, ValidationError> {
    const data = Object.fromEntries(searchParams.entries())
    return this.input(schema, data)
  }

  /**
   * 配列データのバリデーション
   */
  static array<T>(
    itemSchema: z.ZodType<T>, 
    items: unknown[]
  ): Result<T[], ValidationError> {
    const arraySchema = z.array(itemSchema)
    return this.input(arraySchema, items)
  }

  /**
   * 文字列配列からのバリデーション（Redis LRANGE用）
   */
  static fromStringArray<T>(
    itemSchema: z.ZodType<T>,
    serializedItems: string[]
  ): Result<T[], ValidationError> {
    const results: T[] = []
    
    for (let i = 0; i < serializedItems.length; i++) {
      const itemResult = this.fromStorage(itemSchema, serializedItems[i])
      
      if (!itemResult.success) {
        return Err(new ValidationError(`Array item ${i} validation failed`, {
          index: i,
          originalError: itemResult.error
        }))
      }
      
      results.push(itemResult.data)
    }
    
    return Ok(results)
  }

  /**
   * 条件付きバリデーション
   */
  static conditional<T>(
    condition: boolean,
    schema: z.ZodType<T>,
    data: unknown
  ): Result<T | null, ValidationError> {
    if (!condition) {
      return Ok(null)
    }
    
    return this.input(schema, data)
  }

  /**
   * 複数スキーマのUnion型バリデーション
   */
  static union<T extends readonly [z.ZodTypeAny, ...z.ZodTypeAny[]]>(
    schemas: T,
    data: unknown
  ): Result<z.infer<T[number]>, ValidationError> {
    const unionSchema = z.union(schemas)
    return this.input(unionSchema, data)
  }

  /**
   * 部分的なデータの更新バリデーション
   */
  static partial<T extends Record<string, unknown>>(
    schema: z.ZodObject<z.ZodRawShape>, 
    data: unknown
  ): Result<Partial<T>, ValidationError> {
    const partialSchema = schema.partial()
    const result = this.input(partialSchema, data)
    if (!result.success) {
      return Err(result.error)
    }
    return Ok(result.data as Partial<T>)
  }
}

/**
 * よく使用されるスキーマのプリセット
 */
export const CommonSchemas = {
  // 基本型
  nonEmptyString: z.string().min(1),
  positiveInt: z.number().int().positive(),
  nonNegativeInt: z.number().int().min(0),
  url: z.string().url(),
  email: z.string().email(),
  date: z.coerce.date(),
  
  // アプリケーション固有
  publicId: z.string().regex(/^[a-z0-9-]+-[a-f0-9]{8}$/),
  token: z.string().min(8).max(16),
  theme: z.enum(['classic', 'modern', 'retro']),
  
  // Redis用
  redisKey: z.string().min(1),
  
  // API用
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10)
  })
} as const

/**
 * バリデーション結果のログ記録
 */
export class ValidationLogger {
  static logValidation(
    operation: string,
    success: boolean,
    error?: ValidationError,
    context?: Record<string, unknown>
  ): void {
    if (success) {
      console.log(`✓ Validation success: ${operation}`, context)
    } else {
      console.error(`✗ Validation failed: ${operation}`, {
        error: error?.toJSON(),
        context
      })
    }
  }

  static logPerformance(operation: string, startTime: number): void {
    const duration = Date.now() - startTime
    if (duration > 100) { // 100ms以上の場合のみログ
      console.warn(`⚠ Slow validation: ${operation} took ${duration}ms`)
    }
  }
}

/**
 * バリデーションのパフォーマンス計測デコレータ
 */
export function measureValidation<T extends (...args: unknown[]) => Result<unknown, ValidationError>>(
  operation: string,
  fn: T
): T {
  const wrapper = (...args: Parameters<T>) => {
    const startTime = Date.now()
    const result = fn(...args)
    
    ValidationLogger.logPerformance(operation, startTime)
    ValidationLogger.logValidation(operation, result.success, result.success ? undefined : result.error)
    
    return result
  }
  
  return wrapper as T
}