/**
 * スキーマ定数の一元管理
 * 全てのマジックナンバー、デフォルト値、制限値をここで定義
 */

// === TOKEN 関連 ===
export const TOKEN = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 16,
} as const;

// === PUBLIC ID 関連 ===
export const PUBLIC_ID = {
  PATTERN: /^[a-z0-9-]+-[a-f0-9]{8}$/,
  HASH_LENGTH: 8,
} as const;

// === URL 関連 ===
export const URL = {
  REQUIRED_PROTOCOL: 'https://',
  PATTERN: /^https:\/\/.+/,
} as const;

// === テーマ関連 ===
export const THEMES = ['classic', 'modern', 'retro'] as const;
export const DEFAULT_THEME = 'classic' as const;

// === Counter サービス ===
export const COUNTER = {
  TYPES: ['total', 'today', 'yesterday', 'week', 'month'] as const,
  DEFAULT_TYPE: 'total' as const,
  
  FORMATS: ['json', 'text', 'image'] as const,
  DEFAULT_FORMAT: 'image' as const,
  
  DIGITS: {
    MIN: 1,
    MAX: 10,
    // DEFAULT: undefined (指定なしでゼロ埋めしない)
  },
} as const;

// === Like サービス ===
export const LIKE = {
  ICONS: ['heart', 'star', 'thumb'] as const,
  DEFAULT_ICON: 'heart' as const,
  
  FORMATS: ['interactive', 'text', 'image'] as const,
  DEFAULT_FORMAT: 'interactive' as const,
} as const;

// === Ranking サービス ===
export const RANKING = {
  FORMATS: ['interactive'] as const,
  DEFAULT_FORMAT: 'interactive' as const,
  
  LIMIT: {
    MIN: 1,
    MAX: 100,
    DEFAULT: 10,
  },
  
  SCORE: {
    MIN: 0,
    MAX: 999999999, // 10億-1
  },
  
  NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50,
  },
} as const;

// === BBS サービス ===
export const BBS = {
  FORMATS: ['interactive'] as const,
  DEFAULT_FORMAT: 'interactive' as const,
  
  PAGINATION: {
    DEFAULT_PAGE: 1,
    MESSAGES_PER_PAGE: 10,
  },
  
  AUTHOR: {
    MAX_LENGTH: 20,
    DEFAULT_VALUE: '名無しさん',
  },
  
  MESSAGE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 200,
  },
  
  TITLE: {
    MAX_LENGTH: 100,
  },
  
  ICONS: ['😀', '😉', '😎', '😠', '😢', '😮'] as const,
} as const;

// === 共通制限値 ===
export const LIMITS = {
  // 一般的な長さ制限
  SHORT_TEXT: 50,     // 短いテキスト (名前など)
  MEDIUM_TEXT: 100,   // 中程度のテキスト (タイトルなど)
  LONG_TEXT: 200,     // 長いテキスト (メッセージなど)
  VERY_LONG_TEXT: 1000, // 非常に長いテキスト
  
  // 数値制限
  SMALL_NUMBER: 10,
  MEDIUM_NUMBER: 100,
  LARGE_NUMBER: 1000,
  VERY_LARGE_NUMBER: 10000,
} as const;

// === Web Component デフォルト ===
export const WEB_COMPONENT = {
  LOADING_TEXT: 'Loading...',
  ERROR_TEXT: 'Error',
  
  COUNTER: {
    INITIAL_VALUE: '0',
  },
  
  LIKE: {
    LOADING_OPACITY: 0.6,
  },
  
  RANKING: {
    EMPTY_MESSAGE: 'No rankings yet',
  },
  
  BBS: {
    EMPTY_MESSAGE: 'まだメッセージがありません',
    POSTING_TEXT: '投稿中...',
    UPDATING_TEXT: '更新中...',
  },
} as const;

// === TTL 関連 (既存の ttl-constants.ts と統合可能) ===
export const TTL = {
  // 24時間 (秒)
  ONE_DAY: 86400,
  
  // 1時間 (秒)  
  ONE_HOUR: 3600,
  
  // 5分 (秒)
  FIVE_MINUTES: 300,
  
  // 1分 (秒)
  ONE_MINUTE: 60,
} as const;

// === 型エクスポート ===
export type ThemeType = typeof THEMES[number];
export type CounterType = typeof COUNTER.TYPES[number];
export type CounterFormat = typeof COUNTER.FORMATS[number];
export type LikeIcon = typeof LIKE.ICONS[number];
export type LikeFormat = typeof LIKE.FORMATS[number];
export type RankingFormat = typeof RANKING.FORMATS[number];
export type BBSFormat = typeof BBS.FORMATS[number];
export type BBSIcon = typeof BBS.ICONS[number];