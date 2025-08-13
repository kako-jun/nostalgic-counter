# Nostalgic - 実装タスク

## ✅ 完了済み（リファクタリング完了）

### 1. 公開ID方式への移行 ✅ 完了
- [x] API を公開ID方式に変更
  - [x] `/api/count` を URL+トークン → 公開ID返却に変更
  - [x] `/api/display` を 公開IDベースに変更
  - [x] `/api/owner` の管理APIを実装

### 2. Redis Cloud統合 ✅ 完了
- [x] CounterDB クラスをRedis対応に改修
  - [x] メモリベースから Redis ベースに変更
  - [x] アトミックなカウントアップ実装（kv.incr）
  - [x] 日別カウントの Redis 保存機能
- [x] 環境変数の設定（デプロイ時に設定）
  - `REDIS_URL`

### 3. 公開ID生成機能 ✅ 完了
- [x] 公開ID生成ロジック実装
  - [x] ドメイン-ハッシュ8桁形式（例：blog-a7b9c3d4）
  - [x] 重複チェック機能
- [x] オーナートークンのハッシュ化保存
  - [x] SHA256でトークンをハッシュ化してRedisに保存

### 4. Web Components更新 ✅ 完了
- [x] nostalgic-counter をIDベースに変更
  - [x] url+token から id 属性に変更
  - [x] 同一ID重複カウント防止機能
- [x] 配布用JSファイルの作成
  - [x] `/public/components/display.js` として配置

### 5. 重複防止機能の改善 ✅ 完了
- [x] Redisベースの重複チェック実装
  - [x] IP+UserAgent+日付をキーにしたTTL設定
  - [x] メモリキャッシュから Redis へ移行

### 6. コードクリーンアップ ✅ 完了
- [x] 古い管理者認証コードを削除
- [x] 古い `/api/admin` エンドポイントを削除
- [x] 不要な関数（`generateCounterKey`, `isValidAdminToken`）を削除

### 7. API設計・ディレクトリ構造の再構築 ✅ 完了
- [x] `src/app/api/` 以下に各サービス（`counter`, `like`, `ranking`, `bbs`）のルートディレクトリを作成
- [x] 各サービスルートの `route.ts` にて `action` パラメータによる処理を実装
- [x] 既存カウンターAPI (`/api/count`, `/api/display`, `/api/owner`) のロジックを新しい `/api/counter` へ移行
- [x] 移行完了後、古いAPIディレクトリ (`src/app/api/count`, `display`, `owner`) を削除

### 8. コアロジックの共通化と拡張 ✅ 完了
- [x] `src/lib/core/db.ts` でRedis操作のインターフェース統一、メモリストア代替実装
- [x] `src/lib/services/` 以下に各サービス（`counter.ts`, `like.ts`, `ranking.ts`, `bbs.ts`）のロジック実装
- [x] `src/types/` 以下に各サービス（`counter.ts`, `like.ts`, `ranking.ts`, `bbs.ts`）の型定義ファイル作成

### 9. 4つのサービス実装 ✅ 完了
- [x] **Counter Service**: 既存カウンター機能の移行
  - [x] 累計・日別・週別・月別統計
  - [x] 重複防止機能
  - [x] SVG画像生成（3スタイル）
- [x] **Like Service**: いいねボタン機能
  - [x] ユーザー別状態管理（IP+UserAgent）
  - [x] トグル機能（いいね/取り消し）
- [x] **Ranking Service**: スコアランキング
  - [x] Redis Sorted Setによる自動ソート
  - [x] スコア管理（submit/update/remove/clear）
  - [x] 最大エントリー数制限
- [x] **BBS Service**: 掲示板機能
  - [x] メッセージ投稿・取得
  - [x] カスタマイズ可能なドロップダウン（3つ）
  - [x] アイコン選択機能
  - [x] ページネーション
  - [x] 投稿者による自分の投稿編集・削除
  - [x] オーナーによる全投稿管理

### 10. フロントエンド・UX ✅ 完了
- [x] プロジェクト名を「Nostalgic」ブランドに変更
- [x] 総合ランディングページ (`/`) の更新
- [x] 各サービスデモページ (`/counter`, `/like`, `/ranking`, `/bbs`) の作成
- [x] 共通レイアウト（`Layout.tsx`）の実装
- [x] ナビゲーション統合

### 11. ドキュメント更新 ✅ 完了
- [x] README.md の4サービス対応更新
- [x] API仕様表の追加
- [x] デモページリンクの追加

## 📋 今後の拡張タスク（優先度：中）

### 12. 画像生成の拡張
- [ ] WebP形式の実装（現在はSVGのみ）
- [ ] カスタムスタイルの追加
- [ ] アニメーション効果のオプション

### 13. Web Components の拡張
- [ ] Like用Web Component (`/components/like.js`) の実装
- [ ] Ranking用Web Component (`/components/ranking.js`) の実装
- [ ] BBS用Web Component (`/components/bbs.js`) の実装

## 📚 優先度：低

### 14. 統計機能の拡充
- [ ] 時間帯別アクセス統計
- [ ] リファラー統計
- [ ] グラフ表示機能

### 15. テストの追加
- [ ] ユニットテスト
- [ ] E2Eテスト
- [ ] 負荷テスト

## 🧑‍💻 人間系タスク（手動対応が必要）

### 16. プロジェクト環境設定
- [ ] **リポジトリ名変更**: GitHubリポジトリ名を `nostalgic` などに変更
- [ ] **ドメイン名変更**: Vercelでカスタムドメインを `nostalgic.llll-ll.com` に変更
- [ ] **Vercel設定更新**: ドメイン変更に伴うVercelプロジェクト設定の更新

## 📝 リファクタリング結果

### 変更点
- **プロジェクト名**: Nostalgic Counter → Nostalgic
- **アーキテクチャ**: 単一サービス → 4サービス統合プラットフォーム
- **API設計**: 個別エンドポイント → action パラメータ統一
- **ディレクトリ構造**: モノリス → サービス分離

### 実装済み機能
- **Counter**: 累計・期間別統計、SVG画像生成
- **Like**: トグル機能、ユーザー状態管理
- **Ranking**: スコア管理、自動ソート、エントリー制限
- **BBS**: メッセージ投稿、カスタムドロップダウン、投稿者編集

### 設計方針
- ユーザー登録不要でシンプルに保つ
- URLごとに各サービスを自動作成
- オーナートークンによる安全な管理
- すべて無料枠で運用可能な設計

### 技術的な注意点
- Vercel の無料枠制限を考慮
- Redis/メモリストア代替実装
- 24時間重複防止によるデータ効率化
- IP+UserAgentによるユーザー識別

### 今後の拡張候補
- 各サービス用Web Components
- WebP画像形式対応
- 統計機能拡充
- テストコード整備
