# Web Components Customization Guide

## 🎨 スタイルカスタマイズ方法

Nostalgic Web Componentsは複数の方法でスタイルをカスタマイズできます。

## 1. CSS Custom Properties（推奨）

### Ranking Component

```html
<style>
  nostalgic-ranking {
    /* サイズ調整 */
    --ranking-min-width: 250px;
    --ranking-max-width: 500px;
    --ranking-padding: 15px;
    
    /* 色調整 */
    --ranking-bg-color: #f8f9fa;
    --ranking-border-color: #007bff;
    --ranking-header-bg: #007bff;
    --ranking-header-color: white;
    --ranking-text-color: #333;
    
    /* フォント調整 */
    --ranking-font-family: 'Arial', sans-serif;
    
    /* アイテム間隔調整 */
    --ranking-item-padding: 10px 15px;
    --ranking-header-padding: 12px;
  }
</style>

<nostalgic-ranking id="game-abc123" theme="custom"></nostalgic-ranking>
```

### BBS Component

```html
<style>
  nostalgic-bbs {
    /* サイズ調整 */
    --bbs-min-width: 400px;
    --bbs-max-width: 800px;
    --bbs-max-height: 500px;
    
    /* メッセージ調整 */
    --bbs-message-padding: 12px;
    --bbs-message-margin: 8px;
    --bbs-message-border-radius: 8px;
    
    /* 色調整 */
    --bbs-bg-color: #ffffff;
    --bbs-border-color: #28a745;
    --bbs-header-bg: #28a745;
    --bbs-header-color: white;
    --bbs-message-bg: #f8f9fa;
    --bbs-text-color: #212529;
    
    /* フォント調整 */
    --bbs-font-family: 'Helvetica', sans-serif;
  }
</style>

<nostalgic-bbs id="site-def456"></nostalgic-bbs>
```

### Counter Component

```html
<style>
  nostalgic-counter {
    /* カスタム色 */
    --counter-bg-color: #e9ecef;
    --counter-text-color: #495057;
    --counter-border-color: #6c757d;
  }
</style>

<nostalgic-counter id="blog-ghi789"></nostalgic-counter>
```

### Like Component

```html
<style>
  nostalgic-like {
    /* カスタム色 */
    --like-bg-color: #ffeaa7;
    --like-text-color: #2d3436;
    --like-border-color: #fdcb6e;
  }
</style>

<nostalgic-like id="blog-jkl012"></nostalgic-like>
```

## 2. テーマ作成

### カスタムテーマCSS例

```html
<style>
  /* 企業ブランド風テーマ */
  .corporate-theme {
    --ranking-bg-color: #ffffff;
    --ranking-border-color: #0066cc;
    --ranking-header-bg: linear-gradient(135deg, #0066cc, #004499);
    --ranking-header-color: white;
    --ranking-text-color: #333333;
    --ranking-font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    --ranking-border-radius: 8px;
    --ranking-item-padding: 12px 16px;
  }
  
  /* ダークテーマ */
  .dark-theme {
    --bbs-bg-color: #2c3e50;
    --bbs-border-color: #34495e;
    --bbs-header-bg: #34495e;
    --bbs-header-color: #ecf0f1;
    --bbs-message-bg: #34495e;
    --bbs-text-color: #ecf0f1;
    --bbs-message-border-radius: 6px;
  }
  
  /* ゲーム風テーマ */
  .game-theme {
    --ranking-bg-color: #1a1a2e;
    --ranking-border-color: #16213e;
    --ranking-header-bg: linear-gradient(45deg, #e94560, #f39c12);
    --ranking-header-color: white;
    --ranking-text-color: #eee;
    --ranking-font-family: 'Courier New', monospace;
    --ranking-border-radius: 0;
    --ranking-item-padding: 8px 12px;
  }
</style>

<nostalgic-ranking class="corporate-theme" id="business-ranking"></nostalgic-ranking>
<nostalgic-bbs class="dark-theme" id="dark-bbs"></nostalgic-bbs>
<nostalgic-ranking class="game-theme" id="game-ranking"></nostalgic-ranking>
```

