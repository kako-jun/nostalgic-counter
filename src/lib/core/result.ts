/**
 * Result型パターン - エラーハンドリングの統一
 */

// Result型の定義
export type Result<T, E = AppError> = Success<T> | Failure<E>

export interface Success<T> {
  readonly success: true
  readonly data: T
}

export interface Failure<E> {
  readonly success: false
  readonly error: E
}

// Result型のコンストラクタ
export const Ok = <T>(data: T): Success<T> => ({
  success: true,
  data
})

export const Err = <E>(error: E): Failure<E> => ({
  success: false,
  error
})

// Result型のユーティリティ関数
export const isOk = <T, E>(result: Result<T, E>): result is Success<T> => 
  result.success === true

export const isErr = <T, E>(result: Result<T, E>): result is Failure<E> => 
  result.success === false

// map関数：成功時のデータを変換
export const map = <T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => U
): Result<U, E> => {
  if (isOk(result)) {
    return Ok(fn(result.data))
  }
  return result as Failure<E>
}

// flatMap関数：成功時に別のResultを返す関数を適用
export const flatMap = <T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => Result<U, E>
): Result<U, E> => {
  if (isOk(result)) {
    return fn(result.data)
  }
  return result as Failure<E>
}

// mapError関数：エラーを変換
export const mapError = <T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F
): Result<T, F> => {
  if (isErr(result)) {
    return Err(fn(result.error))
  }
  return result as Success<T>
}

// unwrap関数：成功時のデータを取得（エラー時は例外）
export const unwrap = <T, E>(result: Result<T, E>): T => {
  if (isOk(result)) {
    return result.data
  }
  throw new Error(`Failed to unwrap result: ${JSON.stringify(result.error)}`)
}

// unwrapOr関数：成功時のデータまたはデフォルト値を取得
export const unwrapOr = <T, E>(result: Result<T, E>, defaultValue: T): T => {
  if (isOk(result)) {
    return result.data
  }
  return defaultValue
}

// Promise<Result>のユーティリティ
export const asyncMap = async <T, U, E>(
  resultPromise: Promise<Result<T, E>>,
  fn: (data: T) => Promise<U>
): Promise<Result<U, E>> => {
  const result = await resultPromise
  if (isOk(result)) {
    try {
      const newData = await fn(result.data)
      return Ok(newData)
    } catch (error) {
      return Err(error as E)
    }
  }
  return result as Failure<E>
}

// 複数のResultを組み合わせる
export const combine = <T extends readonly unknown[], E>(
  results: { [K in keyof T]: Result<T[K], E> }
): Result<T, E> => {
  const values = [] as unknown as T
  
  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    if (isErr(result)) {
      return result
    }
    ;(values as any)[i] = result.data
  }
  
  return Ok(values)
}

// すべて成功か、一つでも失敗したら失敗
export const all = <T, E>(results: Result<T, E>[]): Result<T[], E> => {
  const values: T[] = []
  
  for (const result of results) {
    if (isErr(result)) {
      return result
    }
    values.push(result.data)
  }
  
  return Ok(values)
}

/**
 * アプリケーション固有のエラー型
 */
export abstract class AppError extends Error {
  abstract readonly code: string
  abstract readonly statusCode: number
  
  constructor(message: string, public readonly context?: Record<string, unknown>) {
    super(message)
    this.name = this.constructor.name
  }
  
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      context: this.context,
      statusCode: this.statusCode
    }
  }
}

// 具体的なエラー型
export class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR'
  readonly statusCode = 400
  
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context)
  }
}

export class NotFoundError extends AppError {
  readonly code = 'NOT_FOUND'
  readonly statusCode = 404
  
  constructor(resource: string, id?: string) {
    super(`${resource}${id ? ` with id '${id}'` : ''} not found`)
  }
}

export class UnauthorizedError extends AppError {
  readonly code = 'UNAUTHORIZED'
  readonly statusCode = 403
  
  constructor(message: string = 'Unauthorized access') {
    super(message)
  }
}

export class StorageError extends AppError {
  readonly code = 'STORAGE_ERROR'
  readonly statusCode = 500
  
  constructor(operation: string, details?: string) {
    super(`Storage operation failed: ${operation}${details ? ` - ${details}` : ''}`)
  }
}

export class BusinessLogicError extends AppError {
  readonly code = 'BUSINESS_LOGIC_ERROR'
  readonly statusCode = 422
  
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context)
  }
}

// エラーからResultを作成するヘルパー
export const fromError = (error: unknown): Failure<AppError> => {
  if (error instanceof AppError) {
    return Err(error)
  }
  
  if (error instanceof Error) {
    return Err(new StorageError('Unknown error', error.message))
  }
  
  return Err(new StorageError('Unknown error', String(error)))
}

// try-catch を Result に変換
export const tryTo = <T>(fn: () => T): Result<T, AppError> => {
  try {
    return Ok(fn())
  } catch (error) {
    return fromError(error)
  }
}

// async try-catch を Result に変換
export const asyncTryTo = async <T>(fn: () => Promise<T>): Promise<Result<T, AppError>> => {
  try {
    const result = await fn()
    return Ok(result)
  } catch (error) {
    return fromError(error)
  }
}