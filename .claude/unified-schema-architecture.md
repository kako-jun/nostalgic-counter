# 統一スキーマアーキテクチャ設計書

## 概要
Nostalgicプロジェクトにおける統一スキーマシステムの設計原則と実装ガイドライン。

## 設計原則

### 1. エンティティスキーマが唯一のマスター
- **原則**: すべてのデータ構造定義は、各ドメインのエンティティファイルで一元管理
- **禁止**: API層やサービス層での重複するスキーマ定義
- **マスターファイル**: `src/domain/{service}/{service}.entity.ts`

### 2. CommonSchemas vs FieldSchemas の分離

#### CommonSchemas（`src/lib/core/validation.ts`）
- **定義**: 全サービスで共通利用される汎用フィールド
- **含むもの**: 
  - 基本型（string, number, date, url等）
  - アプリケーション共通（publicId, token, theme等）
  - 制限値（shortText, mediumText等）
- **含まないもの**: サービス固有のフィールド定義

```typescript
export const CommonSchemas = {
  // ✅ 汎用基本型
  nonEmptyString: z.string().min(1),
  positiveInt: z.number().int().positive(),
  nonNegativeInt: z.number().int().min(0),
  url: z.string().url().refine(...),
  date: z.coerce.date(),
  
  // ✅ アプリケーション共通
  publicId: z.string().regex(PUBLIC_ID.PATTERN),
  token: z.string().min(TOKEN.MIN_LENGTH).max(TOKEN.MAX_LENGTH),
  
  // ❌ サービス固有は含まない
  // bbsMessage: z.string().max(200), // NG
  // rankingScore: z.number().min(0), // NG
} as const
```

#### FieldSchemas（各ドメインエンティティ内）
- **定義**: サービス固有のフィールド定義
- **命名**: `{Service}FieldSchemas`
- **責務**: そのサービスでのみ使用されるフィールドの定義

```typescript
// src/domain/bbs/bbs.entity.ts
export const BBSFieldSchemas = {
  bbsTitle: z.string().max(100),
  author: z.string().max(20),
  messageText: z.string().min(1).max(200),
  // ...
} as const

// src/domain/ranking/ranking.entity.ts  
export const RankingFieldSchemas = {
  playerName: z.string().min(1).max(50),
  score: CommonSchemas.nonNegativeInt, // 共通型の再利用はOK
  // ...
} as const
```

### 3. 生のZod定義の禁止

#### 許可される場所
- CommonSchemas内
- 各FieldSchemas内

#### 禁止される場所
- API層（`src/app/api/*/route.ts`）
- サービス層（`src/lib/validation/service-schemas.ts`）
- その他すべてのファイル

```typescript
// ❌ NG例
const schema = z.object({
  name: z.string().min(1).max(50), // 生のZod定義
  score: z.number().min(0)         // 生のZod定義
})

// ✅ OK例
const schema = z.object({
  name: RankingFieldSchemas.playerName,    // FieldSchemas参照
  score: RankingFieldSchemas.score         // FieldSchemas参照
})
```

## 実装パターン

### 新サービス追加時のチェックリスト

1. **エンティティファイル作成**
   ```
   src/domain/{service}/{service}.entity.ts
   ```

2. **FieldSchemas定義**
   ```typescript
   export const {Service}FieldSchemas = {
     // サービス固有フィールドのみ定義
     specificField: z.string().max(100),
     // 共通型は再利用
     commonField: CommonSchemas.nonNegativeInt,
   } as const
   ```

3. **エンティティスキーマ定義**
   ```typescript
   export const {Service}EntitySchema = z.object({
     id: CommonSchemas.publicId,
     url: CommonSchemas.url,
     created: CommonSchemas.date,
     specificField: {Service}FieldSchemas.specificField,
     // ...
   })
   ```

4. **型エクスポート**
   ```typescript
   export type {Service}EntityType = z.infer<typeof {Service}EntitySchema>
   // ...
   ```

### API層での参照パターン

```typescript
// src/app/api/{service}/route.ts
import { {Service}CreateParamsSchema } from '@/domain/{service}/{service}.entity'

// ✅ エンティティからのスキーマ参照のみ
const result = ValidationFramework.input({Service}CreateParamsSchema, data)
```

### サービス層での参照パターン

