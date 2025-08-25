/**
 * サービス別統一スキーマビルダー
 * 各サービスの全スキーマをここで一元管理
 */

import { z } from 'zod'
import { CommonSchemas } from '@/lib/core/validation'
import {
  COUNTER, LIKE, RANKING, BBS,
  DEFAULT_THEME
} from '@/lib/validation/schema-constants'
import { CounterFieldSchemas } from '@/domain/counter/counter.entity'
import { LikeFieldSchemas } from '@/domain/like/like.entity'
import { RankingFieldSchemas } from '@/domain/ranking/ranking.entity'
import { BBSFieldSchemas } from '@/domain/bbs/bbs.entity'

// === Counter Service Schemas ===
export const CounterSchemas = {
  // 作成用パラメータ
  create: z.object({
    action: z.literal('create'),
    url: CommonSchemas.url,
    token: CommonSchemas.token
  }),

  // カウントアップ用パラメータ
  increment: z.object({
    action: z.literal('increment'),
    id: CommonSchemas.publicId
  }),

  // 表示用パラメータ
  display: z.object({
    action: z.literal('display'),
    id: CommonSchemas.publicId,
    type: CounterFieldSchemas.counterType.default(COUNTER.DEFAULT_TYPE),
    theme: CommonSchemas.theme.default(DEFAULT_THEME),
    digits: CounterFieldSchemas.counterDigits,
    format: CounterFieldSchemas.counterFormat.default(COUNTER.DEFAULT_FORMAT)
  }),

  // 値設定用パラメータ
  set: z.object({
    action: z.literal('set'),
    url: CommonSchemas.url,
    token: CommonSchemas.token,
    total: CommonSchemas.nonNegativeInt
  }),

  // 削除用パラメータ
  delete: z.object({
    action: z.literal('delete'),
    url: CommonSchemas.url,
    token: CommonSchemas.token
  }),

  // データ形式
  data: z.object({
    id: CommonSchemas.publicId,
    url: CommonSchemas.url,
    total: CommonSchemas.nonNegativeInt,
    today: CommonSchemas.nonNegativeInt,
    yesterday: CommonSchemas.nonNegativeInt,
    week: CommonSchemas.nonNegativeInt,
    month: CommonSchemas.nonNegativeInt,
    lastVisit: CommonSchemas.date.optional()
  })
} as const

// === Like Service Schemas ===
export const LikeSchemas = {
  // 作成用パラメータ
  create: z.object({
    action: z.literal('create'),
    url: CommonSchemas.url,
    token: CommonSchemas.token
  }),

  // いいねトグル用パラメータ
  toggle: z.object({
    action: z.literal('toggle'),
    id: CommonSchemas.publicId
  }),

  // 取得用パラメータ
  get: z.object({
    action: z.literal('get'),
    id: CommonSchemas.publicId
  }),

  // 表示用パラメータ
  display: z.object({
    action: z.literal('display'),
    id: CommonSchemas.publicId,
    theme: CommonSchemas.theme.default(DEFAULT_THEME),
    format: LikeFieldSchemas.likeFormat.default(LIKE.DEFAULT_FORMAT)
  }),

  // 値設定用パラメータ
  set: z.object({
    action: z.literal('set'),
    url: CommonSchemas.url,
    token: CommonSchemas.token,
    value: CommonSchemas.nonNegativeInt
  }),

  // 削除用パラメータ
  delete: z.object({
    action: z.literal('delete'),
    url: CommonSchemas.url,
    token: CommonSchemas.token
  }),

  // データ形式
  data: z.object({
    id: CommonSchemas.publicId,
    url: CommonSchemas.url,
    total: CommonSchemas.nonNegativeInt,
    userLiked: LikeFieldSchemas.userLiked,
    action: LikeFieldSchemas.likeAction.optional()
  })
} as const

