/**
 * ジェネリックAPIハンドラー - 統一されたAPI処理
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Result, Ok, Err, AppError, ValidationError, StorageError, isOk } from './result'
import { ValidationFramework } from './validation'
import { getCacheSettings } from './config'

/**
 * APIハンドラーの設定型
 */
export interface ApiHandlerConfig<TParams, TResult> {
  paramsSchema: z.ZodType<TParams>
  resultSchema: z.ZodType<TResult>
  handler: (params: TParams, request: NextRequest) => Promise<Result<TResult, AppError>>
  allowedMethods?: string[]
  requireAuth?: boolean
  cacheMaxAge?: number
}

/**
 * APIレスポンスの型
 */
export interface ApiSuccessResponse<T> {
  success: true
  data: T
  message?: string
}

export interface ApiErrorResponse {
  success: false
  error: string
  code: string
  statusCode: number
}

/**
 * 特殊レスポンス（SVG、テキストなど）の設定
 */
export interface SpecialResponseConfig<TData> {
  schema: z.ZodType<TData>
  formatter: (data: TData) => string
  contentType: string
  cacheControl?: string
}

/**
 * APIハンドラーのメインクラス
 */
export class ApiHandler {
  /**
   * 標準的なJSON APIエンドポイントを作成
   */
  static create<TParams, TResult>(
    config: ApiHandlerConfig<TParams, TResult>
  ) {
    return async (request: NextRequest): Promise<NextResponse> => {
      try {
        // HTTPメソッドチェック
        const methodResult = this.validateHttpMethod(request, config.allowedMethods)
        if (!methodResult.success) {
          return this.createErrorResponse(methodResult.error)
        }

        // パラメータ抽出と検証
        const paramsResult = await this.extractParams(request, config.paramsSchema)
        if (!paramsResult.success) {
          return this.createErrorResponse(paramsResult.error)
        }

        // 認証チェック（必要な場合）
        if (config.requireAuth) {
          const authResult = await this.validateAuth(request)
          if (!authResult.success) {
            return this.createErrorResponse(authResult.error)
          }
        }

        // ビジネスロジック実行
        const handlerResult = await config.handler(paramsResult.data, request)
        if (!handlerResult.success) {
          return this.createErrorResponse(handlerResult.error)
        }

        // レスポンスデータの検証
        const validatedResult = ValidationFramework.output(config.resultSchema, handlerResult.data)
        if (!validatedResult.success) {
          return this.createErrorResponse(validatedResult.error)
        }

        // 成功レスポンス作成
        return this.createSuccessResponse(
          validatedResult.data,
          undefined,
          config.cacheMaxAge
        )

      } catch (error) {
        console.error('API Handler Error:', error)
        return this.createErrorResponse(
          new StorageError('Internal server error', error instanceof Error ? error.message : String(error))
        )
      }
    }
  }

  /**
   * 特殊フォーマット（SVG、テキストなど）のAPIエンドポイントを作成
   */
  static createSpecialResponse<TParams, TData>(
    paramsSchema: z.ZodType<TParams>,
    handler: (params: TParams, request: NextRequest) => Promise<Result<TData, AppError>>,
    responseConfig: SpecialResponseConfig<TData>
  ) {
    return async (request: NextRequest): Promise<NextResponse> => {
      try {
        // パラメータ抽出と検証
        const paramsResult = await this.extractParams(request, paramsSchema)
        if (!paramsResult.success) {
          // 特殊レスポンスの場合はフォールバックコンテンツを返す
          return this.createFallbackResponse(responseConfig.contentType, responseConfig.cacheControl)
        }

        // ハンドラー実行
        const handlerResult = await handler(paramsResult.data, request)
        if (!handlerResult.success) {
          return this.createFallbackResponse(responseConfig.contentType, responseConfig.cacheControl)
        }

        // データ検証
        const validatedResult = ValidationFramework.output(responseConfig.schema, handlerResult.data)
        if (!validatedResult.success) {
          return this.createFallbackResponse(responseConfig.contentType, responseConfig.cacheControl)
        }

        // フォーマッターで変換
        const content = responseConfig.formatter(validatedResult.data)

        // レスポンス作成
        const headers: Record<string, string> = {
          'Content-Type': responseConfig.contentType
        }

        if (responseConfig.cacheControl) {
          headers['Cache-Control'] = responseConfig.cacheControl
        }

        this.addCorsHeaders(headers)

        return new NextResponse(content, { headers })

      } catch (error) {
        console.error('Special Response Handler Error:', error)
        return this.createFallbackResponse(responseConfig.contentType, responseConfig.cacheControl)
      }
    }
  }