```typescript
// src/lib/validation/service-schemas.ts
import { BBSFieldSchemas } from '@/domain/bbs/bbs.entity'

// ✅ FieldSchemasの参照のみ、生のZod定義なし
export const BBSActionSchemas = {
  post: z.object({
    action: z.literal('post'),
    author: BBSFieldSchemas.author,
    message: BBSFieldSchemas.messageText,
    // ...
  }),
  // ...
}
```

## 違反チェック方法

### 1. CommonSchemasの純粋性チェック
```bash
# CommonSchemas内にサービス固有名が含まれていないか
grep -E "(bbs|ranking|counter|like)[A-Z]" src/lib/core/validation.ts
# 何も出力されなければOK
```

### 2. 生のZod定義チェック
```bash
# API層とサービス層に生のZod定義がないか
grep -E "z\.(string|number|boolean|array|object)\(" src/app/api/*/route.ts src/lib/validation/service-schemas.ts
# z.object()とz.literal()以外は出力されるべきでない
```

### 3. ビルドチェック
```bash
npm run build
# 型エラーが発生しないことを確認
```

## ファイル構成

```
src/
├── lib/
│   ├── core/
│   │   └── validation.ts          # CommonSchemas定義
│   └── validation/
│       └── service-schemas.ts     # API用スキーマ（FieldSchemas参照のみ）
└── domain/
    ├── bbs/
    │   └── bbs.entity.ts          # BBSFieldSchemas + エンティティスキーマ
    ├── ranking/
    │   └── ranking.entity.ts      # RankingFieldSchemas + エンティティスキーマ
    ├── counter/
    │   └── counter.entity.ts      # CounterFieldSchemas + エンティティスキーマ
    └── like/
        └── like.entity.ts         # LikeFieldSchemas + エンティティスキーマ
```

## 利点

1. **単一責任原則**: 各スキーマの責務が明確
2. **DRY原則**: 重複定義の排除
3. **保守性**: 変更時の影響範囲が限定的
4. **型安全性**: TypeScriptの型推論が効率的
5. **一貫性**: 全サービスで統一されたパターン

## デフォルト値とルーティング処理

### スキーマデフォルト値の尊重
```typescript
// ✅ スキーマでデフォルト値を定義
export const CounterDisplaySchema = z.object({
  id: CommonSchemas.publicId,
  type: CounterFieldSchemas.counterType.default('total'),
  theme: CommonSchemas.theme.default('classic'),
  format: CounterFieldSchemas.counterFormat.default('image')
})

// ❌ API層でのデフォルト値重複定義
async function routeRequest(request: NextRequest) {
  const format = searchParams.get('format') || 'image' // NG: スキーマと重複
  // ...
}
```

### APIルーティング層の責務
- **やること**: アクションに応じた適切なハンドラー呼び出し
- **やらないこと**: パラメータのデフォルト値設定、手動変換
- **原則**: スキーマで定義された処理はスキーマに任せる

### ハンドラー設計パターン
```typescript
// ✅ OK: スキーマの条件を尊重
const svgHandler = ApiHandler.createSpecialResponse(
  CounterSchemas.display, // そのまま使用
  async ({ id, type, theme, format }) => {
    // ハンドラー内でパラメータは既に正規化済み
  }
)

// ❌ NG: スキーマ条件を上書き
const svgHandler = ApiHandler.createSpecialResponse(
  CounterSchemas.display.extend({
    format: z.literal('image') // スキーマのデフォルト値を無効化
  }),
  // ...
)
```

## 注意事項

- **CommonSchemas拡張時**: 本当に全サービスで必要かを慎重に検討
- **FieldSchemas追加時**: 他サービスとの重複がないかを確認
- **破壊的変更時**: 依存関係の影響を事前に調査
- **新規参加者**: この設計書を必読として遵守を徹底
- **デフォルト値**: スキーマで設定したデフォルト値を API層で上書きしない
- **ハンドラー設計**: 不要な条件追加でスキーマの意図を歪めない

---

## 関連ドキュメント
- [WebComponents防御的プログラミング方針](./webcomponents-defensive-programming.md) - WebComponentsでの安全なコーディング指針

**重要**: この設計原則に違反するコードは、統一性を損ない、保守性を著しく悪化させます。必ず遵守してください。