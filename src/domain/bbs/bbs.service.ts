/**
 * BBS Domain Service - 新アーキテクチャ版
 */

import { z } from 'zod'
import { Result, Ok, Err, ValidationError, NotFoundError } from '@/lib/core/result'
import { BaseService } from '@/lib/core/base-service'
import { ValidationFramework } from '@/lib/core/validation'
import { getBBSLimits } from '@/lib/core/config'
import { RepositoryFactory, ListRepository } from '@/lib/core/repository'
import { createHash } from 'crypto'
import {
  BBSEntity,
  BBSData,
  BBSMessage,
  BBSSettings,
  BBSCreateParams,
  BBSPostParams,
  BBSUpdateParams,
  BBSRemoveParams,
  BBSUpdateSettingsParamsType,
  BBSEntitySchema,
  BBSDataSchema,
  BBSMessageSchema,
  BBSSettingsSchema
} from './bbs.entity'

type BBSUpdateSettingsParams = BBSUpdateSettingsParamsType

/**
 * BBSサービスクラス
 */
export class BBSService extends BaseService<BBSEntity, BBSData, BBSCreateParams> {
  private readonly listRepository: ListRepository<BBSMessage>

  constructor() {
    const limits = getBBSLimits()
    const config = {
      serviceName: 'bbs' as const,
      maxValue: limits.maxMessages
    }
    
    super(config, BBSEntitySchema, BBSDataSchema)
    this.listRepository = RepositoryFactory.createList(BBSMessageSchema, 'bbs_messages')
  }

  /**
   * 新しいBBSエンティティを作成
   */
  protected async createNewEntity(
    id: string, 
    url: string, 
    params: BBSCreateParams
  ): Promise<Result<BBSEntity, ValidationError>> {
    const limits = getBBSLimits()
    
    const settings: BBSSettings = {
      title: params.title || 'BBS',
      maxMessages: params.maxMessages || limits.maxMessages,
      messagesPerPage: params.messagesPerPage || limits.messagesPerPage,
      icons: params.icons || [],
      selects: params.selects || []
    }

    const entity: BBSEntity = {
      id,
      url,
      created: new Date(),
      totalMessages: 0,
      settings
    }

    const validationResult = ValidationFramework.output(BBSEntitySchema, entity)
    if (!validationResult.success) {
      return validationResult
    }

    return Ok(validationResult.data)
  }

  /**
   * エンティティをデータ形式に変換
   */
  public async transformEntityToData(entity: BBSEntity, page: number = 1): Promise<Result<BBSData, ValidationError>> {
    // 指定ページのメッセージを取得
    const messagesResult = await this.getMessages(entity.id, page, entity.settings.messagesPerPage)
    const messages = messagesResult.success ? messagesResult.data : []

    const totalPages = Math.ceil(entity.totalMessages / entity.settings.messagesPerPage)

    const data: BBSData = {
      id: entity.id,
      url: entity.url,
      title: entity.settings.title,
      messages,
      totalMessages: entity.totalMessages,
      currentPage: page,
      totalPages,
      pagination: {
        page: page,
        totalPages: totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages
      }, // Web Components用のページネーション
      settings: entity.settings,
      lastMessage: entity.lastMessage
    }

    return ValidationFramework.output(BBSDataSchema, data)
  }

  /**
   * クリーンアップ処理
   */
  protected async performCleanup(id: string): Promise<Result<void, ValidationError>> {
    // メッセージリストをクリーンアップ
    const clearResult = await this.listRepository.clear(`${id}:messages`)
    if (!clearResult.success) {
      return Err(new ValidationError('Failed to cleanup BBS messages', { error: clearResult.error }))
    }

    return Ok(undefined)
  }