  /**
   * バッチ処理用APIエンドポイント
   */
  static createBatch<TParams, TResult>(
    config: ApiHandlerConfig<TParams[], TResult[]>
  ) {
    return async (request: NextRequest): Promise<NextResponse> => {
      try {
        const batchParamsSchema = z.array(config.paramsSchema)
        const batchResultSchema = z.array(config.resultSchema)

        const paramsResult = await this.extractParams(request, batchParamsSchema)
        if (!paramsResult.success) {
          return this.createErrorResponse(paramsResult.error)
        }

        // 各アイテムを並列処理
        const results = await Promise.all(
          paramsResult.data.map(async (params) => {
            return await config.handler(params, request)
          })
        )

        // エラーがあるかチェック
        const errors = results.filter(result => !result.success)
        if (errors.length > 0) {
          const firstError = errors[0] as Result<never, AppError>
          return this.createErrorResponse((firstError as any).error)
        }

        // 成功結果を抽出
        const successResults = results
          .filter(result => result.success)
          .map(result => (result as any).data)

        // レスポンス検証
        const validatedResult = ValidationFramework.output(batchResultSchema, successResults)
        if (!validatedResult.success) {
          return this.createErrorResponse(validatedResult.error)
        }

        return this.createSuccessResponse(validatedResult.data)

      } catch (error) {
        console.error('Batch API Handler Error:', error)
        return this.createErrorResponse(new StorageError('Batch processing failed'))
      }
    }
  }

  /**
   * HTTPメソッドの検証
   */
  private static validateHttpMethod(
    request: NextRequest, 
    allowedMethods: string[] = ['GET', 'POST']
  ): Result<void, ValidationError> {
    if (!allowedMethods.includes(request.method)) {
      return Err(new ValidationError(`Method ${request.method} not allowed`))
    }
    return Ok(undefined)
  }

  /**
   * パラメータの抽出と検証
   */
  private static async extractParams<T>(
    request: NextRequest,
    schema: z.ZodType<T>
  ): Promise<Result<T, ValidationError>> {
    try {
      let data: unknown

      if (request.method === 'GET') {
        // URLSearchParamsから抽出
        const { searchParams } = new URL(request.url)
        data = Object.fromEntries(searchParams.entries())
      } else {
        // リクエストボディから抽出
        const contentType = request.headers.get('content-type') || ''
        
        if (contentType.includes('application/json')) {
          data = await request.json()
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
          const formData = await request.formData()
          data = Object.fromEntries(formData.entries())
        } else {
          // URLSearchParamsも試す
          const { searchParams } = new URL(request.url)
          data = Object.fromEntries(searchParams.entries())
        }
      }

      return ValidationFramework.input(schema, data)

    } catch (error) {
      return Err(new ValidationError('Failed to extract request parameters', { 
        originalError: error 
      }))
    }
  }

