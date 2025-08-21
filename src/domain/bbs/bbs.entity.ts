/**
 * BBS Domain Entity - 掲示板機能のエンティティ定義
 */

import { z } from 'zod'
import { CommonSchemas } from '@/lib/core/validation'

/**
 * BBS固有のフィールドスキーマ
 */
export const BBSFieldSchemas = {
  bbsTitle: CommonSchemas.bbsTitle,
  author: CommonSchemas.bbsAuthor,
  messageText: CommonSchemas.bbsMessage,
  messageId: CommonSchemas.messageId,
  authorHash: CommonSchemas.authorHash,
  icon: CommonSchemas.iconString,
  page: CommonSchemas.bbsPage,
  maxMessages: CommonSchemas.bbsMaxMessages,
  messagesPerPage: CommonSchemas.bbsMessagesPerPage,
  selectLabel: CommonSchemas.bbsSelectLabel,
  selectOption: CommonSchemas.bbsSelectOption
} as const

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
  }
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
  label: BBSFieldSchemas.selectLabel,
  options: z.array(BBSFieldSchemas.selectOption).max(50)
})

export const BBSSettingsSchema = z.object({
  title: BBSFieldSchemas.bbsTitle.default('💬 BBS'),
  maxMessages: BBSFieldSchemas.maxMessages,
  messagesPerPage: BBSFieldSchemas.messagesPerPage,
  icons: z.array(BBSFieldSchemas.icon).max(20),
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
  id: BBSFieldSchemas.messageId,
  author: BBSFieldSchemas.author,
  message: BBSFieldSchemas.messageText,
  timestamp: CommonSchemas.date,
  icon: BBSFieldSchemas.icon.optional(),
  selects: z.array(z.string()).max(3).optional(),
  authorHash: BBSFieldSchemas.authorHash
})

export const BBSDataSchema = z.object({
  id: z.string(),
  url: CommonSchemas.url,
  title: BBSFieldSchemas.bbsTitle,
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
  title: BBSFieldSchemas.bbsTitle.default('💬 BBS'),
  maxMessages: BBSFieldSchemas.maxMessages.default(1000),
  messagesPerPage: BBSFieldSchemas.messagesPerPage.default(10),
  icons: z.array(BBSFieldSchemas.icon).max(20).default([]),
  selects: z.array(BBSSelectOptionSchema).max(3).default([])
})

export const BBSPostParamsSchema = z.object({
  author: BBSFieldSchemas.author,
  message: BBSFieldSchemas.messageText,
  icon: BBSFieldSchemas.icon.optional(),
  selects: z.array(z.string()).max(3).optional(),
  authorHash: BBSFieldSchemas.authorHash
})

export const BBSUpdateParamsSchema = z.object({
  messageId: BBSFieldSchemas.messageId,
  author: BBSFieldSchemas.author,
  message: BBSFieldSchemas.messageText,
  icon: BBSFieldSchemas.icon.optional(),
  selects: z.array(z.string()).max(3).optional(),
  authorHash: BBSFieldSchemas.authorHash
})

export const BBSRemoveParamsSchema = z.object({
  messageId: BBSFieldSchemas.messageId,
  authorHash: BBSFieldSchemas.authorHash
})

export const BBSDisplayParamsSchema = z.object({
  id: CommonSchemas.publicId,
  page: BBSFieldSchemas.page.default(1)
})

/**
 * BBS設定更新用パラメータ
 */
export const BBSUpdateSettingsParamsSchema = z.object({
  title: BBSFieldSchemas.bbsTitle.optional(),
  messagesPerPage: BBSFieldSchemas.messagesPerPage.optional(),
  maxMessages: BBSFieldSchemas.maxMessages.optional(),
  icons: z.array(BBSFieldSchemas.icon).max(20).optional(),
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