/**
 * Nostalgic Counter Web Component
 * 
 * 使用方法:
 * <script src="/components/visit.js"></script>
 * <nostalgic-counter id="your-counter-id" type="total" theme="classic"></nostalgic-counter>
 */

// バリデーション定数は不要になりました（API側でデフォルト値処理）

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

  // 安全なアトリビュート処理
  safeGetAttribute(name) {
    const value = this.getAttribute(name);
    
    switch (name) {
      case 'id':
        if (!value || typeof value !== 'string' || value.trim() === '') {
          return null;
        }
        return value.trim();
        
      case 'type':
        return value;
        
      case 'theme':
        return value;
        
      case 'digits':
        return value;
        
      case 'format':
        return value;
        
      default:
        return value;
    }
  }

  connectedCallback() {
    // カウントアップを先に実行し、完了を待つ
    this.countUpAndRender();
  }

  attributeChangedCallback() {
    this.render();
  }

  async countUpAndRender() {
    const id = this.safeGetAttribute('id');
    if (!id) {
      this.render();
      return;
    }

    // フォーマットをチェックして初期表示を設定
    const format = this.safeGetAttribute('format');
    
    // 既にカウント済みの場合は即座にレンダリング
    if (NostalgicCounter.counted.has(id)) {
      this.render();
      return;
    }

    // テキスト形式の場合は先に初期値を表示
    if (format === 'text') {
      this.renderInitialText();
    }

    // カウントアップして結果を待つ
    await this.countUp();
    this.render();
  }

  async countUp() {
    const id = this.safeGetAttribute('id');
    
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

  renderInitialText() {
    // テキスト形式の初期表示（ローディング中表示）
    const digits = this.safeGetAttribute('digits');
    const formatValue = (value) => {
      if (digits && !isNaN(digits) && digits > 0) {
        return String(value).padStart(parseInt(digits), '0');
      }
      return String(value);
    };
    
    this.shadowRoot.innerHTML = digits ? formatValue(0) : '0';
  }

  render() {
    const id = this.safeGetAttribute('id');
    const type = this.safeGetAttribute('type');
    const theme = this.safeGetAttribute('theme');
    const digits = this.safeGetAttribute('digits');
    const format = this.safeGetAttribute('format');
    
    if (!id) {
      // IDが無い場合は0を表示
      const formatValue = (value) => {
        if (digits && !isNaN(digits) && digits > 0) {
          return String(value).padStart(parseInt(digits), '0');
        }
        return String(value);
      };
      this.shadowRoot.innerHTML = formatValue(0);
      return;
    }
    
    const baseUrl = this.getAttribute('api-base') || NostalgicCounter.apiBaseUrl;
    const apiUrl = `${baseUrl}/api/visit?action=display&id=${encodeURIComponent(id)}${type ? `&type=${type}` : ''}${theme ? `&theme=${theme}` : ''}${digits ? `&digits=${digits}` : ''}${format ? `&format=${format}` : ''}`;
    
    // カウントアップ後の最新データがあれば使用
    const latestData = NostalgicCounter.latestCounts.get(id);
    const hasLatestData = latestData && latestData[type] !== undefined;
    
    if (format === 'text') {
      // プレーンテキスト形式の場合
      const formatValue = (value) => {
        if (digits && !isNaN(digits) && digits > 0) {
          return String(value).padStart(parseInt(digits), '0');
        }
        return String(value);
      };
      
      // 最新データがあれば即座に表示
      if (hasLatestData) {
        const value = latestData[type];
        this.shadowRoot.innerHTML = formatValue(value);
      } else {
        // ローディング中は0を桁数分表示
        this.shadowRoot.innerHTML = formatValue(0);
        
        // 値を非同期で取得（action=display&format=textを使用）
        fetch(`${baseUrl}/api/visit?action=display&id=${encodeURIComponent(id)}&type=${type}&format=text${digits ? `&digits=${digits}` : ''}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          return response.text(); // テキスト形式なのでtextで取得
        })
        .then(data => {
          // すでに桁数がパディング済みの文字列なのでそのまま表示
          this.shadowRoot.innerHTML = data;
        })
        .catch(error => {
          this.shadowRoot.innerHTML = 'エラー';
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

