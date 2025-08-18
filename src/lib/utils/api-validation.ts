import { z } from 'zod'
import { safeParseSearchParams } from '@/lib/validation/safe-parse'
import { createApiErrorResponse } from '@/lib/utils/api'
import { NextResponse } from 'next/server'

/**
 * API パラメータの安全なバリデーション
 */
export function validateApiParams<T>(
  schema: z.ZodType<T>,
  searchParams: URLSearchParams
): { success: true; data: T } | { success: false; response: NextResponse } {
  const result = safeParseSearchParams(schema, searchParams)
  
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { 
      success: false, 
      response: createApiErrorResponse(result.error, 400)
    }
  }
}

/**
 * バリデーション結果のヘルパー関数
 */
export function handleValidationResult<T>(
  result: { success: true; data: T } | { success: false; response: NextResponse }
): T | NextResponse {
  if (result.success) {
    return result.data
  } else {
    return result.response
  }
}