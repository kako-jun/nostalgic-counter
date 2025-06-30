"use client";

import { useState } from "react";

export default function AdminTestPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const resetCounter = async (url: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin?action=reset&token=dev_admin_token_123&url=${encodeURIComponent(url)}&start=0`,
        {
          method: "POST",
        }
      );
      const result = await response.json();
      addLog(`リセット完了: ${result.message || result.error}`);
    } catch (error) {
      addLog(`エラー: ${error}`);
    }
    setIsLoading(false);
  };

  const setCounter = async (url: string, total: number, today: number = 0) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin?action=set&token=dev_admin_token_123&url=${encodeURIComponent(
          url
        )}&total=${total}&today=${today}&yesterday=0&week=${total}&month=${total}`,
        {
          method: "POST",
        }
      );
      const result = await response.json();
      addLog(`カウンター設定完了: ${result.message || result.error}`);
    } catch (error) {
      addLog(`エラー: ${error}`);
    }
    setIsLoading(false);
  };

  const getCounter = async (url: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin?action=get&token=dev_admin_token_123&url=${encodeURIComponent(url)}`, {
        method: "POST",
      });
      const result = await response.json();
      addLog(`現在の値: ${JSON.stringify(result.data)}`);
    } catch (error) {
      addLog(`エラー: ${error}`);
    }
    setIsLoading(false);
  };

  const testUrls = ["http://localhost:3000/test1", "http://localhost:3000/test2", "http://localhost:3000/blog"];

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">管理者テストページ</h1>
      <p className="text-center text-gray-600 mb-8">カウンターの動作をテストするための管理機能</p>

      <div className="max-w-4xl mx-auto">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">クイックテスト</h2>
          <div className="grid gap-4">
            {testUrls.map((url) => (
              <div key={url} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">{url}</h3>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => resetCounter(url)}
                    disabled={isLoading}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 disabled:opacity-50"
                  >
                    0にリセット
                  </button>
                  <button
                    onClick={() => setCounter(url, 42, 5)}
                    disabled={isLoading}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                  >
                    テスト値設定(42/5)
                  </button>
                  <button
                    onClick={() => setCounter(url, Math.floor(Math.random() * 1000), Math.floor(Math.random() * 50))}
                    disabled={isLoading}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50"
                  >
                    ランダム値
                  </button>
                  <button
                    onClick={() => getCounter(url)}
                    disabled={isLoading}
                    className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 disabled:opacity-50"
                  >
                    現在の値確認
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">カウンター表示テスト</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {testUrls.map((url) => (
              <div key={url} className="bg-white border p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-sm">{url.split("/").pop()}</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">総数</p>
                    <img
                      src={`/api/counter?url=${encodeURIComponent(url)}&type=total&style=classic`}
                      alt="総数"
                      className="border"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">今日</p>
                    <img
                      src={`/api/counter?url=${encodeURIComponent(url)}&type=today&style=modern`}
                      alt="今日"
                      className="border"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">操作ログ</h2>
          <div className="bg-black text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-gray-500">操作ログがここに表示されます...</p>
            ) : (
              logs.map((log, index) => <div key={index}>{log}</div>)
            )}
          </div>
          <button
            onClick={() => setLogs([])}
            className="mt-2 bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
          >
            ログクリア
          </button>
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
            <a href="/test2" className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
              テストページ2
            </a>
            <a href="/blog" className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
              ブログサンプル
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
