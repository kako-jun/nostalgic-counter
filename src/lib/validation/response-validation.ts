import { z } from 'zod'
import { NextResponse } from 'next/server'

/**
 * API応答データの安全な検証とレスポンス生成
 */
export function createValidatedApiResponse<T>(
  schema: z.ZodType<T>,
  data: T,
  message?: string,
  status: number = 200
): NextResponse {
  try {
    // Zodスキーマで応答データを検証
    const validatedData = schema.parse(data)
    
    const responseBody = {
      data: validatedData,
      ...(message && { message }),
      success: status < 400
    }
    
    return NextResponse.json(responseBody, { status })
  } catch (error) {
    const errorMessage = error instanceof z.ZodError 
      ? `Response validation failed: ${error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')}`
      : `Response creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    
    console.error('API Response Validation Error:', errorMessage)
    
    return NextResponse.json({
      error: 'Internal server error: Response validation failed',
      success: false
    }, { status: 500 })
  }
}

/**
 * 特殊フォーマット応答（テキスト、SVG等）の安全な生成
 */
export function createValidatedSpecialResponse<T>(
  schema: z.ZodType<T>,
  data: T,
  formatter: (validatedData: T) => string,
  contentType: string,
  cacheControl?: string
): NextResponse {
  try {
    // Zodスキーマで検証
    const validatedData = schema.parse(data)
    
    // フォーマッターで文字列変換
    const content = formatter(validatedData)
    
    const headers: Record<string, string> = {
      'Content-Type': contentType
    }
    
    if (cacheControl) {
      headers['Cache-Control'] = cacheControl
    }
    
    return new NextResponse(content, { headers })
  } catch (error) {
    const errorMessage = error instanceof z.ZodError 
      ? `Special response validation failed: ${error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')}`
      : `Special response creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    
    console.error('Special Response Validation Error:', errorMessage)
    
    // フォールバック応答
    return new NextResponse('0', {
      headers: {
        'Content-Type': contentType,
        ...(cacheControl && { 'Cache-Control': cacheControl })
      }
    })
  }
}

/**
 * 成功応答のスキーマ
 */
export const SuccessResponseSchema = z.object({
  data: z.any(),
  message: z.string().optional(),
  success: z.literal(true)
})

/**
 * エラー応答のスキーマ
 */
export const ErrorResponseSchema = z.object({
  error: z.string(),
  success: z.literal(false)
})

/**
 * 汎用API応答スキーマ
 */
export const ApiResponseSchema = z.union([
  SuccessResponseSchema,
  ErrorResponseSchema
])

/**
 * 表示用データの基本スキーマ
 */
export const DisplayDataSchema = z.object({
  value: z.number().int().min(0),
  type: z.union([z.literal('total'), z.literal('today'), z.literal('yesterday'), z.literal('week'), z.literal('month')]),
  theme: z.enum(['classic', 'modern', 'retro']),
  digits: z.number().int().min(1).max(10)
})

export type DisplayData = z.infer<typeof DisplayDataSchema>
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>
export type ApiResponse = z.infer<typeof ApiResponseSchema>