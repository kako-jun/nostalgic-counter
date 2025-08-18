import { getRedis } from '@/lib/core/db'
import { generatePublicId } from '@/lib/core/id'
import { bbsKeys } from '@/lib/utils/redis-keys'
import { generateAuthorHash, generateUserHash } from '@/lib/utils/user-identification'
import { createOwnershipManager } from '@/lib/utils/ownership'
import { TTL } from '@/lib/utils/ttl-constants'
import { createHash } from 'crypto'
import {
  BBSData,
  BBSMetadata,
  BBSMessage,
  BBSOptions,
  BBSDataSchema,
  BBSMetadataSchema,
  BBSMessageSchema
} from '@/lib/validation/schemas'
import { safeParseRedisData, safeParseRedisArray } from '@/lib/validation/safe-parse'
import { safeRedisSet } from '@/lib/validation/db-validation'
import { safeRedisLRange } from '@/lib/validation/redis-validation'

export class BBSService {
  private get redis() {
    return getRedis()
  }

  // 公開IDでBBSデータを取得
  async getBBSById(id: string, page: number = 1): Promise<BBSData | null> {
    const metadataStr = await this.redis.get(bbsKeys.metadata(id))
    if (!metadataStr) return null
    const metadataResult = safeParseRedisData(BBSMetadataSchema, metadataStr)
    if (!metadataResult.success) {
      console.error(`BBS metadata validation failed for ${id}:`, metadataResult.error)
      return null
    }
    const metadata = metadataResult.data

    const messagesPerPage = metadata.messagesPerPage || 10
    const start = (page - 1) * messagesPerPage
    const end = start + messagesPerPage - 1

    // Listから指定範囲のメッセージを取得（新しい順）
    const [messagesResult, totalMessages] = await Promise.all([
      safeRedisLRange(this.redis, bbsKeys.messages(id), start, end, BBSMessageSchema),
      this.redis.llen(bbsKeys.messages(id))
    ])
    
    if (!messagesResult.success) {
      console.error(`BBS messages validation failed for ${id}:`, messagesResult.error)
      return null
    }
    const messages = messagesResult.data

    return {
      id: metadata.id,
      url: metadata.url,
      messages,
      totalMessages,
      currentPage: page,
      messagesPerPage,
      options: metadata.options,
      lastPost: metadata.lastPost,
      firstPost: metadata.created
    }
  }

  // URL+トークンでBBSを検索
  async getBBSByUrl(url: string): Promise<{ id: string; url: string } | null> {
    const id = await this.redis.get(bbsKeys.urlMapping(url))
    if (!id) return null

    const metadataStr = await this.redis.get(bbsKeys.metadata(id))
    if (!metadataStr) return null
    const metadataResult = safeParseRedisData(BBSMetadataSchema, metadataStr)
    if (!metadataResult.success) {
      console.error(`BBS metadata validation failed for ${id}:`, metadataResult.error)
      return null
    }
    const metadata = metadataResult.data

    return { id, url: metadata.url }
  }

  // 新規BBS作成
  async createBBS(
    url: string, 
    token: string, 
    maxMessages: number = 1000,
    messagesPerPage: number = 10,
    options?: BBSOptions
  ): Promise<{ id: string; bbsData: BBSData }> {
    const id = generatePublicId(url)
    const now = new Date()
    const ownershipManager = createOwnershipManager('bbs', this.getBBSByUrl.bind(this))
    
    const metadata: BBSMetadata = {
      id,
      url,
      created: now,
      maxMessages,
      messagesPerPage,
      options
    }
    
    // 安全なRedis書き込み
    const metadataResult = await safeRedisSet(this.redis, bbsKeys.metadata(id), BBSMetadataSchema, metadata)
    
    if (!metadataResult.success) {
      throw new Error(`Failed to save BBS metadata: ${metadataResult.error}`)
    }
    
    await Promise.all([
      ownershipManager.set(id, token),
      this.redis.set(bbsKeys.urlMapping(url), id)
    ])
    
    const bbsData: BBSData = {
      id,
      url,
      messages: [],
      totalMessages: 0,
      currentPage: 1,
      messagesPerPage,
      options,
      firstPost: now
    }
    
    return { id, bbsData }
  }

  // メッセージ投稿
  async postMessage(
    id: string, 
    author: string, 
    message: string,
    options?: {
      icon?: string
      select1?: string
      select2?: string
      select3?: string
      ipAddress?: string
      userAgent?: string
    }
  ): Promise<BBSMessage | null> {
    const metadataStr = await this.redis.get(bbsKeys.metadata(id))
    if (!metadataStr) return null
    const metadataResult = safeParseRedisData(BBSMetadataSchema, metadataStr)
    if (!metadataResult.success) {
      console.error(`BBS metadata validation failed for ${id}:`, metadataResult.error)
      return null
    }
    const metadata = metadataResult.data
    
    const timestamp = new Date()
    const messageId = this.generateMessageId(author, message, timestamp)
    
    const newMessage: BBSMessage = {
      id: messageId,
      author: author.substring(0, 50), // 名前は50文字まで
      message: message.substring(0, 1000), // メッセージは1000文字まで（平文で保存）
      timestamp,
      icon: options?.icon,
      select1: options?.select1,
      select2: options?.select2,
      select3: options?.select3,
      userAgent: options?.userAgent,
      ipHash: options?.ipAddress ? generateAuthorHash(options.ipAddress, options.userAgent || '') : undefined
    }
    
    // メタデータ更新（lastPostタイムスタンプ）
    metadata.lastPost = timestamp
    
    // 安全なメタデータ更新
    const metadataResult = await safeRedisSet(this.redis, bbsKeys.metadata(id), BBSMetadataSchema, metadata)
    const messageResult = await safeRedisSet(this.redis, '', BBSMessageSchema, newMessage)
    
    if (!metadataResult.success) {
      console.error('Failed to update BBS metadata:', metadataResult.error)
      return null
    }
    if (!messageResult.success) {
      console.error('Failed to validate new message:', messageResult.error)
      return null
    }
    
    // メッセージをListに追加（先頭に追加で新しい順）
    await this.redis.lpush(bbsKeys.messages(id), messageResult.serialized)
    
    // 最大メッセージ数を超えた場合、古いものを削除
    const totalMessages = await this.redis.llen(bbsKeys.messages(id))
    if (totalMessages > metadata.maxMessages) {
      await this.redis.ltrim(bbsKeys.messages(id), 0, metadata.maxMessages - 1)
    }
    
    return newMessage
  }
  
