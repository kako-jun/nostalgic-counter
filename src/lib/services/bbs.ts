import { BBSData, BBSMetadata, BBSMessage, BBSOptions } from '@/types/bbs'
import { getRedis } from '@/lib/core/db'
import { generatePublicId } from '@/lib/core/id'
import { bbsKeys } from '@/lib/utils/redis-keys'
import { generateAuthorHash, generateUserHash } from '@/lib/utils/user-identification'
import { createOwnershipManager } from '@/lib/utils/ownership'
import { TTL } from '@/lib/utils/ttl-constants'
import { createHash } from 'crypto'

export class BBSService {
  private get redis() {
    return getRedis()
  }

  // 公開IDでBBSデータを取得
  async getBBSById(id: string, page: number = 1): Promise<BBSData | null> {
    const metadataStr = await this.redis.get(bbsKeys.metadata(id))
    if (!metadataStr) return null
    const metadata: BBSMetadata = JSON.parse(metadataStr)

    const messagesPerPage = metadata.messagesPerPage || 10
    const start = (page - 1) * messagesPerPage
    const end = start + messagesPerPage - 1

    // Listから指定範囲のメッセージを取得（新しい順）
    const [rawMessages, totalMessages] = await Promise.all([
      this.redis.lrange(bbsKeys.messages(id), start, end),
      this.redis.llen(bbsKeys.messages(id))
    ])
    
    const messages: BBSMessage[] = rawMessages.map(msg => JSON.parse(msg))

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
    const metadata: BBSMetadata = JSON.parse(metadataStr)

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
    
    await Promise.all([
      this.redis.set(bbsKeys.metadata(id), JSON.stringify(metadata)),
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
    const metadata: BBSMetadata = JSON.parse(metadataStr)
    
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
    
    // メッセージをListに追加（先頭に追加で新しい順）
    await Promise.all([
      this.redis.lpush(bbsKeys.messages(id), JSON.stringify(newMessage)),
      this.redis.set(bbsKeys.metadata(id), JSON.stringify(metadata))
    ])
    
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
      const parsedMsg: BBSMessage = JSON.parse(msg)
      
      if (parsedMsg.id === messageId) {
        // 投稿者の確認（IP+UserAgentハッシュ）
        const messageUserHash = generateUserHash(parsedMsg.ipHash || '', parsedMsg.userAgent || '')
        
        if (messageUserHash === userHash) {
          messageFound = true
          return JSON.stringify({
            ...parsedMsg,
            message: newMessage.substring(0, 1000),
            updated: new Date()
          })
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
      const parsedMsg: BBSMessage = JSON.parse(msg)
      
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