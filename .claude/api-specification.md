# Nostalgic Platform - API Specification

## Base URL

```
https://nostalgic.llll-ll.com/api
```

## 共通仕様

### リクエスト形式

- **Method**: GET のみ（すべてブラウザのURL欄で操作可能）
- **Content-Type**: URLパラメータ

### レスポンス形式

#### 成功レスポンス

```typescript
{
  "success": true,
  "data": T,
  "message"?: string
}
```

#### エラーレスポンス

```typescript
{
  "success": false,
  "error": string,
  "code": string,
  "statusCode": number
}
```

### エラーコード

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | パラメータ検証エラー |
| `UNAUTHORIZED` | 403 | 認証エラー（トークン不正） |
| `NOT_FOUND` | 404 | リソースが見つからない |
| `BUSINESS_LOGIC_ERROR` | 422 | ビジネスロジックエラー |
| `STORAGE_ERROR` | 500 | ストレージエラー |

---

## Counter Service API

### 1. カウンター作成

サイトのカウンターを新規作成します。

**Endpoint**: `GET /api/counter?action=create`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `"create"` |
| `url` | string | Yes | サイトのURL |
| `token` | string | Yes | オーナートークン（8-16文字） |

**Example Request**:
```bash
curl "https://nostalgic.llll-ll.com/api/counter?action=create&url=https://example.com&token=mysecret123"
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": "example-a7b9c3d4",
    "url": "https://example.com"
  }
}
```

### 2. カウントアップ

カウンターを1増やします（24時間重複防止）。

**Endpoint**: `GET /api/counter?action=increment`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `"increment"` |
| `id` | string | Yes | カウンターID |

**Example Request**:
```bash
curl "https://nostalgic.llll-ll.com/api/counter?action=increment&id=example-a7b9c3d4"
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": "example-a7b9c3d4",
    "url": "https://example.com",
    "total": 123,
    "today": 45,
    "yesterday": 38,
    "week": 234,
    "month": 987,
    "created": "2025-08-01T10:00:00.000Z",
    "lastUpdated": "2025-08-18T15:30:00.000Z"
  }
}
```

### 3. カウンター表示

カウンターの値を取得します（SVG画像、JSON、テキスト形式）。

**Endpoint**: `GET /api/counter?action=display`

**Parameters**:
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `action` | string | Yes | - | `"display"` |
| `id` | string | Yes | - | カウンターID |
| `type` | string | No | `"total"` | 表示タイプ: `total`, `today`, `yesterday`, `week`, `month` |
| `format` | string | No | `"image"` | 出力形式: `image`, `json`, `text` |
| `theme` | string | No | `"classic"` | テーマ: `classic`, `modern`, `retro` (image形式のみ) |
| `digits` | number | No | `6` | 表示桁数: 1-10 (image形式のみ) |

**Example Requests**:

SVG画像取得:
```bash
curl "https://nostalgic.llll-ll.com/api/counter?action=display&id=example-a7b9c3d4&format=image&theme=retro"
```

JSON取得:
```bash
curl "https://nostalgic.llll-ll.com/api/counter?action=display&id=example-a7b9c3d4&format=json"
```

### 4. カウンター値設定

カウンターの値を指定値に設定します（オーナー権限必要）。

**Endpoint**: `GET /api/counter?action=set`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `"set"` |
| `url` | string | Yes | サイトのURL |
| `token` | string | Yes | オーナートークン |
| `total` | number | Yes | 設定する値（0以上） |

**Example Request**:
```bash
curl "https://nostalgic.llll-ll.com/api/counter?action=set&url=https://example.com&token=mysecret123&total=1000"
```

---

## Like Service API

### 1. いいねボタン作成

サイトのいいねボタンを新規作成します。

**Endpoint**: `GET /api/like?action=create`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `"create"` |
| `url` | string | Yes | サイトのURL |
| `token` | string | Yes | オーナートークン（8-16文字） |

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": "example-b8c2d5e9",
    "url": "https://example.com"
  }
}
```

### 2. いいね切り替え

いいねの状態を切り替えます（いいね/取り消し）。

**Endpoint**: `GET /api/like?action=toggle`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `"toggle"` |
| `id` | string | Yes | いいねボタンID |

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": "example-b8c2d5e9",
    "url": "https://example.com",
    "total": 42,
    "userLiked": true,
    "created": "2025-08-01T10:00:00.000Z",
    "lastLike": "2025-08-18T15:30:00.000Z"
  }
}
```

