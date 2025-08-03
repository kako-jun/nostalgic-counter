export default function Test2Page() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">テストページ2</h1>
      <p className="text-center text-gray-600 mb-8">別URLでのカウンターテスト用ページです</p>

      <div className="max-w-4xl mx-auto">
        <section className="mb-12 text-center">
          <h2 className="text-2xl font-semibold mb-4">このページのカウンター</h2>
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <div>
              <h3 className="text-sm font-medium mb-2">総訪問数（クラシック）</h3>
              <img src="/api/display?url=http://localhost:3000/test2&type=total&style=classic" alt="総訪問数" />
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">今日の訪問数（モダン）</h3>
              <img src="/api/display?url=http://localhost:3000/test2&type=today&style=modern" alt="今日の訪問数" />
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">昨日の訪問数（レトロ）</h3>
              <img src="/api/display?url=http://localhost:3000/test2&type=yesterday&style=retro" alt="昨日の訪問数" />
            </div>
          </div>

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>テスト2ページ:</strong> このページは Test1 とは独立したカウンターを持ちます。
              URLが異なるため、それぞれ別々にカウントされます。
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">カウンターの確認方法</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>このページを何度か更新して、カウンターが増加することを確認</li>
              <li>Test1ページに移動して、別のカウンターが動作することを確認</li>
              <li>24時間以内の重複訪問は除外される仕組みを確認</li>
              <li>異なるスタイル（classic, modern, retro）の表示を確認</li>
            </ol>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">ナビゲーション</h2>
          <div className="flex gap-4 justify-center">
            <a href="/" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              ホーム
            </a>
            <a href="/test1" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              テストページ1
            </a>
            <a href="/blog" className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
              ブログサンプル
            </a>
          </div>
        </section>
      </div>

      {/* カウント用スクリプト */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            fetch('/api/count?url=' + encodeURIComponent(window.location.href))
              .then(r => r.json())
              .then(d => console.log('カウント完了:', d))
              .catch(e => console.error('カウントエラー:', e));
          `,
        }}
      />
    </main>
  );
}