  /**
   * メッセージを投稿
   */
  async postMessage(
    url: string,
    token: string,
    params: BBSPostParams,
    userHash?: string
  ): Promise<Result<BBSData, ValidationError | NotFoundError>> {
    // オーナーシップ検証
    const ownershipResult = await this.verifyOwnership(url, token)
    if (!ownershipResult.success) {
      return Err(new ValidationError('Ownership verification failed', { error: ownershipResult.error }))
    }

    if (!ownershipResult.data.isOwner || !ownershipResult.data.entity) {
      return Err(new ValidationError('Invalid token or entity not found'))
    }

    const entity = ownershipResult.data.entity as BBSEntity

    // 連投防止チェック（userHashが提供された場合）
    if (userHash) {
      const cooldownResult = await this.checkPostCooldown(entity.id, userHash)
      if (!cooldownResult.success) {
        return cooldownResult
      }
      
      if (!cooldownResult.data) {
        return Err(new ValidationError('Please wait before posting another message (10 seconds cooldown)'))
      }
    }

    // メッセージ長制限チェック
    const limits = getBBSLimits()
    if (params.message.length > limits.maxMessageLength) {
      return Err(new ValidationError(`Message exceeds maximum length of ${limits.maxMessageLength}`))
    }

    if (params.author.length > limits.maxAuthorLength) {
      return Err(new ValidationError(`Author name exceeds maximum length of ${limits.maxAuthorLength}`))
    }

    // 連投防止マーク（userHashが提供された場合）
    if (userHash) {
      const markResult = await this.markPostTime(entity.id, userHash)
      if (!markResult.success) {
        return Err(new ValidationError('Failed to mark post time', { error: markResult.error }))
      }
    }

    // メッセージIDを生成
    const messageId = this.generateMessageId(entity.id)

    // メッセージオブジェクトを作成
    const message: BBSMessage = {
      id: messageId,
      author: params.author,
      message: params.message,
      timestamp: new Date(),
      icon: params.icon,
      selects: params.selects,
      authorHash: params.authorHash
    }

    // メッセージをリストに追加
    const addResult = await this.listRepository.push(`${entity.id}:messages`, [message])
    if (!addResult.success) {
      // ロールバック: 投稿マークを削除
      if (userHash) {
        await this.removePostMark(entity.id, userHash)
      }
      return Err(new ValidationError('Failed to add message', { error: addResult.error }))
    }

    // メッセージ数制限チェック
    await this.enforceMaxMessages(entity.id, entity.settings.maxMessages)

    // エンティティ更新
    entity.totalMessages = Math.min(entity.totalMessages + 1, entity.settings.maxMessages)
    entity.lastMessage = new Date()

    const saveResult = await this.entityRepository.save(entity.id, entity)
    if (!saveResult.success) {
      // ロールバック処理
      if (userHash) {
        await this.removePostMark(entity.id, userHash)
      }
      return Err(new ValidationError('Failed to save entity', { error: saveResult.error }))
    }

    return await this.transformEntityToData(entity)
  }

  /**
   * メッセージを更新
   */
  async updateMessage(
    url: string,
    token: string,
    params: BBSUpdateParams
  ): Promise<Result<BBSData, ValidationError | NotFoundError>> {
    // オーナーシップ検証
    const ownershipResult = await this.verifyOwnership(url, token)
    if (!ownershipResult.success) {
      return Err(new ValidationError('Ownership verification failed', { error: ownershipResult.error }))
    }

    if (!ownershipResult.data.isOwner || !ownershipResult.data.entity) {
      return Err(new ValidationError('Invalid token or entity not found'))
    }

    const entity = ownershipResult.data.entity as BBSEntity

    // メッセージを取得
    const messagesResult = await this.getAllMessages(entity.id)
    if (!messagesResult.success) {
      return Err(new ValidationError('Failed to get messages'))
    }

    const messages = messagesResult.data
    const messageIndex = messages.findIndex(msg => msg.id === params.messageId)
    
    if (messageIndex === -1) {
      return Err(new ValidationError('Message not found'))
    }

    // 作成者チェック（作成者のみ編集可能）
    if (messages[messageIndex].authorHash !== params.authorHash) {
      return Err(new ValidationError('Only the author can edit this message'))
    }

    // メッセージを更新
    messages[messageIndex] = {
      ...messages[messageIndex],
      author: params.author,
      message: params.message,
      icon: params.icon,
      selects: params.selects,
      timestamp: new Date() // 更新時刻を記録
    }

    // メッセージリストを更新
    const updateResult = await this.replaceAllMessages(entity.id, messages)
    if (!updateResult.success) {
      return Err(new ValidationError('Failed to update message'))
    }

    entity.lastMessage = new Date()
    await this.entityRepository.save(entity.id, entity)

    return await this.transformEntityToData(entity)
  }

