#!/usr/bin/env tsx
/**
 * WebComponents用定数生成スクリプト
 * TypeScriptスキーマからJavaScript定数を自動生成
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { BBSFieldSchemas, BBS_LIMITS } from '@/domain/bbs/bbs.entity'
import { RankingFieldSchemas, RANKING_LIMITS } from '@/domain/ranking/ranking.entity'
import { CounterFieldSchemas } from '@/domain/counter/counter.entity'
import { LikeFieldSchemas } from '@/domain/like/like.entity'

// Zodスキーマから制限値を抽出する汎用関数
function extractLimits(schema: any): { min?: number, max?: number, values?: string[] } {
  const limits: { min?: number, max?: number, values?: string[] } = {}
  
  if (!schema || !schema._def) {
    return limits
  }

  const def = schema._def

  // type が 'string' の場合
  if (def.type === 'string') {
    const checks = def.checks || []
    checks.forEach((check: any) => {
      // プロトタイプチェーンも含めて全プロパティをチェック
      const allProps = Object.getOwnPropertyNames(check).concat(Object.getOwnPropertyNames(Object.getPrototypeOf(check)))
      
      // コンストラクター名で判定
      const constructorName = check.constructor?.name || ''
      
      if (constructorName === 'ZodCheckMaxLength' || constructorName.includes('MaxLength')) {
        // 直接値にアクセス
        if (check.maxLength !== undefined) limits.max = check.maxLength
        if (check.value !== undefined) limits.max = check.value
        // プライベートプロパティもチェック
        allProps.forEach(prop => {
          if (prop.includes('max') || prop.includes('length')) {
            const val = check[prop]
            if (typeof val === 'number') limits.max = val
          }
        })
      }
      
      if (constructorName === 'ZodCheckMinLength' || constructorName.includes('MinLength')) {
        if (check.minLength !== undefined) limits.min = check.minLength
        if (check.value !== undefined) limits.min = check.value
        allProps.forEach(prop => {
          if (prop.includes('min') || prop.includes('length')) {
            const val = check[prop]
            if (typeof val === 'number') limits.min = val
          }
        })
      }
    })
  }
  
  // type が 'number' の場合
  if (def.type === 'number') {
    const checks = def.checks || []
    checks.forEach((check: any) => {
      if (check.kind === 'max') limits.max = check.value
      if (check.kind === 'min') limits.min = check.value
    })
    
    // minValue/maxValue属性もチェック
    if (schema.minValue !== undefined) limits.min = schema.minValue
    if (schema.maxValue !== undefined) limits.max = schema.maxValue
  }
  
  // type が 'enum' の場合
  if (def.type === 'enum') {
    if (def.entries) {
      limits.values = Object.keys(def.entries)
    }
  }

  // type が 'optional' の場合は内部型を確認
  if (def.type === 'optional' && def.innerType) {
    return extractLimits(def.innerType)
  }

  // Coerce Number の場合
  if (def.coerce && def.type === 'number') {
    const checks = def.checks || []
    checks.forEach((check: any) => {
      if (check.kind === 'max') limits.max = check.value
      if (check.kind === 'min') limits.min = check.value
    })
    
    if (schema.minValue !== undefined) limits.min = schema.minValue
    if (schema.maxValue !== undefined) limits.max = schema.maxValue
  }
  
  return limits
}

// 定数生成
const constants = `// 🤖 自動生成ファイル - 手動編集禁止
// 生成元: src/domain/*/*.entity.ts の FieldSchemas
// 生成日時: ${new Date().toISOString()}

/**
 * WebComponents用バリデーション定数
 * TypeScriptスキーマと自動同期
 */
