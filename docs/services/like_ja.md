# いいねサービス API

## 概要

ユーザー状態追跡機能付きのトグル型いいね/取り消しボタンサービス。ユーザーは即座にフィードバックを得ながらいいね/取り消しができます。

## アクション

### create
新しいいいねボタンを作成または既存ボタンIDを取得。

```
GET /api/like?action=create&url={URL}&token={TOKEN}
```

**パラメータ:**
- `url` (必須): いいねボタン対象URL
- `token` (必須): オーナートークン（8-16文字）

**レスポンス:**
```json
{
  "id": "yoursite-a7b9c3d4",
  "url": "https://yoursite.com",
  "total": 0,
  "userLiked": false,
  "message": "Like button created successfully"
}
```

### toggle
現在のユーザーのいいね/取り消し状態をトグル。

```
GET /api/like?action=toggle&url={URL}&token={TOKEN}
```

**パラメータ:**
- `url` (必須): 対象URL
- `token` (必須): オーナートークン

**レスポンス:**
```json
{
  "url": "https://yoursite.com",
  "total": 1,
  "userLiked": true,
  "action": "liked"
}
```

### get
現在のいいねデータを取得（公開アクセス）。

```
GET /api/like?action=get&id={ID}
```

**パラメータ:**
- `id` (必須): 公開いいねボタンID

**レスポンス:**
```json
{
  "url": "https://yoursite.com",
  "total": 5,
  "userLiked": false
}
```

## Web Component 統合

```html
<script src="https://nostalgic.llll-ll.com/components/like.js"></script>

<!-- インタラクティブボタン（デフォルト） -->
<nostalgic-like id="yoursite-a7b9c3d4" theme="classic" icon="heart"></nostalgic-like>

<!-- テキスト形式 -->
<nostalgic-like id="yoursite-a7b9c3d4" format="text" theme="modern"></nostalgic-like>

<!-- SVG画像形式 -->
<nostalgic-like id="yoursite-a7b9c3d4" format="image" theme="retro"></nostalgic-like>
```

**属性:**
- `id`: 公開いいねボタンID
- `theme`: 表示スタイル（classic, modern, retro）
- `icon`: アイコン種類（heart, star, thumb）- インタラクティブ形式のみ
- `format`: 表示形式（interactive, text, image）- デフォルト: interactive
- `api-base`: カスタムAPIベースURL（オプション）

## 使用例

### 基本的ないいねボタン設置
```javascript
// 1. いいねボタン作成
const response = await fetch('/api/like?action=create&url=https://myblog.com&token=my-secret')
const data = await response.json()
console.log('いいねボタンID:', data.id)

// 2. HTMLに埋め込み
document.body.innerHTML += `
  <script src="/components/like.js"></script>
  <nostalgic-like id="${data.id}"></nostalgic-like>
`
```

### テキスト形式の活用
```html
<!-- モダンなレイアウト用インラインテキスト -->
<div class="post-stats">
  <span>いいね: <nostalgic-like id="post-123" format="text" theme="modern"></nostalgic-like></span>
  <span>閲覧: 1,234</span>
</div>

<!-- カスタムスタイルのテキストいいね -->
<style>
nostalgic-like {
  --like-text-color-unliked: #666;
  --like-text-color-liked: #ff4757;
  --like-text-hover-color-unliked: #333;
  --like-text-hover-color-liked: #ff3838;
}
</style>
<nostalgic-like id="post-123" format="text"></nostalgic-like>
```

### 手動いいね制御
```javascript
// 手動でいいねトグル
const response = await fetch('/api/like?action=toggle&url=https://myblog.com&token=my-secret')
const data = await response.json()
console.log('ユーザーがいいね:', data.userLiked, '合計:', data.total)

// 現在の状態取得
const current = await fetch('/api/like?action=get&id=myblog-a7b9c3d4')
const state = await current.json()
console.log('現在のいいね数:', state.total)
```

## 特徴

- **トグル機能**: ユーザーはいいねと取り消しが可能
- **ユーザー状態追跡**: 現在のユーザーがいいね済みかを記憶
- **重複防止**: IP+UserAgentハッシュベース
- **即座のフィードバック**: 新しい状態で即座にレスポンス
- **公開アクセス**: 公開IDで誰でもいいね数閲覧可能

## TypeScript サポート

TypeScriptプロジェクトでWeb Componentsを使用する場合、プロジェクトルートに `types.d.ts` ファイルを作成してください：

```typescript
// types.d.ts
import 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'nostalgic-like': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        id?: string;
        theme?: 'classic' | 'modern' | 'retro';
        icon?: 'heart' | 'star' | 'thumb';
      };
    }
  }
}
```

これにより、React/Next.jsプロジェクトでWeb Componentsを使用してもTypeScriptビルドエラーが発生しません。

## セキュリティ注意事項

- IP+UserAgentハッシュによるユーザー識別
- 永続的なユーザー追跡やCookieなし
- いいねボタン作成にはオーナートークンが必要
- 公開IDは埋め込み安全（閲覧専用アクセス）