# Redis管理スクリプト

このディレクトリには、Redisデータベースを管理するための便利なスクリプトが含まれています。

## 使い方

### 1. 全データを表形式で表示
```bash
npm run redis:show
```
- カウンター一覧
- 日別データ
- URLマッピング
- アクティブな訪問記録
- メモリ使用量

### 2. Redisサーバー情報を表示
```bash
npm run redis:info
```
- サーバーバージョン
- メモリ使用量
- 接続クライアント数
- 統計情報

### 3. カウンターの不整合を修正
```bash
npm run redis:fix nostalgi-5e343478
```
- 日別データの合計と累計値の不整合を修正
- 例：累計が0なのに日別が10ある場合

## 環境変数

すべてのスクリプトは`REDIS_URL`環境変数が必要です：

```bash
# ローカル実行時
REDIS_URL="redis://..." npm run redis:show

# .env.localに設定済みの場合
npm run redis:show
```