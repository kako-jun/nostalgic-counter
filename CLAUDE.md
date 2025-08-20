# Nostalgic - プロジェクト目次

## プロジェクト概要
昔のWebツールを最新技術で復活させた総合プラットフォーム。Next.js + Redis で実装。

## 📚 重要ドキュメント
- [**Redis Database Structure**](.claude/redis-database-structure.md) - DB構造の完全仕様書（削除時は必読）

## 実装済み機能（4サービス）

### 📊 Counter Service
- ✅ 複数期間統計（累計・今日・昨日・週間・月間）
- ✅ 24時間重複防止
- ✅ SVG画像生成（3スタイル：classic/modern/retro）
- ✅ Web Components による埋め込み

### 💖 Like Service  
- ✅ トグル型いいね/取り消し機能
- ✅ ユーザー状態管理（IP+UserAgent）
- ✅ 即座のフィードバック

### 🏆 Ranking Service
- ✅ Redis Sorted Setによる自動ソート
- ✅ スコア管理（submit/update/remove/clear）
- ✅ 最大エントリー数制限

### 💬 BBS Service
- ✅ メッセージ投稿・取得
- ✅ カスタマイズ可能なドロップダウン（3つ）
- ✅ アイコン選択機能
- ✅ ページネーション
- ✅ 投稿者による自分の投稿編集・削除

## API構成（統一アクション型・GET専用）
```
/api/{service}?action={action}&url={URL}&token={TOKEN}&...params
```

### GET専用の理由（1990年代Web文化復活）
- ブラウザのURL欄で全操作が可能
- リンククリックだけでサービス作成
- 掲示板の書き込みもGETパラメータ（昔のまま）
- 共有可能なURL、シンプルな操作性

### サービス別エンドポイント
- `/api/counter` - カウンター（create/increment/display/set）
- `/api/like` - いいね（create/toggle/get）
- `/api/ranking` - ランキング（create/submit/update/remove/clear/get）
- `/api/bbs` - BBS（create/post/update/remove/clear/get）

## データ構造（Redis）
### Counter
```
counter:{id}:total             → 累計
counter:{id}:daily:{date}      → 日別カウント  
counter:{id}:owner             → オーナートークン（ハッシュ化）
visit:counter:{id}:{hash}      → 重複防止（24h TTL）
```

### Like
```
like:{id}:total                → いいね総数
like:{id}:users:{hash}         → ユーザー状態（24h TTL）
like:{id}:owner                → オーナートークン
```

### Ranking  
```
ranking:{id}:scores            → Sorted Set（スコア）
ranking:{id}:owner             → オーナートークン
ranking:{id}:meta              → メタデータ
```

### BBS
```
bbs:{id}:messages              → List（メッセージ）
bbs:{id}:owner                 → オーナートークン
bbs:{id}                       → メタデータ
```

## 公開ID形式
`{domain}-{hash8桁}` (例: blog-a7b9c3d4)

## ファイル構成
### API Routes
- `src/app/api/counter/route.ts` - カウンターAPI
- `src/app/api/like/route.ts` - いいねAPI  
- `src/app/api/ranking/route.ts` - ランキングAPI
- `src/app/api/bbs/route.ts` - BBS API

### Core Logic
- `src/lib/core/db.ts` - Redis操作
- `src/lib/core/auth.ts` - 認証機能
- `src/lib/core/id.ts` - ID生成
- `src/domain/` - DDD各ドメインサービス
- `src/lib/utils/` - ユーティリティ

### Frontend
- `src/app/page.tsx` - 総合ランディングページ
- `src/app/counter/page.tsx` - カウンターデモ
- `src/app/like/page.tsx` - いいねデモ  
- `src/app/ranking/page.tsx` - ランキングデモ
- `src/app/bbs/page.tsx` - BBSデモ
- `src/components/Layout.tsx` - 共通レイアウト
- `public/components/counter.js` - カウンター Web Component

### Documentation
- `docs/API.md` - 総合API仕様
- `docs/services/` - サービス別詳細文書（英語・日本語）

## メンテナンス・管理

### データ確認
```bash
npm run redis:show         # 全データ表示
npm run redis:service {service}  # 特定サービスのデータ表示
npm run redis:info         # Redis接続情報
```

### データ削除（完全削除）
```bash
npm run cleanup:service {service} {id}  # サービスの完全削除
# 例: npm run cleanup:service counter nostalgic-a1b2c3d4
```

**⚠️ 削除時の注意**: 必ず[Redis Database Structure](.claude/redis-database-structure.md)を参照してください。

## 使用方法
### 1. サービス作成
ブラウザのアドレスバーに直接入力：
```
https://nostalgic.llll-ll.com/api/{service}?action=create&url=https://example.com&token=your-secret
```

### 2. 操作
```
# カウントアップ
https://nostalgic.llll-ll.com/api/counter?action=increment&id=your-id

# いいねトグル  
https://nostalgic.llll-ll.com/api/like?action=toggle&url=https://example.com&token=your-secret

# スコア送信
https://nostalgic.llll-ll.com/api/ranking?action=submit&url=https://example.com&token=your-secret&name=Player&score=1000

# メッセージ投稿（純粋なGET、1990年代スタイル）
https://nostalgic.llll-ll.com/api/bbs?action=post&url=https://example.com&token=your-secret&author=User&message=Hello
```

### 3. 埋め込み（Counter例）
```html
<script src="/components/counter.js"></script>
<nostalgic-counter id="your-id" type="total" theme="classic"></nostalgic-counter>
```

## セキュリティ
- オーナートークンはSHA256でハッシュ化保存
- 公開IDは表示専用（管理操作不可）
- IP+UserAgent+日付での重複防止
- 投稿者確認による編集権限管理
- トークン長8-16文字制限

## デプロイメント
- Vercel自動デプロイ
- Redis設定
  - REDIS_URL環境変数が必要
- 完全無料運用可能

## 技術スタック
- Next.js 15 (App Router)
- TypeScript
- Redis (ioredis)
- Tailwind CSS
- Web Components