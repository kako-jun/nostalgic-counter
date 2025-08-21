/**
 * サービス別統一スキーマビルダー
 * 各サービスの全スキーマをここで一元管理
 */

import { z } from 'zod'
import { BaseSchemas } from '../core/validation'
import {
  COUNTER, LIKE, RANKING, BBS,
  DEFAULT_THEME
} from './schema-constants'

// === Counter Service Schemas ===
export const CounterSchemas = {
  // 作成用パラメータ
  create: z.object({
    action: z.literal('create'),
    url: BaseSchemas.url,
    token: BaseSchemas.token
  }),

  // カウントアップ用パラメータ
  increment: z.object({
    action: z.literal('increment'),
    id: BaseSchemas.publicId
  }),

  // 表示用パラメータ
  display: z.object({
    action: z.literal('display'),
    id: BaseSchemas.publicId,
    type: BaseSchemas.counterType.default(COUNTER.DEFAULT_TYPE),
    theme: BaseSchemas.theme.default(DEFAULT_THEME),
    digits: BaseSchemas.counterDigits,
    format: BaseSchemas.counterFormat.default(COUNTER.DEFAULT_FORMAT)
  }),

  // 値設定用パラメータ
  set: z.object({
    action: z.literal('set'),
    url: BaseSchemas.url,
    token: BaseSchemas.token,
    total: BaseSchemas.nonNegativeInt
  }),

  // 削除用パラメータ
  delete: z.object({
    action: z.literal('delete'),
    url: BaseSchemas.url,
    token: BaseSchemas.token
  }),

  // データ形式
  data: z.object({
    url: z.string(),
    total: z.number().int().min(0),
    today: z.number().int().min(0),
    yesterday: z.number().int().min(0),
    week: z.number().int().min(0),
    month: z.number().int().min(0),
    lastVisit: z.date().optional()
  })
} as const

// === Like Service Schemas ===
export const LikeSchemas = {
  // 作成用パラメータ
  create: z.object({
    action: z.literal('create'),
    url: BaseSchemas.url,
    token: BaseSchemas.token
  }),

  // いいねトグル用パラメータ
  toggle: z.object({
    action: z.literal('toggle'),
    id: BaseSchemas.publicId
  }),

  // 取得用パラメータ
  get: z.object({
    action: z.literal('get'),
    id: BaseSchemas.publicId
  }),

  // 表示用パラメータ
  display: z.object({
    action: z.literal('display'),
    id: BaseSchemas.publicId,
    theme: BaseSchemas.theme.default(DEFAULT_THEME),
    format: BaseSchemas.likeFormat.default(LIKE.DEFAULT_FORMAT)
  }),

  // 値設定用パラメータ
  set: z.object({
    action: z.literal('set'),
    url: BaseSchemas.url,
    token: BaseSchemas.token,
    value: BaseSchemas.nonNegativeInt
  }),

  // 削除用パラメータ
  delete: z.object({
    action: z.literal('delete'),
    url: BaseSchemas.url,
    token: BaseSchemas.token
  }),

  // データ形式
  data: z.object({
    url: z.string(),
    total: z.number().int().min(0),
    userLiked: z.boolean(),
    action: z.enum(['liked', 'unliked']).optional()
  })
} as const

// === Ranking Service Schemas ===
export const RankingSchemas = {
  // 作成用パラメータ
  create: z.object({
    action: z.literal('create'),
    url: BaseSchemas.url,
    token: BaseSchemas.token,
    title: BaseSchemas.shortText.optional(),
    max: BaseSchemas.rankingLimit.default(RANKING.LIMIT.DEFAULT)
  }),

  // スコア送信用パラメータ
  submit: z.object({
    action: z.literal('submit'),
    url: BaseSchemas.url,
    token: BaseSchemas.token,
    name: BaseSchemas.rankingName,
    score: BaseSchemas.rankingScore
  }),

  // スコア更新用パラメータ
  update: z.object({
    action: z.literal('update'),
    url: BaseSchemas.url,
    token: BaseSchemas.token,
    name: BaseSchemas.rankingName,
    score: BaseSchemas.rankingScore
  }),

  // エントリー削除用パラメータ
  remove: z.object({
    action: z.literal('remove'),
    url: BaseSchemas.url,
    token: BaseSchemas.token,
    name: BaseSchemas.rankingName
  }),

  // 全削除用パラメータ
  clear: z.object({
    action: z.literal('clear'),
    url: BaseSchemas.url,
    token: BaseSchemas.token
  }),

  // 取得用パラメータ
  get: z.object({
    action: z.literal('get'),
    id: BaseSchemas.publicId,
    limit: BaseSchemas.rankingLimit.default(RANKING.LIMIT.DEFAULT)
  }),

  // 表示用パラメータ
  display: z.object({
    action: z.literal('display'),
    id: BaseSchemas.publicId,
    limit: BaseSchemas.rankingLimit.default(RANKING.LIMIT.DEFAULT),
    theme: BaseSchemas.theme.default(DEFAULT_THEME),
    format: BaseSchemas.rankingFormat.default(RANKING.DEFAULT_FORMAT)
  }),

  // 削除用パラメータ
  delete: z.object({
    action: z.literal('delete'),
    url: BaseSchemas.url,
    token: BaseSchemas.token
  }),

  // エントリー形式
  entry: z.object({
    rank: z.number().int().positive(),
    name: z.string(),
    score: z.number().int().min(0)
  }),

  // データ形式
  data: z.object({
    url: z.string(),
    title: z.string().optional(),
    entries: z.array(z.object({
      rank: z.number().int().positive(),
      name: z.string(),
      score: z.number().int().min(0)
    })),
    maxEntries: z.number().int().positive()
  })
} as const