  /**
   * メッセージを削除
   */
  async removeMessage(
    url: string,
    token: string,
    params: BBSRemoveParams
  ): Promise<Result<BBSData, ValidationError | NotFoundError>> {
    // オーナーシップ検証
    const ownershipResult = await this.verifyOwnership(url, token)
    if (!ownershipResult.success) {
      return Err(new ValidationError('Ownership verification failed', { error: ownershipResult.error }))
    }

    if (!ownershipResult.data.isOwner || !ownershipResult.data.entity) {
      return Err(new ValidationError('Invalid token or entity not found'))
    }

    const entity = ownershipResult.data.entity as BBSEntity

    // メッセージを取得
    const messagesResult = await this.getAllMessages(entity.id)
    if (!messagesResult.success) {
      return Err(new ValidationError('Failed to get messages'))
    }

    const messages = messagesResult.data
    const messageIndex = messages.findIndex(msg => msg.id === params.messageId)
    
    if (messageIndex === -1) {
      return Err(new ValidationError('Message not found'))
    }

    // 作成者チェック（作成者のみ削除可能）
    if (messages[messageIndex].authorHash !== params.authorHash) {
      return Err(new ValidationError('Only the author can delete this message'))
    }

    // メッセージを削除
    messages.splice(messageIndex, 1)

    // メッセージリストを更新
    const updateResult = await this.replaceAllMessages(entity.id, messages)
    if (!updateResult.success) {
      return Err(new ValidationError('Failed to remove message'))
    }

    // エンティティ更新
    entity.totalMessages = messages.length
    entity.lastMessage = messages.length > 0 ? messages[0].timestamp : undefined

    await this.entityRepository.save(entity.id, entity)

    return await this.transformEntityToData(entity)
  }

  /**
   * BBS全体をクリア
   */
  async clearBBS(
    url: string,
    token: string
  ): Promise<Result<BBSData, ValidationError | NotFoundError>> {
    // オーナーシップ検証
    const ownershipResult = await this.verifyOwnership(url, token)
    if (!ownershipResult.success) {
      return Err(new ValidationError('Ownership verification failed', { error: ownershipResult.error }))
    }

    if (!ownershipResult.data.isOwner || !ownershipResult.data.entity) {
      return Err(new ValidationError('Invalid token or entity not found'))
    }

    const entity = ownershipResult.data.entity as BBSEntity

    // メッセージをクリア
    const clearResult = await this.listRepository.clear(`${entity.id}:messages`)
    if (!clearResult.success) {
      return Err(new ValidationError('Failed to clear BBS', { error: clearResult.error }))
    }

    // エンティティ更新
    entity.totalMessages = 0
    entity.lastMessage = undefined

    const saveResult = await this.entityRepository.save(entity.id, entity)
    if (!saveResult.success) {
      return Err(new ValidationError('Failed to save entity', { error: saveResult.error }))
    }

    return await this.transformEntityToData(entity)
  }

  /**
   * ページネーション付きでメッセージを取得
   */
  private async getMessages(id: string, page: number, limit: number): Promise<Result<BBSMessage[], ValidationError>> {
    const start = (page - 1) * limit
    const end = start + limit - 1

    const messagesResult = await this.listRepository.range(`${id}:messages`, start, end)
    if (!messagesResult.success) {
      return Ok([]) // エラーの場合は空配列
    }

    return Ok(messagesResult.data)
  }

  /**
   * 全メッセージを取得
   */
  private async getAllMessages(id: string): Promise<Result<BBSMessage[], ValidationError>> {
    const messagesResult = await this.listRepository.range(`${id}:messages`, 0, -1)
    if (!messagesResult.success) {
      return Ok([])
    }

    return Ok(messagesResult.data)
  }

