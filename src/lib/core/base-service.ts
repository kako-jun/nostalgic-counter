/**
 * BaseService - 全サービスの共通基底クラス
 */

import { z } from 'zod'
import { Result, Ok, Err, ValidationError, NotFoundError, UnauthorizedError } from './result'
import { ValidationFramework } from './validation'
import { BaseRepository, UrlMappingRepository, NumberRepository, RepositoryFactory } from './repository'
import { generatePublicId } from './id'
import { createHash } from 'crypto'

/**
 * サービス共通の設定型
 */
export interface ServiceConfig {
  serviceName: string
  maxValue?: number
  defaultTTL?: number
}

/**
 * 基底エンティティの型
 */
export interface BaseEntity {
  id: string
  url: string
  created: Date
}

/**
 * オーナーシップ検証の結果
 */
export interface OwnershipResult {
  isOwner: boolean
  entity: BaseEntity | null
}

/**
 * 抽象基底サービスクラス
 */
export abstract class BaseService<TEntity extends BaseEntity, TData, TCreateParams> {
  protected readonly entityRepository: BaseRepository<TEntity>
  protected readonly urlMappingRepository: UrlMappingRepository
  
  constructor(
    protected readonly config: ServiceConfig,
    protected readonly entitySchema: z.ZodType<TEntity>,
    protected readonly dataSchema: z.ZodType<TData>
  ) {
    this.entityRepository = RepositoryFactory.createEntity(entitySchema, config.serviceName)
    this.urlMappingRepository = RepositoryFactory.createUrlMapping(config.serviceName)
  }

  /**
   * 新しいエンティティを作成
   */
  async create(url: string, token: string, params: TCreateParams): Promise<Result<{id: string, data: TData}, ValidationError | UnauthorizedError>> {
    // URL検証
    const urlValidation = ValidationFramework.input(z.string().url(), url)
    if (!urlValidation.success) {
      return urlValidation
    }

    // トークン検証
    const tokenValidation = this.validateToken(token)
    if (!tokenValidation.success) {
      return tokenValidation
    }

    // 既存エンティティの確認
    const existingResult = await this.getByUrl(url)
    if (existingResult.success) {
      // 既存エンティティがある場合はオーナーシップ確認
      const ownershipResult = await this.verifyOwnership(url, token)
      if (!ownershipResult.success) {
        return ownershipResult
      }
      
      if (!ownershipResult.data.isOwner) {
        return Err(new UnauthorizedError('Invalid token for this URL'))
      }

      // 既存エンティティのデータを返す
      const dataResult = await this.transformEntityToData(ownershipResult.data.entity! as TEntity)
      if (!dataResult.success) {
        return dataResult
      }

      return Ok({
        id: ownershipResult.data.entity!.id,
        data: dataResult.data
      })
    }

    // 新規作成
    const id = generatePublicId(url)
    const entity = await this.createNewEntity(id, url, params)
    if (!entity.success) {
      return entity
    }

    // エンティティ保存
    const saveEntityResult = await this.entityRepository.save(id, entity.data)
    if (!saveEntityResult.success) {
      return Err(new ValidationError('Failed to save entity', { error: saveEntityResult.error }))
    }

    // オーナートークンの保存
    const saveOwnerResult = await this.saveOwnerToken(id, token)
    if (!saveOwnerResult.success) {
      return saveOwnerResult
    }

    // URLマッピングの保存
    const saveMappingResult = await this.urlMappingRepository.set(url, id)
    if (!saveMappingResult.success) {
      return Err(new ValidationError('Failed to save URL mapping', { error: saveMappingResult.error }))
    }

    // データ変換
    const dataResult = await this.transformEntityToData(entity.data)
    if (!dataResult.success) {
      return dataResult
    }

    return Ok({
      id,
      data: dataResult.data
    })
  }

  /**
   * IDでエンティティを取得
   */
  async getById(id: string): Promise<Result<TEntity, ValidationError | NotFoundError>> {
    const idValidation = this.validatePublicId(id)
    if (!idValidation.success) {
      return idValidation
    }

    const result = await this.entityRepository.get(id)
    if (!result.success) {
      if (result.error.code === 'NOT_FOUND') {
        return result as Result<TEntity, NotFoundError>
      }
      return Err(new ValidationError('Failed to get entity', { error: result.error }))
    }
    return result
  }