// === BBS Service Schemas ===
export const BBSSchemas = {
  // 作成用パラメータ
  create: z.object({
    action: z.literal('create'),
    url: BaseSchemas.url,
    token: BaseSchemas.token,
    title: BaseSchemas.bbsTitle.default('BBS'),
    messagesPerPage: z.coerce.number().int().min(1).max(50).default(10),
    max: z.coerce.number().int().min(1).max(1000).default(100),
    enableIcons: z.coerce.boolean().default(true),
    enableSelects: z.coerce.boolean().default(false)
  }),

  // 投稿用パラメータ
  post: z.object({
    action: z.literal('post'),
    id: BaseSchemas.publicId,
    author: BaseSchemas.bbsAuthor.default(BBS.AUTHOR.DEFAULT_VALUE),
    message: BaseSchemas.bbsMessage,
    icon: BaseSchemas.bbsIcon,
    select1: z.string().optional(),
    select2: z.string().optional(),
    select3: z.string().optional()
  }),

  // ID指定投稿用パラメータ
  postById: z.object({
    action: z.literal('postById'),
    url: BaseSchemas.url,
    token: BaseSchemas.token,
    author: BaseSchemas.bbsAuthor.default(BBS.AUTHOR.DEFAULT_VALUE),
    message: BaseSchemas.bbsMessage,
    icon: BaseSchemas.bbsIcon
  }),

  // メッセージ編集用パラメータ
  editMessage: z.object({
    action: z.literal('editMessage'),
    url: BaseSchemas.url,
    token: BaseSchemas.token,
    messageId: z.string(),
    editToken: z.string(),
    author: BaseSchemas.bbsAuthor,
    message: BaseSchemas.bbsMessage,
    icon: BaseSchemas.bbsIcon,
    select1: z.string().optional(),
    select2: z.string().optional(),
    select3: z.string().optional()
  }),

  // ID指定メッセージ編集用パラメータ
  editMessageById: z.object({
    action: z.literal('editMessageById'),
    id: BaseSchemas.publicId,
    messageId: z.string(),
    editToken: z.string(),
    author: BaseSchemas.bbsAuthor,
    message: BaseSchemas.bbsMessage,
    icon: BaseSchemas.bbsIcon,
    select1: z.string().optional(),
    select2: z.string().optional(),
    select3: z.string().optional()
  }),

  // メッセージ削除用パラメータ
  deleteMessage: z.object({
    action: z.literal('deleteMessage'),
    url: BaseSchemas.url,
    token: BaseSchemas.token,
    messageId: z.string(),
    editToken: z.string()
  }),

  // ID指定メッセージ削除用パラメータ
  deleteMessageById: z.object({
    action: z.literal('deleteMessageById'),
    id: BaseSchemas.publicId,
    messageId: z.string(),
    editToken: z.string()
  }),

  // 全削除用パラメータ
  clear: z.object({
    action: z.literal('clear'),
    url: BaseSchemas.url,
    token: BaseSchemas.token
  }),

  // 取得用パラメータ
  get: z.object({
    action: z.literal('get'),
    id: BaseSchemas.publicId,
    page: BaseSchemas.bbsPage.default(BBS.PAGINATION.DEFAULT_PAGE)
  }),

  // 削除用パラメータ
  delete: z.object({
    action: z.literal('delete'),
    url: BaseSchemas.url,
    token: BaseSchemas.token
  }),

  // 設定更新用パラメータ
  updateSettings: z.object({
    action: z.literal('updateSettings'),
    url: BaseSchemas.url,
    token: BaseSchemas.token,
    title: BaseSchemas.bbsTitle.optional(),
    messagesPerPage: z.coerce.number().int().min(1).max(50).optional(),
    maxMessages: z.coerce.number().int().min(1).max(1000).optional()
  }),

  // 表示用パラメータ
  display: z.object({
    action: z.literal('display'),
    id: BaseSchemas.publicId,
    page: BaseSchemas.bbsPage.default(BBS.PAGINATION.DEFAULT_PAGE),
    theme: BaseSchemas.theme.default(DEFAULT_THEME),
    format: BaseSchemas.bbsFormat.default(BBS.DEFAULT_FORMAT)
  }),

  // メッセージ形式
  message: z.object({
    id: z.string(),
    author: z.string(),
    message: z.string(),
    timestamp: z.date(),
    icon: z.string().optional(),
    selects: z.array(z.string()).optional(),
    authorHash: z.string(),
    editToken: z.string().optional()
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
        icon: z.string().optional(),
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
    messageId: z.string(),
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
      icon: z.string().optional(),
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
    code: z.string().optional(),
    details: z.record(z.string(), z.unknown()).optional()
  }),

  // 共通成功レスポンス
  success: <T extends z.ZodTypeAny>(dataSchema: T) => z.object({
    success: z.literal(true),
    data: dataSchema,
    message: z.string().optional()
  }),

  // 作成成功レスポンス
  createSuccess: z.object({
    success: z.literal(true),
    id: BaseSchemas.publicId,
    url: z.string(),
    message: z.string().optional()
  }),

  // 更新成功レスポンス
  updateSuccess: z.object({
    success: z.literal(true)
  }),

  // 削除成功レスポンス  
  deleteSuccess: z.object({
    success: z.literal(true),
    message: z.string()
  }),

  // SET成功レスポンス
  setSuccess: z.object({
    success: z.literal(true)
  }),

  // REMOVE成功レスポンス
  removeSuccess: z.object({
    success: z.literal(true)
  }),

  // CLEAR成功レスポンス
  clearSuccess: z.object({
    success: z.literal(true)
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