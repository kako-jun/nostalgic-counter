export default function BlogPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">ブログサンプル</h1>
      <p className="text-center text-gray-600 mb-8">実際のブログサイトでの使用例</p>

      <div className="max-w-4xl mx-auto">
        <section className="mb-12">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-3xl font-bold mb-4">Nostalgic Counterの使い方</h2>
            <p className="text-gray-600 text-sm mb-4">2024年6月12日 | 技術ブログ</p>

            <div className="prose max-w-none">
              <p className="mb-4">
                このブログページでは、実際のWebサイトでNostalgic Counterをどのように活用できるかを示しています。
                各記事ページに個別のカウンターを設置することで、人気記事の把握が可能になります。
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">この記事の統計情報</h3>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">総閲覧数</p>
                    <img
                      src="/api/display?url=http://localhost:3000/blog&type=total&style=classic&digits=4"
                      alt="総閲覧数"
                      className="mx-auto"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">今日</p>
                    <img
                      src="/api/display?url=http://localhost:3000/blog&type=today&style=modern&digits=3"
                      alt="今日の閲覧数"
                      className="mx-auto"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">昨日</p>
                    <img
                      src="/api/display?url=http://localhost:3000/blog&type=yesterday&style=retro&digits=3"
                      alt="昨日の閲覧数"
                      className="mx-auto"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">今週</p>
                    <img
                      src="/api/display?url=http://localhost:3000/blog&type=week&style=classic&digits=4"
                      alt="今週の閲覧数"
                      className="mx-auto"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">今月</p>
                    <img
                      src="/api/display?url=http://localhost:3000/blog&type=month&style=modern&digits=4"
                      alt="今月の閲覧数"
                      className="mx-auto"
                    />
                  </div>
                </div>
              </div>

              <p className="mb-4">
                実際のブログサイトでは、各記事のURLを使用してカウンターを設置します。 例：
                <code className="bg-gray-100 px-2 py-1 rounded">
                  https://myblog.com/articles/nostalgic-counter-guide
                </code>
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">設置方法</h3>
              <div className="bg-gray-800 text-white p-4 rounded-lg text-sm mb-4">
                <pre>{`<!-- カウント用スクリプト -->
<script>
fetch('/api/count?url=' + encodeURIComponent(window.location.href))
  .then(r => r.json())
  .then(d => console.log('カウント完了:', d));
</script>

<!-- カウンター表示 -->
<img src="/api/display?url=https://yourblog.com/article1&type=total&style=classic" 
     alt="総閲覧数" />`}</pre>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">他のページへ</h2>
          <div className="flex gap-4 justify-center">
            <a href="/" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              ホーム
            </a>
            <a href="/test1" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              テストページ1
            </a>
            <a href="/test2" className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
              テストページ2
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
