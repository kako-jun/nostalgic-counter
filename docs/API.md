# Nostalgic Counter 仕様書

## 概要

Nostalgic Counterは、昔のインターネットで使われていたアクセスカウンターを現代の技術で再現したサービスです。
任意のWebサイトに設置可能で、訪問者数を記録・表示します。

## 基本設計

### データモデル

各カウンターは以下の要素で構成されます：
- **URL**: カウント対象のURL
- **公開ID**: 表示・カウント用の識別子（例: `blog-a7b9c3d4`）
- **オーナートークン**: 管理操作用の秘密トークン

### カウンターの識別方法

1. **作成・管理時**: URL + オーナートークン
2. **表示・カウント時**: 公開ID

これにより：
- オーナートークンはHTMLに埋め込む必要がない
- 公開IDは何度でも確認可能
- 他人のカウンターには干渉できない

## API仕様

### 1. カウンター作成・ID確認

```
GET /api/count?url={URL}&token={TOKEN}
```

#### 動作
- カウンターが存在しない場合：新規作成
- カウンターが既に存在する場合：カウントアップ
- **公開IDを返す**（トークン付きの場合のみ）

#### パラメータ
- `url` (必須): カウント対象のURL
- `token` (必須): カウンターのオーナートークン

#### レスポンス
```json
{
  "id": "blog-a7b9c3d4",
  "url": "https://example.com",
  "total": 1,
  "today": 1,
  "yesterday": 0,
  "week": 1,
  "month": 1,
  "lastVisit": "2025-07-30T12:00:00Z",
  "firstVisit": "2025-07-30T12:00:00Z"
}
```

### 1-2. 通常のカウントアップ

```
GET /api/count?id={ID}
```

#### パラメータ
- `id` (必須): カウンターの公開ID

#### レスポンス
```json
{
  "url": "https://example.com",
  "total": 2,
  "today": 2,
  "yesterday": 0,
  "week": 2,
  "month": 2,
  "lastVisit": "2025-07-30T12:05:00Z",
  "firstVisit": "2025-07-30T12:00:00Z"
}
```

### 2. カウンター画像・データ取得

```
GET /api/counter?id={ID}&type={TYPE}&style={STYLE}&digits={DIGITS}&format={FORMAT}
```

#### パラメータ
- `id` (必須): カウンターの公開ID
- `type` (任意): 表示する値の種類
  - `total` (デフォルト): 累計
  - `today`: 今日
  - `yesterday`: 昨日
  - `week`: 直近7日間
  - `month`: 直近30日間
- `style` (任意): 表示スタイル（format=imageの場合のみ有効）
  - `classic` (デフォルト): 黒背景・緑文字・monospace（90年代風）
  - `modern`: ダークグレー背景・白文字・Arial（現代風）
  - `retro`: 紫背景・黄文字・monospace（80年代風）
- `digits` (任意): 表示桁数（デフォルト: 6、format=imageの場合のみ有効）
- `format` (任意): レスポンス形式
  - `text`: プレーンテキスト（数値のみ）
  - `image` (デフォルト): SVG画像

#### レスポンス
- `format=text`: 数値のみ（プレーンテキスト）
- `format=image`: SVG形式の画像

### 3. カウンター管理

```
GET /api/owner?action={ACTION}&url={URL}&token={TOKEN}&...
```

#### アクション

##### 値の設定
```
GET /api/owner?action=set&url={URL}&token={TOKEN}&total={TOTAL}
```
- `url` (必須): カウンターのURL
- `token` (必須): カウンターのオーナートークン
- `total`: 累計値を設定（任意、デフォルトは変更なし）
- 今日・昨日・週間・月間の値は日別データから自動計算されるため設定不可

## 使用例

### 1. カウンターの設置手順

#### ステップ1: カウンターを作成してIDを取得
```javascript
// ブラウザのコンソールまたは別途実行
fetch('/api/count?url=https://myblog.com&token=my-secret-token')
  .then(r => r.json())
  .then(data => console.log('公開ID:', data.id));
// 結果: 公開ID: blog-a7b9c3d4
```

#### ステップ2: HTMLに埋め込み
```html
<script src="https://nostalgic-counter.vercel.app/components/counter.js"></script>
<nostalgic-counter 
  id="blog-a7b9c3d4"
  type="total"
  style="classic">
</nostalgic-counter>
```

これだけで：
- カウンターの表示
- 訪問のカウントアップ
- 24時間の重複防止

すべてが自動的に処理されます。

### 2. 複数カウンターの設置

```html
<!-- 総訪問数 -->
<nostalgic-counter id="blog-a7b9c3d4" type="total" style="classic"></nostalgic-counter>

<!-- 今日の訪問数（同じIDなのでカウントアップは発生しない） -->
<nostalgic-counter id="blog-a7b9c3d4" type="today" style="modern"></nostalgic-counter>

<!-- 今週の訪問数（同じIDなのでカウントアップは発生しない） -->
<nostalgic-counter id="blog-a7b9c3d4" type="week" style="retro"></nostalgic-counter>
```

注：同じページ内で同じIDの組み合わせは、最初の1回だけカウントアップされます。

### 3. カウンターの値を変更

```javascript
// カウンターを0にリセット
fetch('/api/owner?action=set&url=https://myblog.com&token=my-secret-token&total=0')
  .then(response => response.json())
  .then(data => console.log('リセット完了:', data));

// 累計を10000に設定
fetch('/api/owner?action=set&url=https://myblog.com&token=my-secret-token&total=10000')
  .then(response => response.json())
  .then(data => console.log('設定完了:', data));
```

## セキュリティ

### トークンの管理
- オーナートークンは作成者のみが知る秘密情報
- 管理操作時のみ使用、HTMLには埋め込まない
- 公開IDは知られても問題なし（表示・カウントのみ可能）
- HTTPSの使用を推奨

### 重複カウント防止
- 同一IP・UserAgentからの24時間以内の重複アクセスは無視
- これにより、リロードによる不正なカウントアップを防止

## 制限事項

### 実装環境
- **ホスティング**: Vercel（Next.js）
- **データベース**: Vercel KV（Redis互換）
- **利点**: 高速なKey-Value操作、アトミックなカウントアップ

### 今後の拡張予定
- レート制限の実装
- CORS設定の追加
- 統計機能の拡充
- 管理画面の追加