  /**
   * URLでエンティティを取得
   */
  async getByUrl(url: string): Promise<Result<TEntity, ValidationError | NotFoundError>> {
    const urlValidation = ValidationFramework.input(z.string().url(), url)
    if (!urlValidation.success) {
      return urlValidation
    }

    const idResult = await this.urlMappingRepository.get(url)
    if (!idResult.success) {
      return Err(new ValidationError('Failed to get URL mapping', { error: idResult.error }))
    }

    if (idResult.data === null) {
      return Err(new NotFoundError('Entity', url))
    }

    const result = await this.entityRepository.get(idResult.data)
    if (!result.success) {
      if (result.error.code === 'NOT_FOUND') {
        return result as Result<TEntity, NotFoundError>
      }
      return Err(new ValidationError('Failed to get entity', { error: result.error }))
    }
    return result
  }

  /**
   * オーナーシップの検証
   */
  async verifyOwnership(url: string, token: string): Promise<Result<OwnershipResult, ValidationError | UnauthorizedError>> {
    const entityResult = await this.getByUrl(url)
    if (!entityResult.success) {
      return Ok({ isOwner: false, entity: null })
    }

    const entity = entityResult.data
    const storedHashResult = await this.getOwnerTokenHash(entity.id)
    if (!storedHashResult.success) {
      return Ok({ isOwner: false, entity })
    }

    const providedHash = this.hashToken(token)
    const isOwner = storedHashResult.data === providedHash

    return Ok({ isOwner, entity })
  }

  /**
   * エンティティの削除（オーナーのみ）
   */
  async delete(url: string, token: string): Promise<Result<void, ValidationError | UnauthorizedError | NotFoundError>> {
    const ownershipResult = await this.verifyOwnership(url, token)
    if (!ownershipResult.success) {
      return ownershipResult
    }

    if (!ownershipResult.data.isOwner || !ownershipResult.data.entity) {
      return Err(new UnauthorizedError('Invalid token or entity not found'))
    }

    const entity = ownershipResult.data.entity

    // エンティティ固有のクリーンアップ
    const cleanupResult = await this.performCleanup(entity.id)
    if (!cleanupResult.success) {
      return cleanupResult
    }

    // エンティティ削除
    const deleteEntityResult = await this.entityRepository.delete(entity.id)
    if (!deleteEntityResult.success) {
      return Err(new ValidationError('Failed to delete entity', { error: deleteEntityResult.error }))
    }

    // オーナートークン削除
    const deleteOwnerResult = await this.deleteOwnerToken(entity.id)
    if (!deleteOwnerResult.success) {
      return deleteOwnerResult
    }

    // URLマッピング削除
    const deleteMappingResult = await this.urlMappingRepository.delete(url)
    if (!deleteMappingResult.success) {
      return Err(new ValidationError('Failed to delete URL mapping', { error: deleteMappingResult.error }))
    }

    return Ok(undefined)
  }

  /**
   * 抽象メソッド - サブクラスで実装必須
   */
  protected abstract createNewEntity(id: string, url: string, params: TCreateParams): Promise<Result<TEntity, ValidationError>>
  public abstract transformEntityToData(entity: TEntity): Promise<Result<TData, ValidationError>>
  protected abstract performCleanup(id: string): Promise<Result<void, ValidationError>>

  /**
   * パブリックIDの検証
   */
  protected validatePublicId(id: string): Result<string, ValidationError> {
    const publicIdSchema = z.string().regex(/^[a-z0-9-]+-[a-f0-9]{8}$/)
    return ValidationFramework.input(publicIdSchema, id)
  }

  /**
   * トークンの検証
   */
  protected validateToken(token: string): Result<string, ValidationError> {
    const tokenSchema = z.string().min(8).max(16)
    return ValidationFramework.input(tokenSchema, token)
  }

