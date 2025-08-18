import { z } from 'zod'

// 基本的なスキーマ
export const UrlSchema = z.string().url().min(1)
export const TokenSchema = z.string().min(8).max(16)
export const PublicIdSchema = z.string().regex(/^[a-z0-9.-]+-[a-f0-9]{8}$/)
export const DateSchema = z.coerce.date()

// Counter関連スキーマ
export const CounterTypeSchema = z.enum(['total', 'today', 'yesterday', 'week', 'month'])

export const CounterMetadataSchema = z.object({
  id: PublicIdSchema,
  url: UrlSchema,
  created: DateSchema,
})

export const CounterDataSchema = z.object({
  id: PublicIdSchema,
  url: UrlSchema,
  total: z.number().int().min(0),
  today: z.number().int().min(0),
  yesterday: z.number().int().min(0),
  week: z.number().int().min(0),
  month: z.number().int().min(0),
  firstVisit: DateSchema,
  lastVisit: DateSchema.optional(),
})

// Like関連スキーマ
export const LikeTypeSchema = z.literal('total')

export const LikeMetadataSchema = z.object({
  id: PublicIdSchema,
  url: UrlSchema,
  created: DateSchema,
  lastLike: DateSchema.optional(),
})

export const LikeDataSchema = z.object({
  id: PublicIdSchema,
  url: UrlSchema,
  total: z.number().int().min(0),
  userLiked: z.boolean(),
  lastLike: DateSchema,
  firstLike: DateSchema,
})

// Ranking関連スキーマ
export const RankingEntrySchema = z.object({
  name: z.string().min(1).max(20),
  score: z.number().int(),
  rank: z.number().int().min(1),
  timestamp: DateSchema,
})

export const RankingMetadataSchema = z.object({
  id: PublicIdSchema,
  url: UrlSchema,
  created: DateSchema,
  maxEntries: z.number().int().min(1).max(1000),
})

export const RankingDataSchema = z.object({
  id: PublicIdSchema,
  url: UrlSchema,
  entries: z.array(RankingEntrySchema),
  totalEntries: z.number().int().min(0),
})

// BBS関連スキーマ
export const BBSSelectOptionSchema = z.object({
  label: z.string().min(1).max(50),
  values: z.array(z.string()).max(50),
  required: z.boolean(),
})

export const BBSOptionsSchema = z.object({
  availableIcons: z.array(z.string()).max(20).optional(),
  select1: BBSSelectOptionSchema.optional(),
  select2: BBSSelectOptionSchema.optional(),
  select3: BBSSelectOptionSchema.optional(),
}).optional()

export const BBSMessageSchema = z.object({
  id: z.string().length(12),
  author: z.string().min(1).max(50),
  message: z.string().min(1).max(1000),
  timestamp: DateSchema,
  updated: DateSchema.optional(),
  icon: z.string().optional(),
  select1: z.string().optional(),
  select2: z.string().optional(),
  select3: z.string().optional(),
  userAgent: z.string().optional(),
  ipHash: z.string().optional(),
})

export const BBSMetadataSchema = z.object({
  id: PublicIdSchema,
  url: UrlSchema,
  created: DateSchema,
  maxMessages: z.number().int().min(1).max(10000),
  messagesPerPage: z.number().int().min(1).max(100),
  options: BBSOptionsSchema,
  lastPost: DateSchema.optional(),
})

export const BBSDataSchema = z.object({
  id: PublicIdSchema,
  url: UrlSchema,
  messages: z.array(BBSMessageSchema),
  totalMessages: z.number().int().min(0),
  currentPage: z.number().int().min(1),
  messagesPerPage: z.number().int().min(1).max(100),
  options: BBSOptionsSchema,
  lastPost: DateSchema.optional(),
  firstPost: DateSchema,
})

// API Parameter Schemas
export const CreateParamsSchema = z.object({
  url: UrlSchema,
  token: TokenSchema,
})

export const CounterIncrementParamsSchema = z.object({
  id: PublicIdSchema,
})

export const CounterDisplayParamsSchema = z.object({
  id: PublicIdSchema,
  type: CounterTypeSchema.default('total'),
  theme: z.enum(['classic', 'modern', 'retro']).default('classic'),
  digits: z.coerce.number().int().min(1).max(10).default(6),
  format: z.enum(['text', 'image']).default('image'),
})

export const CounterSetParamsSchema = z.object({
  url: UrlSchema,
  token: TokenSchema,
  total: z.coerce.number().int().min(0),
})

export const LikeToggleParamsSchema = z.object({
  url: UrlSchema,
  token: TokenSchema,
})

export const LikeDisplayParamsSchema = z.object({
  id: PublicIdSchema,
  theme: z.enum(['classic', 'modern', 'retro']).default('classic'),
  digits: z.coerce.number().int().min(1).max(10).default(6),
  format: z.enum(['text', 'image']).default('image'),
})

export const LikeSetParamsSchema = z.object({
  url: UrlSchema,
  token: TokenSchema,
  total: z.coerce.number().int().min(0),
})

export const RankingCreateParamsSchema = z.object({
  url: UrlSchema,
  token: TokenSchema,
  max: z.coerce.number().int().min(1).max(1000).default(100),
})