  /**
   * メッセージ全体を置き換え
   */
  private async replaceAllMessages(id: string, messages: BBSMessage[]): Promise<Result<void, ValidationError>> {
    // 既存メッセージをクリア
    const clearResult = await this.listRepository.clear(`${id}:messages`)
    if (!clearResult.success) {
      return Err(new ValidationError('Failed to clear messages'))
    }

    // 新しいメッセージを追加
    if (messages.length > 0) {
      const addResult = await this.listRepository.push(`${id}:messages`, messages)
      if (!addResult.success) {
        return Err(new ValidationError('Failed to add messages'))
      }
    }

    return Ok(undefined)
  }

  /**
   * 最大メッセージ数を制限
   */
  private async enforceMaxMessages(id: string, maxMessages: number): Promise<Result<void, ValidationError>> {
    const lengthResult = await this.listRepository.length(`${id}:messages`)
    if (!lengthResult.success) {
      return Ok(undefined)
    }

    if (lengthResult.data > maxMessages) {
      // 古いメッセージを削除（リストの末尾から削除）
      const trimResult = await this.listRepository.trim(`${id}:messages`, 0, maxMessages - 1)
      if (!trimResult.success) {
        return Err(new ValidationError('Failed to enforce max messages', { error: trimResult.error }))
      }
    }

    return Ok(undefined)
  }

