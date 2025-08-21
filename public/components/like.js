/**
 * Nostalgic Like Web Component
 * 
 * 使用方法:
 * <script src="/components/like.js"></script>
 * <nostalgic-like id="your-like-id" theme="classic" icon="heart" format="interactive"></nostalgic-like>
 */

// バリデーション定数は不要になりました（API側でデフォルト値処理）

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

  // 安全なアトリビュート処理
  safeGetAttribute(name) {
    const value = this.getAttribute(name);
    
    switch (name) {
      case 'id':
        if (!value || typeof value !== 'string' || value.trim() === '') {
          return null;
        }
        return value.trim();
        
      case 'theme':
        return value;
        
      case 'icon':
        return value;
        
      case 'format':
        return value;
        
      case 'url':
        if (!value || typeof value !== 'string') return null;
        try {
          new URL(value);
          return value;
        } catch {
          return null;
        }
        
      case 'token':
        if (!value || typeof value !== 'string' || value.trim() === '') {
          return null;
        }
        return value.trim();
        
      default:
        return value;
    }
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
    const id = this.safeGetAttribute('id');
    if (!id) {
      this.renderError('エラー: id属性が必要です');
      return;
    }

    this.isLoading = true;

    try {
      const baseUrl = this.safeGetAttribute('api-base') || NostalgicLike.apiBaseUrl;
      const apiUrl = `${baseUrl}/api/like?action=get&id=${encodeURIComponent(id)}`;
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const responseData = await response.json();
      if (responseData.success) {
        this.likeData = responseData.data;
      } else {
        throw new Error(responseData.error || 'APIがエラーを返しました');
      }
    } catch (error) {
      console.error('nostalgic-like: Failed to load data:', error);
      this.likeData = { total: 0, userLiked: false };
    }

    this.isLoading = false;
    this.render();
  }

  async toggleLike() {
    const id = this.safeGetAttribute('id');
    if (!id || this.isLoading) return;

    this.isLoading = true;

    try {
      const baseUrl = this.safeGetAttribute('api-base') || NostalgicLike.apiBaseUrl;
      const toggleUrl = `${baseUrl}/api/like?action=toggle&id=${encodeURIComponent(id)}`;
      
      const response = await fetch(toggleUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const responseData = await response.json();
      if (responseData.success) {
        this.likeData = responseData.data;
      } else {
        throw new Error(responseData.error || 'APIがエラーを返しました');
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
    const theme = this.safeGetAttribute('theme');
    const icon = this.safeGetAttribute('icon');
    const format = this.safeGetAttribute('format');
    
    if (!this.safeGetAttribute('id')) {
      this.renderError('エラー: id属性が必要です');
      return;
    }

    // SVG画像形式の場合
    if (format === 'image') {
      const baseUrl = this.safeGetAttribute('api-base') || NostalgicLike.apiBaseUrl;
      const id = this.safeGetAttribute('id');
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

    // テキスト形式の場合（数字のみ）
    if (format === 'text') {
      const isLoading = this.isLoading;
      const total = this.likeData ? this.likeData.total : 0;
      const userLiked = this.likeData ? this.likeData.userLiked : false;
      
      // テーマ別デフォルト色（CSS変数のフォールバック）
      const textThemes = {
        classic: {
          color: userLiked ? '#0000ff' : '#0066cc',
          hoverColor: userLiked ? '#000080' : '#004499'
        },
        modern: {
          color: userLiked ? '#3742fa' : '#2f3542',
          hoverColor: userLiked ? '#2f32e2' : '#1e2328'
        },
        retro: {
          color: userLiked ? '#8b0000' : '#b22222',
          hoverColor: userLiked ? '#660000' : '#8b1a1a'
        }
      };
      
      const textStyle = textThemes[theme] || textThemes.classic;
      const likedClass = userLiked ? 'liked' : 'unliked';
      
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: inline;
            /* CSS Custom Properties for external customization */
            --like-text-color-unliked: ${textStyle.color};
            --like-text-color-liked: ${userLiked ? textStyle.color : textThemes[theme].color};
            --like-text-hover-color-unliked: ${textStyle.hoverColor};
            --like-text-hover-color-liked: ${userLiked ? textStyle.hoverColor : textThemes[theme].hoverColor};
          }
          .like-text {
            cursor: pointer;
            text-decoration: underline;
            font-family: inherit;
            font-size: inherit;
            opacity: ${isLoading ? '0.6' : '1'};
            transition: color 0.2s ease;
          }
          .like-text.unliked {
            color: var(--like-text-color-unliked, ${textStyle.color});
          }
          .like-text.liked {
            color: var(--like-text-color-liked, ${userLiked ? textStyle.color : textThemes[theme].color});
          }
          .like-text.unliked:hover:not(.loading) {
            color: var(--like-text-hover-color-unliked, ${textStyle.hoverColor});
          }
          .like-text.liked:hover:not(.loading) {
            color: var(--like-text-hover-color-liked, ${userLiked ? textStyle.hoverColor : textThemes[theme].hoverColor});
          }
        </style>
        <span class="like-text ${likedClass} ${isLoading ? 'loading' : ''}" onclick="this.getRootNode().host.toggleLike()">${total}</span>
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
        bgColor: '#f0f0f0',
        hoverBgColor: '#e8e8e8',
        textColor: '#333',
        borderColor: '#333',
        shadowColor: '#333'
      },
      modern: {
        bgColor: '#fff',
        hoverBgColor: '#f8f9fa',
        textColor: '#2f3542',
        borderColor: '#ddd',
        shadowColor: '#ddd'
      },
      retro: {
        bgColor: '#ffe066',
        hoverBgColor: '#ffdd44',
        textColor: '#2d3436',
        borderColor: '#2d3436',
        shadowColor: '#2d3436'
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
          border: 2px solid ${style.borderColor};
          border-radius: 4px;
          box-shadow: 3px 3px 0px ${style.shadowColor};
          cursor: pointer;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          font-weight: bold;
          user-select: none;
          transition: all 0.2s ease;
          opacity: ${isLoading ? '0.6' : '1'};
        }
        
        .like-button:hover:not(.loading) {
          background: ${style.hoverBgColor};
          transform: translate(-1px, -1px);
          box-shadow: 4px 4px 0px ${style.shadowColor};
        }
        
        .like-button:active:not(.loading) {
          transform: translate(1px, 1px);
          box-shadow: 2px 2px 0px ${style.shadowColor};
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

