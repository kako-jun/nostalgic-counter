/**
 * Nostalgic BBS Web Component
 * 
 * 使用方法:
 * <script src="/components/bbs.js"></script>
 * <nostalgic-bbs id="your-bbs-id" page="1" theme="classic" format="interactive"></nostalgic-bbs>
 */

class NostalgicBBS extends HTMLElement {
  // スクリプトが読み込まれたドメインを自動検出
  static apiBaseUrl = (() => {
    const scripts = document.querySelectorAll('script[src*="bbs.js"]');
    for (const script of scripts) {
      const src = script.getAttribute('src');
      if (src && src.includes('bbs.js')) {
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
    this.bbsData = null;
    this.loading = false;
    this.currentPage = 1;
    this.posting = false;
  }

  static get observedAttributes() {
    return ['id', 'page', 'theme', 'format', 'url', 'token'];
  }

  connectedCallback() {
    this.currentPage = parseInt(this.getAttribute('page') || '1');
    this.loadBBSData();
  }

  attributeChangedCallback() {
    this.currentPage = parseInt(this.getAttribute('page') || '1');
    this.loadBBSData();
  }

  async loadBBSData() {
    const id = this.getAttribute('id');
    if (!id) {
      this.renderError('ID attribute is required');
      return;
    }

    try {
      this.loading = true;
      this.render();

      const response = await fetch(`${NostalgicBBS.apiBaseUrl}/api/bbs?action=display&id=${encodeURIComponent(id)}&page=${this.currentPage}`);
      const data = await response.json();

      if (data.success) {
        this.bbsData = data.data;
      } else {
        this.renderError(data.error || 'Failed to load BBS data');
        return;
      }
    } catch (error) {
      this.renderError(`Network error: ${error.message}`);
      return;
    } finally {
      this.loading = false;
    }

    this.render();
  }

  async changePage(newPage) {
    this.currentPage = newPage;
    this.setAttribute('page', newPage.toString());
    await this.loadBBSData();
  }

  render() {
    const theme = this.getAttribute('theme') || 'classic';

    if (!this.bbsData) {
      this.shadowRoot.innerHTML = `
        <style>
          .bbs-container {
            font-family: 'Courier New', monospace;
            background: #f0f0f0;
            border: 2px solid #333;
            padding: 10px;
            border-radius: 4px;
            box-shadow: 2px 2px 0px #333;
            min-width: 300px;
            max-width: 600px;
          }
          .loading {
            color: #666;
            text-align: center;
            padding: 20px;
          }
        </style>
        <div class="bbs-container">
          <div class="loading">${this.loading ? 'Loading...' : 'No data'}</div>
        </div>
      `;
      return;
    }

    // テーマ別のスタイル
    const themeStyles = {
      classic: {
        bgColor: '#f0f0f0',
        borderColor: '#333',
        headerBg: '#ccc',
        headerColor: '#000',
        messageBg: '#fff',
        textColor: '#333'
      },
      modern: {
        bgColor: '#fff',
        borderColor: '#ddd',
        headerBg: '#3742fa',
        headerColor: '#fff',
        messageBg: '#f8f9fa',
        textColor: '#2f3542'
      },
      retro: {
        bgColor: '#ffe066',
        borderColor: '#2d3436',
        headerBg: '#ff6b6b',
        headerColor: '#2d3436',
        messageBg: '#fff',
        textColor: '#2d3436'
      }
    };

    const style = themeStyles[theme] || themeStyles.classic;
    const messages = this.bbsData.messages || [];
    const pagination = this.bbsData.pagination || {};

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          /* CSS Variables for customization */
          --bbs-bg-color: ${style.bgColor};
          --bbs-border-color: ${style.borderColor};
          --bbs-header-bg: ${style.headerBg};
          --bbs-header-color: ${style.headerColor};
          --bbs-message-bg: ${style.messageBg};
          --bbs-text-color: ${style.textColor};
          --bbs-border-radius: 4px;
          --bbs-min-width: 300px;
          --bbs-max-width: 600px;
          --bbs-message-padding: 8px;
          --bbs-message-margin: 5px;
          --bbs-max-height: 400px;
        }
        .bbs-container {
          font-family: var(--bbs-font-family, 'Courier New', monospace);
          background: var(--bbs-bg-color);
          border: 2px solid var(--bbs-border-color);
          border-radius: var(--bbs-border-radius);
          box-shadow: 2px 2px 0px var(--bbs-border-color);
          min-width: var(--bbs-min-width);
          max-width: var(--bbs-max-width);
        }
        .bbs-header {
          background: var(--bbs-header-bg);
          color: var(--bbs-header-color);
          padding: var(--bbs-header-padding, 8px);
          text-align: center;
          font-weight: bold;
          border-bottom: 2px solid var(--bbs-border-color);
        }
        .bbs-messages {
          max-height: var(--bbs-max-height);
          overflow-y: auto;
        }
        .message-item {
          background: var(--bbs-message-bg);
          margin: var(--bbs-message-margin);
          padding: var(--bbs-message-padding);
          border: 1px solid var(--bbs-border-color);
          border-radius: var(--bbs-message-border-radius, 2px);
          color: var(--bbs-text-color);
        }
        .message-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
          font-size: 12px;
          color: #666;
        }
        .message-author {
          font-weight: bold;
        }
        .message-time {
          font-size: 10px;
        }
        .message-content {
          margin: 4px 0;
          line-height: 1.4;
          word-wrap: break-word;
        }
        .message-meta {
          font-size: 10px;
          color: #999;
          margin-top: 4px;
        }
        .pagination {
          padding: 10px;
          text-align: center;
          border-top: 1px solid ${style.borderColor};
        }
        .pagination button {
          background: ${style.headerBg};
          color: ${style.headerColor};
          border: 1px solid ${style.borderColor};
          padding: 4px 8px;
          margin: 0 2px;
          cursor: pointer;
          font-family: inherit;
          font-size: 12px;
        }
        .pagination button:hover {
          opacity: 0.8;
        }
        .pagination button:disabled {
          opacity: 0.5;
          cursor: default;
        }
        .pagination .current-page {
          font-weight: bold;
          background: ${style.textColor};
          color: ${style.bgColor};
        }
        .empty-message {
          text-align: center;
          padding: 40px 20px;
          color: #666;
          font-style: italic;
        }
        .post-form {
          border-top: 2px solid var(--bbs-border-color);
          margin-top: 10px;
          padding-top: 10px;
        }
        .form-header {
          background: var(--bbs-header-bg);
          color: var(--bbs-header-color);
          padding: 6px 8px;
          text-align: center;
          font-weight: bold;
          font-size: 12px;
          margin-bottom: 8px;
        }
        .form-body {
          padding: 0 5px;
        }
        .form-row {
          margin-bottom: 6px;
          display: flex;
          gap: 6px;
          align-items: flex-start;
        }
        .form-row input, .form-row select, .form-row textarea {
          font-family: inherit;
          font-size: 12px;
          padding: 4px 6px;
          border: 1px solid var(--bbs-border-color);
          border-radius: 2px;
          background: var(--bbs-message-bg);
          color: var(--bbs-text-color);
        }
        .form-row input[type="text"] {
          flex: 2;
        }
        .form-row select {
          flex: 1;
        }
        .form-row textarea {
          flex: 1;
          width: 100%;
          resize: vertical;
          min-height: 60px;
        }
        .form-row button {
          font-family: inherit;
          font-size: 12px;
          padding: 6px 12px;
          background: var(--bbs-header-bg);
          color: var(--bbs-header-color);
          border: 1px solid var(--bbs-border-color);
          border-radius: 2px;
          cursor: pointer;
          font-weight: bold;
        }
        .form-row button:hover:not(:disabled) {
          opacity: 0.8;
        }
        .form-row button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      </style>
      <div class="bbs-container">
        <div class="bbs-header">💬 BBS</div>
        <div class="bbs-messages">
          ${messages.length > 0 ? 
            messages.map(message => `
              <div class="message-item">
                <div class="message-header">
                  <span class="message-author">${this.escapeHtml(message.author || 'Anonymous')}</span>
                  <span class="message-time">${this.formatDate(message.timestamp)}</span>
                </div>
                <div class="message-content">${this.escapeHtml(message.message || '')}</div>
                ${message.icon || message.selects ? `
                  <div class="message-meta">
                    ${message.icon ? `Icon: ${message.icon}` : ''}
                    ${message.selects ? Object.entries(message.selects).map(([key, value]) => `${key}: ${value}`).join(', ') : ''}
                  </div>
                ` : ''}
              </div>
            `).join('') 
            : `<div class="empty-message">No messages yet</div>`
          }
        </div>
        ${pagination.totalPages > 1 ? `
          <div class="pagination">
            <button ${!pagination.hasPrev ? 'disabled' : ''} onclick="this.getRootNode().host.changePage(${pagination.page - 1})">
              &lt; Prev
            </button>
            <span class="current-page">Page ${pagination.page} / ${pagination.totalPages}</span>
            <button ${!pagination.hasNext ? 'disabled' : ''} onclick="this.getRootNode().host.changePage(${pagination.page + 1})">
              Next &gt;
            </button>
          </div>
        ` : ''}
        ${this.getAttribute('url') && this.getAttribute('token') ? `
          <div class="post-form">
            <div class="form-header">Post Message</div>
            <div class="form-body">
              <div class="form-row">
                <input type="text" id="message-author" placeholder="Name (optional)" maxlength="50">
                <select id="message-icon">
                  <option value="">No icon</option>
                  <option value="😀">😀</option>
                  <option value="😉">😉</option>
                  <option value="😎">😎</option>
                  <option value="😠">😠</option>
                  <option value="😢">😢</option>
                  <option value="😮">😮</option>
                </select>
              </div>
              <div class="form-row">
                <textarea id="message-content" placeholder="Enter your message..." maxlength="1000" rows="3"></textarea>
              </div>
              <div class="form-row">
                <button id="post-button" onclick="this.getRootNode().host.postMessage()">Post</button>
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  renderError(message) {
    this.shadowRoot.innerHTML = `
      <style>
        .error-container {
          font-family: 'Courier New', monospace;
          background: #ffebee;
          border: 2px solid #f44336;
          padding: 10px;
          border-radius: 4px;
          color: #d32f2f;
          font-size: 12px;
          min-width: 300px;
        }
      </style>
      <div class="error-container">
        ❌ ${message}
      </div>
    `;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  async postMessage() {
    const url = this.getAttribute('url');
    const token = this.getAttribute('token');
    
    if (!url || !token) {
      alert('Error: url and token attributes are required for message posting');
      return;
    }

    const authorInput = this.shadowRoot.querySelector('#message-author');
    const messageInput = this.shadowRoot.querySelector('#message-content');
    const iconSelect = this.shadowRoot.querySelector('#message-icon');
    
    const author = authorInput.value.trim() || '名無しさん';
    const message = messageInput.value.trim();
    const icon = iconSelect ? iconSelect.value : '';

    if (!message) {
      alert('Please enter a message');
      return;
    }

    this.posting = true;
    this.updatePostButton();

    try {
      const baseUrl = this.getAttribute('api-base') || NostalgicBBS.apiBaseUrl;
      const postUrl = `${baseUrl}/api/bbs?action=post&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}&author=${encodeURIComponent(author)}&message=${encodeURIComponent(message)}${icon ? `&icon=${encodeURIComponent(icon)}` : ''}`;
      
      const response = await fetch(postUrl);
      const data = await response.json();

      if (data.success) {
        // 成功: フォームをクリアして再読み込み
        authorInput.value = '';
        messageInput.value = '';
        if (iconSelect) iconSelect.value = '';
        
        // 最新ページに移動して再読み込み
        this.currentPage = 1;
        this.setAttribute('page', '1');
        await this.loadBBSData();
      } else {
        throw new Error(data.error || 'Failed to post message');
      }
    } catch (error) {
      console.error('Post message failed:', error);
      alert(`Failed to post message: ${error.message}`);
    } finally {
      this.posting = false;
      this.updatePostButton();
    }
  }

  updatePostButton() {
    const button = this.shadowRoot.querySelector('#post-button');
    if (button) {
      button.disabled = this.posting;
      button.textContent = this.posting ? 'Posting...' : 'Post';
    }
  }

  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  }
}

// Web Componentを登録
if (!customElements.get('nostalgic-bbs')) {
  customElements.define('nostalgic-bbs', NostalgicBBS);
}

// コンソールに使用方法を表示
console.log('💬 Nostalgic BBS loaded!');
console.log('Usage: <nostalgic-bbs id="your-bbs-id" page="1" theme="classic" url="https://example.com" token="your-token"></nostalgic-bbs>');
console.log('Themes: classic, modern, retro');
console.log('Formats: interactive (default)');
console.log('Note: url and token attributes are required for message posting');
console.log('Docs: https://nostalgic.llll-ll.com');