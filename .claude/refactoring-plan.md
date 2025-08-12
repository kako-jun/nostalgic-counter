# 総合サービス化に向けたリファクタリング案

## 1. 目的
単一目的の「Nostalgic Counter」から、複数の兄弟サービス（カウンター、いいね、ランキング、BBS）を統合的に提供するプラットフォームへと進化させる。そのために、各サービスが対等な立場で拡張・管理できるような、一貫性のあるアーキテクチャに再設計する。

## 2. 基本方針
- **モノレポ構成**: 現在のリポジトリをそのまま活用し、全サービスのコードを単一リポジトリで管理する。
- **APIの統一**: `/api/{service}/{action}` のような、サービス名を第一階層に持つ、統一されたAPIエンドポイントを設計する。
- **ロジックの共通化**: `src/lib` 以下のDB接続、ID生成、認証、重複防止などのコアロジックは、全サービスで共有する。
- **DBの分離**: 単一のRedisインスタンス内で、サービスごとに明確なキープレフィックスを使い、データを論理的に分離する。

## 3. API設計案
既存のGETリクエストのみの制約と、`action`パラメータによる操作の振り分けパターンを踏襲します。秘密トークンと公開IDの仕組みは全サービスで共通とします。

**すべての操作は明示的に `action` パラメータを指定する必要があります。**

| サービス | アクション | HTTPメソッド | URL | 説明 |
|:---|:---|:---:|:---|:---|
| **Nostalgic Counter** | 作成 | `GET` | `/api/counter?url={URL}&token={TOKEN}&action=create` | 新しいカウンターを作成 |
| | カウントアップ | `GET` | `/api/counter?id={ID}&action=increment` | 公開IDによるカウントアップとデータ取得 |
| | データ/画像取得 | `GET` | `/api/counter?id={ID}&action=display&type={TYPE}&style={STYLE}&format={FORMAT}` | カウンターの数値データまたは画像を取得 |
| | 値の設定 | `GET` | `/api/counter?url={URL}&token={TOKEN}&action=set&total={TOTAL}` | カウンターの値を直接設定（管理者用） |
| | | | | |
| **Nostalgic Like** | 作成 | `GET` | `/api/like?url={URL}&token={TOKEN}&action=create` | いいね対象作成 |
| | いいねする | `GET` | `/api/like?id={ID}&action=increment` | 公開IDによるいいねとデータ取得 |
| | データ/画像取得 | `GET` | `/api/like?id={ID}&action=display&type={TYPE}&style={STYLE}&format={FORMAT}` | いいねの数値データまたは画像を取得 |
| | 値の設定 | `GET` | `/api/like?url={URL}&token={TOKEN}&action=set&total={TOTAL}` | いいねの値を直接設定（管理者用） |
| | | | | |
| **Nostalgic Ranking** | 作成 | `GET` | `/api/ranking?url={URL}&token={TOKEN}&action=create` | ランキングボード作成 |
| | スコア送信 | `GET` | `/api/ranking?url={URL}&token={TOKEN}&action=submit&score={SCORE}&name={NAME}` | スコアを送信し、ランキングを更新 |
| | ランキング取得 | `GET` | `/api/ranking?id={ID}&action=get&limit={LIMIT}` | ランキングデータを取得 |
| | | | | |
| **Nostalgic BBS** | 作成 | `GET` | `/api/bbs?url={URL}&token={TOKEN}&action=create` | 掲示板作成 |
| | メッセージ投稿 | `GET` | `/api/bbs?url={URL}&token={TOKEN}&action=post&message={MESSAGE}&author={AUTHOR}` | メッセージを投稿 |
| | メッセージ取得 | `GET` | `/api/bbs?id={ID}&action=get&page={PAGE}` | メッセージ一覧を取得 |

## 4. ディレクトリ構成案
API設計の変更に伴い、`src/app/api/` 以下のディレクトリ構造を簡素化します。各サービスのエンドポイントは、基本的にそのサービス名のルートディレクトリの `route.ts` で `action` パラメータを処理する形とします。

```
src/app/api/
├── counter/
│   └── route.ts                  # GET /api/counter (全アクションを処理)
├── like/
│   └── route.ts                  # GET /api/like (全アクションを処理)
├── ranking/
│   └── route.ts                  # GET /api/ranking (全アクションを処理)
└── bbs/
    └── route.ts                  # GET /api/bbs (全アクションを処理)
```

- `src/lib`: `db.ts` は各サービスのデータ構造（Sorted Set, Listなど）に合わせた操作関数を追加する。
- `src/types`: サービスごとに `counter.ts`, `like.ts`, `ranking.ts`, `bbs.ts` のように型定義を分離する。

## 5. DB設計（Redisスキーマ案）
キーの衝突を避けるため、サービス名をプレフィックスとして利用する。

### 5.1 ID生成とキー戦略

- **データ分離**: 各サービスはRedis上で独立したキー空間を使用します。これは、`counter:{id}:...`、`like:{id}:...`、`ranking:{id}:...`、`bbs:{id}:...` のように、サービス名をプレフィックスとしたRedisキーを使用することで実現されます。これにより、データは論理的に分離され、互いに干渉しません。

