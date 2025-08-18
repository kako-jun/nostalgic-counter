/**
 * イベント駆動システム
 * サービス間の疎結合な連携を実現
 */

import { z } from 'zod'
import { Result, Ok, Err, ValidationError } from './result'
import { ValidationFramework } from './validation'

/**
 * イベントの基本型
 */
export interface BaseEvent {
  id: string
  type: string
  timestamp: Date
  source: string
  data: unknown
  correlationId?: string
}

/**
 * イベントハンドラーの型
 */
export type EventHandler<T = unknown> = (event: BaseEvent & { data: T }) => Promise<void> | void

/**
 * イベントリスナーの設定
 */
export interface EventListener {
  id: string
  eventType: string
  handler: EventHandler
  schema?: z.ZodType<any>
  priority: number
  once: boolean
}

/**
 * イベントバスの実装
 */
export class EventBus {
  private static instance: EventBus
  private listeners: Map<string, EventListener[]> = new Map()
  private eventHistory: BaseEvent[] = []
  private maxHistorySize = 1000

  private constructor() {}

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus()
    }
    return EventBus.instance
  }

  /**
   * イベントリスナーの登録
   */
  on<T>(
    eventType: string,
    handler: EventHandler<T>,
    options: {
      schema?: z.ZodType<T>
      priority?: number
      once?: boolean
      id?: string
    } = {}
  ): string {
    const listenerId = options.id || `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const listener: EventListener = {
      id: listenerId,
      eventType,
      handler: handler as EventHandler,
      schema: options.schema,
      priority: options.priority || 0,
      once: options.once || false
    }

    const listeners = this.listeners.get(eventType) || []
    listeners.push(listener)
    
    // 優先度でソート（高い順）
    listeners.sort((a, b) => b.priority - a.priority)
    
    this.listeners.set(eventType, listeners)

    console.log(`Event listener registered: ${eventType} (${listenerId})`)
    return listenerId
  }

  /**
   * 一回のみのイベントリスナー
   */
  once<T>(
    eventType: string,
    handler: EventHandler<T>,
    options: { schema?: z.ZodType<T>; priority?: number } = {}
  ): string {
    return this.on(eventType, handler, { ...options, once: true })
  }

  /**
   * イベントリスナーの削除
   */
  off(eventType: string, listenerId?: string): boolean {
    const listeners = this.listeners.get(eventType)
    if (!listeners) {
      return false
    }

    if (listenerId) {
      const index = listeners.findIndex(l => l.id === listenerId)
      if (index >= 0) {
        listeners.splice(index, 1)
        console.log(`Event listener removed: ${eventType} (${listenerId})`)
        return true
      }
    } else {
      // 全てのリスナーを削除
      this.listeners.delete(eventType)
      console.log(`All event listeners removed: ${eventType}`)
      return true
    }

    return false
  }

  /**
   * イベントの発行
   */
  async emit(
    eventType: string,
    data: unknown,
    options: {
      source?: string
      correlationId?: string
      validateData?: boolean
    } = {}
  ): Promise<Result<void, ValidationError>> {
    const event: BaseEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: eventType,
      timestamp: new Date(),
      source: options.source || 'unknown',
      data,
      correlationId: options.correlationId
    }

    // イベント履歴に追加
    this.addToHistory(event)

    const listeners = this.listeners.get(eventType) || []
    
    if (listeners.length === 0) {
      console.log(`No listeners for event: ${eventType}`)
      return Ok(undefined)
    }

    console.log(`Emitting event: ${eventType} to ${listeners.length} listeners`)

    // 全リスナーを並列実行
    const results = await Promise.allSettled(
      listeners.map(async (listener) => {
        try {
          // データ検証（スキーマが指定されている場合）
          if (listener.schema && options.validateData !== false) {
            const validationResult = ValidationFramework.input(listener.schema, data)
            if (!validationResult.success) {
              console.error(`Event data validation failed for listener ${listener.id}:`, validationResult.error)
              return
            }
            event.data = validationResult.data
          }

          // ハンドラー実行
          await listener.handler(event)

          // 一回のみのリスナーは削除
          if (listener.once) {
            this.off(eventType, listener.id)
          }

        } catch (error) {
          console.error(`Event handler failed (${listener.id}):`, error)
          throw error
        }
      })
    )

    // 失敗したハンドラーをログに記録
    const failures = results.filter(result => result.status === 'rejected')
    if (failures.length > 0) {
      console.error(`${failures.length} event handlers failed for ${eventType}`)
      failures.forEach((failure, index) => {
        console.error(`Handler ${listeners[index].id}:`, failure.reason)
      })
    }

    return Ok(undefined)
  }

  /**
   * 同期的なイベント発行
   */
  emitSync(
    eventType: string,
    data: unknown,
    options: {
      source?: string
      correlationId?: string
    } = {}
  ): Result<void, ValidationError> {
    const event: BaseEvent = {
      id: `sync_event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: eventType,
      timestamp: new Date(),
      source: options.source || 'unknown',
      data,
      correlationId: options.correlationId
    }

    this.addToHistory(event)

    const listeners = this.listeners.get(eventType) || []
    
    for (const listener of listeners) {
      try {
        // データ検証
        if (listener.schema) {
          const validationResult = ValidationFramework.input(listener.schema, data)
          if (!validationResult.success) {
            console.error(`Sync event data validation failed for listener ${listener.id}:`, validationResult.error)
            continue
          }
          event.data = validationResult.data
        }

        // 同期ハンドラー実行
        const result = listener.handler(event)
        
        // Promiseが返された場合は警告
        if (result && typeof result.then === 'function') {
          console.warn(`Async handler detected in sync event ${eventType} (${listener.id})`)
        }

        // 一回のみのリスナーは削除
        if (listener.once) {
          this.off(eventType, listener.id)
        }

      } catch (error) {
        console.error(`Sync event handler failed (${listener.id}):`, error)
      }
    }

    return Ok(undefined)
  }

  /**
   * イベント履歴の取得
   */
  getHistory(eventType?: string, limit?: number): BaseEvent[] {
    let history = this.eventHistory

    if (eventType) {
      history = history.filter(event => event.type === eventType)
    }

    if (limit) {
      history = history.slice(-limit)
    }

    return history.map(event => ({ ...event })) // コピーを返す
  }

  /**
   * リスナー情報の取得
   */
  getListeners(eventType?: string): { eventType: string; count: number; listeners: Array<Omit<EventListener, 'handler' | 'schema'> & { hasSchema: boolean }> }[] {
    if (eventType) {
      const listeners = this.listeners.get(eventType) || []
      return [{
        eventType,
        count: listeners.length,
        listeners: listeners.map(l => ({
          id: l.id,
          eventType: l.eventType,
          priority: l.priority,
          once: l.once,
          hasSchema: !!l.schema
        }))
      }]
    }

    return Array.from(this.listeners.entries()).map(([type, listeners]) => ({
      eventType: type,
      count: listeners.length,
      listeners: listeners.map(l => ({
        id: l.id,
        eventType: l.eventType,
        priority: l.priority,
        once: l.once,
        hasSchema: !!l.schema
      }))
    }))
  }

  /**
   * 全リスナーのクリア
   */
  clear(): void {
    this.listeners.clear()
    this.eventHistory = []
    console.log('EventBus cleared')
  }

  /**
   * 統計情報の取得
   */
  getStats(): {
    totalListeners: number
    eventTypes: number
    historySize: number
    recentEvents: { type: string; count: number }[]
  } {
    const totalListeners = Array.from(this.listeners.values())
      .reduce((total, listeners) => total + listeners.length, 0)

    const recentEvents = this.eventHistory
      .slice(-100) // 直近100イベント
      .reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    const recentEventsList = Object.entries(recentEvents)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)

    return {
      totalListeners,
      eventTypes: this.listeners.size,
      historySize: this.eventHistory.length,
      recentEvents: recentEventsList
    }
  }

  private addToHistory(event: BaseEvent): void {
    this.eventHistory.push(event)
    
    // 履歴サイズ制限
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize)
    }
  }
}