  /**
   * トークンのハッシュ化
   */
  protected hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }

  /**
   * オーナートークンの保存
   */
  protected async saveOwnerToken(id: string, token: string): Promise<Result<void, ValidationError>> {
    const ownerRepo = RepositoryFactory.createEntity(z.string(), `${this.config.serviceName}_owner`)
    const hashedToken = this.hashToken(token)
    
    const saveResult = await ownerRepo.save(id, hashedToken)
    if (!saveResult.success) {
      return Err(new ValidationError('Failed to save owner token', { error: saveResult.error }))
    }

    return Ok(undefined)
  }

  /**
   * オーナートークンハッシュの取得
   */
  protected async getOwnerTokenHash(id: string): Promise<Result<string, ValidationError | NotFoundError>> {
    const ownerRepo = RepositoryFactory.createEntity(z.string(), `${this.config.serviceName}_owner`)
    const result = await ownerRepo.get(id)
    
    if (!result.success) {
      if (result.error.code === 'NOT_FOUND') {
        return result as Result<string, NotFoundError>
      }
      return Err(new ValidationError('Failed to get owner token', { error: result.error }))
    }
    
    return result
  }

  /**
   * オーナートークンの削除
   */
  protected async deleteOwnerToken(id: string): Promise<Result<void, ValidationError>> {
    const ownerRepo = RepositoryFactory.createEntity(z.string(), `${this.config.serviceName}_owner`)
    
    const deleteResult = await ownerRepo.delete(id)
    if (!deleteResult.success) {
      return Err(new ValidationError('Failed to delete owner token', { error: deleteResult.error }))
    }

    return Ok(undefined)
  }

  /**
   * 共通のバリデーションヘルパー
   */
  protected validateStringLength(value: string, maxLength: number, fieldName: string): Result<string, ValidationError> {
    if (value.length > maxLength) {
      return Err(new ValidationError(`${fieldName} exceeds maximum length of ${maxLength}`))
    }
    return Ok(value)
  }

  protected validatePositiveNumber(value: number, fieldName: string): Result<number, ValidationError> {
    if (value < 0) {
      return Err(new ValidationError(`${fieldName} must be positive`))
    }
    return Ok(value)
  }

  protected validateRange(value: number, min: number, max: number, fieldName: string): Result<number, ValidationError> {
    if (value < min || value > max) {
      return Err(new ValidationError(`${fieldName} must be between ${min} and ${max}`))
    }
    return Ok(value)
  }

  /**
   * ログ記録ヘルパー
   */
  protected logOperation(operation: string, success: boolean, context?: Record<string, unknown>): void {
    const logLevel = success ? 'info' : 'error'
    const message = `${this.config.serviceName}.${operation}: ${success ? 'SUCCESS' : 'FAILED'}`
    
    console[logLevel](message, context)
  }

  /**
   * パフォーマンス計測ヘルパー
   */
  protected async measurePerformance<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now()
    
    try {
      const result = await fn()
      const duration = Date.now() - startTime
      
      if (duration > 1000) { // 1秒以上の場合に警告
        console.warn(`Slow operation: ${this.config.serviceName}.${operation} took ${duration}ms`)
      }
      
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`Failed operation: ${this.config.serviceName}.${operation} failed after ${duration}ms`, error)
      throw error
    }
  }
}

/**
 * 数値を扱うサービス用の基底クラス
 */
export abstract class BaseNumericService<TEntity extends BaseEntity, TData, TCreateParams> 
  extends BaseService<TEntity, TData, TCreateParams> {
  
  protected readonly numberRepository: NumberRepository

  constructor(
    config: ServiceConfig,
    entitySchema: z.ZodType<TEntity>,
    dataSchema: z.ZodType<TData>
  ) {
    super(config, entitySchema, dataSchema)
    this.numberRepository = RepositoryFactory.createNumber(config.serviceName)
  }

  /**
   * 数値の増加
   */
  protected async incrementValue(key: string, by: number = 1): Promise<Result<number, ValidationError>> {
    const maxValue = this.config.maxValue || 999999999
    
    const incrementResult = await this.numberRepository.increment(key, by)
    if (!incrementResult.success) {
      return Err(new ValidationError('Failed to increment value', { error: incrementResult.error }))
    }

    // 最大値チェック
    if (incrementResult.data > maxValue) {
      // 最大値に設定し直す
      await this.numberRepository.set(key, maxValue)
      return Ok(maxValue)
    }

    return Ok(incrementResult.data)
  }

  /**
   * 数値の設定
   */
  protected async setValue(key: string, value: number): Promise<Result<void, ValidationError>> {
    const maxValue = this.config.maxValue || 999999999
    
    if (value > maxValue) {
      return Err(new ValidationError(`Value exceeds maximum of ${maxValue}`))
    }

    const setResult = await this.numberRepository.set(key, value)
    if (!setResult.success) {
      return Err(new ValidationError('Failed to set value', { error: setResult.error }))
    }

    return Ok(undefined)
  }

  /**
   * 数値の取得
   */
  protected async getValue(key: string): Promise<Result<number, ValidationError>> {
    const getResult = await this.numberRepository.get(key)
    if (!getResult.success) {
      return Err(new ValidationError('Failed to get value', { error: getResult.error }))
    }

    return Ok(getResult.data)
  }
}