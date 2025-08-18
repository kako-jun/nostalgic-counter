import { NextRequest, NextResponse } from 'next/server'
import { addCorsHeaders } from '@/lib/utils/cors'

export interface ApiError {
  message: string
  code?: string
  details?: Record<string, unknown>
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  message?: string
}

export interface CreateServiceParams {
  url: string
  token: string
}

export interface ServiceUrlTokenParams {
  url: string
  token: string
}

/**
 * Validates action parameter against allowed actions
 */
export function validateAction(
  action: string | null, 
  validActions: string[]
): { isValid: boolean; error?: string } {
  if (!action) {
    return { isValid: false, error: 'Action parameter is required' }
  }
  
  if (!validActions.includes(action)) {
    return { 
      isValid: false, 
      error: `Invalid action. Allowed actions: ${validActions.join(', ')}` 
    }
  }
  
  return { isValid: true }
}

/**
 * Validates URL parameter
 */
export function validateUrl(url: string | null): { isValid: boolean; error?: string } {
  if (!url) {
    return { isValid: false, error: 'URL parameter is required' }
  }
  
  try {
    new URL(url)
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return { isValid: false, error: 'URL must start with http:// or https://' }
    }
    return { isValid: true }
  } catch {
    return { isValid: false, error: 'Invalid URL format' }
  }
}

/**
 * Validates token parameter
 */
export function validateToken(token: string | null): { isValid: boolean; error?: string } {
  if (!token) {
    return { isValid: false, error: 'Token parameter is required' }
  }
  
  if (token.length < 8 || token.length > 16) {
    return { isValid: false, error: 'Token must be between 8 and 16 characters' }
  }
  
  return { isValid: true }
}

/**
 * Validates create service parameters (url + token)
 */
export function validateCreateParams(searchParams: URLSearchParams): {
  isValid: boolean
  params?: CreateServiceParams
  error?: string
} {
  const url = searchParams.get('url')
  const token = searchParams.get('token')
  
  const urlValidation = validateUrl(url)
  if (!urlValidation.isValid) {
    return { isValid: false, error: urlValidation.error }
  }
  
  const tokenValidation = validateToken(token)
  if (!tokenValidation.isValid) {
    return { isValid: false, error: tokenValidation.error }
  }
  
  return {
    isValid: true,
    params: { url: url!, token: token! }
  }
}

/**
 * Validates service operations that require url + token
 */
export function validateServiceParams(searchParams: URLSearchParams): {
  isValid: boolean
  params?: ServiceUrlTokenParams
  error?: string
} {
  return validateCreateParams(searchParams)
}

/**
 * Creates standardized API success response
 */
export function createApiSuccessResponse<T>(
  data: T, 
  message?: string,
  status: number = 200
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(message && { message })
  }
  
  return addCorsHeaders(NextResponse.json(response, { status }))
}

/**
 * Creates standardized API error response
 */
export function createApiErrorResponse(
  message: string,
  status: number = 400,
  code?: string,
  details?: Record<string, unknown>
): NextResponse {
  const response: ApiResponse = {
    success: false,
    error: {
      message,
      ...(code && { code }),
      ...(details && { details })
    }
  }
  
  return addCorsHeaders(NextResponse.json(response, { status }))
}

/**
 * Handles API errors with consistent formatting
 */
export function handleApiError(error: unknown, service: string): NextResponse {
  console.error(`${service} API error:`, error)
  
  if (error instanceof Error) {
    return createApiErrorResponse(
      `${service} service error: ${error.message}`,
      500,
      'INTERNAL_ERROR',
      { service, timestamp: new Date().toISOString() }
    )
  }
  
  return createApiErrorResponse(
    `Unknown ${service} service error`,
    500,
    'UNKNOWN_ERROR',
    { service, timestamp: new Date().toISOString() }
  )
}

/**
 * Creates OPTIONS response for CORS preflight
 */
export function createOptionsResponse(): NextResponse {
  return addCorsHeaders(new NextResponse(null, { status: 200 }))
}

/**
 * Extracts client IP from request
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  // Fallback for development
  return '127.0.0.1'
}

/**
 * Gets User-Agent from request
 */
export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'Unknown'
}

/**
 * Common service action handler wrapper
 */
export async function handleServiceAction<T>(
  request: NextRequest,
  serviceName: string,
  validActions: string[],
  actionHandlers: Record<string, () => Promise<T>>
): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    // Validate action
    const actionValidation = validateAction(action, validActions)
    if (!actionValidation.isValid) {
      return createApiErrorResponse(actionValidation.error!, 400)
    }
    
    // Execute action handler
    const handler = actionHandlers[action!]
    if (!handler) {
      return createApiErrorResponse(`No handler for action: ${action}`, 400)
    }
    
    const result = await handler()
    return createApiSuccessResponse(result)
    
  } catch (error) {
    return handleApiError(error, serviceName)
  }
}