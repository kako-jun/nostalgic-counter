# Nostalgic Counter ランディングページ設計

## 概要

90年代のインターネット文化を再現した懐かしいデザインで、実際に動作するカウンターを体験できるランディングページ。技術は最新、デザインはノスタルジックをコンセプトとする。

## デザインコンセプト

### **テーマ：90年代後半〜2000年代前半のWebサイト**
- **参考**: 阿部寛のホームページ、昔の個人サイト
- **要素**: ブリンク、マーキー、テーブルレイアウト、GIFアニメ風の背景
- **色合い**: 黒背景、緑文字、カラフルなボーダー
- **フォント**: MS UI Gothic, monospace

## ページ構成

### **1. ヘッダー部分**
```html
<marquee>🚀 懐かしのアクセスカウンター復活！ 最新技術で蘇る90年代の思い出 🚀</marquee>

<center>
  <table border="3" bordercolor="#ff00ff" bgcolor="#000080">
    <tr><td>
      <font color="#00ff00" size="6">
        <b>★☆★ Nostalgic Counter ★☆★</b>
      </font>
    </td></tr>
  </table>
</center>
```

### **2. メイン説明部分**
- **キャッチコピー**: "あの頃のインターネットを思い出しませんか？"
- **特徴説明**: 
  - 登録不要で即利用開始
  - 24時間重複防止機能
  - 複数の期間統計（累計・今日・昨日・週間・月間）
  - 3つのレトロスタイル

### **3. ライブデモセクション**
```html
<table border="2" bgcolor="#ffffff">
  <tr>
    <td align="center">
      <font color="#800080"><b>◆このサイトの訪問者数◆</b></font><br>
      <nostalgic-counter id="demo-main-2025" type="total" style="classic"></nostalgic-counter>
      <br>
      <font size="2">↑リアルタイムで動いています！</font>
    </td>
  </tr>
</table>
```

### **4. 設置方法（2ステップ）**
```html
<table border="1" bgcolor="#ffffcc">
  <tr><td>
    <font color="#cc0000"><b>【超簡単！2ステップで設置完了】</b></font>
    
    <p><b>ステップ1:</b> カウンター作成してIDを取得</p>
    <pre bgcolor="#f0f0f0">
fetch('/api/count?url=https://yoursite.com&token=your-secret')
  .then(r => r.json())
  .then(d => console.log('公開ID:', d.id));
// 結果: 公開ID: yoursite-2025-a7b9
    </pre>
    
    <p><b>ステップ2:</b> HTMLに埋め込み</p>
    <pre bgcolor="#f0f0f0">
&lt;script src="/components/counter.js"&gt;&lt;/script&gt;
&lt;nostalgic-counter id="yoursite-2025-a7b9"&gt;&lt;/nostalgic-counter&gt;
    </pre>
    
    <center><blink>これだけ！</blink></center>
  </td></tr>
</table>
```

### **5. スタイルサンプル**
```html
<table border="2">
  <tr>
    <td align="center">
      <b>Classic Style</b><br>
      <nostalgic-counter id="demo-classic-2025" type="total" style="classic"></nostalgic-counter>
      <br><font size="1">90年代ターミナル風</font>
    </td>
    <td align="center">
      <b>Modern Style</b><br>
      <nostalgic-counter id="demo-modern-2025" type="total" style="modern"></nostalgic-counter>
      <br><font size="1">現代風シンプル</font>
    </td>
    <td align="center">
      <b>Retro Style</b><br>
      <nostalgic-counter id="demo-retro-2025" type="total" style="retro"></nostalgic-counter>
      <br><font size="1">80年代ネオン風</font>
    </td>
  </tr>
</table>
```

### **6. 体験コーナー**
```html
<table border="3" bordercolor="#00ff00" bgcolor="#000000">
  <tr><td>
    <font color="#00ff00">
      <center><b>【体験コーナー】</b></center>
      <br>
      実際にカウンターが動作する懐かしいページを体験！
      <br><br>
      <center>
        <a href="/retro-demo"><img src="/images/enter-button.gif" alt="ENTER"></a>
      </center>
    </font>
  </td></tr>
</table>
```

### **7. フッター**
```html
<hr width="80%" color="#ff00ff">
<center>
  <font size="2" color="#666666">
    <i>このサイトは1997年風のデザインで作成されています</i><br>
    Powered by Next.js + Vercel KV<br>
    Last Updated: <script>document.write(new Date().toLocaleDateString());</script><br>
    <img src="/images/counter-small.gif" alt="Made with Nostalgic Counter">
  </font>
</center>
```

## 技術実装詳細

### **Web Components の配置**
```javascript
// /public/components/counter.js として配布
class NostalgicCounter extends HTMLElement {
  static counted = new Set();
  
  async connectedCallback() {
    const id = this.getAttribute('id');
    
    // 同じIDは1回のみカウント
    if (!NostalgicCounter.counted.has(id)) {
      NostalgicCounter.counted.add(id);
      await fetch(`/api/count?id=${id}`);
    }
    
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

### **CSS適用**
- 既存の `src/app/test1/nostalgic.css` をベースに使用
- 追加でランディングページ専用のスタイルを適用
- レスポンシブ対応（スマホでも懐かしさを損なわない）

### **デモ用カウンターの事前作成**
```bash
# 管理者がデモ用のカウンターを事前作成
curl "/api/count?url=https://nostalgic-counter.vercel.app/demo&token=demo-secret"
# → id: "demo-main-2025" を取得

curl "/api/count?url=https://nostalgic-counter.vercel.app/classic&token=demo-secret"  
# → id: "demo-classic-2025" を取得
```

## ページの目的と効果

### **主な目的**
1. **懐かしさの演出**: 90年代を知る人には懐かしく、知らない人には新鮮
2. **機能の実演**: 実際に動くカウンターでサービスの価値を実感
3. **設置の簡単さをアピール**: 2ステップで完了することを強調
4. **技術とノスタルジアの融合**: 最新技術で昔の文化を再現

### **ターゲットユーザー**
- **プライマリ**: 90年代〜2000年代のインターネット文化を知る世代
- **セカンダリ**: レトロ・ヴィンテージに興味がある若い世代
- **開発者**: 個人サイト・ブログを運営する技術者

### **期待される反応**
- "懐かしい！" → 感情的な共感から利用へ
- "面白い！" → SNSでのシェア・拡散
- "簡単！" → 実際の導入・利用

## GitHub README との差別化

| 項目 | GitHub README | ランディングページ |
|------|---------------|-------------------|
| **目的** | 技術者向け仕様説明 | 一般ユーザー向け体験 |
| **内容** | API仕様、コード例 | デモ、感情的アピール |
| **デザイン** | マークダウン（シンプル） | 90年代風（没入感） |
| **アプローチ** | 論理的・機能的 | 感情的・体験的 |

この設計により、技術的な説明だけでは伝わらない「懐かしさ」と「楽しさ」をユーザーに直接体験してもらえるランディングページが完成します。