- **公開IDの形式**:
  - 公開ID（`id`パラメータとして使用されるもの）は、現在のカウンターと同様に `{識別子}-{ハッシュ8桁}` の形式（例: `blog-a7b9c3d4`）を維持します。
  - この公開ID自体にサービス名（例: `counter-` や `like-`）のプレフィックスを含める必要はありません。なぜなら、APIエンドポイント（例: `/api/counter` や `/api/like`）が既にどのサービスに対するリクエストであるかを明確に示しているためです。
  - **いいねのID運用**: カウンターと同様に、いいねの対象（例: 記事URL、コメントIDなど）を `url` パラメータとして渡し、それに対応する公開IDを生成します。これにより、1つのサイト内で複数のいいね対象を管理できます（例: `article1-hash`, `comment2-hash`）。既存のID生成ロジックをそのまま流用可能です。

- **BBSのデータ構造**: BBSのような複雑なサービスでは、単一のRedisキープレフィックスの下で、複数のRedisデータ構造（例: 投稿リスト用の `LIST`、投稿メタデータ用の `HASH`、ユーザー情報用の `HASH` など）を組み合わせて使用します。これはリレーショナルデータベースにおける複数のテーブルに相当します。

- **Counter**: `counter:{id}:total`, `visit:counter:{id}:{hash}`
- **Like**: `like:{id}:total`, `visit:like:{id}:{hash}`
- **Ranking**: `ranking:{id}:scores` (Sorted Set)
- **BBS**: `bbs:{id}:posts` (List), `bbs:{id}:meta` (Hash)

## 6. 移行ステップ案
1. **ディレクトリ作成**: 上記構成案に基づき、`src/app/api` 以下に新しいディレクトリを作成する。
2. **カウンター機能の移行**: 既存のカウンターロジックを、新しいAPIパス (`/api/counter/...`) に移設・改修する。
3. **フロントエンドの更新**: 既存のWeb Component (`display.js`) が新しいカウンターAPIを叩くように修正する。
4. **旧APIの削除**: 動作確認後、古いAPI (`/api/count`, `/api/display`, `/api/owner`) を削除する。
5. **新規サービスの実装**: 「いいね」「ランキング」「BBS」を、新しい設計規則に沿って実装する。

## 7. フロントエンド・UX設計案
### 方針
- **単一ドメイン、複数ページ構成**: 兄弟サービスとしての統一感を出すため、現在のドメインのまま、サービスごとにデモ・解説ページを設ける。
  - `/` -> 総合ランディングページ
  - `/counter` -> カウンターのデモページ
  - `/like` -> いいねボタンのデモページ
  - `/ranking` -> ランキングのデモページ
- **共通レイアウトとナビゲーション**: Next.jsのLayout機能を活用し、サイト全体で共通のヘッダー・フッターと、全サービスへ移動できるサイドバーを設置する。
- **プロジェクト名の再検討**: 
  - **ブランド名**: 「Nostalgic」そのものをブランド名として確立する。
  - **各サービス名**: 「Nostalgic Counter」「Nostalgic Like」「Nostalgic Ranking」「Nostalgic BBS」のように、ブランド名＋サービス名とする。
  - **リポジトリ名**: `nostalgic-suite` や `nostalgic-tools` など、複数のサービスを含むことを示す名前に変更することを推奨する。
  - **ドメイン名**: `nostalgic.llll-ll.com` や `nostalgic-suite.llll-ll.com` など、ブランド名を冠したドメインへの変更を検討する。

### ディレクトリ構成案 (Page)
```
src/app/
├── (pages)/                  # 共通レイアウトを適用するページグループ
│   ├── counter/
│   │   └── page.tsx          # /counter
│   ├── like/
│   │   └── page.tsx          # /like
│   └── ranking/
│       └── page.tsx          # /ranking
│
├── layout.tsx                # ルートレイアウト（<html>, <body>など）
├── page.tsx                  # 総合ランディングページ (/)
└── globals.css
```

## 8. ドキュメンテーション戦略
プロジェクトの多機能化に伴い、ドキュメンテーションも整理し、ユーザーや開発者が目的の情報にアクセスしやすくする。

- **`README.md`**: 
  - プロジェクト全体の概要、コンセプト（Nostalgicブランド）、提供する4つのサービス（Counter, Like, Ranking, BBS）の簡単な紹介に特化する。
  - 各サービスの詳細ドキュメントやデモページへのリンクを配置する、エントリポイントとしての役割を担う。
  - 開発環境のセットアップ方法など、プロジェクト全体に関わる基本的な情報もここに記載する。

- **`docs/` ディレクトリ**: 
  - 各サービスの詳細なドキュメントを格納する。
  - 例: `docs/counter.md`, `docs/like.md`, `docs/ranking.md`, `docs/bbs.md`
  - API仕様、Web Componentの埋め込み方法、データ構造、具体的な使用例などをサービスごとに詳細に記述する。
  - 既存の `docs/API.md` や `README_ja.md` の内容は、この新しい構造に合わせて再配置・統合を検討する。