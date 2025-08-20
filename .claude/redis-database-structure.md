# Redis Database Structure - Nostalgic Platform

## 概要
NostalgicプラットフォームのRedisデータベース構造の完全な仕様書。
各サービス（Counter, Like, Ranking, BBS）のデータ構造とキーパターンを記載。

## 重要：データ削除時の注意事項
**サービスを削除する際は、必ず以下の2つを削除すること：**
1. **URLマッピング** (`url:{service}:{encoded_url}`)
2. **サービスデータ** (メタデータ、関連データ)

## 共通構造

### URLマッピング（全サービス共通）
```
url:{service}:{encoded_url} → {service_id}
```
- **例**: `url:counter:https%3A%2F%2Fexample.com` → `example-a1b2c3d4`
- **重要**: URLはエンコードされて保存される
- **削除時**: 必ずこのマッピングも削除すること

### インデックス
```
{service}s:index → Sorted Set of service IDs
```
- **例**: `counters:index` → Sorted Set

## Counter Service

### データ構造
```
# URLマッピング
url:counter:{encoded_url} → {counter_id}

# メタデータ
counter:{id} → JSON {
  service: "counter",
  id: string,
  url: string,
  created: ISO8601,
  owner: hashed_token | null
}

# カウント総数
counter:{id}:total → number

# 日別カウント
counter:{id}:daily:{YYYY-MM-DD} → number

# オーナートークン（ハッシュ化）
counter:{id}:owner → hashed_token

# 訪問記録（24時間TTL）
visit:counter:{id}:{user_hash} → 1 (expires in 24h)
```

### 削除時の処理
1. `url:counter:{encoded_url}` を削除
2. `counter:{id}` を削除
3. `counter:{id}:*` パターンの全キーを削除
4. `visit:counter:{id}:*` パターンの全キーを削除
5. `counters:index` から ID を削除

## Like Service

### データ構造
```
# URLマッピング  
url:like:{encoded_url} → {like_id}

# メタデータ
like:{id} → JSON {
  service: "like",
  id: string,
  url: string,
  created: ISO8601,
  lastLike: ISO8601 | null,
  owner: hashed_token | null
}

# いいね総数
like:{id}:total → number

# ユーザー状態（24時間TTL）
like:{id}:users:{user_hash} → 1 (expires in 24h)

# オーナートークン（ハッシュ化）
like:{id}:owner → hashed_token
```

### 削除時の処理
1. `url:like:{encoded_url}` を削除
2. `like:{id}` を削除
3. `like:{id}:total` を削除
4. `like:{id}:users:*` パターンの全キーを削除
5. `like:{id}:owner` を削除
6. `likes:index` から ID を削除

## Ranking Service

### データ構造
```
# URLマッピング
url:ranking:{encoded_url} → {ranking_id}

# メタデータ
ranking:{id} → JSON {
  service: "ranking",
  id: string,
  url: string,
  created: ISO8601,
  maxEntries: number,
  owner: hashed_token | null
}

# スコアデータ（Sorted Set）
ranking:{id}:scores → Sorted Set {
  member: "{name}:{unique_id}",
  score: number
}

# オーナートークン（ハッシュ化）
ranking:{id}:owner → hashed_token

# メタデータ（追加設定）
ranking:{id}:meta → JSON {
  title?: string,
  description?: string
}
```

### 削除時の処理
1. `url:ranking:{encoded_url}` を削除
2. `ranking:{id}` を削除
3. `ranking:{id}:scores` を削除
4. `ranking:{id}:owner` を削除
5. `ranking:{id}:meta` を削除
6. `rankings:index` から ID を削除

## BBS Service

### データ構造
```
# URLマッピング
url:bbs:{encoded_url} → {bbs_id}

# メタデータ
bbs:{id} → JSON {
  service: "bbs",
  id: string,
  url: string,
  created: ISO8601,
  lastPost: ISO8601 | null,
  settings: {
    title?: string,
    maxMessages?: number,
    allowImages?: boolean,
    fields?: object
  },
  owner: hashed_token | null
}

# メッセージリスト（List）
bbs:{id}:messages → List of JSON {
  id: string,
  timestamp: ISO8601,
  author: string,
  message: string,
  icon?: string,
  selects?: object,
  userHash: string
}

# オーナートークン（ハッシュ化）
bbs:{id}:owner → hashed_token
```

### 削除時の処理
1. `url:bbs:{encoded_url}` を削除
2. `bbs:{id}` を削除
3. `bbs:{id}:messages` を削除
4. `bbs:{id}:owner` を削除
5. `bbses:index` から ID を削除

## 削除スクリプトの使い方

### 個別サービス削除
```bash
# カウンター削除
npm run cleanup:service counter {counter_id}

# いいね削除
npm run cleanup:service like {like_id}

# ランキング削除
npm run cleanup:service ranking {ranking_id}

# BBS削除
npm run cleanup:service bbs {bbs_id}
```

### 不正なレコード削除
```bash
# 特定のIDを指定して削除
npm run cleanup:invalid
```

## トラブルシューティング

### Q: サービスを削除したのにURL Mappingsに残っている
A: URLマッピング (`url:{service}:{encoded_url}`) の削除が漏れています。
   完全削除スクリプトを使用してください。

### Q: データの整合性を確認したい
A: `npm run redis:show` で全データを確認できます。

### Q: 特定のサービスのデータのみ確認したい
A: `npm run redis:service {service}` で確認できます。

## データ整合性チェックリスト

削除処理を実装する際は、以下を必ず確認：

- [ ] URLマッピングを削除したか
- [ ] メタデータを削除したか
- [ ] 関連データ（total, scores, messages等）を削除したか
- [ ] オーナートークンを削除したか
- [ ] インデックスから削除したか
- [ ] TTL付きデータ（visit, users）も考慮したか

## 参考：既存APIの削除処理

各サービスのAPIには削除機能が実装されています：
- `/api/visit?action=delete` (未実装だが構造は同じ)
- `/api/like?action=delete` (未実装だが構造は同じ)
- `/api/ranking?action=clear` (エントリークリア)
- `/api/bbs?action=clear` (メッセージクリア)

これらのAPIの実装を参考にスクリプトを作成してください。