  /**
   * メッセージIDを生成
   */
  private generateMessageId(bbsId: string): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 8)
    return `${bbsId}_${timestamp}_${random}`
  }

  /**
   * BBS設定を更新（オーナー限定）
   */
  async updateSettings(
    url: string,
    token: string,
    params: BBSUpdateSettingsParams
  ): Promise<Result<BBSData, ValidationError | NotFoundError>> {
    // オーナーシップ検証
    const ownershipResult = await this.verifyOwnership(url, token)
    if (!ownershipResult.success) {
      return Err(new ValidationError('Ownership verification failed', { error: ownershipResult.error }))
    }

    if (!ownershipResult.data.isOwner || !ownershipResult.data.entity) {
      return Err(new ValidationError('Invalid token or entity not found'))
    }

    const entity = ownershipResult.data.entity as BBSEntity

    // 設定を更新
    if (params.title !== undefined) {
      entity.settings.title = params.title
    }
    if (params.messagesPerPage !== undefined) {
      entity.settings.messagesPerPage = params.messagesPerPage
    }
    if (params.maxMessages !== undefined) {
      entity.settings.maxMessages = params.maxMessages
    }
    if (params.icons !== undefined) {
      entity.settings.icons = params.icons
    }
    if (params.selects !== undefined) {
      entity.settings.selects = params.selects
    }

    // エンティティ保存
    const saveResult = await this.entityRepository.save(entity.id, entity)
    if (!saveResult.success) {
      return Err(new ValidationError('Failed to save entity', { error: saveResult.error }))
    }

    return await this.transformEntityToData(entity, 1)
  }

  /**
   * ユーザーハッシュの生成
   */
  generateUserHash(ip: string, userAgent: string): string {
    return createHash('sha256')
      .update(`${ip}:${userAgent}`)
      .digest('hex')
      .substring(0, 16)
  }

  /**
   * IDで投稿（投稿者権限、サーバーサイドでeditToken生成）
   */
  async postMessageById(
    id: string, 
    params: {
      author: string
      message: string
      icon?: string
      selects?: string[]
      authorHash: string
    }
  ): Promise<Result<{ data: BBSData, messageId: string, editToken: string }, ValidationError | NotFoundError>> {
    // エンティティ取得
    const entityResult = await this.getById(id)
    if (!entityResult.success) {
      return entityResult
    }

    const entity = entityResult.data

    // 連投防止チェック
    const cooldownResult = await this.checkPostCooldown(entity.id, params.authorHash)
    if (!cooldownResult.success) {
      return cooldownResult
    }
    
    if (!cooldownResult.data) {
      return Err(new ValidationError('Please wait before posting another message (10 seconds cooldown)'))
    }

    // メッセージ長制限チェック
    const limits = getBBSLimits()
    if (params.message.length > limits.maxMessageLength) {
      return Err(new ValidationError(`Message exceeds maximum length of ${limits.maxMessageLength}`))
    }

    if (params.author.length > limits.maxAuthorLength) {
      return Err(new ValidationError(`Author name exceeds maximum length of ${limits.maxAuthorLength}`))
    }

    // 連投防止マーク
    const markResult = await this.markPostTime(entity.id, params.authorHash)
    if (!markResult.success) {
      return Err(new ValidationError('Failed to mark post time', { error: markResult.error }))
    }

    // メッセージIDを生成
    const messageId = this.generateMessageId(entity.id)

    // メッセージオブジェクトを作成
    const message: BBSMessage = {
      id: messageId,
      author: params.author,
      message: params.message,
      timestamp: new Date(),
      icon: params.icon,
      selects: params.selects,
      authorHash: params.authorHash
    }

    // メッセージをリストに追加
    const addResult = await this.listRepository.push(`${entity.id}:messages`, [message])
    if (!addResult.success) {
      // ロールバック: 投稿マークを削除
      await this.removePostMark(entity.id, params.authorHash)
      return Err(new ValidationError('Failed to add message', { error: addResult.error }))
    }

    // メッセージ数制限チェック
    await this.enforceMaxMessages(entity.id, entity.settings.maxMessages)

    // エンティティ更新
    entity.totalMessages = Math.min(entity.totalMessages + 1, entity.settings.maxMessages)
    entity.lastMessage = new Date()

    const saveResult = await this.entityRepository.save(entity.id, entity)
    if (!saveResult.success) {
      // ロールバック処理
      await this.removePostMark(entity.id, params.authorHash)
      return Err(new ValidationError('Failed to save entity', { error: saveResult.error }))
    }

    const dataResult = await this.transformEntityToData(entity)
    if (!dataResult.success) {
      return dataResult
    }

    // editTokenとしてauthorHashを返す
    return Ok({
      data: dataResult.data,
      messageId,
      editToken: params.authorHash
    })
  }

  /**
   * IDでBBSデータを取得（パブリックメソッド）
   */
  public async getBBSData(id: string, page: number = 1): Promise<Result<BBSData, ValidationError | NotFoundError>> {
    const entityResult = await this.getById(id)
    if (!entityResult.success) {
      return entityResult
    }

    const entity = entityResult.data
    
    // 指定されたページのメッセージを取得
    const messagesResult = await this.getMessages(entity.id, page, entity.settings.messagesPerPage)
    const messages = messagesResult.success ? messagesResult.data : []

    const totalPages = Math.ceil(entity.totalMessages / entity.settings.messagesPerPage)

    const data: BBSData = {
      id: entity.id,
      url: entity.url,
      title: entity.settings.title,
      messages,
      totalMessages: entity.totalMessages,
      currentPage: page,
      totalPages,
      pagination: {
        page: page,
        totalPages: totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages
      }, // Web Components用のページネーション
      settings: entity.settings,
      lastMessage: entity.lastMessage
    }

    return ValidationFramework.output(BBSDataSchema, data)
  }

  /**
   * 連投防止チェック
   */
  private async checkPostCooldown(id: string, userHash: string): Promise<Result<boolean, ValidationError>> {
    const postKey = `post:${id}:${userHash}`
    const postRepo = RepositoryFactory.createEntity(z.string(), 'bbs_post')
    
    const existsResult = await postRepo.exists(postKey)
    if (!existsResult.success) {
      return Err(new ValidationError('Failed to check post cooldown', { error: existsResult.error }))
    }

    // true = 投稿可能、false = クールダウン中
    return Ok(!existsResult.data)
  }

  /**
   * 投稿時刻をマーク
   */
  private async markPostTime(id: string, userHash: string): Promise<Result<void, ValidationError>> {
    const postKey = `post:${id}:${userHash}`
    const postRepo = RepositoryFactory.createEntity(z.string(), 'bbs_post')
    const limits = getBBSLimits() as { postCooldown: number }
    const ttl = limits.postCooldown // デフォルト10秒

    const saveResult = await postRepo.saveWithTTL(postKey, new Date().toISOString(), ttl)
    if (!saveResult.success) {
      return Err(new ValidationError('Failed to mark post time', { error: saveResult.error }))
    }

    return Ok(undefined)
  }

  /**
   * 投稿マークを削除（ロールバック用）
   */
  private async removePostMark(id: string, userHash: string): Promise<Result<void, ValidationError>> {
    const postKey = `post:${id}:${userHash}`
    const postRepo = RepositoryFactory.createEntity(z.string(), 'bbs_post')

    const deleteResult = await postRepo.delete(postKey)
    if (!deleteResult.success) {
      return Err(new ValidationError('Failed to remove post mark', { error: deleteResult.error }))
    }

    return Ok(undefined)
  }

  /**
   * IDで投稿を編集（投稿者権限、editToken使用）
   */
  async editMessageByIdWithToken(
    id: string, 
    messageId: string, 
    editToken: string, 
    params: {
      author: string
      message: string
      icon?: string
      selects?: string[]
    }
  ): Promise<Result<BBSData, ValidationError | NotFoundError>> {
    // エンティティ取得
    const entityResult = await this.getById(id)
    if (!entityResult.success) {
      return entityResult
    }

    const entity = entityResult.data

    // メッセージ取得
    const messagesResult = await this.getMessages(entity.id, 1, entity.totalMessages)
    if (!messagesResult.success) {
      return Err(new ValidationError('Failed to get messages', { error: messagesResult.error }))
    }

    const messages = messagesResult.data
    const messageIndex = messages.findIndex(msg => msg.id === messageId)
    
    if (messageIndex === -1) {
      return Err(new ValidationError('Message not found'))
    }

    const targetMessage = messages[messageIndex]
    
    // editToken（投稿者ハッシュ）の照合
    if (targetMessage.authorHash !== editToken) {
      return Err(new ValidationError('Permission denied: You can only edit your own posts'))
    }

    // メッセージ更新
    messages[messageIndex] = {
      ...targetMessage,
      author: params.author,
      message: params.message,
      icon: params.icon,
      selects: params.selects,
      timestamp: new Date(), // 編集時刻で更新
    }

    // メッセージ全体を保存
    const replaceResult = await this.replaceAllMessages(entity.id, messages)
    if (!replaceResult.success) {
      return replaceResult
    }

    // エンティティ更新
    entity.lastMessage = new Date()
    const saveResult = await this.entityRepository.save(entity.id, entity)
    if (!saveResult.success) {
      return Err(new ValidationError('Failed to save entity', { error: saveResult.error }))
    }

    return await this.transformEntityToData(entity)
  }

  /**
   * IDで投稿を削除（投稿者権限、editToken使用）
   */
  async deleteMessageByIdWithToken(
    id: string, 
    messageId: string, 
    editToken: string
  ): Promise<Result<BBSData, ValidationError | NotFoundError>> {
    // エンティティ取得
    const entityResult = await this.getById(id)
    if (!entityResult.success) {
      return entityResult
    }

    const entity = entityResult.data

    // メッセージ取得
    const messagesResult = await this.getMessages(entity.id, 1, entity.totalMessages)
    if (!messagesResult.success) {
      return Err(new ValidationError('Failed to get messages', { error: messagesResult.error }))
    }

    const messages = messagesResult.data
    const messageIndex = messages.findIndex(msg => msg.id === messageId)
    
    if (messageIndex === -1) {
      return Err(new ValidationError('Message not found'))
    }

    const targetMessage = messages[messageIndex]
    
    // editToken（投稿者ハッシュ）の照合
    if (targetMessage.authorHash !== editToken) {
      return Err(new ValidationError('Permission denied: You can only delete your own posts'))
    }

    // メッセージを削除
    messages.splice(messageIndex, 1)

    // メッセージ全体を保存
    const replaceResult = await this.replaceAllMessages(entity.id, messages)
    if (!replaceResult.success) {
      return replaceResult
    }

    // エンティティ更新
    entity.totalMessages = messages.length
    entity.lastMessage = messages.length > 0 ? new Date() : entity.lastMessage
    const saveResult = await this.entityRepository.save(entity.id, entity)
    if (!saveResult.success) {
      return Err(new ValidationError('Failed to save entity', { error: saveResult.error }))
    }

    return await this.transformEntityToData(entity)
  }
}

// シングルトンインスタンス
export const bbsService = new BBSService()