export const VALIDATION_CONSTANTS = {
  // === BBS サービス ===
  BBS: {
    TITLE: {"max": ${BBS_LIMITS.TITLE_MAX}},
    AUTHOR: {"max": ${BBS_LIMITS.AUTHOR_MAX}},
    MESSAGE_TEXT: {"min": ${BBS_LIMITS.MESSAGE_TEXT_MIN}, "max": ${BBS_LIMITS.MESSAGE_TEXT_MAX}},
    SELECT_LABEL: {"min": ${BBS_LIMITS.SELECT_LABEL_MIN}, "max": ${BBS_LIMITS.SELECT_LABEL_MAX}},
    SELECT_OPTION: {"min": ${BBS_LIMITS.SELECT_OPTION_MIN}, "max": ${BBS_LIMITS.SELECT_OPTION_MAX}},
    MAX_MESSAGES: {"min": ${BBS_LIMITS.MAX_MESSAGES_MIN}, "max": ${BBS_LIMITS.MAX_MESSAGES_MAX}},
    MESSAGES_PER_PAGE: {"min": ${BBS_LIMITS.MESSAGES_PER_PAGE_MIN}, "max": ${BBS_LIMITS.MESSAGES_PER_PAGE_MAX}},
    FORMAT: ${JSON.stringify(extractLimits(BBSFieldSchemas.format))},
  },

  // === Ranking サービス ===
  RANKING: {
    PLAYER_NAME: {"min": ${RANKING_LIMITS.PLAYER_NAME_MIN}, "max": ${RANKING_LIMITS.PLAYER_NAME_MAX}},
    SCORE: ${JSON.stringify(extractLimits(RankingFieldSchemas.score))},
    MAX_ENTRIES: {"min": ${RANKING_LIMITS.MAX_ENTRIES_MIN}, "max": ${RANKING_LIMITS.MAX_ENTRIES_MAX}},
    LIMIT: {"min": ${RANKING_LIMITS.LIMIT_MIN}, "max": ${RANKING_LIMITS.LIMIT_MAX}},
    FORMAT: ${JSON.stringify(extractLimits(RankingFieldSchemas.format))},
  },

  // === Counter サービス ===
  COUNTER: {
    TYPE: ${JSON.stringify(extractLimits(CounterFieldSchemas.counterType))},
    FORMAT: ${JSON.stringify(extractLimits(CounterFieldSchemas.counterFormat))},
    DIGITS: ${JSON.stringify(extractLimits(CounterFieldSchemas.counterDigits))},
  },

  // === Like サービス ===
  LIKE: {
    ICON: ${JSON.stringify(extractLimits(LikeFieldSchemas.likeIcon))},
    FORMAT: ${JSON.stringify(extractLimits(LikeFieldSchemas.likeFormat))},
    ACTION: ${JSON.stringify(extractLimits(LikeFieldSchemas.likeAction))},
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
      return { valid: false, safeValue, reason: \`Length must be between \${min} and \${max}\` }
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
    
    if (num < min) return { valid: false, safeValue: min, reason: \`Value must be >= \${min}\` }
    if (num > max) return { valid: false, safeValue: max, reason: \`Value must be <= \${max}\` }
    
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
      return { valid: false, safeValue: limits.values[0], reason: \`Must be one of: \${limits.values.join(', ')}\` }
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
`

// ディレクトリ作成
const outputDir = join(process.cwd(), 'public', 'components')
mkdirSync(outputDir, { recursive: true })

// ファイル出力
const outputPath = join(outputDir, 'validation-constants.js')
writeFileSync(outputPath, constants, 'utf8')

console.log('✅ WebComponents用定数ファイルを生成しました:')
console.log(`   ${outputPath}`)
console.log('')
console.log('📊 生成された定数:')
console.log('   - VALIDATION_CONSTANTS.BBS.*')
console.log('   - VALIDATION_CONSTANTS.RANKING.*') 
console.log('   - VALIDATION_CONSTANTS.COUNTER.*')
console.log('   - VALIDATION_CONSTANTS.LIKE.*')
console.log('   - SafeValidator (安全なバリデーション関数)')