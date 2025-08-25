/**
 * Nostalgic Ranking Web Component
 * 
 * 使用方法:
 * <script src="/components/ranking.js"></script>
 * <nostalgic-ranking id="your-ranking-id" limit="10" theme="classic" format="interactive"></nostalgic-ranking>
 */

// バリデーション定数は不要になりました（API側でデフォルト値処理）

class NostalgicRanking extends HTMLElement {
  // スクリプトが読み込まれたドメインを自動検出
  static apiBaseUrl = (() => {
    const scripts = document.querySelectorAll('script[src*="ranking.js"]');
    for (const script of scripts) {
      const src = script.getAttribute('src');
      if (src && src.includes('ranking.js')) {
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
    this.rankingData = null;
    this.loading = false;
    this.submitting = false;
  }

  static get observedAttributes() {
    return ['id', 'limit', 'theme', 'format', 'url', 'token'];
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
        
      case 'limit':
        return value;
        
      case 'theme':
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
    this.loadRankingData();
  }

  attributeChangedCallback() {
    this.loadRankingData();
  }

  async loadRankingData() {
    const id = this.safeGetAttribute('id');
    if (!id) {
      this.renderError('ID attribute is required');
      return;
    }

    const limit = this.getAttribute('limit');

    try {
      this.loading = true;
      this.render();

      let url = `${NostalgicRanking.apiBaseUrl}/api/ranking?action=display&id=${encodeURIComponent(id)}`;
      if (limit) {
        url += `&limit=${encodeURIComponent(limit)}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        this.rankingData = data.data;
      } else {
        this.renderError(data.error || 'Failed to load ranking data');
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

  render() {
    const theme = this.safeGetAttribute('theme');

    if (!this.rankingData) {
      this.shadowRoot.innerHTML = `
        <style>
          .ranking-container {
            font-family: 'Courier New', monospace;
            background: #f0f0f0;
            border: 2px solid #333;
            padding: 10px;
            border-radius: 4px;
            box-shadow: 3px 3px 0px #333;
            min-width: 300px;
          }
          .loading {
            color: #666;
            text-align: center;
            padding: 20px;
          }
        </style>
        <div class="ranking-container">
          <div class="loading">${this.loading ? '読み込み中...' : 'データがありません'}</div>
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
        textColor: '#333'
      },
      modern: {
        bgColor: '#fff',
        borderColor: '#ddd',
        headerBg: '#3742fa',
        headerColor: '#fff',
        textColor: '#2f3542'
      },
      retro: {
        bgColor: '#ffe066',
        borderColor: '#2d3436',
        headerBg: '#ff6b6b',
        headerColor: '#2d3436',
        textColor: '#2d3436'
      }
    };

    const style = themeStyles[theme] || themeStyles.classic;
    const entries = this.rankingData.entries || [];

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          margin: 0 auto;
          width: fit-content;
          /* CSS Variables for customization */
          --ranking-bg-color: ${style.bgColor};
          --ranking-border-color: ${style.borderColor};
          --ranking-header-bg: ${style.headerBg};
          --ranking-header-color: ${style.headerColor};
          --ranking-text-color: ${style.textColor};
          --ranking-padding: 10px;
          --ranking-border-radius: 4px;
          --ranking-min-width: 300px;
          --ranking-max-width: 500px;
          --ranking-item-padding: 6px 10px;
        }
        .ranking-container {
          font-family: var(--ranking-font-family, 'Courier New', monospace);
          background: var(--ranking-bg-color);
          border: 2px solid var(--ranking-border-color);
          border-radius: var(--ranking-border-radius);
          box-shadow: 3px 3px 0px var(--ranking-border-color);
          min-width: var(--ranking-min-width);
          max-width: var(--ranking-max-width);
        }
        .ranking-header {
          background: var(--ranking-header-bg);
          color: var(--ranking-header-color);
          padding: var(--ranking-header-padding, 8px);
          text-align: center;
          font-weight: bold;
          border-bottom: 2px solid var(--ranking-border-color);
        }
        .ranking-list {
          padding: 10px;
          margin: 0;
          list-style: none;
        }
        .ranking-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--ranking-item-padding);
          border-bottom: 1px solid var(--ranking-border-color);
          color: var(--ranking-text-color);
        }
        .ranking-item:last-child {
          border-bottom: none;
        }
        .ranking-item:nth-child(1) .rank {
          color: #ffd700;
          font-weight: bold;
        }
        .ranking-item:nth-child(2) .rank {
          color: #c0c0c0;
          font-weight: bold;
        }
        .ranking-item:nth-child(3) .rank {
          color: #cd7f32;
          font-weight: bold;
        }
        .rank {
          min-width: 30px;
          text-align: center;
          font-weight: bold;
        }
        .name {
          flex: 1;
          margin: 0 40px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .score {
          font-weight: bold;
          min-width: 60px;
          text-align: right;
        }
        .empty-message {
          text-align: center;
          padding: 15px;
          color: #666;
          font-size: 14px;
        }
        .submit-form {
          border-top: 2px solid var(--ranking-border-color);
          margin-top: 10px;
          padding-top: 10px;
        }
        .form-header {
          background: var(--ranking-header-bg);
          color: var(--ranking-header-color);
          padding: 6px 8px;
          text-align: center;
          font-weight: bold;
          font-size: 12px;
          margin-bottom: 8px;
        }
        .form-row {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .form-row input {
          font-family: inherit;
          font-size: 12px;
          padding: 4px 6px;
          border: 1px solid var(--ranking-border-color);
          border-radius: 2px;
          background: var(--ranking-bg-color);
          color: var(--ranking-text-color);
        }
        .form-row input[type="text"] {
          flex: 2;
        }
        .form-row input[type="number"] {
          flex: 1;
        }
        .form-row button {
          font-family: inherit;
          font-size: 12px;
          padding: 4px 8px;
          background: var(--ranking-header-bg);
          color: var(--ranking-header-color);
          border: 1px solid var(--ranking-border-color);
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
      <div class="ranking-container">
        <div class="ranking-header">RANKING</div>
        ${entries.length > 0 ? `
          <ul class="ranking-list">
            ${entries.map((entry, index) => `
              <li class="ranking-item">
                <span class="rank">${entry.rank || (index + 1)}</span>
                <span class="name">${this.escapeHtml(entry.name || 'Anonymous')}</span>
                <span class="score">${entry.displayScore || entry.score || 0}</span>
              </li>
            `).join('')}
          </ul>
        ` : `
          <div class="empty-message">まだランキングがありません</div>
        `}
        ${this.safeGetAttribute('url') && this.safeGetAttribute('token') ? `
          <div class="submit-form">
            <div class="form-header">スコア送信</div>
            <div class="form-row">
              <input type="text" id="score-name" placeholder="お名前" maxlength="50">
              <input type="number" id="score-value" placeholder="スコア" min="0">
              <button id="submit-button" onclick="this.getRootNode().host.submitScore()">送信</button>
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
          min-width: 200px;
        }
      </style>
      <div class="error-container">
        ❌ ${message}
      </div>
    `;
  }

  async submitScore() {
    const url = this.safeGetAttribute('url');
    const token = this.safeGetAttribute('token');
    
    if (!url || !token) {
      alert('エラー: url と token 属性がスコア送信に必要です');
      return;
    }

    const nameInput = this.shadowRoot.querySelector('#score-name');
    const scoreInput = this.shadowRoot.querySelector('#score-value');
    
    // 安全な入力値検証
    if (!nameInput || !scoreInput) {
      alert('エラー: フォーム要素が見つかりません');
      return;
    }

    let rawName = '';
    let rawScore = '';

    // 存在チェックと型チェック
    try {
      rawName = (typeof nameInput.value === 'string' ? nameInput.value : '').trim();
      rawScore = (typeof scoreInput.value === 'string' ? scoreInput.value : '').trim();
    } catch (error) {
      alert('エラー: 入力値の取得に失敗しました');
      return;
    }

    // 致命的エラー防止のみ（軽微なバリデーションはAPI側に任せる）
    const name = typeof rawName === 'string' ? rawName : '';
    const score = typeof rawScore === 'string' ? parseInt(rawScore, 10) : NaN;

    // 致命的な状態のみチェック
    if (typeof name !== 'string') {
      console.error('Fatal: name is not a string');
      return;
    }

    this.submitting = true;
    this.updateSubmitButton();

    try {
      const baseUrl = this.safeGetAttribute('api-base') || NostalgicRanking.apiBaseUrl;
      const submitUrl = `${baseUrl}/api/ranking?action=submit&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}&name=${encodeURIComponent(name)}&score=${encodeURIComponent(score)}`;
      
      const response = await fetch(submitUrl);
      const data = await response.json();

      if (data.success) {
        // 成功: フォームをクリアして再読み込み
        nameInput.value = '';
        scoreInput.value = '';
        await this.loadRankingData();
        alert('スコアが正常に送信されました！');
      } else {
        throw new Error(data.error || 'Failed to submit score');
      }
    } catch (error) {
      console.error('Submit score failed:', error);
      alert(`スコアの送信に失敗しました: ${error.message}`);
    } finally {
      this.submitting = false;
      this.updateSubmitButton();
    }
  }

  updateSubmitButton() {
    const button = this.shadowRoot.querySelector('#submit-button');
    if (button) {
      button.disabled = this.submitting;
      button.textContent = this.submitting ? '送信中...' : '送信';
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Web Componentを登録
if (!customElements.get('nostalgic-ranking')) {
  customElements.define('nostalgic-ranking', NostalgicRanking);
}

