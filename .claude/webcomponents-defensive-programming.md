# WebComponents防御的プログラミング方針

## 基本原則

### 1. JavaScriptバリデーションの目的
WebComponentsでのバリデーションは**致命的エラー防止**のみを目的とする。

**✅ JS側で防ぐべき：**
- 画面の真っ白化、クラッシュ
- `null`/`undefined`での例外
- 型違いでの実行時エラー
- DOM要素が見つからない場合のエラー

**❌ JS側でやらない：**
- ユーザー入力の妥当性チェック（文字数制限等）
- ビジネスロジックの検証
- alert()でのエラー表示
- デフォルト値の補完（API側のスキーマに任せる）
- 属性の型変換や正規化（スキーマに任せる）

### 2. エラー表示の責任分担

**API側（サーバー）：**
- 全てのビジネスルール検証
- 統一されたエラーレスポンス
- 既存の赤文字エラー表示機構

**JS側（WebComponents）：**
- 型安全性の確保
- DOM操作の安全性
- クラッシュ防止のみ

## 実装パターン

### 安全なアトリビュート処理
```javascript
safeGetAttribute(name) {
  const value = this.getAttribute(name);
  
  switch (name) {
    case 'id':
      if (!value || typeof value !== 'string' || value.trim() === '') {
        return null; // 致命的エラー防止
      }
      return value.trim();
      
    case 'limit':
      // デフォルト値補完は行わない（API側のスキーマに任せる）
      return value;
      
    default:
      return value;
  }
}
```

### 安全なフォーム処理
```javascript
async postMessage() {
  // DOM要素の存在確認（致命的エラー防止）
  const authorInput = this.shadowRoot.querySelector('#message-author');
  const messageInput = this.shadowRoot.querySelector('#message-content');
  
  if (!authorInput || !messageInput) {
    console.error('Fatal: form elements not found');
    return; // 静かに失敗
  }

  // 型安全性の確保（致命的エラー防止）
  let rawAuthor = '';
  let rawMessage = '';
  
  try {
    rawAuthor = (typeof authorInput.value === 'string' ? authorInput.value : '').trim();
    rawMessage = (typeof messageInput.value === 'string' ? messageInput.value : '').trim();
  } catch (error) {
    console.error('Fatal: input value access failed', error);
    return; // 静かに失敗
  }

  // 最小限の型変換（バリデーションエラーはAPI側に任せる）
  const author = typeof rawAuthor === 'string' ? rawAuthor || '名無しさん' : '名無しさん';
  const message = typeof rawMessage === 'string' ? rawMessage : '';

  // 致命的状態のみチェック
  if (typeof author !== 'string' || typeof message !== 'string') {
    console.error('Fatal: author or message is not a string');
    return;
  }

  // API呼び出し（バリデーションエラーはAPI側で処理）
  // エラーは既存の赤文字表示機構で表示される
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (data.success) {
      // 成功処理
    } else {
      // エラーは既存のshowMessage()で表示（赤文字）
      this.showMessage(data.error || 'Failed to post message');
    }
  } catch (error) {
    // ネットワークエラー等
    this.showMessage(`Network error: ${error.message}`);
  }
}
```

## やってはいけないパターン

### ❌ alert()の使用
```javascript
// NG: ユーザー体験を損なう
if (!name) {
  alert('名前を入力してください');
  return;
}
```

### ❌ 過度なバリデーション
```javascript
// NG: API側と重複、エラー表示が二重になる
if (message.length > 200) {
  this.showMessage('メッセージは200文字以内で入力してください');
  return;
}
```

### ❌ 複雑なビジネスロジック
```javascript
// NG: WebComponents側でビジネスルールを実装
if (score < 0 || score > 9999999) {
  alert('スコアは0以上9999999以下で入力してください');
  return;
}
```

## 推奨パターン

### ✅ 型安全性の確保
```javascript
// OK: クラッシュ防止
const name = typeof rawName === 'string' ? rawName : '';
```

### ✅ DOM要素の存在確認
```javascript
// OK: 致命的エラー防止
if (!nameInput || !scoreInput) {
  console.error('Fatal: form elements not found');
  return;
}
```

### ✅ 既存エラー表示機構の活用
```javascript
// OK: 統一されたUI
if (!response.ok) {
  this.showMessage(data.error || 'Operation failed');
}
```

## URL生成時の注意点

### 属性が未指定の場合の処理
```javascript
// ✅ OK: 未指定属性はURLから除外
const format = this.safeGetAttribute('format');
let url = `${baseUrl}/api/service?action=display&id=${id}`;
if (format) {
  url += `&format=${format}`;
}

// ❌ NG: nullやundefinedをURLに含める
const format = this.safeGetAttribute('format') || 'default';
const url = `${baseUrl}/api/service?action=display&id=${id}&format=${format}`;
// → format=nullのようなURLになる危険性
```

### API側との責任分担
- **WebComponents側**：属性が存在する場合のみURLパラメータに含める
- **API側**：パラメータが未指定の場合、スキーマで定義されたデフォルト値を適用

## まとめ

WebComponentsでのJavaScriptバリデーションは：
- **防御的プログラミング**：クラッシュを防ぐ
- **型安全性**：実行時エラーを防ぐ  
- **API連携**：ユーザーエラーはサーバー側に任せる
- **スキーマ尊重**：デフォルト値やバリデーションはAPI側のスキーマに任せる

この方針により、堅牢性とUXを両立させ、単一の真実の源泉を維持する。