  /**
   * 認証の検証（簡易実装）
   */
  private static async validateAuth(request: NextRequest): Promise<Result<void, ValidationError>> {
    // TODO: 実際の認証ロジックを実装
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return Err(new ValidationError('Authentication required'))
    }
    return Ok(undefined)
  }

  /**
   * 成功レスポンスの作成
   */
  private static createSuccessResponse<T>(
    data: T, 
    message?: string,
    cacheMaxAge?: number
  ): NextResponse {
    const responseBody: ApiSuccessResponse<T> = {
      success: true,
      data,
      ...(message && { message })
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json; charset=utf-8'
    }

    if (cacheMaxAge) {
      headers['Cache-Control'] = `public, max-age=${cacheMaxAge}`
    }

    this.addCorsHeaders(headers)

    return NextResponse.json(responseBody, { headers })
  }

  /**
   * エラーレスポンスの作成
   */
  private static createErrorResponse(error: AppError): NextResponse {
    const responseBody: ApiErrorResponse = {
      success: false,
      error: error.message,
      code: error.code,
      statusCode: error.statusCode
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json; charset=utf-8'
    }

    this.addCorsHeaders(headers)

    return NextResponse.json(responseBody, { 
      status: error.statusCode,
      headers 
    })
  }

  /**
   * フォールバックレスポンスの作成
   */
  private static createFallbackResponse(contentType: string, cacheControl?: string): NextResponse {
    const headers: Record<string, string> = {
      'Content-Type': contentType
    }

    if (cacheControl) {
      headers['Cache-Control'] = cacheControl
    }

    this.addCorsHeaders(headers)

    // コンテンツタイプに応じたフォールバック
    let fallbackContent = '0'
    if (contentType.includes('svg')) {
      fallbackContent = `
        <svg width="100" height="30" xmlns="http://www.w3.org/2000/svg">
          <text x="10" y="20" font-family="monospace" font-size="14" fill="#666">Error</text>
        </svg>
      `.trim()
    }

    return new NextResponse(fallbackContent, { headers })
  }

  /**
   * CORSヘッダーの追加
   */
  private static addCorsHeaders(headers: Record<string, string>): void {
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
  }

  /**
   * OPTIONSリクエスト用のハンドラー
   */
  static createOptionsHandler() {
    return async (): Promise<NextResponse> => {
      const headers: Record<string, string> = {}
      this.addCorsHeaders(headers)
      
      return new NextResponse(null, { 
        status: 200, 
        headers 
      })
    }
  }
}

/**
 * よく使用されるAPIハンドラーのファクトリー
 */
export class ApiHandlerFactory {
  /**
   * CRUD操作用のハンドラーセットを作成
   */
  static createCrudHandlers<TEntity, TCreateParams, TUpdateParams>(config: {
    entitySchema: z.ZodType<TEntity>
    createParamsSchema: z.ZodType<TCreateParams>
    updateParamsSchema: z.ZodType<TUpdateParams>
    service: {
      create: (params: TCreateParams) => Promise<Result<TEntity, AppError>>
      get: (id: string) => Promise<Result<TEntity, AppError>>
      update: (id: string, params: TUpdateParams) => Promise<Result<TEntity, AppError>>
      delete: (id: string) => Promise<Result<void, AppError>>
    }
  }) {
    return {
      create: ApiHandler.create({
        paramsSchema: config.createParamsSchema,
        resultSchema: config.entitySchema,
        handler: async (params) => await config.service.create(params),
        allowedMethods: ['POST']
      }),

      get: ApiHandler.create({
        paramsSchema: z.object({ id: z.string() }),
        resultSchema: config.entitySchema,
        handler: async ({ id }) => await config.service.get(id),
        allowedMethods: ['GET']
      }),

      update: ApiHandler.create({
        paramsSchema: z.object({ id: z.string() }).and(config.updateParamsSchema),
        resultSchema: config.entitySchema,
        handler: async ({ id, ...params }) => await config.service.update(id, params as TUpdateParams),
        allowedMethods: ['PUT', 'PATCH']
      }),

      delete: ApiHandler.create({
        paramsSchema: z.object({ id: z.string() }),
        resultSchema: z.object({ success: z.literal(true) }),
        handler: async ({ id }) => {
          const result = await config.service.delete(id)
          if (result.success) {
            return Ok({ success: true as const })
          }
          return result as Result<{ success: true }, AppError>
        },
        allowedMethods: ['DELETE']
      }),

      options: ApiHandler.createOptionsHandler()
    }
  }

  /**
   * ページネーション対応リスト取得ハンドラー
   */
  static createPaginatedListHandler<TItem>(config: {
    itemSchema: z.ZodType<TItem>
    handler: (page: number, limit: number) => Promise<Result<{items: TItem[], total: number, hasMore: boolean}, AppError>>
  }) {
    const paramsSchema = z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(10)
    })

    const resultSchema = z.object({
      items: z.array(config.itemSchema),
      pagination: z.object({
        page: z.number().int(),
        limit: z.number().int(),
        total: z.number().int(),
        hasMore: z.boolean()
      })
    })

    return ApiHandler.create({
      paramsSchema,
      resultSchema,
      handler: async ({ page, limit }) => {
        const result = await config.handler(page, limit)
        if (!result.success) {
          return result
        }

        return Ok({
          items: result.data.items,
          pagination: {
            page,
            limit,
            total: result.data.total,
            hasMore: result.data.hasMore
          }
        })
      }
    })
  }
}