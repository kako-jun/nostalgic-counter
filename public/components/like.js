/**
 * Nostalgic Like Web Component
 * 
 * 使用方法:
 * <script src="/components/like.js"></script>
 * <nostalgic-like id="your-like-id" theme="classic" icon="heart" format="interactive"></nostalgic-like>
 */

class NostalgicLike extends HTMLElement {
  // スクリプトが読み込まれたドメインを自動検出
  static apiBaseUrl = (() => {
    const scripts = document.querySelectorAll('script[src*="like.js"]');
    for (const script of scripts) {
      const src = script.getAttribute('src');
      if (src && src.includes('like.js')) {
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
    this.likeData = null;
    this.isLoading = false;
  }

  static get observedAttributes() {
    return ['id', 'theme', 'icon', 'format'];
  }

  connectedCallback() {
    this.loadLikeData();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.loadLikeData();
    }
  }

  async loadLikeData() {
    const id = this.getAttribute('id');
    if (!id) {
      this.renderError('Error: id attribute is required');
      return;
    }

    this.isLoading = true;

    try {
      const baseUrl = this.getAttribute('api-base') || NostalgicLike.apiBaseUrl;
      const apiUrl = `${baseUrl}/api/like?action=get&id=${encodeURIComponent(id)}`;
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const responseData = await response.json();
      if (responseData.success) {
        this.likeData = responseData.data;
        console.log('nostalgic-like: Data loaded:', this.likeData);
      } else {
        throw new Error(responseData.error || 'API returned error');
      }
    } catch (error) {
      console.error('nostalgic-like: Failed to load data:', error);
      this.likeData = { total: 0, userLiked: false };
    }

    this.isLoading = false;
    this.render();
  }

  async toggleLike() {
    const id = this.getAttribute('id');
    if (!id || this.isLoading) return;

    this.isLoading = true;

    try {
      const baseUrl = this.getAttribute('api-base') || NostalgicLike.apiBaseUrl;
      const toggleUrl = `${baseUrl}/api/like?action=toggle&id=${encodeURIComponent(id)}`;
      
      console.log('nostalgic-like: Toggling like:', toggleUrl);
      const response = await fetch(toggleUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const responseData = await response.json();
      if (responseData.success) {
        this.likeData = responseData.data;
        console.log('nostalgic-like: Toggle successful:', this.likeData);
      } else {
        throw new Error(responseData.error || 'API returned error');
      }
    } catch (error) {
      console.error('nostalgic-like: Toggle failed:', error);
    }

    this.isLoading = false;
    this.render();
  }

  renderError(message) {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          color: red;
          font-size: 12px;
        }
      </style>
      <span>${message}</span>
    `;
  }

  render() {
    const theme = this.getAttribute('theme') || 'classic';
    const icon = this.getAttribute('icon') || 'heart';
    const format = this.getAttribute('format') || 'interactive';
    
    if (!this.getAttribute('id')) {
      this.renderError('Error: id attribute is required');
      return;
    }

    // SVG画像形式の場合
    if (format === 'image') {
      const baseUrl = this.getAttribute('api-base') || NostalgicLike.apiBaseUrl;
      const id = this.getAttribute('id');
      const apiUrl = `${baseUrl}/api/like?action=display&id=${encodeURIComponent(id)}&theme=${theme}&format=image`;
      
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: inline-block;
          }
          img {
            display: block;
            max-width: 100%;
            height: auto;
          }
        </style>
        <img src="${apiUrl}" alt="like count" loading="lazy" />
      `;
      return;
    }
    
    const isLoading = this.isLoading;
    const total = this.likeData ? this.likeData.total : 0;
    const userLiked = this.likeData ? this.likeData.userLiked : false;
    
    // アイコンマッピング
    const iconMapping = {
      heart: { filled: '♥', empty: '♡' },
      star: { filled: '★', empty: '☆' },
      thumb: { filled: '👍', empty: '👍' }
    };
    
    const currentIcon = iconMapping[icon] || iconMapping.heart;
    const displayIcon = userLiked ? currentIcon.filled : currentIcon.empty;
    
    // アイコンの色設定
    const iconColor = {
      heart: userLiked ? '#ff0000' : '#999999',  // 赤いハート / グレー
      star: userLiked ? '#ffd700' : '#999999',   // 黄色い星 / グレー  
      thumb: userLiked ? '#3742fa' : '#999999'   // 青い親指 / グレー
    };
    
    const currentIconColor = iconColor[icon] || iconColor.heart;
    
    // テーマ別のスタイル
    const themeStyles = {
      classic: {
        bgColor: '#ffffff',
        hoverBgColor: '#f5f5f5',
        textColor: '#333',
        border: userLiked ? '2px solid #666' : '2px solid #ccc'
      },
      modern: {
        bgColor: '#ffffff',
        hoverBgColor: '#f8f9fa',
        textColor: '#2f3542',
        border: userLiked ? '2px solid #3742fa' : '1px solid #ddd'
      },
      retro: {
        bgColor: '#ffffff',
        hoverBgColor: '#fffef5',
        textColor: '#2d3436',
        border: userLiked ? '3px solid #2d3436' : '3px solid #999'
      }
    };
    
    const style = themeStyles[theme] || themeStyles.classic;
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }
        
        .like-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: ${style.bgColor};
          color: ${style.textColor};
          border: ${style.border};
          border-radius: 6px;
          cursor: pointer;
          font-family: Arial, sans-serif;
          font-size: 14px;
          font-weight: bold;
          user-select: none;
          transition: all 0.2s ease;
          opacity: ${isLoading ? '0.6' : '1'};
        }
        
        .like-button:hover:not(.loading) {
          background: ${style.hoverBgColor};
          transform: scale(1.05);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        
        .like-button:active:not(.loading) {
          transform: scale(0.95);
        }
        
        .heart-icon {
          font-size: 16px;
          line-height: 1;
          color: ${currentIconColor};
        }
        
        .like-count {
          font-family: monospace;
          min-width: 20px;
          text-align: center;
        }
        
        .loading {
          cursor: pointer !important;
          opacity: 0.7;
        }
        
        .like-button:disabled {
          cursor: pointer !important;
        }
      </style>
      
      <button class="like-button ${isLoading ? 'loading' : ''}" ${isLoading ? 'disabled' : ''}>
        <span class="heart-icon">${displayIcon}</span>
        <span class="like-count">${total}</span>
      </button>
    `;
    
    // クリックイベントを追加
    if (!isLoading) {
      this.shadowRoot.querySelector('.like-button').addEventListener('click', () => {
        this.toggleLike();
      });
    }
  }
}

// カスタム要素として登録
if (!customElements.get('nostalgic-like')) {
  customElements.define('nostalgic-like', NostalgicLike);
}

// コンソールに使用方法を表示
console.log('❤️ Nostalgic Like loaded!');
console.log('Usage: <nostalgic-like id="your-like-id" theme="classic" icon="heart" format="interactive"></nostalgic-like>');
console.log('Icons: heart (♥), star (★), thumb (👍)');
console.log('Themes: classic, modern, retro');
console.log('Formats: interactive (default), image');
console.log('Docs: https://nostalgic.llll-ll.com');