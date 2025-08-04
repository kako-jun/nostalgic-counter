# Nostalgic Counter API仕様書

## 概要

Nostalgic Counterは、昔のインターネットで使われていたアクセスカウンターを現代の技術で再現したサービスです。
任意のWebサイトに設置可能で、訪問者数を記録・表示します。

## 重要な注意事項

### URLパラメータについて
`url`パラメータは**カウンターの識別子**として使用されるだけで、他人のWebサイトを追跡するものではありません。URL+トークンの組み合わせごとに別々のカウンターが作成され、あなたの秘密トークンでのみ管理できます。異なるページに別々のカウンターが欲しい場合は、異なるURLを使用してください（例：`https://yoursite.com/blog`、`https://yoursite.com/about`）。

### サービス利用について
- **提供サービス**: `https://nostalgic-counter.llll-ll.com` を使用（設定不要）
- **セルフホスティング**: 自分でVercelにデプロイすることも可能

### 練習モード
実際にカウンターを作って動作を確認してみましょう！以下の手順で試せます：

#### 1. カウンターを作成
まずはカウンターを作成して公開IDを取得します。ブラウザのアドレスバーに直接入力してください：
```
https://nostalgic-counter.llll-ll.com/api/count?url=https://demo.example.com&token=demo-secret-123
```
→ ブラウザにJSONが表示され、`"id": "demo-562a8fd7"`という公開IDが確認できます

#### 2. カウントアップを確認
取得した公開IDを使ってカウントアップします：
```
https://nostalgic-counter.llll-ll.com/api/count?id=demo-562a8fd7
```
→ アクセスするたびに`"total"`の値が増えます（24時間の重複防止あり）

#### 3. 画像として表示
カウンターを画像として確認：
```
https://nostalgic-counter.llll-ll.com/api/display?id=demo-562a8fd7&type=total&style=classic
```
→ 昔懐かしい黒背景に緑文字のカウンター画像が表示されます

#### 4. テキストとして表示
数値だけを取得：
```
https://nostalgic-counter.llll-ll.com/api/display?id=demo-562a8fd7&type=total&format=text
```
→ 現在のカウント数がテキストで表示されます

#### 5. 管理操作（値の設定）
最後に管理者権限で値を変更してみます：
```
https://nostalgic-counter.llll-ll.com/api/owner?action=set&url=https://demo.example.com&token=demo-secret-123&total=12345
```
→ カウンターの値が12345に設定されます

これらのURLはすべてブラウザで直接アクセスできるので、気軽に試してみてください！

## パラメータ一覧

### カウンタータイプ（type）
- `total` - 累計訪問者（デフォルト）
- `today` - 今日の訪問者
- `yesterday` - 昨日の訪問者
- `week` - 直近7日間
- `month` - 直近30日間

### スタイル（style）
- `classic` - 黒背景に緑文字（90年代ターミナル風）
- `modern` - グレー背景に白文字（2000年代クリーン風）
- `retro` - 紫背景に黄文字（80年代ネオン風）

### その他のパラメータ
- `digits` - 表示桁数（デフォルト: 6）
- `format` - レスポンス形式（`text`または`image`、デフォルト: `image`）

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
GET /api/display?id={ID}&type={TYPE}&style={STYLE}&digits={DIGITS}&format={FORMAT}
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

**Web Component（シンプル）**
```html
<script src="https://nostalgic-counter.llll-ll.com/components/display.js"></script>
<nostalgic-counter 
  id="blog-a7b9c3d4"
  type="total"
  theme="classic">
</nostalgic-counter>
```

**手動制御（カスタム）**
```html
<!-- 画像のみ表示（自動カウントなし） -->
<img src="https://nostalgic-counter.llll-ll.com/api/display?id=blog-a7b9c3d4&type=total&style=classic" alt="カウンター" />

<!-- またはJavaScriptで手動カウント -->
<script>
  // 訪問をカウントして現在値を表示
  fetch('https://nostalgic-counter.llll-ll.com/api/count?id=blog-a7b9c3d4')
    .then(response => response.json())
    .then(data => console.log('現在のカウント:', data.total));
</script>
```

Web Componentを使用した場合：
- カウンターの表示
- 訪問のカウントアップ
- 24時間の重複防止

すべてが自動的に処理されます。

#### TypeScriptプロジェクトでの追加設定

TypeScriptを使用している場合は、カスタム要素の型定義を追加する必要があります。

**Next.js 15 + React 19の場合** (推奨)：
```typescript
// types.d.ts をプロジェクトルートに作成
import 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'nostalgic-counter': {
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

**従来のReactプロジェクトの場合**：
```typescript
// globals.d.ts または適切な型定義ファイルに追加
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'nostalgic-counter': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        id?: string;
        type?: string;
        theme?: string;
        digits?: string;
        scale?: string;
      }, HTMLElement>;
    }
  }
}
```

型定義ファイルを作成後、`tsconfig.json`の`include`に追加してください：
```json
{
  "include": [
    "next-env.d.ts",
    "types.d.ts",
    "**/*.ts",
    "**/*.tsx"
  ]
}
```

この設定により、TypeScriptの型チェックエラーが解消されます。通常のJavaScript/HTMLプロジェクトでは不要です。

### 2. 複数カウンターの設置

```html
<!-- 総訪問数 -->
<nostalgic-counter id="blog-a7b9c3d4" type="total" theme="classic"></nostalgic-counter>

<!-- 今日の訪問数（同じIDなのでカウントアップは発生しない） -->
<nostalgic-counter id="blog-a7b9c3d4" type="today" theme="modern"></nostalgic-counter>

<!-- 今週の訪問数（同じIDなのでカウントアップは発生しない） -->
<nostalgic-counter id="blog-a7b9c3d4" type="week" theme="retro"></nostalgic-counter>
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

#### 累計リセット時の推奨事項
累計値をリセットする際は、**月間カウント以上の値に設定することを推奨**します。これは、週間・月間カウントが過去の日別データから計算されるため、累計を0や小さい値にリセットすると「累計 < 月間」という見た目上の矛盾が生じるためです。

例：月間カウントが100の場合、累計は100以上に設定することで自然な表示になります。

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
- **データベース**: Redis Cloud
- **利点**: 高速なKey-Value操作、アトミックなカウントアップ

### 今後の拡張予定
- レート制限の実装
- CORS設定の追加
- 統計機能の拡充
- 管理画面の追加