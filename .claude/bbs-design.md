# BBS機能設計書

## 機能要件

### 1. 基本機能
- [x] BBSサービス作成（オーナートークン）
- [x] メッセージ投稿（IDのみ、認証不要）
- [x] メッセージ編集（投稿者のみ、userHash使用）
- [x] メッセージ削除（投稿者のみ、userHash使用）
- [x] メッセージ一覧表示（ページネーション）
- [x] アイコン選択機能
- [x] カスタムドロップダウン（3つまで）

### 2. 権限管理
#### オーナー権限（URLトークン認証）
- [x] BBSサービス作成・削除
- [x] 設定変更（タイトル、最大メッセージ数等）
- [x] 全メッセージの編雈・削除（editMessage/deleteMessage）
- [x] BBS全体クリア

#### 投稿者権限（userHash認証）
- [x] 自分の投稿の編雈・削除（editMessageById/deleteMessageById）
- userHashはサーバーサイドで生成（IP+UserAgentハッシュ）

### 3. API設計

#### 完成済みAPI
- `GET /api/bbs?action=create` - BBS作成
- `GET /api/bbs?action=post&id=xxx` - メッセージ投稿
- `GET /api/bbs?action=get&id=xxx&page=1` - メッセージ一覧取得
- `GET /api/bbs?action=display&id=xxx&page=1` - メッセージ表示（getと同じ）
- `GET /api/bbs?action=editMessageById&id=xxx&messageId=xxx` - 投稿者編集
- `GET /api/bbs?action=deleteMessageById&id=xxx&messageId=xxx` - 投稿者削除
- `GET /api/bbs?action=editMessage&url=xxx&token=xxx&messageId=xxx` - オーナー編集
- `GET /api/bbs?action=deleteMessage&url=xxx&token=xxx&messageId=xxx` - オーナー削除
- `GET /api/bbs?action=updateSettings&url=xxx&token=xxx` - BBS設定更新
- `GET /api/bbs?action=clear&url=xxx&token=xxx` - BBS全体クリア
- `GET /api/bbs?action=delete&url=xxx&token=xxx` - BBSサービス削除

### 4. Web Component機能

#### 実装状態 ✅
- [x] BBS表示（メッセージ一覧、ページネーション）
- [x] 投稿フォーム（名前、メッセージ、アイコン選択）
- [x] カスタムドロップダウン機能
- [x] エラー・成功メッセージ表示エリア
- [x] Web Component実装（`/components/bbs.js` - 748行）

### 5. 認証システム

#### 実装済み
- [x] userHashによる投稿者認証
- [x] サーバーサイドでのuserHash生成（IP+UserAgent）
- [x] 投稿時のuserHash保存
- [x] 編集・削除時のuserHash検証

## 実装状況チェックリスト

### サーバーサイド
- [x] BBSServiceのDDD実装
- [x] postMessage メソッド
- [x] updateMessage メソッド  
- [x] removeMessage メソッド
- [x] getMessages メソッド
- [x] clearMessages メソッド
- [x] updateSettings メソッド
- [x] generateUserHash メソッド
- [x] API route実装（`/api/bbs/route.ts`）

### クライアントサイド
- [x] デモページ（`/bbs/page.tsx`）
- [ ] Web Component（`/components/bbs.js`）

## 次のタスク

1. 本番環境でのBBS動作確認
2. Web Componentの実装
3. カスタムドロップダウンの動作確認
4. ページネーションの動作確認