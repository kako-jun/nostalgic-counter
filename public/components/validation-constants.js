// 🤖 自動生成ファイル - 手動編集禁止
// 生成元: src/domain/*/*.entity.ts の FieldSchemas
// 生成日時: 2025-08-21T17:23:26.060Z

/**
 * WebComponents用バリデーション定数
 * TypeScriptスキーマと自動同期
 */
export const VALIDATION_CONSTANTS = {
  // === BBS サービス ===
  BBS: {
    TITLE: {"max": 100},
    AUTHOR: {"max": 20},
    MESSAGE_TEXT: {"min": 1, "max": 200},
    SELECT_LABEL: {"min": 1, "max": 50},
    SELECT_OPTION: {"min": 1, "max": 50},
    MAX_MESSAGES: {"min": 1, "max": 10000},
    MESSAGES_PER_PAGE: {"min": 1, "max": 100},
    FORMAT: {"values":["interactive"]},
  },

  // === Ranking サービス ===
  RANKING: {
    PLAYER_NAME: {"min": 1, "max": 50},
    SCORE: {"min":0,"max":9007199254740991},
    MAX_ENTRIES: {"min": 1, "max": 10000},
    LIMIT: {"min": 1, "max": 1000},
    FORMAT: {"values":["interactive"]},
  },

  // === Counter サービス ===
  COUNTER: {
    TYPE: {"values":["total","today","yesterday","week","month"]},
    FORMAT: {"values":["json","text","image"]},
    DIGITS: {"min":1,"max":10},
  },

  // === Like サービス ===
  LIKE: {
    ICON: {"values":["heart","star","thumb"]},
    FORMAT: {"values":["interactive","text","image"]},
    ACTION: {"values":["liked","unliked"]},
  }
}

/**
 * 安全なバリデーション関数
 */
export const SafeValidator = {
  /**
   * 文字列の安全なバリデーション
   */
  validateString(value, limits) {
    if (typeof value !== 'string') return { valid: false, safeValue: '' }
    if (value === null || value === undefined) return { valid: false, safeValue: '' }
    
    const min = limits?.min || 0
    const max = limits?.max || Infinity
    
    if (value.length < min || value.length > max) {
      // 制限内に切り詰め
      const safeValue = value.slice(0, max)
      return { valid: false, safeValue, reason: `Length must be between ${min} and ${max}` }
    }
    
    return { valid: true, safeValue: value }
  },

  /**
   * 数値の安全なバリデーション
   */
  validateNumber(value, limits) {
    const num = typeof value === 'string' ? parseInt(value, 10) : value
    if (isNaN(num)) return { valid: false, safeValue: limits?.min || 0 }
    
    const min = limits?.min !== undefined ? limits.min : -Infinity
    const max = limits?.max !== undefined ? limits.max : Infinity
    
    if (num < min) return { valid: false, safeValue: min, reason: `Value must be >= ${min}` }
    if (num > max) return { valid: false, safeValue: max, reason: `Value must be <= ${max}` }
    
    return { valid: true, safeValue: num }
  },

  /**
   * Enumの安全なバリデーション
   */
  validateEnum(value, limits) {
    if (typeof value !== 'string') return { valid: false, safeValue: limits?.values?.[0] || '' }
    if (!limits?.values || !Array.isArray(limits.values)) {
      return { valid: true, safeValue: value }
    }
    
    if (!limits.values.includes(value)) {
      return { valid: false, safeValue: limits.values[0], reason: `Must be one of: ${limits.values.join(', ')}` }
    }
    
    return { valid: true, safeValue: value }
  },

  /**
   * 汎用安全化関数
   */
  sanitize(value, type, limits) {
    switch (type) {
      case 'string': return this.validateString(value, limits)
      case 'number': return this.validateNumber(value, limits)
      case 'enum': return this.validateEnum(value, limits)
      default: return { valid: true, safeValue: value }
    }
  }
}