export const RankingSubmitParamsSchema = z.object({
  url: UrlSchema,
  token: TokenSchema,
  name: z.string().min(1).max(20),
  score: z.coerce.number().int(),
})

export const RankingGetParamsSchema = z.object({
  id: PublicIdSchema,
  limit: z.coerce.number().int().min(1).max(100).default(10),
})

export const RankingClearParamsSchema = z.object({
  url: UrlSchema,
  token: TokenSchema,
})

export const RankingRemoveParamsSchema = z.object({
  url: UrlSchema,
  token: TokenSchema,
  name: z.string().min(1).max(20),
})

export const RankingUpdateParamsSchema = z.object({
  url: UrlSchema,
  token: TokenSchema,
  name: z.string().min(1).max(20),
  score: z.coerce.number().int(),
})

export const BBSCreateParamsSchema = z.object({
  url: UrlSchema,
  token: TokenSchema,
  max: z.coerce.number().int().min(1).max(10000).default(1000),
  perPage: z.coerce.number().int().min(1).max(100).default(10),
  icons: z.string().optional(),
  select1Label: z.string().max(50).optional(),
  select1Values: z.string().optional(),
  select1Required: z.enum(['true', 'false']).optional(),
  select2Label: z.string().max(50).optional(),
  select2Values: z.string().optional(),
  select2Required: z.enum(['true', 'false']).optional(),
  select3Label: z.string().max(50).optional(),
  select3Values: z.string().optional(),
  select3Required: z.enum(['true', 'false']).optional(),
})

export const BBSPostParamsSchema = z.object({
  url: UrlSchema,
  token: TokenSchema,
  author: z.string().min(1).max(50).default('名無しさん'),
  message: z.string().min(1).max(1000),
  icon: z.string().optional(),
  select1: z.string().optional(),
  select2: z.string().optional(),
  select3: z.string().optional(),
})

export const BBSGetParamsSchema = z.object({
  id: PublicIdSchema,
  page: z.coerce.number().int().min(1).default(1),
})

export const BBSRemoveParamsSchema = z.object({
  url: UrlSchema,
  messageId: z.string().length(12),
  token: z.string().optional(),
})

export const BBSClearParamsSchema = z.object({
  url: UrlSchema,
  token: TokenSchema,
})

export const BBSUpdateParamsSchema = z.object({
  url: UrlSchema,
  messageId: z.string().length(12),
  message: z.string().min(1).max(1000),
})

// 型をエクスポート（Zodスキーマから生成）
export type CounterType = z.infer<typeof CounterTypeSchema>
export type CounterMetadata = z.infer<typeof CounterMetadataSchema>
export type CounterData = z.infer<typeof CounterDataSchema>

export type LikeType = z.infer<typeof LikeTypeSchema>
export type LikeMetadata = z.infer<typeof LikeMetadataSchema>
export type LikeData = z.infer<typeof LikeDataSchema>

export type RankingEntry = z.infer<typeof RankingEntrySchema>
export type RankingMetadata = z.infer<typeof RankingMetadataSchema>
export type RankingData = z.infer<typeof RankingDataSchema>

export type BBSSelectOption = z.infer<typeof BBSSelectOptionSchema>
export type BBSOptions = z.infer<typeof BBSOptionsSchema>
export type BBSMessage = z.infer<typeof BBSMessageSchema>
export type BBSMetadata = z.infer<typeof BBSMetadataSchema>
export type BBSData = z.infer<typeof BBSDataSchema>

// API Parameter Types
export type CreateParams = z.infer<typeof CreateParamsSchema>
export type CounterIncrementParams = z.infer<typeof CounterIncrementParamsSchema>
export type CounterDisplayParams = z.infer<typeof CounterDisplayParamsSchema>
export type CounterSetParams = z.infer<typeof CounterSetParamsSchema>
export type LikeToggleParams = z.infer<typeof LikeToggleParamsSchema>
export type LikeDisplayParams = z.infer<typeof LikeDisplayParamsSchema>
export type LikeSetParams = z.infer<typeof LikeSetParamsSchema>
export type RankingCreateParams = z.infer<typeof RankingCreateParamsSchema>
export type RankingSubmitParams = z.infer<typeof RankingSubmitParamsSchema>
export type RankingGetParams = z.infer<typeof RankingGetParamsSchema>
export type RankingClearParams = z.infer<typeof RankingClearParamsSchema>
export type RankingRemoveParams = z.infer<typeof RankingRemoveParamsSchema>
export type RankingUpdateParams = z.infer<typeof RankingUpdateParamsSchema>
export type BBSCreateParams = z.infer<typeof BBSCreateParamsSchema>
export type BBSPostParams = z.infer<typeof BBSPostParamsSchema>
export type BBSGetParams = z.infer<typeof BBSGetParamsSchema>
export type BBSRemoveParams = z.infer<typeof BBSRemoveParamsSchema>
export type BBSClearParams = z.infer<typeof BBSClearParamsSchema>
export type BBSUpdateParams = z.infer<typeof BBSUpdateParamsSchema>