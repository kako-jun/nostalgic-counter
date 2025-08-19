/**
 * Nostalgic Like Web Component
 * 
 * 使用方法:
 * <script src="/components/like.js"></script>
 * <nostalgic-like id="your-like-id" theme="classic"></nostalgic-like>
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
    return ['id', 'theme'];
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
    
    if (!this.getAttribute('id')) {
      this.renderError('Error: id attribute is required');
      return;
    }
    
    const isLoading = this.isLoading;
    const total = this.likeData ? this.likeData.total : 0;
    const userLiked = this.likeData ? this.likeData.userLiked : false;
    
    // テーマ別のスタイル
    const themeStyles = {
      classic: {
        bgColor: userLiked ? '#ff4757' : '#ddd',
        textColor: userLiked ? '#fff' : '#333',
        border: '2px solid #333',
        heartIcon: userLiked ? '♥' : '♡'
      },
      modern: {
        bgColor: userLiked ? '#3742fa' : '#f1f2f6',
        textColor: userLiked ? '#fff' : '#2f3542',
        border: '1px solid #ddd',
        heartIcon: userLiked ? '♥' : '♡'
      },
      retro: {
        bgColor: userLiked ? '#ff6b6b' : '#ffe066',
        textColor: '#2d3436',
        border: '3px solid #2d3436',
        heartIcon: userLiked ? '♥' : '♡'
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
          transform: scale(1.05);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        
        .like-button:active:not(.loading) {
          transform: scale(0.95);
        }
        
        .heart-icon {
          font-size: 16px;
          line-height: 1;
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
        <span class="heart-icon">${style.heartIcon}</span>
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
console.log('Usage: <nostalgic-like id="your-like-id" theme="classic"></nostalgic-like>');
console.log('Docs: https://nostalgic.llll-ll.com');