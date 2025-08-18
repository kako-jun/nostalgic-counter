/**
 * Nostalgic Ranking Web Component
 * 
 * 使用方法:
 * <script src="/components/ranking.js"></script>
 * <nostalgic-ranking id="your-ranking-id" limit="10" theme="classic"></nostalgic-ranking>
 */

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
  }

  static get observedAttributes() {
    return ['id', 'limit', 'theme'];
  }

  connectedCallback() {
    this.loadRankingData();
  }

  attributeChangedCallback() {
    this.loadRankingData();
  }

  async loadRankingData() {
    const id = this.getAttribute('id');
    if (!id) {
      this.renderError('ID attribute is required');
      return;
    }

    const limit = this.getAttribute('limit') || '10';

    try {
      this.loading = true;
      this.render();

      const response = await fetch(`${NostalgicRanking.apiBaseUrl}/api/ranking?action=get&id=${encodeURIComponent(id)}&limit=${encodeURIComponent(limit)}`);
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
    const theme = this.getAttribute('theme') || 'classic';

    if (!this.rankingData) {
      this.shadowRoot.innerHTML = `
        <style>
          .ranking-container {
            font-family: 'Courier New', monospace;
            background: #f0f0f0;
            border: 2px solid #333;
            padding: 10px;
            border-radius: 4px;
            box-shadow: 2px 2px 0px #333;
            min-width: 200px;
          }
          .loading {
            color: #666;
            text-align: center;
            padding: 20px;
          }
        </style>
        <div class="ranking-container">
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
          /* CSS Variables for customization */
          --ranking-bg-color: ${style.bgColor};
          --ranking-border-color: ${style.borderColor};
          --ranking-header-bg: ${style.headerBg};
          --ranking-header-color: ${style.headerColor};
          --ranking-text-color: ${style.textColor};
          --ranking-padding: 10px;
          --ranking-border-radius: 4px;
          --ranking-min-width: 200px;
          --ranking-max-width: 400px;
          --ranking-item-padding: 6px 10px;
        }
        .ranking-container {
          font-family: var(--ranking-font-family, 'Courier New', monospace);
          background: var(--ranking-bg-color);
          border: 2px solid var(--ranking-border-color);
          border-radius: var(--ranking-border-radius);
          box-shadow: 2px 2px 0px var(--ranking-border-color);
          min-width: var(--ranking-min-width);
          max-width: var(--ranking-max-width);
          padding: var(--ranking-padding);
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
          padding: 0;
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
          margin: 0 8px;
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
          padding: 20px;
          color: #666;
          font-style: italic;
        }
      </style>
      <div class="ranking-container">
        <div class="ranking-header">🏆 RANKING</div>
        ${entries.length > 0 ? `
          <ul class="ranking-list">
            ${entries.map((entry, index) => `
              <li class="ranking-item">
                <span class="rank">${entry.rank || (index + 1)}</span>
                <span class="name">${this.escapeHtml(entry.name || 'Anonymous')}</span>
                <span class="score">${entry.score || 0}</span>
              </li>
            `).join('')}
          </ul>
        ` : `
          <div class="empty-message">No rankings yet</div>
        `}
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

// コンソールに使用方法を表示
console.log('🏆 Nostalgic Ranking loaded!');
console.log('Usage: <nostalgic-ranking id="your-ranking-id" limit="10" theme="classic"></nostalgic-ranking>');
console.log('Docs: https://nostalgic.llll-ll.com');