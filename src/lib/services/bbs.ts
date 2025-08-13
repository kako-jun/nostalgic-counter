import { BBSData, BBSMetadata, BBSMessage, BBSOptions } from '@/types/bbs'
import { getRedis } from '@/lib/core/db'
import { generatePublicId } from '@/lib/core/id'
import { hashToken } from '@/lib/core/auth'
import { createHash } from 'crypto'

export class BBSService {
  private get redis() {
    return getRedis()
  }

  // 公開IDでBBSデータを取得
  async getBBSById(id: string, page: number = 1): Promise<BBSData | null> {
    const metadataStr = await this.redis.get(`bbs:${id}`)
    if (!metadataStr) return null
    const metadata: BBSMetadata = JSON.parse(metadataStr)

    const messagesPerPage = metadata.messagesPerPage || 10
    const start = (page - 1) * messagesPerPage
    const end = start + messagesPerPage - 1

    // Listから指定範囲のメッセージを取得（新しい順）
    const rawMessages = await this.redis.lrange(`bbs:${id}:messages`, start, end)
    
    const messages: BBSMessage[] = rawMessages.map(msg => JSON.parse(msg))
    const totalMessages = await this.redis.llen(`bbs:${id}:messages`)

    return {
      id: metadata.id,
      url: metadata.url,
      messages,
      totalMessages,
      currentPage: page,
      messagesPerPage,
      options: metadata.options
    }
  }

  // URL+トークンでBBSを検索
  async getBBSByUrl(url: string): Promise<{ id: string; url: string } | null> {
    const id = await this.redis.get(`url:bbs:${encodeURIComponent(url)}`)
    if (!id) return null

    const metadataStr = await this.redis.get(`bbs:${id}`)
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
    const hashedToken = hashToken(token)
    
    const metadata: BBSMetadata = {
      id,
      url,
      created: now,
      ownerTokenHash: hashedToken,
      maxMessages,
      messagesPerPage,
      options
    }
    
    await Promise.all([
      this.redis.set(`bbs:${id}`, JSON.stringify(metadata)),
      this.redis.set(`bbs:${id}:owner`, hashedToken),
      this.redis.set(`url:bbs:${encodeURIComponent(url)}`, id)
    ])
    
    const bbsData: BBSData = {
      id,
      url,
      messages: [],
      totalMessages: 0,
      currentPage: 1,
      messagesPerPage,
      options
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
    const metadataStr = await this.redis.get(`bbs:${id}`)
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
      ipHash: options?.ipAddress ? this.hashIP(options.ipAddress) : undefined
    }
    
    // メッセージをListに追加（先頭に追加で新しい順）
    await this.redis.lpush(`bbs:${id}:messages`, JSON.stringify(newMessage))
    
    // 最大メッセージ数を超えた場合、古いものを削除
    const totalMessages = await this.redis.llen(`bbs:${id}:messages`)
    if (totalMessages > metadata.maxMessages) {
      await this.redis.ltrim(`bbs:${id}:messages`, 0, metadata.maxMessages - 1)
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
    const rawMessages = await this.redis.lrange(`bbs:${id}:messages`, 0, -1)
    
    let messageFound = false
    const updatedMessages = rawMessages.map(msg => {
      const parsedMsg: BBSMessage = JSON.parse(msg)
      
      if (parsedMsg.id === messageId) {
        // 投稿者の確認（IP+UserAgentハッシュ）
        const messageUserHash = this.generateUserHash(parsedMsg.ipHash || '', parsedMsg.userAgent || '')
        
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
    await this.redis.del(`bbs:${id}:messages`)
    if (updatedMessages.length > 0) {
      await this.redis.rpush(`bbs:${id}:messages`, ...updatedMessages)
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
    const rawMessages = await this.redis.lrange(`bbs:${id}:messages`, 0, -1)
    
    let messageFound = false
    const filteredMessages = rawMessages.filter(msg => {
      const parsedMsg: BBSMessage = JSON.parse(msg)
      
      if (parsedMsg.id === messageId) {
        messageFound = true
        
        // オーナーなら削除可能
        if (isOwner) return false
        
        // 投稿者本人なら削除可能
        if (userHash) {
          const messageUserHash = this.generateUserHash(parsedMsg.ipHash || '', parsedMsg.userAgent || '')
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
    await this.redis.del(`bbs:${id}:messages`)
    if (filteredMessages.length > 0) {
      await this.redis.rpush(`bbs:${id}:messages`, ...filteredMessages)
    }
    
    return true
  }
  
  // オーナートークンの検証
  async verifyOwnership(url: string, token: string): Promise<boolean> {
    const result = await this.getBBSByUrl(url)
    if (!result) return false
    
    const storedHash = await this.redis.get(`bbs:${result.id}:owner`)
    if (!storedHash) return false
    
    return hashToken(token) === storedHash
  }
  
  // BBSのクリア
  async clearBBS(url: string, token: string): Promise<boolean> {
    const isOwner = await this.verifyOwnership(url, token)
    if (!isOwner) return false
    
    const result = await this.getBBSByUrl(url)
    if (!result) return false
    
    await this.redis.del(`bbs:${result.id}:messages`)
    return true
  }
  
  // IPアドレスのハッシュ化
  private hashIP(ip: string): string {
    return createHash('sha256')
      .update(ip)
      .digest('hex')
      .substring(0, 8)
  }
  
  // ユーザーハッシュの生成（投稿者識別用）
  private generateUserHash(ipHash: string, userAgent: string): string {
    return createHash('sha256')
      .update(`${ipHash}:${userAgent}`)
      .digest('hex')
      .substring(0, 8)
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