// === Ranking Service Schemas ===
export const RankingSchemas = {
  // 作成用パラメータ
  create: z.object({
    action: z.literal('create'),
    url: CommonSchemas.url,
    token: CommonSchemas.token,
    title: CommonSchemas.shortText.optional(),
    max: RankingFieldSchemas.maxEntries.default(RANKING.LIMIT.DEFAULT)
  }),

  // スコア送信用パラメータ
  submit: z.object({
    action: z.literal('submit'),
    id: CommonSchemas.publicId,
    name: RankingFieldSchemas.playerName,
    score: RankingFieldSchemas.score,
    displayScore: RankingFieldSchemas.displayScore.optional()
  }),

  // スコア更新用パラメータ
  update: z.object({
    action: z.literal('update'),
    url: CommonSchemas.url,
    token: CommonSchemas.token,
    name: RankingFieldSchemas.playerName,
    score: RankingFieldSchemas.score
  }),

  // エントリー削除用パラメータ
  remove: z.object({
    action: z.literal('remove'),
    url: CommonSchemas.url,
    token: CommonSchemas.token,
    name: RankingFieldSchemas.playerName
  }),

  // 全削除用パラメータ
  clear: z.object({
    action: z.literal('clear'),
    url: CommonSchemas.url,
    token: CommonSchemas.token
  }),

  // 取得用パラメータ
  get: z.object({
    action: z.literal('get'),
    id: CommonSchemas.publicId,
    limit: RankingFieldSchemas.limit.default(RANKING.LIMIT.DEFAULT)
  }),

  // 表示用パラメータ
  display: z.object({
    action: z.literal('display'),
    id: CommonSchemas.publicId,
    limit: RankingFieldSchemas.limit.default(RANKING.LIMIT.DEFAULT),
    theme: CommonSchemas.theme.default(DEFAULT_THEME),
    format: RankingFieldSchemas.format.default(RANKING.DEFAULT_FORMAT)
  }),

  // 削除用パラメータ
  delete: z.object({
    action: z.literal('delete'),
    url: CommonSchemas.url,
    token: CommonSchemas.token
  }),

  // エントリー形式
  entry: z.object({
    rank: CommonSchemas.positiveInt,
    name: RankingFieldSchemas.playerName,
    score: RankingFieldSchemas.score,
    displayScore: RankingFieldSchemas.displayScore.optional()
  }),

  // データ形式
  data: z.object({
    id: CommonSchemas.publicId,
    url: CommonSchemas.url,
    title: CommonSchemas.title.optional(),
    entries: z.array(z.object({
      rank: CommonSchemas.positiveInt,
      name: RankingFieldSchemas.playerName,
      score: RankingFieldSchemas.score,
      displayScore: RankingFieldSchemas.displayScore.optional()
    })),
    maxEntries: RankingFieldSchemas.maxEntries
  })
} as const

