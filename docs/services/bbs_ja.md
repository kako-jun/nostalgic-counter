# BBSサービス API

## 概要

カスタマイズ可能なドロップダウン選択、アイコンサポート、投稿者によるメッセージ編集機能を持つメッセージボードサービス。

## アクション

### create
新しいBBSメッセージボードを作成。

```
GET /api/bbs?action=create&url={URL}&token={TOKEN}&max={MAX_MESSAGES}&perPage={PER_PAGE}&icons={ICONS}&select1Label={LABEL}&select1Values={VALUES}
```

**パラメータ:**
- `url` (必須): BBS対象URL
- `token` (必須): オーナートークン（8-16文字）
- `max` (オプション): 最大メッセージ数（1-10000、デフォルト: 1000）
- `perPage` (オプション): 1ページあたりのメッセージ数（1-100、デフォルト: 10）
- `icons` (オプション): 利用可能アイコン（カンマ区切り、最大20個）
- `select1Label`, `select1Values`, `select1Required`: 第1ドロップダウン設定
- `select2Label`, `select2Values`, `select2Required`: 第2ドロップダウン設定
- `select3Label`, `select3Values`, `select3Required`: 第3ドロップダウン設定

### post
BBSに新しいメッセージを投稿。

```
GET /api/bbs?action=post&url={URL}&token={TOKEN}&author={AUTHOR}&message={MESSAGE}&icon={ICON}&select1={VALUE1}
```

**パラメータ:**
- `url` (必須): 対象URL
- `token` (必須): オーナートークン
- `author` (オプション): 投稿者名（デフォルト: "名無しさん"、最大50文字）
- `message` (必須): メッセージ内容（最大1000文字）
- `icon` (オプション): 選択されたアイコン
- `select1`, `select2`, `select3` (オプション): ドロップダウン選択

### update
自分のメッセージを更新（投稿者確認が必要）。

```
GET /api/bbs?action=update&url={URL}&messageId={MESSAGE_ID}&message={NEW_MESSAGE}
```

**パラメータ:**
- `url` (必須): 対象URL
- `messageId` (必須): 更新するメッセージID
- `message` (必須): 新しいメッセージ内容

### remove
メッセージを削除（オーナーまたは投稿者が削除可能）。

```
GET /api/bbs?action=remove&url={URL}&token={TOKEN}&messageId={MESSAGE_ID}
```

**パラメータ:**
- `url` (必須): 対象URL
- `token` (オプション): オーナートークン（提供されればオーナーは任意のメッセージを削除可能）
- `messageId` (必須): 削除するメッセージID

### clear
すべてのメッセージをクリア（オーナーのみ）。

```
GET /api/bbs?action=clear&url={URL}&token={TOKEN}
```

### get
BBSメッセージを取得（公開アクセス）。

```
GET /api/bbs?action=get&id={ID}&page={PAGE}
```

**パラメータ:**
- `id` (必須): 公開BBS ID
- `page` (オプション): ページ番号（デフォルト: 1）

## 使用例

### 基本的なBBS設置
```javascript
// 1. カスタムオプション付きBBS作成
const response = await fetch(`/api/bbs?action=create&url=https://mysite.com&token=my-secret&max=500&perPage=20&icons=😀,😎,😍,🤔,😢&select1Label=国&select1Values=日本,アメリカ,イギリス&select2Label=トピック&select2Values=一般,技術,ゲーム`)

const data = await response.json()
console.log('BBS ID:', data.id)

// 2. メッセージ投稿
await fetch('/api/bbs?action=post&url=https://mysite.com&token=my-secret&author=太郎&message=みなさんこんにちは！&icon=😀&select1=日本&select2=一般')
```

### メッセージ管理
```javascript
// 自分のメッセージ更新（同じIP+UserAgentが必要）
await fetch('/api/bbs?action=update&url=https://mysite.com&messageId=abc123def456&message=更新されたメッセージ！')

// メッセージ削除（オーナーまたは投稿者）
await fetch('/api/bbs?action=remove&url=https://mysite.com&token=my-secret&messageId=abc123def456')

// 全メッセージクリア（オーナーのみ）
await fetch('/api/bbs?action=clear&url=https://mysite.com&token=my-secret')
```

## カスタマイズオプション

### アイコン選択
```
&icons=😀,😎,😍,🤔,😢,😊,😭,😡,😱,🤗
```
- 最大20個のアイコン
- ユーザーは投稿時に選択可能

### ドロップダウン選択
```
&select1Label=国&select1Values=日本,アメリカ,イギリス,フランス,ドイツ&select1Required=true
&select2Label=カテゴリ&select2Values=一般,技術,ゲーム,音楽
&select3Label=優先度&select3Values=高,中,低
```
- 最大3つの設定可能ドロップダウン
- それぞれ最大50個のオプション
- 必須選択として指定可能

## 特徴

- **投稿者確認**: ユーザーは自分の投稿を編集/削除可能
- **オーナー管理**: BBSオーナーは任意のメッセージを削除可能
- **カスタマイズ可能オプション**: アイコンとドロップダウン選択
- **ページネーション**: 効率的なメッセージ閲覧
- **メッセージ履歴**: 投稿作成と更新時刻を追跡
- **プライバシー保護**: IPアドレスはハッシュ化

## データ構造

メッセージはRedis ListにJSON形式で保存：
- 最新メッセージが先頭（LPUSH）
- 最大メッセージ数を超えると自動トリム
- IP+UserAgentハッシュによる投稿者確認

## Web Component 統合

```html
<script src="https://nostalgic.llll-ll.com/components/bbs.js"></script>

<!-- インタラクティブBBS表示 -->
<nostalgic-bbs id="yoursite-a7b9c3d4" theme="classic" page="1"></nostalgic-bbs>

<!-- テキスト形式BBS -->
<nostalgic-bbs id="yoursite-a7b9c3d4" format="text" theme="modern" page="1"></nostalgic-bbs>
```

**属性:**
- `id`: 公開BBS ID
- `theme`: 表示スタイル（classic, modern, retro）
- `page`: 表示ページ番号（デフォルト: 1）
- `format`: 表示形式（interactive, text）- デフォルト: interactive
- `api-base`: カスタムAPIベースURL（オプション）

## TypeScript サポート

TypeScriptプロジェクトでWeb Componentsを使用する場合、プロジェクトルートに `types.d.ts` ファイルを作成してください：

```typescript
// types.d.ts
import 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'nostalgic-bbs': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        id?: string;
        theme?: 'classic' | 'modern' | 'retro';
        page?: string;
      };
    }
  }
}
```

これにより、React/Next.jsプロジェクトでWeb Componentsを使用してもTypeScriptビルドエラーが発生しません。

## セキュリティ注意事項

- IP+UserAgentハッシュによるメッセージ投稿者確認
- BBS作成と管理にはオーナートークンが必要
- 投稿者は自分のメッセージのみ編集可能
- プライバシーのためIPアドレスはハッシュ化
- メッセージ内容は1000文字制限