  // メッセージ更新（投稿者による自分の投稿編集）
  async updateMessage(
    id: string,
    messageId: string,
    newMessage: string,
    userHash: string
  ): Promise<boolean> {
    // 全メッセージを取得
    const rawMessages = await this.redis.lrange(bbsKeys.messages(id), 0, -1)
    
    let messageFound = false
    const updatedMessages = rawMessages.map(msg => {
      const msgResult = safeParseRedisData(BBSMessageSchema, msg)
      if (!msgResult.success) {
        console.error(`BBS message validation failed:`, msgResult.error)
        return msg // Keep original if validation fails
      }
      const parsedMsg = msgResult.data
      
      if (parsedMsg.id === messageId) {
        // 投稿者の確認（IP+UserAgentハッシュ）
        const messageUserHash = generateUserHash(parsedMsg.ipHash || '', parsedMsg.userAgent || '')
        
        if (messageUserHash === userHash) {
          messageFound = true
          const updatedMessage = {
            ...parsedMsg,
            message: newMessage.substring(0, 1000),
            updated: new Date()
          }
          const messageResult = await import('@/lib/validation/db-validation').then(({safeStringifyForRedis}) => 
            safeStringifyForRedis(BBSMessageSchema, updatedMessage)
          )
          if (!messageResult.success) {
            console.error('Failed to validate updated message:', messageResult.error)
            return msg
          }
          return messageResult.serialized
        }
      }
      
      return msg
    })
    
    if (!messageFound) return false
    
    // Listを再構築
    await this.redis.del(bbsKeys.messages(id))
    if (updatedMessages.length > 0) {
      await this.redis.rpush(bbsKeys.messages(id), ...updatedMessages)
    }
    
    return true
  }

  // メッセージ削除（オーナー権限またはメッセージ投稿者）
  async removeMessage(
    id: string,
    messageId: string,
    userHash?: string,
    ownerToken?: string,
    url?: string
  ): Promise<boolean> {
    // オーナー権限チェック
    let isOwner = false
    if (ownerToken && url) {
      isOwner = await this.verifyOwnership(url, ownerToken)
    }
    
    // 全メッセージを取得
    const rawMessages = await this.redis.lrange(bbsKeys.messages(id), 0, -1)
    
    let messageFound = false
    const filteredMessages = rawMessages.filter(msg => {
      const msgResult = safeParseRedisData(BBSMessageSchema, msg)
      if (!msgResult.success) {
        console.error(`BBS message validation failed:`, msgResult.error)
        return msg // Keep original if validation fails
      }
      const parsedMsg = msgResult.data
      
      if (parsedMsg.id === messageId) {
        messageFound = true
        
        // オーナーなら削除可能
        if (isOwner) return false
        
        // 投稿者本人なら削除可能
        if (userHash) {
          const messageUserHash = generateUserHash(parsedMsg.ipHash || '', parsedMsg.userAgent || '')
          if (messageUserHash === userHash) return false
        }
        
        // どちらでもなければ削除不可
        return true
      }
      
      return true
    })
    
    if (!messageFound) return false
    if (filteredMessages.length === rawMessages.length) return false // 削除権限なし
    
    // Listを再構築
    await this.redis.del(bbsKeys.messages(id))
    if (filteredMessages.length > 0) {
      await this.redis.rpush(bbsKeys.messages(id), ...filteredMessages)
    }
    
    return true
  }
  
  // オーナートークンの検証
  async verifyOwnership(url: string, token: string): Promise<boolean> {
    const ownershipManager = createOwnershipManager('bbs', this.getBBSByUrl.bind(this))
    return ownershipManager.verify(url, token)
  }
  
  // BBSのクリア
  async clearBBS(url: string, token: string): Promise<boolean> {
    const isOwner = await this.verifyOwnership(url, token)
    if (!isOwner) return false
    
    const result = await this.getBBSByUrl(url)
    if (!result) return false
    
    await this.redis.del(bbsKeys.messages(result.id))
    return true
  }
  
  // メッセージIDの生成
  private generateMessageId(author: string, message: string, timestamp: Date): string {
    return createHash('sha256')
      .update(`${author}:${message}:${timestamp.getTime()}`)
      .digest('hex')
      .substring(0, 12)
  }
}

export const bbsService = new BBSService()