// === BBS Service Schemas ===
export const BBSSchemas = {
  // 作成用パラメータ
  create: z.object({
    action: z.literal('create'),
    url: CommonSchemas.url,
    token: CommonSchemas.token,
    title: BBSFieldSchemas.bbsTitle.default('BBS'),
    messagesPerPage: BBSFieldSchemas.messagesPerPage.default(10),
    max: BBSFieldSchemas.maxMessages.default(100),
    enableIcons: BBSFieldSchemas.enableFlags.default(true),
    enableSelects: BBSFieldSchemas.enableFlags.default(false)
  }),

  // 投稿用パラメータ
  post: z.object({
    action: z.literal('post'),
    id: CommonSchemas.publicId,
    author: BBSFieldSchemas.author.default(BBS.AUTHOR.DEFAULT_VALUE),
    message: BBSFieldSchemas.messageText,
    icon: BBSFieldSchemas.icon,
    select1: BBSFieldSchemas.selectOption.optional(),
    select2: BBSFieldSchemas.selectOption.optional(),
    select3: BBSFieldSchemas.selectOption.optional()
  }),

  // ID指定投稿用パラメータ
  postById: z.object({
    action: z.literal('postById'),
    url: CommonSchemas.url,
    token: CommonSchemas.token,
    author: BBSFieldSchemas.author.default(BBS.AUTHOR.DEFAULT_VALUE),
    message: BBSFieldSchemas.messageText,
    icon: BBSFieldSchemas.icon
  }),

  // メッセージ編集用パラメータ
  editMessage: z.object({
    action: z.literal('editMessage'),
    url: CommonSchemas.url,
    token: CommonSchemas.token,
    messageId: BBSFieldSchemas.messageId,
    editToken: BBSFieldSchemas.editToken,
    author: BBSFieldSchemas.author,
    message: BBSFieldSchemas.messageText,
    icon: BBSFieldSchemas.icon,
    select1: BBSFieldSchemas.selectOption.optional(),
    select2: BBSFieldSchemas.selectOption.optional(),
    select3: BBSFieldSchemas.selectOption.optional()
  }),

  // ID指定メッセージ編集用パラメータ
  editMessageById: z.object({
    action: z.literal('editMessageById'),
    id: CommonSchemas.publicId,
    messageId: BBSFieldSchemas.messageId,
    editToken: BBSFieldSchemas.editToken,
    author: BBSFieldSchemas.author,
    message: BBSFieldSchemas.messageText,
    icon: BBSFieldSchemas.icon,
    select1: BBSFieldSchemas.selectOption.optional(),
    select2: BBSFieldSchemas.selectOption.optional(),
    select3: BBSFieldSchemas.selectOption.optional()
  }),

  // メッセージ削除用パラメータ
  deleteMessage: z.object({
    action: z.literal('deleteMessage'),
    url: CommonSchemas.url,
    token: CommonSchemas.token,
    messageId: BBSFieldSchemas.messageId,
    editToken: z.string()
  }),

  // ID指定メッセージ削除用パラメータ
  deleteMessageById: z.object({
    action: z.literal('deleteMessageById'),
    id: CommonSchemas.publicId,
    messageId: BBSFieldSchemas.messageId,
    editToken: z.string()
  }),

  // 全削除用パラメータ
  clear: z.object({
    action: z.literal('clear'),
    url: CommonSchemas.url,
    token: CommonSchemas.token
  }),

  // 取得用パラメータ
  get: z.object({
    action: z.literal('get'),
    id: CommonSchemas.publicId,
    page: BBSFieldSchemas.page.default(BBS.PAGINATION.DEFAULT_PAGE)
  }),

  // 削除用パラメータ
  delete: z.object({
    action: z.literal('delete'),
    url: CommonSchemas.url,
    token: CommonSchemas.token
  }),

  // 設定更新用パラメータ
  updateSettings: z.object({
    action: z.literal('updateSettings'),
    url: CommonSchemas.url,
    token: CommonSchemas.token,
    title: BBSFieldSchemas.bbsTitle.optional(),
    messagesPerPage: BBSFieldSchemas.updateMessagesPerPage.optional(),
    maxMessages: BBSFieldSchemas.updateMaxMessages.optional()
  }),

  // 表示用パラメータ
  display: z.object({
    action: z.literal('display'),
    id: CommonSchemas.publicId,
    page: BBSFieldSchemas.page.default(BBS.PAGINATION.DEFAULT_PAGE),
    theme: CommonSchemas.theme.default(DEFAULT_THEME),
    format: BBSFieldSchemas.format.default(BBS.DEFAULT_FORMAT)
  }),

  // メッセージ形式
  message: z.object({
    id: z.string(),
    author: z.string(),
    message: z.string(),
    timestamp: z.date(),
    icon: BBSFieldSchemas.selectOption.optional(),
    selects: z.array(z.string()).optional(),
    authorHash: z.string(),
    editToken: BBSFieldSchemas.selectOption.optional()
  }),

  // 投稿結果形式
  postResult: z.object({
    success: z.literal(true),
    data: z.object({
      id: z.string(),
      url: z.string(),
      title: z.string(),
      messages: z.array(z.object({
        id: z.string(),
        author: z.string(),
        message: z.string(),
        timestamp: z.date(),
        icon: BBSFieldSchemas.selectOption.optional(),
        selects: z.array(z.string()).optional(),
        authorHash: z.string()
      })),
      totalMessages: z.number().int().min(0),
      currentPage: z.number().int().positive(),
      totalPages: z.number().int().min(0),
      pagination: z.object({
        page: z.number().int().positive(),
        totalPages: z.number().int().min(0),
        hasNext: z.boolean(),
        hasPrev: z.boolean()
      }),
      settings: z.object({
        title: z.string(),
        maxMessages: z.number().int().positive(),
        messagesPerPage: z.number().int().positive(),
        icons: z.array(z.string()),
        selects: z.array(z.object({
          label: z.string(),
          options: z.array(z.string())
        }))
      }),
      lastMessage: z.date().optional()
    }),
    messageId: BBSFieldSchemas.messageId,
    editToken: z.string()
  }),

  // データ形式
  data: z.object({
    id: z.string(),
    url: z.string(), 
    title: z.string(),
    messages: z.array(z.object({
      id: z.string(),
      author: z.string(),
      message: z.string(),
      timestamp: z.date(),
      icon: BBSFieldSchemas.selectOption.optional(),
      selects: z.array(z.string()).optional(),
      authorHash: z.string()
    })),
    totalMessages: z.number().int().min(0),
    currentPage: z.number().int().positive(),
    totalPages: z.number().int().min(0),
    pagination: z.object({
      page: z.number().int().positive(),
      totalPages: z.number().int().min(0),
      hasNext: z.boolean(),
      hasPrev: z.boolean()
    }),
    settings: z.object({
      title: z.string(),
      maxMessages: z.number().int().positive(),
      messagesPerPage: z.number().int().positive(),
      icons: z.array(z.string()),
      selects: z.array(z.object({
        label: z.string(),
        options: z.array(z.string())
      }))
    }),
    lastMessage: z.date().optional()
  })
} as const

