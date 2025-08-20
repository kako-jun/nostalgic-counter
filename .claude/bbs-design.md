# BBS機能設計書

## 機能要件

### 1. 基本機能
- [x] BBSサービス作成（オーナートークン）
- [x] メッセージ投稿（IDのみ、認証不要）
- [ ] メッセージ編集（投稿者のみ、editToken使用）
- [ ] メッセージ削除（投稿者のみ、editToken使用）
- [x] メッセージ一覧表示（ページネーション）
- [x] アイコン選択機能
- [x] カスタムドロップダウン（3つまで）

### 2. 権限管理
#### オーナー権限（URLトークン認証）
- [x] BBSサービス作成・削除
- [x] 設定変更（タイトル、最大メッセージ数等）
- [x] 全メッセージの編集・削除（editMessage/deleteMessage）
- [x] BBS全体クリア

#### 投稿者権限（editToken認証）
- [x] 自分の投稿の編集・削除（editMessageById/deleteMessageById）
- editTokenはサーバーサイドで生成（IP+UserAgentハッシュ）

### 3. API設計

#### 完成済みAPI
- `POST /api/bbs?action=create` - BBS作成
- `GET /api/bbs?action=post&id=xxx` - メッセージ投稿
- `GET /api/bbs?action=display&id=xxx&page=1` - メッセージ表示
- `GET /api/bbs?action=editMessageById&id=xxx&messageId=xxx&editToken=xxx` - 投稿者編集
- `GET /api/bbs?action=deleteMessageById&id=xxx&messageId=xxx&editToken=xxx` - 投稿者削除
- `GET /api/bbs?action=editMessage&url=xxx&token=xxx&messageId=xxx` - オーナー編集
- `GET /api/bbs?action=deleteMessage&url=xxx&token=xxx&messageId=xxx` - オーナー削除
- `GET /api/bbs?action=clear&url=xxx&token=xxx` - BBS全体クリア
- `GET /api/bbs?action=delete&url=xxx&token=xxx` - BBSサービス削除

### 4. Web Component機能

#### 実装済み
- [x] BBS表示（メッセージ一覧、ページネーション）
- [x] 投稿フォーム（名前、メッセージ、アイコン選択）
- [x] editTokenのlocalStorage管理
- [x] エラー・成功メッセージ表示エリア

#### 未実装・要修正
- [ ] 編集機能の動作確認
- [ ] 削除機能の動作確認
- [ ] editTokenが正しく返されているかテスト

### 5. 認証システム

#### 現在の問題点
- [ ] サーバーサイドでeditToken生成しているが、postHandlerの戻り値が正しいか未確認
- [ ] Web Componentが正しくeditTokenを受け取れているか未確認
- [ ] 編集・削除APIが実際に動作するか未確認

## 実装状況チェックリスト

### サーバーサイド
- [x] postMessageById メソッド追加
- [x] editMessageByIdWithToken メソッド追加  
- [x] deleteMessageByIdWithToken メソッド追加
- [x] generateUserHash から日付削除
- [ ] postHandler の戻り値確認（editToken含む）
- [ ] API動作テスト

### クライアントサイド
- [x] メッセージエリア追加（alert削除）
- [x] localStorage管理コード復活
- [x] 編集・削除ボタン表示
- [ ] 投稿時のeditToken受信確認
- [ ] 編集・削除機能の動作確認

## 次のタスク

1. postHandlerの戻り値を確認・修正
2. 実際にBBSに投稿して editToken が返されるかテスト
3. 編集・削除機能の動作テスト
4. エラーハンドリングの確認