/**
 * グローバルイベントバスインスタンス
 */
export const eventBus = EventBus.getInstance()

/**
 * イベント型定義のヘルパー
 */
export const Events = {
  // カウンター関連
  COUNTER_CREATED: 'counter.created',
  COUNTER_INCREMENTED: 'counter.incremented',
  COUNTER_VALUE_SET: 'counter.value_set',

  // いいね関連
  LIKE_CREATED: 'like.created',
  LIKE_TOGGLED: 'like.toggled',

  // ランキング関連
  RANKING_CREATED: 'ranking.created',
  RANKING_SCORE_SUBMITTED: 'ranking.score_submitted',
  RANKING_SCORE_UPDATED: 'ranking.score_updated',

  // BBS関連
  BBS_CREATED: 'bbs.created',
  BBS_MESSAGE_POSTED: 'bbs.message_posted',
  BBS_MESSAGE_UPDATED: 'bbs.message_updated',
  BBS_MESSAGE_REMOVED: 'bbs.message_removed',

  // システム関連
  USER_VISIT: 'user.visit',
  PERFORMANCE_WARNING: 'system.performance_warning',
  ERROR_OCCURRED: 'system.error'
} as const

/**
 * イベントデータのスキーマ
 */
export const EventSchemas = {
  counterIncremented: z.object({
    id: z.string(),
    previousValue: z.number(),
    newValue: z.number(),
    incrementBy: z.number(),
    userHash: z.string()
  }),

  likeToggled: z.object({
    id: z.string(),
    previousTotal: z.number(),
    newTotal: z.number(),
    userLiked: z.boolean(),
    userHash: z.string()
  }),

  performanceWarning: z.object({
    operation: z.string(),
    duration: z.number(),
    threshold: z.number(),
    service: z.string()
  })
} as const

/**
 * 便利なイベント発行関数
 */
export const emitEvent = {
  counterIncremented: (data: z.infer<typeof EventSchemas.counterIncremented>) =>
    eventBus.emit(Events.COUNTER_INCREMENTED, data, { 
      source: 'counter-service',
      validateData: true 
    }),

  likeToggled: (data: z.infer<typeof EventSchemas.likeToggled>) =>
    eventBus.emit(Events.LIKE_TOGGLED, data, { 
      source: 'like-service',
      validateData: true 
    }),

  performanceWarning: (data: z.infer<typeof EventSchemas.performanceWarning>) =>
    eventBus.emit(Events.PERFORMANCE_WARNING, data, { 
      source: 'system',
      validateData: true 
    })
}