### 3. いいね状態取得

現在のいいね数とユーザーの状態を取得します。

**Endpoint**: `GET /api/like?action=get`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `"get"` |
| `id` | string | Yes | いいねボタンID |

---

## Ranking Service API

### 1. ランキング作成

新しいランキングを作成します。

**Endpoint**: `GET /api/ranking?action=create`

**Parameters**:
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `action` | string | Yes | - | `"create"` |
| `url` | string | Yes | - | サイトのURL |
| `token` | string | Yes | - | オーナートークン |
| `maxEntries` | number | No | `10` | 最大エントリー数（1-100） |
| `orderBy` | string | No | `"desc"` | 並び順: `desc`, `asc` |

### 2. スコア送信

ランキングに新しいスコアを送信します。

**Endpoint**: `GET /api/ranking?action=submit`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `"submit"` |
| `id` | string | Yes | ランキングID |
| `name` | string | Yes | プレイヤー名（1-50文字） |
| `score` | number | Yes | スコア |

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": "example-c9d3e6f0",
    "url": "https://example.com",
    "entries": [
      { "rank": 1, "name": "Alice", "score": 9999 },
      { "rank": 2, "name": "Bob", "score": 8500 },
      { "rank": 3, "name": "Charlie", "score": 7200 }
    ],
    "totalEntries": 3,
    "maxEntries": 10,
    "created": "2025-08-01T10:00:00.000Z"
  }
}
```

### 3. スコア更新

既存エントリーのスコアを更新します（オーナー権限必要）。

**Endpoint**: `GET /api/ranking?action=update`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `"update"` |
| `url` | string | Yes | サイトのURL |
| `token` | string | Yes | オーナートークン |
| `name` | string | Yes | プレイヤー名 |
| `score` | number | Yes | 新しいスコア |

### 4. エントリー削除

ランキングからエントリーを削除します（オーナー権限必要）。

**Endpoint**: `GET /api/ranking?action=remove`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `"remove"` |
| `url` | string | Yes | サイトのURL |
| `token` | string | Yes | オーナートークン |
| `name` | string | Yes | 削除するプレイヤー名 |

### 5. ランキング取得

ランキングデータを取得します。

**Endpoint**: `GET /api/ranking?action=get`

**Parameters**:
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `action` | string | Yes | - | `"get"` |
| `id` | string | Yes | - | ランキングID |
| `limit` | number | No | `10` | 取得件数（1-100） |

### 6. ランキングクリア

全エントリーを削除します（オーナー権限必要）。

**Endpoint**: `GET /api/ranking?action=clear`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `"clear"` |
| `url` | string | Yes | サイトのURL |
| `token` | string | Yes | オーナートークン |

---

## BBS Service API

### 1. 掲示板作成

新しい掲示板を作成します。

**Endpoint**: `GET /api/bbs?action=create`

**Parameters**:
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `action` | string | Yes | - | `"create"` |
| `url` | string | Yes | - | サイトのURL |
| `token` | string | Yes | - | オーナートークン |
| `messagesPerPage` | number | No | `10` | 1ページの表示件数（1-50） |
| `maxMessages` | number | No | `100` | 最大メッセージ数（1-1000） |
| `enableIcons` | boolean | No | `true` | アイコン機能の有効化 |
| `iconOptions` | string[] | No | デフォルトセット | 選択可能なアイコン |
| `enableSelects` | boolean | No | `false` | カスタムドロップダウンの有効化 |
| `selectOptions` | object | No | `{}` | ドロップダウンの選択肢 |

### 2. メッセージ投稿

掲示板にメッセージを投稿します。

**Endpoint**: `GET /api/bbs?action=post`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `"post"` |
| `id` | string | Yes | 掲示板ID |
| `author` | string | Yes | 投稿者名（1-50文字） |
| `message` | string | Yes | メッセージ（1-1000文字） |
| `icon` | string | No | アイコン |
| `select1` | string | No | カスタム選択1 |
| `select2` | string | No | カスタム選択2 |
| `select3` | string | No | カスタム選択3 |

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": "msg_1234567890",
    "author": "田中太郎",
    "message": "こんにちは！",
    "icon": "smile",
    "selects": {
      "select1": "東京",
      "select2": "晴れ"
    },
    "timestamp": "2025-08-18T15:30:00.000Z",
    "isOwner": false
  }
}
```

### 3. メッセージ編集

自分が投稿したメッセージを編集します。

