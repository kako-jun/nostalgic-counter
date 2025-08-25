# 作業タスク一覧

## 🔥 緊急修正が必要

### 1. APIレスポンス統一の実装完了
- [ ] 全APIハンドラーで削除したスキーマを使っている箇所を修正
- [ ] ビルドテストで動作確認
- [ ] 各APIがidフィールドを正しく返すことを確認

### 2. ドキュメント更新
- [ ] docs/services/*.md 全8ファイルのレスポンス例を更新
  - [ ] counter.md
  - [ ] counter_ja.md  
  - [ ] like.md
  - [ ] like_ja.md
  - [ ] ranking.md
  - [ ] ranking_ja.md
  - [ ] bbs.md
  - [ ] bbs_ja.md
- [ ] `update`, `remove`, `clear`操作のレスポンス例を`{ success: true }`から完全なデータレスポンスに変更

### 3. デモページ更新
- [ ] src/app/counter/page.tsx のAPIレスポンス表示を確認
- [ ] src/app/like/page.tsx のAPIレスポンス表示を確認
- [ ] src/app/ranking/page.tsx のAPIレスポンス表示を確認
- [ ] src/app/bbs/page.tsx のAPIレスポンス表示を確認

### 4. ランキング投票後のリロード機能追加
- [ ] ランキングデモページで投票後、即座にランキングサンプルをリロードする機能を実装

### 5. Redis情報表示のバグ修正
- [ ] `npm run redis:show`の結果でLast AccessがNever、Unknownと誤認識される問題を修正
- [ ] 正しい最終アクセス時刻を表示するように修正

## 📋 完了済み
- [x] 統一スキーマでid追加（CounterSchemas.data, LikeSchemas.data, RankingSchemas.data）
- [x] 不要な型削除（updateSuccess, setSuccess, removeSuccess, clearSuccess）
- [x] 基本的なAPIハンドラー修正（一部）
- [x] サイドバーのナビゲーションバグ修正（他サービスの使い方がクリックできない問題）

## 🎯 目標
全てのAPIフォーム実行後に：
1. JSONレスポンスに`id`フィールドが含まれる
2. `setPublicId(data.id)`でpublicIdが更新される
3. サンプル表示が新しいIDで自動更新される
4. 操作後の最新データも同時に表示される