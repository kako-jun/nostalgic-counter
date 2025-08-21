/**
 * Nostalgic Counter Web Component
 * 
 * 使用方法:
 * <script src="' + window.location.origin + '/components/visit.js"></script>
 * <nostalgic-counter id="your-counter-id" type="total" theme="classic"></nostalgic-counter>
 */

class NostalgicCounter extends HTMLElement {
  // ページ内でカウント済みのIDを記録（同じIDは1回のみカウント）
  static counted = new Set();
  // カウントアップ後の最新データを保存
  static latestCounts = new Map();
  // スクリプトが読み込まれたドメインを自動検出
  static apiBaseUrl = (() => {
    const scripts = document.querySelectorAll('script[src*="visit.js"]');
    for (const script of scripts) {
      const src = script.getAttribute('src');
      if (src && src.includes('visit.js')) {
        try {
          const url = new URL(src, window.location.href);
          return url.origin;
        } catch (e) {
          console.warn('Failed to parse script URL:', src);
        }
      }
    }
    // フォールバック: 現在のドメインを使用
    return window.location.origin;
  })();
  
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

  attributeChangedCallback() {
    this.render();
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
      const baseUrl = this.getAttribute('api-base') || NostalgicCounter.apiBaseUrl;
      const countUrl = `${baseUrl}/api/visit?action=increment&id=${encodeURIComponent(id)}`;
      const response = await fetch(countUrl);
      if (!response.ok) {
        console.error('nostalgic-counter: Count failed with status:', response.status, response.statusText);
        const errorData = await response.text();
        console.error('nostalgic-counter: Error response:', errorData);
      } else {
        const result = await response.json();
        // カウントアップ後の値で表示を更新
        NostalgicCounter.latestCounts.set(id, result);
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
    
    const baseUrl = this.getAttribute('api-base') || NostalgicCounter.apiBaseUrl;
    const apiUrl = `${baseUrl}/api/visit?action=display&id=${encodeURIComponent(id)}&type=${type}&theme=${theme}&digits=${digits}&format=${format}`;
    
    // カウントアップ後の最新データがあれば使用
    const latestData = NostalgicCounter.latestCounts.get(id);
    const hasLatestData = latestData && latestData[type] !== undefined;
    
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
        <span class="loading ${theme}">Loading...</span>
      `;
      
      // 最新データがあれば即座に表示
      if (hasLatestData) {
        const value = latestData[type];
        this.shadowRoot.querySelector('span').textContent = value;
        this.shadowRoot.querySelector('span').className = theme;
      } else {
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
            <span class="${theme}">${text}</span>
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
      }
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

