/**
 * Nostalgic Counter Web Component
 * 
 * 使用方法:
 * <script src="' + window.location.origin + '/components/display.js"></script>
 * <nostalgic-counter id="your-counter-id" type="total" theme="classic"></nostalgic-counter>
 */

class NostalgicCounter extends HTMLElement {
  // ページ内でカウント済みのIDを記録（同じIDは1回のみカウント）
  static counted = new Set();
  
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['id', 'type', 'theme', 'digits'];
  }

  connectedCallback() {
    this.countUp();
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  async countUp() {
    const id = this.getAttribute('id');
    
    if (!id) {
      console.warn('nostalgic-counter: id attribute is required');
      return;
    }
    
    // 同じIDは1回のみカウント（ページ内重複防止）
    if (NostalgicCounter.counted.has(id)) {
      return;
    }
    
    NostalgicCounter.counted.add(id);
    
    try {
      const baseUrl = this.getAttribute('api-base') || window.location.origin;
      const countUrl = `${baseUrl}/api/count?id=${encodeURIComponent(id)}`;
      console.log('nostalgic-counter: Counting up:', countUrl);
      const response = await fetch(countUrl);
      if (!response.ok) {
        console.error('nostalgic-counter: Count failed with status:', response.status, response.statusText);
        const errorData = await response.text();
        console.error('nostalgic-counter: Error response:', errorData);
      } else {
        const result = await response.json();
        console.log('nostalgic-counter: Count successful:', result);
      }
    } catch (error) {
      console.error('nostalgic-counter: Count failed:', error);
    }
  }

  render() {
    const id = this.getAttribute('id');
    const type = this.getAttribute('type') || 'total';
    const theme = this.getAttribute('theme') || 'classic';
    const digits = this.getAttribute('digits') || '6';
    const format = this.getAttribute('format') || 'image';
    
    if (!id) {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: inline-block;
            color: red;
            font-size: 12px;
          }
        </style>
        <span>Error: id attribute is required</span>
      `;
      return;
    }
    
    const baseUrl = this.getAttribute('api-base') || window.location.origin;
    const apiUrl = `${baseUrl}/api/display?id=${encodeURIComponent(id)}&type=${type}&theme=${theme}&digits=${digits}&format=${format}`;
    
    if (format === 'text') {
      // テキスト形式の場合
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: inline-block;
            font-family: monospace;
            font-weight: bold;
          }
          .loading {
            color: #666;
          }
          .classic {
            color: #00ff00;
            background: #000;
            padding: 2px 4px;
          }
          .modern {
            color: #fff;
            background: #1a1a1a;
            padding: 2px 4px;
          }
          .retro {
            color: #ffff00;
            background: #800080;
            padding: 2px 4px;
          }
        </style>
        <span class="loading ${style}">Loading...</span>
      `;
      
      // テキストを非同期で取得
      fetch(apiUrl)
        .then(response => response.text())
        .then(text => {
          this.shadowRoot.innerHTML = `
            <style>
              :host {
                display: inline-block;
                font-family: monospace;
                font-weight: bold;
              }
              .classic {
                color: #00ff00;
                background: #000;
                padding: 2px 4px;
              }
              .modern {
                color: #fff;
                background: #1a1a1a;
                padding: 2px 4px;
              }
              .retro {
                color: #ffff00;
                background: #800080;
                padding: 2px 4px;
              }
            </style>
            <span class="${style}">${text}</span>
          `;
        })
        .catch(error => {
          this.shadowRoot.innerHTML = `
            <style>
              :host {
                display: inline-block;
                color: red;
                font-size: 12px;
              }
            </style>
            <span>Error loading counter</span>
          `;
        });
    } else {
      // 画像形式の場合（デフォルト）
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
            max-width: 100%;
            height: auto;
          }
        </style>
        <img src="${apiUrl}" alt="${type} counter" loading="lazy" />
      `;
    }
  }
}

// カスタム要素として登録
if (!customElements.get('nostalgic-counter')) {
  customElements.define('nostalgic-counter', NostalgicCounter);
}

// コンソールに使用方法を表示
console.log('🎯 Nostalgic Counter loaded!');
console.log('Usage: <nostalgic-counter id="your-counter-id" type="total" theme="classic"></nostalgic-counter>');
console.log('Docs: https://github.com/kako-jun/nostalgic-counter');