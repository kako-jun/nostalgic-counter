/**
 * アプリケーション初期化
 * 新アーキテクチャの起動処理
 */

import { config, type Config } from '@/lib/core/config'
import { eventBus, Events } from '@/lib/core/event-bus'
import { Result, Ok, Err, ValidationError } from '@/lib/core/result'

/**
 * アプリケーション初期化クラス
 */
export class Application {
  private static initialized = false

  /**
   * アプリケーションの初期化
   */
  static async initialize(): Promise<Result<void, ValidationError>> {
    if (this.initialized) {
      return Ok(undefined)
    }

    console.log('🚀 Initializing Nostalgic Platform v2...')

    try {
      // 1. 設定システム初期化
      const configResult = config.initialize()
      if (!configResult.success) {
        return configResult
      }

      // 2. イベントバス初期化
      this.setupEventBus()

      // 3. グローバルエラーハンドリング
      this.setupGlobalErrorHandling()

      // 4. パフォーマンス監視
      this.setupPerformanceMonitoring()

      this.initialized = true

      console.log('✅ Nostalgic Platform v2 initialized successfully')
      console.log(`📊 Configuration: ${JSON.stringify(config.toJSON(), null, 2)}`)
      
      // 初期化完了イベント
      await eventBus.emit('app.initialized', {
        timestamp: new Date(),
        version: '2.0.0',
        config: config.toJSON()
      }, { source: 'application' })

      return Ok(undefined)

    } catch (error) {
      console.error('❌ Application initialization failed:', error)
      return Err(new ValidationError('Application initialization failed', { error }))
    }
  }

  /**
   * イベントバスの設定
   */
  private static setupEventBus(): void {
    // パフォーマンス警告の監視
    eventBus.on(Events.PERFORMANCE_WARNING, async (event) => {
      const data = event.data as { operation: string; duration: number; threshold: number; service: string }
      console.warn(`⚠️ Performance Warning: ${data.service}.${data.operation} took ${data.duration}ms (threshold: ${data.threshold}ms)`)
    }, { priority: 100 })

    // エラー発生の監視
    eventBus.on(Events.ERROR_OCCURRED, async (event) => {
      const data = event.data as { error: string; context?: unknown; service: string }
      console.error(`❌ Error in ${data.service}:`, data.error, data.context)
    }, { priority: 100 })

    // ユーザー訪問の統計
    const visitStats = new Map<string, number>()
    eventBus.on(Events.USER_VISIT, async (event) => {
      const data = event.data as { service: string; userHash: string }
      const key = `${data.service}:${data.userHash}`
      visitStats.set(key, (visitStats.get(key) || 0) + 1)
      
      // 10分おきに統計をログ出力
      if (visitStats.size % 100 === 0) {
        console.log(`📈 Visit Stats: ${visitStats.size} unique visitors`)
      }
    }, { priority: 50 })

    console.log('📡 EventBus configured with system listeners')
  }

  /**
   * グローバルエラーハンドリング
   */
  private static setupGlobalErrorHandling(): void {
    // 未処理の Promise rejection
    process.on('unhandledRejection', (reason, promise) => {
      console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason)
      
      eventBus.emitSync(Events.ERROR_OCCURRED, {
        type: 'unhandled_rejection',
        error: reason,
        promise: promise.toString()
      }, { source: 'global' })
    })

    // 未キャッチの例外
    process.on('uncaughtException', (error) => {
      console.error('🚨 Uncaught Exception:', error)
      
      eventBus.emitSync(Events.ERROR_OCCURRED, {
        type: 'uncaught_exception',
        error: error.message,
        stack: error.stack
      }, { source: 'global' })

      // プロセスを終了（本番環境では適切な処理を行う）
      process.exit(1)
    })

    console.log('🛡️ Global error handling configured')
  }

  /**
   * パフォーマンス監視
   */
  private static setupPerformanceMonitoring(): void {
    const loggingSettings = config.getLoggingSettings()
    
    if (!loggingSettings.enablePerformanceLogging) {
      return
    }

    // メモリ使用量の監視
    setInterval(() => {
      const memUsage = process.memoryUsage()
      const memUsageMB = {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024)
      }

      // メモリ使用量が500MB以上の場合に警告
      if (memUsageMB.rss > 500) {
        eventBus.emitSync(Events.PERFORMANCE_WARNING, {
          operation: 'memory_usage',
          duration: memUsageMB.rss,
          threshold: 500,
          service: 'system'
        }, { source: 'performance-monitor' })
      }

      console.log(`💾 Memory Usage: RSS=${memUsageMB.rss}MB, Heap=${memUsageMB.heapUsed}/${memUsageMB.heapTotal}MB`)
    }, 60000) // 1分間隔

    console.log('📊 Performance monitoring enabled')
  }

  /**
   * アプリケーション状態の取得
   */
  static getStatus(): {
    initialized: boolean
    uptime: number
    memoryUsage: NodeJS.MemoryUsage
    eventBusStats: ReturnType<typeof eventBus.getStats>
    config: ReturnType<typeof config.toJSON>
  } {
    return {
      initialized: this.initialized,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      eventBusStats: eventBus.getStats(),
      config: this.initialized ? config.toJSON() : {} as Config
    }
  }

  /**
   * ヘルスチェック
   */
  static async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    timestamp: Date
    checks: Record<string, boolean>
    details?: Record<string, unknown>
  }> {
    const checks: Record<string, boolean> = {
      initialized: this.initialized,
      configValid: config.validate().success,
      memoryOk: process.memoryUsage().rss < 1024 * 1024 * 1024, // 1GB未満
      eventBusHealthy: eventBus.getStats().totalListeners > 0
    }

    const allHealthy = Object.values(checks).every(check => check)
    const status = allHealthy ? 'healthy' : 'degraded'

    return {
      status,
      timestamp: new Date(),
      checks,
      details: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        eventBusStats: eventBus.getStats()
      }
    }
  }

  /**
   * グレースフルシャットダウン
   */
  static async shutdown(): Promise<void> {
    console.log('🔄 Shutting down Nostalgic Platform v2...')

    try {
      // シャットダウンイベント発行
      await eventBus.emit('app.shutdown', {
        timestamp: new Date(),
        uptime: process.uptime()
      }, { source: 'application' })

      // 少し待機してイベント処理を完了
      await new Promise(resolve => setTimeout(resolve, 1000))

      // イベントバスのクリーンアップ
      eventBus.clear()

      console.log('✅ Graceful shutdown completed')
    } catch (error) {
      console.error('❌ Shutdown error:', error)
    }
  }
}

/**
 * アプリケーション初期化の実行（サーバー起動時）
 */
export const initializeApp = Application.initialize