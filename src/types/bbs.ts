export interface BBSMessage {
  id: string
  author: string
  message: string
  timestamp: Date
  updated?: Date // メッセージ更新日時
  // ユーザー選択要素（カスタマイズ可能）
  icon?: string
  select1?: string // 汎用ドロップダウン1（国、地域、部署など）
  select2?: string // 汎用ドロップダウン2（アプリ、カテゴリ、トピックなど）
  select3?: string // 汎用ドロップダウン3（その他の分類）
  // 昔のBBS風の追加要素
  userAgent?: string
  ipHash?: string // IPアドレスのハッシュ（プライバシー保護）
}

export interface BBSSelectOption {
  label: string // ドロップダウンのラベル（例: "国", "カテゴリ", "部署"）
  values: string[] // 選択肢の配列
  required?: boolean // 必須選択かどうか
}

export interface BBSOptions {
  // 利用可能なアイコン
  availableIcons?: string[]
  // カスタマイズ可能なドロップダウン
  select1?: BBSSelectOption
  select2?: BBSSelectOption
  select3?: BBSSelectOption
}

export interface BBSData {
  id: string
  url: string
  messages: BBSMessage[]
  totalMessages: number
  currentPage: number
  messagesPerPage: number
  options?: BBSOptions // BBS設定で定義された選択肢
  lastPost?: Date // 最後の投稿日時
  firstPost: Date // 最初の投稿日時（BBS作成日時）
}

export interface BBSMetadata {
  id: string
  url: string
  created: Date
  ownerTokenHash: string
  maxMessages: number // 保存する最大メッセージ数
  messagesPerPage: number // 1ページあたりのメッセージ数
  options?: BBSOptions // カスタマイズ可能な選択肢
}