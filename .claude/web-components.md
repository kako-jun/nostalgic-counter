# Web Components 実装仕様

## 概要

Nostalgic CounterをWeb Componentsとして提供し、モダンな技術で懐かしいカウンターを実現します。

## コンポーネント仕様

### `<nostalgic-counter>`

#### 属性
- `id` (必須): カウンターの公開ID
- `type` (任意): 表示する値の種類（total, today, yesterday, week, month）
- `style` (任意): 表示スタイル（classic, modern, retro）
- `digits` (任意): 表示桁数（デフォルト: 6）

### 実装例

```javascript
// /components/counter.js
class NostalgicCounter extends HTMLElement {
  // ページ内でカウント済みのIDを記録
  static counted = new Set();
  
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['id', 'type', 'style', 'digits'];
  }

  connectedCallback() {
    this.render();
    this.countUp();
  }

  async countUp() {
    const id = this.getAttribute('id');
    
    if (!id) return;
    
    // 同じIDは1回だけカウント
    if (NostalgicCounter.counted.has(id)) {
      return;
    }
    
    NostalgicCounter.counted.add(id);
    
    try {
      await fetch(`/api/count?id=${id}`);
    } catch (error) {
      console.error('Count failed:', error);
    }
  }

  render() {
    const id = this.getAttribute('id');
    const type = this.getAttribute('type') || 'total';
    const style = this.getAttribute('style') || 'classic';
    const digits = this.getAttribute('digits') || '6';
    
    if (!id) {
      this.shadowRoot.innerHTML = '<span>設定エラー</span>';
      return;
    }
    
    const imgUrl = `/api/counter?id=${id}&type=${type}&style=${style}&digits=${digits}`;
    
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
<script src="https://nostalgic-counter.vercel.app/components/counter.js"></script>
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