## 3. レスポンシブ対応

```html
<style>
  /* スマホ対応 */
  @media (max-width: 768px) {
    nostalgic-ranking {
      --ranking-min-width: 280px;
      --ranking-max-width: 100%;
      --ranking-item-padding: 8px 12px;
    }
    
    nostalgic-bbs {
      --bbs-min-width: 280px;
      --bbs-max-width: 100%;
      --bbs-max-height: 300px;
      --bbs-message-padding: 8px;
    }
  }
  
  /* デスクトップ対応 */
  @media (min-width: 1200px) {
    nostalgic-ranking {
      --ranking-max-width: 600px;
    }
    
    nostalgic-bbs {
      --bbs-max-width: 900px;
      --bbs-max-height: 600px;
    }
  }
</style>
```

## 4. 高度なカスタマイズ例

### 表形式ランキング

```html
<style>
  .table-style-ranking {
    --ranking-bg-color: white;
    --ranking-border-color: #dee2e6;
    --ranking-header-bg: #f8f9fa;
    --ranking-header-color: #495057;
    --ranking-text-color: #212529;
    --ranking-item-padding: 12px 16px;
    --ranking-border-radius: 0;
    --ranking-font-family: 'Arial', sans-serif;
    --ranking-min-width: 400px;
  }
</style>

<nostalgic-ranking class="table-style-ranking" id="table-ranking"></nostalgic-ranking>
```

### チャット風BBS

```html
<style>
  .chat-style-bbs {
    --bbs-bg-color: #f1f3f4;
    --bbs-border-color: transparent;
    --bbs-header-bg: #4285f4;
    --bbs-header-color: white;
    --bbs-message-bg: white;
    --bbs-text-color: #202124;
    --bbs-message-border-radius: 18px;
    --bbs-message-padding: 10px 16px;
    --bbs-message-margin: 2px 8px;
    --bbs-border-radius: 12px;
    --bbs-max-width: 700px;
    --bbs-font-family: 'Roboto', sans-serif;
  }
</style>

<nostalgic-bbs class="chat-style-bbs" id="chat-bbs"></nostalgic-bbs>
```

## 5. 利用可能なCSS Variables一覧

### Ranking Component
- `--ranking-bg-color`: 背景色
- `--ranking-border-color`: 枠線色
- `--ranking-header-bg`: ヘッダー背景色
- `--ranking-header-color`: ヘッダー文字色
- `--ranking-text-color`: 本文色
- `--ranking-font-family`: フォント
- `--ranking-padding`: 内部余白
- `--ranking-border-radius`: 角丸
- `--ranking-min-width`: 最小幅
- `--ranking-max-width`: 最大幅
- `--ranking-item-padding`: 項目内余白
- `--ranking-header-padding`: ヘッダー内余白

### BBS Component
- `--bbs-bg-color`: 背景色
- `--bbs-border-color`: 枠線色
- `--bbs-header-bg`: ヘッダー背景色
- `--bbs-header-color`: ヘッダー文字色
- `--bbs-message-bg`: メッセージ背景色
- `--bbs-text-color`: 文字色
- `--bbs-font-family`: フォント
- `--bbs-border-radius`: 角丸
- `--bbs-min-width`: 最小幅
- `--bbs-max-width`: 最大幅
- `--bbs-message-padding`: メッセージ内余白
- `--bbs-message-margin`: メッセージ間隔
- `--bbs-message-border-radius`: メッセージ角丸
- `--bbs-max-height`: 最大高さ
- `--bbs-header-padding`: ヘッダー内余白

## 💡 Tips

1. **段階的カスタマイズ**: まず基本的な色から変更し、徐々に細かい調整を行う
2. **テーマファイル化**: よく使う組み合わせは別CSSファイルにまとめる
3. **ブラウザ互換性**: CSS Variables はモダンブラウザでサポート
4. **デバッグ**: ブラウザの開発者ツールでCSS Variablesを確認可能

## 🚀 1990年代風からモダンまで

従来の1990年代風デザインから、最新のフラットデザインまで、CSS Variablesで簡単に切り替え可能です！