**Endpoint**: `GET /api/bbs?action=update`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `"update"` |
| `id` | string | Yes | 掲示板ID |
| `messageId` | string | Yes | メッセージID |
| `message` | string | No | 新しいメッセージ |
| `icon` | string | No | 新しいアイコン |
| `select1` | string | No | 新しい選択1 |
| `select2` | string | No | 新しい選択2 |
| `select3` | string | No | 新しい選択3 |

### 4. メッセージ削除

メッセージを削除します（投稿者またはオーナー権限必要）。

**Endpoint**: `GET /api/bbs?action=remove`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `"remove"` |
| `id` | string | Yes | 掲示板ID |
| `messageId` | string | Yes | メッセージID |
| `url` | string | No* | サイトのURL（オーナー削除時） |
| `token` | string | No* | オーナートークン（オーナー削除時） |

*投稿者による削除の場合は不要

### 5. メッセージ一覧取得

掲示板のメッセージ一覧を取得します。

**Endpoint**: `GET /api/bbs?action=get`

**Parameters**:
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `action` | string | Yes | - | `"get"` |
| `id` | string | Yes | - | 掲示板ID |
| `page` | number | No | `1` | ページ番号 |

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": "example-d0e4f7g1",
    "url": "https://example.com",
    "messages": [
      {
        "id": "msg_1234567890",
        "author": "田中太郎",
        "message": "こんにちは！",
        "icon": "smile",
        "timestamp": "2025-08-18T15:30:00.000Z",
        "isOwner": false
      }
    ],
    "pagination": {
      "page": 1,
      "totalPages": 3,
      "totalMessages": 25,
      "hasNext": true,
      "hasPrev": false
    },
    "settings": {
      "messagesPerPage": 10,
      "maxMessages": 100,
      "enableIcons": true,
      "enableSelects": true
    }
  }
}
```

### 6. 全メッセージクリア

掲示板の全メッセージを削除します（オーナー権限必要）。

**Endpoint**: `GET /api/bbs?action=clear`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `action` | string | Yes | `"clear"` |
| `url` | string | Yes | サイトのURL |
| `token` | string | Yes | オーナートークン |

---

## 共通パラメータ

### 公開ID形式

各サービスのIDは以下の形式で生成されます：
```
{domain}-{hash8桁}
```

例:
- `blog-a7b9c3d4`
- `mysite-b8c2d5e9`

### トークン

- 長さ: 8-16文字
- 使用可能文字: 英数字、記号
- SHA256でハッシュ化して保存

### 日付形式

すべての日付はISO 8601形式：
```
2025-08-18T15:30:00.000Z
```

---

## 使用例

### Web Componentsでの利用

```html
<!-- カウンター表示 -->
<script src="https://nostalgic.llll-ll.com/components/display.js"></script>
<nostalgic-counter id="blog-a7b9c3d4" type="total" theme="retro"></nostalgic-counter>
```

### JavaScriptでの利用

```javascript
// カウンターをインクリメント
fetch('https://nostalgic.llll-ll.com/api/counter?action=increment&id=blog-a7b9c3d4')
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      console.log('Total count:', data.data.total)
    }
  })

// いいねトグル
fetch('https://nostalgic.llll-ll.com/api/like?action=toggle&id=blog-b8c2d5e9')
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      console.log('Liked:', data.data.userLiked)
      console.log('Total likes:', data.data.total)
    }
  })
```

### cURLでの利用

```bash
# ランキング作成
curl "https://nostalgic.llll-ll.com/api/ranking?action=create&url=https://mygame.com&token=mysecret123&maxEntries=20"

# スコア送信
curl "https://nostalgic.llll-ll.com/api/ranking?action=submit&id=mygame-c9d3e6f0&name=Player1&score=12345"
```

---

## レート制限

無料運用のため、以下の制限があります：

- リクエスト: 100req/分 per IP
- カウンター: 同一IPから24時間に1回のみカウント
- いいね: 同一ユーザーの状態は24時間保持
- BBS: 同一IPから1分に5投稿まで

## エラー時の対処

### 400 Bad Request

パラメータが不正です。エラーメッセージを確認してください。

### 403 Forbidden

トークンが間違っているか、権限がありません。

### 404 Not Found

指定されたIDのリソースが存在しません。

### 422 Unprocessable Entity

ビジネスロジックエラー（例：ランキングの最大エントリー数超過）

### 500 Internal Server Error

サーバーエラーです。時間をおいて再試行してください。