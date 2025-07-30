# Nostalgic Counter 実装方針

## 技術スタック

### **ホスティング・バックエンド**
- **Vercel**: Next.js + API Routes
- **Vercel KV**: Redis互換のKey-Valueストレージ
- **理由**: KVストレージがカウンター用途に最適（高速・アトミック操作）

### **フロントエンド**
- **Web Components**: カスタム要素でカウンター表示
- **SVG画像生成**: 懐かしいスタイルのカウンター画像

## データ設計

### **KVストレージ構造**
```
counter:{id}                    → カウンターメタデータ
counter:{id}:total             → 累計カウント
counter:{id}:daily:{YYYY-MM-DD} → 日別カウント
counter:{id}:owner             → オーナートークン（ハッシュ化）
```

### **データ例**
```javascript
// カウンターメタデータ
counter:blog-a7b9c3d4 = {
  url: "https://myblog.com",
  created: "2025-07-30T12:00:00Z",
  publicId: "blog-a7b9c3d4"
}

// カウント数値（アトミック操作用）
counter:blog-a7b9c3d4:total = 1234
counter:blog-a7b9c3d4:daily:2025-07-30 = 12
counter:blog-a7b9c3d4:daily:2025-07-29 = 8

// 認証用
counter:blog-a7b9c3d4:owner = sha256("my-secret-token")
```

## API設計

### **1. カウンター作成・ID取得**
```
GET /api/count?url={URL}&token={TOKEN}
```
- 新規作成時：公開IDを生成してKVに保存
- 既存の場合：カウントアップ
- レスポンス：公開IDを含むデータ

### **2. 通常カウントアップ**
```
GET /api/count?id={ID}
```
- KV.incr() でアトミックにカウントアップ
- 日別カウントも同時更新

### **3. カウンター画像・データ取得**
```
GET /api/counter?id={ID}&type={TYPE}&style={STYLE}&format={FORMAT}
```
- KVから現在値を取得
- SVG画像またはテキスト形式で返す

### **4. 管理操作**
```
GET /api/owner?action=set&url={URL}&token={TOKEN}&total={TOTAL}
```
- トークンをハッシュ化して認証
- 指定された値に設定

## 実装のポイント

### **公開ID生成**
```javascript
function generatePublicId(url) {
  const domain = new URL(url).hostname.replace(/^www\./, '');
  const hash = crypto.createHash('sha256')
    .update(url + Date.now())
    .digest('hex')
    .substring(0, 8);
  
  let domainPart = domain.split('.')[0].toLowerCase();
  if (domainPart.length > 8) {
    domainPart = domainPart.substring(0, 8);
  }
  
  return `${domainPart}-${hash}`;
  // 例: blog-a7b9c3d4
}
```

### **アトミック操作**
```javascript
// 同時アクセスでも安全
const newTotal = await kv.incr(`counter:${id}:total`);
const today = new Date().toISOString().split('T')[0];
const todayCount = await kv.incr(`counter:${id}:daily:${today}`);
```

### **日別統計の計算**
```javascript
async function getCounterStats(id) {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24*60*60*1000).toISOString().split('T')[0];
  
  const [total, todayCount, yesterdayCount] = await Promise.all([
    kv.get(`counter:${id}:total`) || 0,
    kv.get(`counter:${id}:daily:${today}`) || 0,
    kv.get(`counter:${id}:daily:${yesterday}`) || 0
  ]);
  
  // 週間・月間は過去7日、30日のdailyキーを合計
  const weekCount = await calculatePeriodCount(id, 7);
  const monthCount = await calculatePeriodCount(id, 30);
  
  return { total, today: todayCount, yesterday: yesterdayCount, week: weekCount, month: monthCount };
}
```

## セキュリティ

### **オーナートークン管理**
```javascript
// 保存時：ハッシュ化
const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
await kv.set(`counter:${id}:owner`, hashedToken);

// 認証時：比較
const storedHash = await kv.get(`counter:${id}:owner`);
const inputHash = crypto.createHash('sha256').update(inputToken).digest('hex');
const isValid = storedHash === inputHash;
```

### **重複防止**
```javascript
// IP + UserAgent + 日付でキー生成
const clientKey = crypto.createHash('sha256')
  .update(`${clientIP}:${userAgent}:${today}`)
  .digest('hex');

// 24時間以内の重複チェック
const hasVisited = await kv.get(`visit:${id}:${clientKey}`);
if (!hasVisited) {
  // カウントアップ実行
  await kv.setex(`visit:${id}:${clientKey}`, 86400, '1'); // 24時間TTL
}
```

## Web Components

### **基本実装**
```javascript
class NostalgicCounter extends HTMLElement {
  static counted = new Set(); // ページ内重複防止
  
  async connectedCallback() {
    const id = this.getAttribute('id');
    
    // カウントアップ（同じIDは1回のみ）
    if (!NostalgicCounter.counted.has(id)) {
      NostalgicCounter.counted.add(id);
      await fetch(`/api/count?id=${id}`);
    }
    
    // 画像表示
    this.render();
  }
  
  render() {
    const id = this.getAttribute('id');
    const type = this.getAttribute('type') || 'total';
    const style = this.getAttribute('style') || 'classic';
    
    this.innerHTML = `
      <img src="/api/counter?id=${id}&type=${type}&style=${style}" 
           alt="${type} counter" 
           style="image-rendering: pixelated;" />
    `;
  }
}

customElements.define('nostalgic-counter', NostalgicCounter);
```

## デプロイメント

### **環境変数について**
Vercel KVはプロジェクトに追加すると自動で環境変数が設定されるため、手動での設定は不要です。

### **Vercel設定**
```json
// vercel.json
{
  "functions": {
    "pages/api/count.js": {
      "maxDuration": 10
    }
  }
}
```

この設計でシンプルかつ高性能なカウンターサービスが実現できます。