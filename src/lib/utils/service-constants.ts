// サービス制限・デフォルト値の定数定義

// 汎用制限値
export const GENERAL_LIMITS = {
  TOKEN_MIN_LENGTH: 8,
  TOKEN_MAX_LENGTH: 16,
} as const

// Counter Service
export const COUNTER_LIMITS = {
  DEFAULT_DIGITS: 6,
  MAX_DIGITS: 10,
  THEMES: ['classic', 'modern', 'retro'] as const,
  FORMATS: ['text', 'image'] as const,
  DEFAULT_THEME: 'classic' as const,
  DEFAULT_FORMAT: 'image' as const,
} as const

// Like Service  
export const LIKE_LIMITS = {
  DEFAULT_DIGITS: 6,
  MAX_DIGITS: 10,
  THEMES: ['classic', 'modern', 'retro'] as const,
  FORMATS: ['text', 'image'] as const,
  DEFAULT_THEME: 'classic' as const,
  DEFAULT_FORMAT: 'image' as const,
} as const

// Ranking Service
export const RANKING_LIMITS = {
  DEFAULT_MAX_ENTRIES: 100,
  MAX_ENTRIES_LIMIT: 1000,
  MIN_ENTRIES: 1,
  MAX_NAME_LENGTH: 20,
  DEFAULT_GET_LIMIT: 10,
  MAX_GET_LIMIT: 100,
  MIN_GET_LIMIT: 1,
} as const

// BBS Service
export const BBS_LIMITS = {
  DEFAULT_MAX_MESSAGES: 1000,
  MAX_MESSAGES_LIMIT: 10000,
  MIN_MESSAGES: 1,
  DEFAULT_MESSAGES_PER_PAGE: 10,
  MAX_MESSAGE_LENGTH: 1000,
  MAX_AUTHOR_LENGTH: 50,
  MAX_ICONS: 20,
  MAX_SELECT_LABEL_LENGTH: 50,
  MAX_SELECT_VALUES: 50,
  DEFAULT_AUTHOR: '名無しさん',
  MIN_PAGE: 1,
} as const

// Cache設定
export const CACHE_SETTINGS = {
  DISPLAY_MAX_AGE: 60, // 60秒
  CONTENT_TYPES: {
    TEXT: 'text/plain',
    SVG: 'image/svg+xml',
    JSON: 'application/json',
  } as const,
} as const