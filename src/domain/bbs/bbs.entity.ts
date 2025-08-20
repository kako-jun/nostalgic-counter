/**
 * BBS Domain Entity - 掲示板機能のエンティティ定義
 */

import { z } from 'zod'
import { CommonSchemas } from '@/lib/core/validation'

/**
 * BBSエンティティの基本型
 */
export interface BBSEntity {
  id: string
  url: string
  created: Date
  totalMessages: number
  lastMessage?: Date
  settings: BBSSettings
}

/**
 * BBS設定の型
 */
export interface BBSSettings {
  title: string
  maxMessages: number
  messagesPerPage: number
  icons: string[]
  selects: BBSSelectOption[]
}

/**
 * BBSセレクトオプションの型
 */
export interface BBSSelectOption {
  label: string
  options: string[]
}

/**
 * BBSメッセージの型
 */
export interface BBSMessage {
  id: string
  author: string
  message: string
  timestamp: Date
  icon?: string
  selects?: string[]
  authorHash: string
}

/**
 * クライアントに返すBBSデータの型
 */
export interface BBSData {
  id: string
  url: string
  title: string
  messages: BBSMessage[]
  totalMessages: number
  currentPage: number
  totalPages: number
  pagination: {
    page: number
    totalPages: number
    hasPrev: boolean
    hasNext: boolean
  } // Web Components用のページネーション
  settings: BBSSettings
  lastMessage?: Date
}

/**
 * BBS作成時のパラメータ
 */
export interface BBSCreateParams {
  title?: string
  maxMessages?: number
  messagesPerPage?: number
  icons?: string[]
  selects?: BBSSelectOption[]
}

/**
 * メッセージ投稿時のパラメータ
 */
export interface BBSPostParams {
  author: string
  message: string
  icon?: string
  selects?: string[]
  authorHash: string
}

/**
 * メッセージ更新時のパラメータ
 */
export interface BBSUpdateParams {
  messageId: string
  author: string
  message: string
  icon?: string
  selects?: string[]
  authorHash: string
}

/**
 * メッセージ削除時のパラメータ
 */
export interface BBSRemoveParams {
  messageId: string
  authorHash: string
}

/**
 * BBS表示時のパラメータ
 */
export interface BBSDisplayParams {
  id: string
  page?: number
}

/**
 * Zodスキーマ定義
 */
export const BBSSelectOptionSchema = z.object({
  label: z.string().min(1).max(50),
  options: z.array(z.string().min(1).max(50)).max(50)
})

export const BBSSettingsSchema = z.object({
  title: z.string().min(1).max(100).default('💬 BBS'),
  maxMessages: z.number().int().min(1).max(10000),
  messagesPerPage: z.number().int().min(1).max(100),
  icons: z.array(z.string()).max(20),
  selects: z.array(BBSSelectOptionSchema).max(3)
})

export const BBSEntitySchema = z.object({
  id: CommonSchemas.publicId,
  url: CommonSchemas.url,
  created: CommonSchemas.date,
  totalMessages: CommonSchemas.nonNegativeInt,
  lastMessage: CommonSchemas.date.optional(),
  settings: BBSSettingsSchema
})

export const BBSMessageSchema = z.object({
  id: z.string(),
  author: z.string().min(1).max(50),
  message: z.string().min(1).max(1000),
  timestamp: CommonSchemas.date,
  icon: z.string().optional(),
  selects: z.array(z.string()).max(3).optional(),
  authorHash: z.string()
})

export const BBSDataSchema = z.object({
  id: z.string(),
  url: CommonSchemas.url,
  title: z.string(),
  messages: z.array(BBSMessageSchema),
  totalMessages: CommonSchemas.nonNegativeInt,
  currentPage: CommonSchemas.positiveInt,
  totalPages: CommonSchemas.nonNegativeInt,
  pagination: z.object({
    page: CommonSchemas.positiveInt,
    totalPages: CommonSchemas.nonNegativeInt,
    hasPrev: z.boolean(),
    hasNext: z.boolean()
  }), // Web Components用のページネーション
  settings: BBSSettingsSchema,
  lastMessage: CommonSchemas.date.optional()
})

export const BBSCreateParamsSchema = z.object({
  title: z.string().min(1).max(100).default('💬 BBS'),
  maxMessages: z.number().int().min(1).max(10000).default(1000),
  messagesPerPage: z.number().int().min(1).max(100).default(10),
  icons: z.array(z.string()).max(20).default([]),
  selects: z.array(BBSSelectOptionSchema).max(3).default([])
})

export const BBSPostParamsSchema = z.object({
  author: z.string().min(1).max(50),
  message: z.string().min(1).max(1000),
  icon: z.string().optional(),
  selects: z.array(z.string()).max(3).optional(),
  authorHash: z.string()
})

export const BBSUpdateParamsSchema = z.object({
  messageId: z.string(),
  author: z.string().min(1).max(50),
  message: z.string().min(1).max(1000),
  icon: z.string().optional(),
  selects: z.array(z.string()).max(3).optional(),
  authorHash: z.string()
})

export const BBSRemoveParamsSchema = z.object({
  messageId: z.string(),
  authorHash: z.string()
})

export const BBSDisplayParamsSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+-[a-f0-9]{8}$/),
  page: z.number().int().min(1).default(1)
})

/**
 * BBS設定更新用パラメータ
 */
export const BBSUpdateSettingsParamsSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  messagesPerPage: z.number().int().min(1).max(100).optional(),
  maxMessages: z.number().int().min(1).max(10000).optional(),
  icons: z.array(z.string()).max(20).optional(),
  selects: z.array(BBSSelectOptionSchema).max(3).optional()
})

/**
 * 型エクスポート
 */
export type BBSEntityType = z.infer<typeof BBSEntitySchema>
export type BBSSettingsType = z.infer<typeof BBSSettingsSchema>
export type BBSSelectOptionType = z.infer<typeof BBSSelectOptionSchema>
export type BBSMessageType = z.infer<typeof BBSMessageSchema>
export type BBSDataType = z.infer<typeof BBSDataSchema>
export type BBSCreateParamsType = z.infer<typeof BBSCreateParamsSchema>
export type BBSPostParamsType = z.infer<typeof BBSPostParamsSchema>
export type BBSUpdateParamsType = z.infer<typeof BBSUpdateParamsSchema>
export type BBSRemoveParamsType = z.infer<typeof BBSRemoveParamsSchema>
export type BBSDisplayParamsType = z.infer<typeof BBSDisplayParamsSchema>
export type BBSUpdateSettingsParamsType = z.infer<typeof BBSUpdateSettingsParamsSchema>