// === 統合APIスキーマ（各サービス共通） ===
export const UnifiedAPISchemas = {
  // 共通エラーレスポンス
  error: z.object({
    success: z.literal(false),
    error: z.string(),
    code: BBSFieldSchemas.selectOption.optional(),
    details: z.record(z.string(), z.unknown()).optional()
  }),

  // 共通成功レスポンス
  success: <T extends z.ZodTypeAny>(dataSchema: T) => z.object({
    success: z.literal(true),
    data: dataSchema,
    message: BBSFieldSchemas.selectOption.optional()
  }),

  // 作成成功レスポンス
  createSuccess: z.object({
    success: z.literal(true),
    id: CommonSchemas.publicId,
    url: z.string(),
    message: BBSFieldSchemas.selectOption.optional()
  }),

  // 削除成功レスポンス（完全削除時のみ使用）
  deleteSuccess: z.object({
    success: z.literal(true),
    message: z.string(),
    id: CommonSchemas.publicId
  })
} as const

// === Union型定義（API route用） ===
export const CounterActionParams = z.union([
  CounterSchemas.create,
  CounterSchemas.increment,
  CounterSchemas.display,
  CounterSchemas.set
])

export const LikeActionParams = z.union([
  LikeSchemas.create,
  LikeSchemas.toggle,
  LikeSchemas.get,
  LikeSchemas.display
])

export const RankingActionParams = z.union([
  RankingSchemas.create,
  RankingSchemas.submit,
  RankingSchemas.update,
  RankingSchemas.remove,
  RankingSchemas.clear,
  RankingSchemas.display
])

export const BBSActionParams = z.union([
  BBSSchemas.create,
  BBSSchemas.post,
  BBSSchemas.postById,
  BBSSchemas.editMessage,
  BBSSchemas.editMessageById,
  BBSSchemas.deleteMessage,
  BBSSchemas.deleteMessageById,
  BBSSchemas.clear,
  BBSSchemas.display
])

// === 型エクスポート ===
export type CounterCreateParams = z.infer<typeof CounterSchemas.create>
export type CounterIncrementParams = z.infer<typeof CounterSchemas.increment>
export type CounterDisplayParams = z.infer<typeof CounterSchemas.display>
export type CounterSetParams = z.infer<typeof CounterSchemas.set>
export type CounterData = z.infer<typeof CounterSchemas.data>

export type LikeCreateParams = z.infer<typeof LikeSchemas.create>
export type LikeToggleParams = z.infer<typeof LikeSchemas.toggle>
export type LikeGetParams = z.infer<typeof LikeSchemas.get>
export type LikeDisplayParams = z.infer<typeof LikeSchemas.display>
export type LikeData = z.infer<typeof LikeSchemas.data>

export type RankingCreateParams = z.infer<typeof RankingSchemas.create>
export type RankingSubmitParams = z.infer<typeof RankingSchemas.submit>
export type RankingDisplayParams = z.infer<typeof RankingSchemas.display>
export type RankingEntry = z.infer<typeof RankingSchemas.entry>
export type RankingData = z.infer<typeof RankingSchemas.data>

export type BBSCreateParams = z.infer<typeof BBSSchemas.create>
export type BBSPostParams = z.infer<typeof BBSSchemas.post>
export type BBSDisplayParams = z.infer<typeof BBSSchemas.display>
export type BBSMessage = z.infer<typeof BBSSchemas.message>
export type BBSData = z.infer<typeof BBSSchemas.data>

// === 共通レスポンススキーマ ===
export const CommonResponseSchemas = {
  // エラーハンドリング用
  errorAction: z.object({ action: z.string() }),
  errorResponse: z.object({ error: z.string() }),
  emptyParams: z.object({}),
  
  // 特殊レスポンス用
  textResponse: z.string(),
  numberResponse: CommonSchemas.nonNegativeInt,
  
  // 表示用オブジェクト
  counterSvgData: z.object({
    value: CommonSchemas.nonNegativeInt,
    type: CounterFieldSchemas.counterType,
    theme: CommonSchemas.theme,
    digits: CounterFieldSchemas.counterDigits
  }),
  
  likeSvgData: z.object({
    total: CommonSchemas.nonNegativeInt,
    theme: CommonSchemas.theme
  })
} as const