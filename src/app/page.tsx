export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Nostalgic Counter</h1>
      <p className="text-center text-gray-600 mb-8">昔懐かしいホームページカウンターを最新技術で復活</p>

      <div className="max-w-4xl mx-auto">
        {/* デモ表示 */}
        <section className="mb-12 text-center">
          <h2 className="text-2xl font-semibold mb-4">デモ</h2>
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <img src="/api/counter?id=example-a1b2c3d4&type=total&style=classic" alt="classic style counter" />
            <img src="/api/counter?id=example-a1b2c3d4&type=today&style=modern" alt="modern style counter" />
            <img src="/api/counter?id=example-a1b2c3d4&type=week&style=retro" alt="retro style counter" />
          </div>
          <p className="text-sm text-gray-500">クラシック・モダン・レトロの3つのスタイルが利用可能</p>
        </section>

        <div className="grid md:grid-cols-2 gap-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">📊 カウンター設置方法</h2>
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <p className="mb-2 font-medium">1. 訪問数をカウントするスクリプトを設置:</p>
              <code className="block bg-gray-800 text-white p-3 rounded text-sm overflow-x-auto">
                {`<script src="https://nostalgic-counter.vercel.app/components/counter.js"></script>
<nostalgic-counter 
  id="your-counter-id"
  type="total"
  style="classic">
</nostalgic-counter>`}
              </code>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="mb-2 font-medium">2. ブラウザのアドレスバーに入力して公開IDを取得:</p>
              <code className="block bg-gray-800 text-white p-3 rounded text-sm overflow-x-auto">
                {`https://nostalgic-counter.vercel.app/api/count?url=https://yoursite.com&token=your-secret`}
              </code>
              <p className="text-xs text-gray-600 mt-1">→ ブラウザにJSONが表示され、"id": "yoursite-a7b9c3d4" が確認できます</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">⚙️ パラメータ</h2>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">期間タイプ (type)</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  <code className="bg-gray-200 px-1 rounded">total</code> - 累計
                </li>
                <li>
                  <code className="bg-gray-200 px-1 rounded">today</code> - 今日
                </li>
                <li>
                  <code className="bg-gray-200 px-1 rounded">yesterday</code> - 昨日
                </li>
                <li>
                  <code className="bg-gray-200 px-1 rounded">week</code> - 直近一週間
                </li>
                <li>
                  <code className="bg-gray-200 px-1 rounded">month</code> - 直近一ヶ月
                </li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">スタイル (style)</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  <code className="bg-gray-200 px-1 rounded">classic</code> - クラシック（緑文字・黒背景）
                </li>
                <li>
                  <code className="bg-gray-200 px-1 rounded">modern</code> - モダン（白文字・グレー背景）
                </li>
                <li>
                  <code className="bg-gray-200 px-1 rounded">retro</code> - レトロ（黄文字・紫背景）
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">その他のオプション</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  <code className="bg-gray-200 px-1 rounded">digits</code> - 表示桁数（デフォルト: 6）
                </li>
              </ul>
            </div>
          </section>
        </div>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">🎯 特徴</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">🚫 登録不要</h3>
              <p className="text-sm text-gray-600">
                ユーザー登録やログインは一切不要。URLを指定するだけで即座に利用開始
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">🔒 重複防止</h3>
              <p className="text-sm text-gray-600">同一IPアドレスからの24時間以内の重複アクセスは自動的に除外</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">📈 多彩な統計</h3>
              <p className="text-sm text-gray-600">累計・今日・昨日・週間・月間の5つの期間での集計に対応</p>
            </div>
          </div>
        </section>

        <section className="mb-8 bg-blue-50 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">🧪 テストページ</h2>
          <p className="mb-4 text-gray-700">
            実際にカウンターが動作する様子を確認できるテストページを用意しました。
            それぞれ異なるURLを持つため、独立したカウンターが動作します。
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="/test1" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
              テストページ1
            </a>
            <a
              href="/test2"
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
            >
              テストページ2
            </a>
            <a
              href="/blog"
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
            >
              ブログサンプル
            </a>
          </div>
        </section>

        <section className="mt-12 bg-yellow-50 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">💡 使用例</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Web Components（推奨）:</h3>
              <code className="block bg-white p-2 rounded text-sm mt-1">
                {`<nostalgic-counter id="myblog-a7b9c3d4" type="total" style="classic"></nostalgic-counter>`}
              </code>
            </div>
            <div>
              <h3 className="font-semibold">直接画像表示:</h3>
              <code className="block bg-white p-2 rounded text-sm mt-1">
                {`<img src="/api/counter?id=myblog-a7b9c3d4&type=today" alt="今日の閲覧数" />`}
              </code>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
