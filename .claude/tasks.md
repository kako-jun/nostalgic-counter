# Nostalgic - 実装タスク

## 🚨 優先度：高（設計変更対応）

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

### 7. API設計・ディレクトリ構造の再構築
- [ ] `src/app/api/` 以下に各サービス（`counter`, `like`, `ranking`, `bbs`）のルートディレクトリを作成
- [ ] 各サービスルートの `route.ts` にて `action` パラメータによる処理を実装
- [ ] 既存カウンターAPI (`/api/count`, `/api/display`, `/api/owner`) のロジックを新しい `/api/counter` へ移行
- [ ] 移行完了後、古いAPIディレクトリ (`src/app/api/count`, `display`, `owner`) を削除

### 8. コアロジックの共通化と拡張
- [ ] `src/lib/db.ts` に各サービス（いいね、ランキング、BBS）のRedis操作関数を追加（Sorted Set, Listなど）
- [ ] `src/types/` 以下に各サービス（`like.ts`, `ranking.ts`, `bbs.ts`）の型定義ファイルを分離

## 📋 優先度：中

### 9. 埋め込み用スクリプトの提供 ✅ 完了
- [x] カウント用JavaScriptの配布（/components/display.js）
- [x] 簡単な設置ガイドの作成（README、docs/API.md）

### 10. パフォーマンス改善 ✅ 部分完了
- [x] 重複訪問チェックの最適化
  - [x] メモリキャッシュから Redis へ移行完了
  - [x] 24時間TTLによる自動クリーンアップ実装

### 11. 画像生成の拡張
- [ ] WebP形式の実装（現在はSVGのみ）
- [ ] カスタムスタイルの追加
- [ ] アニメーション効果のオプション

### 12. 新規サービスのバックエンド実装
- [ ] Nostalgic Like のAPIロジック実装
- [ ] Nostalgic Ranking のAPIロジック実装
- [ ] Nostalgic BBS のAPIロジック実装

### 13. フロントエンド・UXの再構築
- [ ] プロジェクト名を「Nostalgic」ブランドに合わせた表示に変更
- [ ] 総合ランディングページ (`/`) の作成
- [ ] 各サービスデモページ (`/counter`, `/like`, `/ranking`, `/bbs`) の作成
- [ ] サイト全体の共通レイアウト（ヘッダー、フッター）の実装
- [ ] 共通サイドバーナビゲーションの実装（各サービスデモページへのリンク）
- [ ] 既存Web Component (`public/components/display.js`) が新しいAPI (`/api/counter`) を叩くように修正

## 📚 優先度：低

### 14. 統計機能の拡充
- [ ] 時間帯別アクセス統計
- [ ] リファラー統計
- [ ] グラフ表示機能

### 15. ドキュメント整備 ✅ 完了
- [x] API仕様書の作成（docs/API.md）
- [x] 設置ガイドの充実（README.md、TypeScript対応含む）
- [x] サンプルコードの追加

### 16. テストの追加
- [ ] ユニットテスト
- [ ] E2Eテスト
- [ ] 負荷テスト

## 🧑‍💻 人間系タスク（手動対応が必要）

### 17. プロジェクト環境設定
- [ ] **リポジトリ名変更**: GitHubリポジトリ名を `nostalgic-suite` または `nostalgic-tools` などに変更
- [ ] **ドメイン名変更**: Vercelでカスタムドメインを `nostalgic.llll-ll.com` または `nostalgic-suite.llll-ll.com` などに変更
- [ ] **Vercel設定更新**: ドメイン変更に伴うVercelプロジェクト設定の更新

## 📝 メモ

### 設計方針
- ユーザー登録不要でシンプルに保つ
- URLごとに自動的にカウンター作成
- 管理者のみリセット・値設定が可能
- すべて無料枠で運用可能な設計

### 技術的な注意点
- Vercel の無料枠制限を考慮
- Redis Cloud の無料枠を活用
- 24時間重複防止によるデータ効率化

### 現在の未実装機能
- WebP画像形式の対応
- カスタムスタイルの追加
- アニメーション効果
- 統計機能の拡充（時間帯別、リファラーなど）
- テストコードの整備
