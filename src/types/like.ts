export interface LikeData {
  id: string
  url: string
  total: number
  userLiked: boolean // 現在のユーザーがいいねしているかどうか
  lastLike: Date
  firstLike: Date
}

export interface LikeMetadata {
  id: string
  url: string
  created: Date
  lastLike?: Date
}

// いいねは累計のみ
export type LikeType = 'total'