# カウンターサービス API

## 概要

複数期間統計と懐かしい表示スタイルを持つ従来の訪問者カウンター。

## アクション

### create
新しいカウンターを作成または既存カウンターIDを取得。

```
GET /api/visit?action=create&url={URL}&token={TOKEN}
```

**パラメータ:**
- `url` (必須): カウント対象URL
- `token` (必須): オーナートークン（8-16文字）

**レスポンス:**
```json
{
  "id": "yoursite-a7b9c3d4",
  "url": "https://yoursite.com",
  "total": 1,
  "today": 1,
  "yesterday": 0,
  "week": 1,
  "month": 1,
  "message": "Counter created successfully"
}
```

### increment
カウンターをカウントアップ（自動重複防止）。

```
GET /api/visit?action=increment&id={ID}
```

**パラメータ:**
- `id` (必須): 公開カウンターID

### display
カウンターデータまたは画像を取得。

```
GET /api/visit?action=display&id={ID}&type={TYPE}&theme={THEME}&format={FORMAT}
```

**パラメータ:**
- `id` (必須): 公開カウンターID
- `type` (オプション): 表示タイプ
  - `total` (デフォルト): 累計カウント
  - `today`: 今日のカウント
  - `yesterday`: 昨日のカウント
  - `week`: 直近7日間
  - `month`: 直近30日間
- `theme` (オプション): 表示スタイル
  - `classic` (デフォルト): 黒背景に緑文字（90年代端末スタイル）
  - `modern`: グレー背景に白文字（2000年代クリーンスタイル）
  - `retro`: 紫背景に黄文字（80年代ネオンスタイル）
- `format` (オプション): レスポンス形式
  - `image` (デフォルト): SVG画像
  - `text`: プレーンテキスト数値（スタイルなし）
- `digits` (オプション): ゼロ埋め桁数（指定時のみ、画像・テキスト両方で有効）

### set
カウンター値を設定（オーナーのみ）。

```
GET /api/visit?action=set&url={URL}&token={TOKEN}&total={VALUE}
```

## TypeScript サポート

TypeScript プロジェクトで Web Components を使用する場合、プロジェクトルートに `types.d.ts` ファイルを作成してください：

```typescript
// types.d.ts
import 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'nostalgic-counter': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        id?: string;
        type?: 'total' | 'today' | 'yesterday' | 'week' | 'month';
        theme?: 'classic' | 'modern' | 'retro';
        digits?: string;
        scale?: string;
      };
    }
  }
}
```

これにより、React/Next.js プロジェクトで Web Components を使用する際の TypeScript ビルドエラーを防止できます。

## Web Component 統合

```html
<script src="https://nostalgic.llll-ll.com/components/visit.js"></script>

<!-- 画像形式（デフォルト） -->
<nostalgic-counter 
  id="yoursite-a7b9c3d4" 
  type="total" 
  theme="classic"
  digits="6">
</nostalgic-counter>

<!-- テキスト形式 -->
<nostalgic-counter 
  id="yoursite-a7b9c3d4" 
  type="total" 
  format="text">
</nostalgic-counter>

<!-- テキスト形式（ゼロ埋めあり） -->
<nostalgic-counter 
  id="yoursite-a7b9c3d4" 
  type="total" 
  format="text"
  digits="6">
</nostalgic-counter>
```

**属性:**
- `id`: 公開カウンターID
- `type`: 表示タイプ（total, today, yesterday, week, month）
- `theme`: 表示スタイル（classic, modern, retro）- 画像形式のみ
- `format`: 出力形式（image, text）- デフォルト: image
- `digits`: ゼロ埋め桁数（指定時のみ）
- `api-base`: カスタムAPI ベースURL（オプション）

## 使用例

### 基本的なカウンター設置
```javascript
// 1. カウンター作成
const response = await fetch('/api/visit?action=create&url=https://myblog.com&token=my-secret')
const data = await response.json()
console.log('カウンターID:', data.id)

// 2. HTMLに埋め込み
document.body.innerHTML += `
  <script src="/components/display.js"></script>
  <nostalgic-counter id="${data.id}" type="total" theme="classic"></nostalgic-counter>
`
```

### 複数期間表示
```html
<!-- 異なる期間、同じカウンター -->
<nostalgic-counter id="blog-a7b9c3d4" type="total" theme="classic"></nostalgic-counter>
<nostalgic-counter id="blog-a7b9c3d4" type="today" theme="modern"></nostalgic-counter>
<nostalgic-counter id="blog-a7b9c3d4" type="week" theme="retro"></nostalgic-counter>
```

### テキスト形式の活用
```html
<!-- モダンなレイアウト用インラインテキストカウンター -->
<div class="stats">
  <span>総訪問者数: <nostalgic-counter id="blog-a7b9c3d4" type="total" format="text"></nostalgic-counter></span>
  <span>今日: <nostalgic-counter id="blog-a7b9c3d4" type="today" format="text"></nostalgic-counter></span>
</div>

<!-- ゼロ埋め表示 -->
<div class="retro-style">
  訪問者数: <nostalgic-counter id="blog-a7b9c3d4" type="total" format="text" digits="8"></nostalgic-counter>
</div>
```

## 特徴

- **複数期間統計**: 累計・今日・昨日・週間・月間
- **重複防止**: IP+UserAgentによる24時間重複防止
- **3つのスタイル**: クラシック・モダン・レトロ
- **SVG画像生成**: 美しいベクター画像
- **Web Components**: 簡単埋め込み