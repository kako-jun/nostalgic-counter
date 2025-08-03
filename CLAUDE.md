# Nostalgic Counter - プロジェクト目次

## プロジェクト概要
昔のWebカウンターを最新技術で復活させたサービス。Next.js + Redis で実装。

## 実装済み機能
- ✅ カウンター作成・管理（公開ID方式）
- ✅ 複数期間統計（累計・今日・昨日・週間・月間）
- ✅ オーナートークン認証（8-16文字制限）
- ✅ 24時間重複防止
- ✅ Web Components による埋め込み
- ✅ SVG画像生成（3スタイル：classic/modern/retro）
- ✅ テキスト・画像両対応

## アーキテクチャ
### API構成
- `/api/count` - カウンター作成・カウントアップ
- `/api/display` - 画像・データ取得
- `/api/owner` - 管理操作（値設定）

### データ構造（Redis）
```
counter:{id}                    → メタデータ
counter:{id}:total             → 累計
counter:{id}:daily:{date}      → 日別カウント
counter:{id}:owner             → オーナートークン（ハッシュ化）
visit:{id}:{hash}              → 重複防止（24h TTL）
```

### 公開ID形式
`{domain}-{hash8桁}` (例: blog-a7b9c3d4)

## ファイル構成
### API Routes
- `src/app/api/count/route.ts` - カウンター作成・カウントアップ
- `src/app/api/display/route.ts` - 画像・データ取得
- `src/app/api/owner/route.ts` - 管理操作

### Core Logic
- `src/lib/db.ts` - Redis操作
- `src/lib/utils.ts` - ID生成・認証・重複防止
- `src/lib/image-generator.ts` - SVG画像生成

### Frontend
- `src/app/page.tsx` - ランディングページ
- `public/components/display.js` - Web Component

### Documentation
- `docs/specification.md` - 公開API仕様
- `docs/landing-page.md` - ランディングページ設計
- `.claude/implementation.md` - 内部実装詳細
- `.claude/web-components.md` - コンポーネント仕様
- `.claude/tasks.md` - タスク管理

## 使用方法
### 1. カウンター作成
ブラウザのアドレスバーに直接入力：
```
https://nostalgic-counter.llll-ll.com/api/count?url=https://example.com&token=your-secret
```
→ ブラウザにJSONが表示され、公開IDが確認できる

### 2. 埋め込み
```html
<script src="/components/display.js"></script>
<nostalgic-counter id="your-id" type="total" style="classic"></nostalgic-counter>
```

### 3. 管理操作
```javascript
fetch('/api/owner?action=set&url=https://example.com&token=your-secret&total=0')
```

## セキュリティ
- オーナートークンはSHA256でハッシュ化保存
- 公開IDは表示専用（管理操作不可）
- IP+UserAgent+日付での重複防止
- トークン長8-16文字制限

## デプロイメント
- Vercel自動デプロイ
- Redis設定
  - Vercel Integrations → Redisを追加
  - REDIS_URL環境変数が自動設定される
- 完全無料運用可能