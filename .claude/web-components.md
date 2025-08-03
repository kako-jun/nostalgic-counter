# Web Components 実装仕様

## 概要

Nostalgic CounterをWeb Componentsとして提供し、モダンな技術で懐かしいカウンターを実現します。

## コンポーネント仕様

### `<nostalgic-counter>`

#### 属性
- `id` (必須): カウンターの公開ID
- `type` (任意): 表示する値の種類（total, today, yesterday, week, month）
- `theme` (任意): 表示スタイル（classic, modern, retro）
- `digits` (任意): 表示桁数（デフォルト: 6）

### 実装例

```javascript
// /components/display.js
class NostalgicCounter extends HTMLElement {
  // ページ内でカウント済みのIDを記録（同じIDは1回のみカウント）
  static counted = new Set();
  // カウントアップ後の最新データを保存
  static latestCounts = new Map();
  
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['id', 'type', 'theme', 'digits'];
  }

  connectedCallback() {
    // カウントアップを先に実行し、完了を待つ
    this.countUpAndRender();
  }

  async countUpAndRender() {
    const id = this.getAttribute('id');
    if (!id) {
      this.render();
      return;
    }

    // 既にカウント済みの場合は即座にレンダリング
    if (NostalgicCounter.counted.has(id)) {
      this.render();
      return;
    }

    // カウントアップして結果を待つ
    await this.countUp();
    this.render();
  }

  async countUp() {
    const id = this.getAttribute('id');
    
    try {
      NostalgicCounter.counted.add(id);
      const response = await fetch(`/api/count?id=${id}`);
      const data = await response.json();
      
      // 最新データを保存
      NostalgicCounter.latestCounts.set(id, data);
    } catch (error) {
      console.error('Count failed:', error);
    }
  }

  render() {
    const id = this.getAttribute('id');
    const type = this.getAttribute('type') || 'total';
    const theme = this.getAttribute('theme') || 'classic';
    const digits = this.getAttribute('digits') || '6';
    
    if (!id) {
      this.shadowRoot.innerHTML = '<span>設定エラー</span>';
      return;
    }
    
    const imgUrl = `/api/display?id=${id}&type=${type}&style=${theme}&digits=${digits}`;
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }
        img {
          display: block;
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }
      </style>
      <img src="${imgUrl}" alt="${type} counter" />
    `;
  }

  attributeChangedCallback() {
    this.render();
  }
}

customElements.define('nostalgic-counter', NostalgicCounter);
```

## 使用例

### 基本的な使い方
```html
<script src="https://nostalgic-counter.llll-ll.com/components/display.js"></script>
<nostalgic-counter 
  id="blog-a7b9c3d4"
  type="total"
  style="classic">
</nostalgic-counter>
```

### 複数のカウンターを並べる
```html
<div class="counter-container">
  <nostalgic-counter id="blog-a7b9c3d4" type="total" style="classic"></nostalgic-counter>
  <nostalgic-counter id="blog-a7b9c3d4" type="today" style="modern"></nostalgic-counter>
  <nostalgic-counter id="blog-a7b9c3d4" type="week" style="retro"></nostalgic-counter>
</div>
```

## 利点

1. **カプセル化**: Shadow DOMにより、ページのCSSと干渉しない
2. **再利用性**: 属性を変えるだけで様々なカウンターを表示
3. **モダン**: 最新のWeb標準に準拠
4. **後方互換性**: 古いブラウザでも画像として表示される（polyfill使用時）

## ブラウザ対応

- Chrome 54+
- Firefox 63+
- Safari 10.1+
- Edge 79+

古いブラウザには[Web Components Polyfill](https://github.com/webcomponents/polyfills)を使用することで対応可能です。