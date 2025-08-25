# ランキングサービス API

## 概要

自動ソート、スコア管理、設定可能なエントリー制限を持つスコアリーダーボードシステム。

## アクション

### create
新しいランキングリーダーボードを作成。

```
GET /api/ranking?action=create&url={URL}&token={TOKEN}&max={MAX_ENTRIES}
```

**パラメータ:**
- `url` (必須): ランキング対象URL
- `token` (必須): オーナートークン（8-16文字）
- `max` (オプション): 最大エントリー数（1-1000、デフォルト: 100）

### submit
ランキングに新しいスコアを送信（公開アクセス）。

```
GET /api/ranking?action=submit&id={ID}&name={PLAYER_NAME}&score={SCORE}
```

**パラメータ:**
- `id` (必須): 公開ランキングID
- `name` (必須): プレイヤー名（最大20文字）
- `score` (必須): スコア値（整数）

### update
既存プレイヤーのスコアを更新。

```
GET /api/ranking?action=update&url={URL}&token={TOKEN}&name={PLAYER_NAME}&score={NEW_SCORE}
```

### remove
特定のプレイヤーのスコアを削除。

```
GET /api/ranking?action=remove&url={URL}&token={TOKEN}&name={PLAYER_NAME}
```

### clear
ランキングからすべてのスコアをクリア。

```
GET /api/ranking?action=clear&url={URL}&token={TOKEN}
```

### get
ランキングデータを取得（公開アクセス）。

```
GET /api/ranking?action=get&id={ID}&limit={LIMIT}
```

**パラメータ:**
- `id` (必須): 公開ランキングID
- `limit` (オプション): 返却エントリー数（1-100、デフォルト: 10）

## 使用例

### 基本的なランキング設置
```javascript
// 1. ランキング作成
const response = await fetch('/api/ranking?action=create&url=https://mygame.com&token=game-secret&max=50')
const data = await response.json()
console.log('ランキングID:', data.id)

// 2. スコア送信（公開IDを使用）
await fetch('/api/ranking?action=submit&id=' + data.id + '&name=Alice&score=1000')
await fetch('/api/ranking?action=submit&id=' + data.id + '&name=Bob&score=1200')

// 3. リーダーボード取得
const ranking = await fetch('/api/ranking?action=get&id=mygame-a7b9c3d4&limit=10')
const leaderboard = await ranking.json()
console.log('上位プレイヤー:', leaderboard.entries)
```

### スコア管理
```javascript
// プレイヤースコア更新
await fetch('/api/ranking?action=update&url=https://mygame.com&token=game-secret&name=Alice&score=1500')

// 不正プレイヤー削除
await fetch('/api/ranking?action=remove&url=https://mygame.com&token=game-secret&name=Cheater')

// 全スコアクリア（シーズンリセット）
await fetch('/api/ranking?action=clear&url=https://mygame.com&token=game-secret')
```

## 特徴

- **自動ソート**: スコアが降順で自動ソート
- **エントリー制限**: 設定可能な最大エントリー数
- **スコア管理**: 個別スコアの送信・更新・削除
- **一括操作**: すべてのスコアを一度にクリア
- **リアルタイム更新**: 即座のリーダーボード更新
- **公開アクセス**: 公開IDでランキング閲覧

## データ構造

ランキングは効率的なソートのためRedis Sorted Setを使用：
- スコアは自動的に降順ソート
- 最大エントリー数を超えると最低スコアが削除
- スコア操作はO(log N)性能

## セキュリティ注意事項

- ランキングオーナーのみがスコア送信/変更可能
- 公開IDはリーダーボードの読み取り専用アクセス
- プレイヤー名は20文字制限
- スコア値は整数のみ