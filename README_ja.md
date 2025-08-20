# Nostalgic

*[English version here](README.md)*

90年代のインターネット文化から懐かしいWebツール（カウンター・いいね・ランキング・BBS）を最新技術で復活させた総合プラットフォームです。昔の個人ホームページに必須だった4つのサービスを現代に蘇らせました。

## ✨ サービス

### 📊 カウンターサービス
- 複数期間統計: 累計・今日・昨日・週間・月間の表示
- 24時間重複防止機能
- 3つの懐かしい表示スタイル: クラシック・モダン・レトロ
- Web Components による簡単埋め込み

### 💖 いいねサービス
- トグル型いいね/取り消し機能
- ユーザー状態管理（IP + UserAgent）
- 現在の状態で即座にフィードバック

### 🏆 ランキングサービス  
- 自動ソート機能付きスコアリーダーボード
- スコア管理（送信・更新・削除）
- 設定可能なエントリー制限
- リアルタイムランキング更新

### 💬 BBSサービス
- ページネーション機能付きメッセージボード
- カスタマイズ可能なドロップダウン選択
- 投稿者による自分のメッセージ編集
- 投稿用アイコン選択

## ✨ 共通機能

- 🚫 **登録不要**: URLと秘密トークンだけで利用開始
- 🔒 **安全な所有権管理**: SHA256ハッシュ化トークン、公開IDシステム
- 🌐 **簡単統合**: アクションパラメータ付きRESTful API
- ⚡ **高速・信頼性**: Next.js + Redis で構築
- 🔗 **純粋なGET API**: すべての操作がブラウザのURL欄で実行可能（1990年代Web文化の復活）

## 🚀 クイックスタート

### カウンターサービス

1. **カウンター作成**:
```
https://nostalgic.llll-ll.com/api/counter?action=create&url=https://yoursite.com&token=your-secret-token
```

2. **サイトに埋め込み**:
```html
<script src="https://nostalgic.llll-ll.com/components/visit.js"></script>
<nostalgic-counter id="yoursite-a7b9c3d4" type="total" theme="classic"></nostalgic-counter>
```

### いいねサービス

1. **いいねボタン作成**:
```
https://nostalgic.llll-ll.com/api/like?action=create&url=https://yoursite.com&token=your-secret-token
```

2. **いいねトグル**:
```
https://nostalgic.llll-ll.com/api/like?action=toggle&url=https://yoursite.com&token=your-secret-token
```

### ランキングサービス

1. **ランキング作成**:
```
https://nostalgic.llll-ll.com/api/ranking?action=create&url=https://yoursite.com&token=your-secret-token&max=100
```

2. **スコア送信**:
```
https://nostalgic.llll-ll.com/api/ranking?action=submit&url=https://yoursite.com&token=your-secret-token&name=Player1&score=1000
```

### BBSサービス

1. **BBS作成**:
```
https://nostalgic.llll-ll.com/api/bbs?action=create&url=https://yoursite.com&token=your-secret-token&max=1000
```

2. **メッセージ投稿**（純粋なGET、1990年代スタイル）:
```
https://nostalgic.llll-ll.com/api/bbs?action=post&url=https://yoursite.com&token=your-secret-token&author=User&message=こんにちは！
```

## 🎮 デモを試す

インタラクティブデモページで各サービスをテスト:

- **[カウンターデモ](https://nostalgic.llll-ll.com/counter)** - カウンター作成と管理をテスト
- **[いいねデモ](https://nostalgic.llll-ll.com/like)** - いいね/取り消し機能を試す  
- **[ランキングデモ](https://nostalgic.llll-ll.com/ranking)** - スコア送信と管理
- **[BBSデモ](https://nostalgic.llll-ll.com/bbs)** - メッセージ投稿と編集

## 🔧 API アーキテクチャ

すべてのサービスは**GET リクエストのみ**の統一されたアクション型APIパターンに従います:

```
/api/{service}?action={action}&url={your-site}&token={your-token}&...params
```

### 🌐 なぜGETのみ？ 1990年代Web文化への回帰

オリジナルの1990年代Webツールと同じく、すべてブラウザのURL欄から直接操作できます:

1. **クリックで作成**: リンクを共有するだけでカウンターが作成
2. **URL ベース操作**: すべてのアクションが単純なGETリンク
3. **懐かしい簡単さ**: 複雑なフォームやPOSTリクエスト不要
4. **簡単共有**: すべての操作が共有可能なURL
5. **BBS文化**: メッセージ投稿もGETパラメータ、昔のままのスタイル

### サービス別利用可能アクション:

| サービス | アクション | 説明 |
|---------|---------|-------------|
| **Counter** | `create`, `increment`, `display`, `set` | 従来の訪問者カウンター |
| **Like** | `create`, `toggle`, `get` | いいね/取り消しボタン |
| **Ranking** | `create`, `submit`, `update`, `remove`, `clear`, `get` | スコアリーダーボード |
| **BBS** | `create`, `post`, `update`, `remove`, `clear`, `get` | メッセージボード |

## 📖 ドキュメント

- **[API リファレンス](docs/API_ja.md)** - 完全なAPI仕様書
- **[ライブデモ](https://nostalgic.llll-ll.com)** - 懐かしいホームページで実際に体験

## 🛡️ セキュリティとプライバシー

### 収集・保存するデータ:
- **サービスURL**（識別子のみ、追跡には使用しません）
- **秘密トークン**（SHA256でハッシュ化）
- **ユーザー識別**（IP + UserAgentハッシュ、重複防止と投稿者確認用）
- **サービスデータ**（カウント、いいね、スコア、メッセージ - 個人情報なし）

### 収集しないデータ:
- Cookieや追跡ピクセルなし
- 個人情報（名前、メールなど）なし
- 閲覧履歴やリファラーデータなし
- IPアドレスはプライバシー保護のためハッシュ化

### セキュリティ対策:
- 秘密トークンはハッシュ化して安全に保存
- 公開IDは表示/操作のみ、変更不可
- 一時的なIP+UserAgentハッシュによるユーザー識別
- メッセージ編集/削除のための投稿者確認

## 📜 ライセンス

MIT License - 自由に使用、変更、配布できます。

## 🌟 コントリビュート

Issue や Pull Request を歓迎します！一緒に懐かしいWebを復活させましょう。

---

*懐かしいWebへの愛を込めて ❤️*