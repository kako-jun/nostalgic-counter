"use client";

import { useState, useEffect, useRef } from "react";
import NostalgicLayout from "@/components/NostalgicLayout";
import { ServiceStructuredData, BreadcrumbStructuredData } from "@/components/StructuredData";

export default function CounterPage() {
  const [currentPage, setCurrentPage] = useState("main");
  const [response, setResponse] = useState("");
  const [publicId, setPublicId] = useState("");
  const [mode, setMode] = useState("create");

  const urlRef = useRef<HTMLInputElement>(null);
  const tokenRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      setCurrentPage(hash);
    } else {
      setCurrentPage("main");
    }
    
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        setCurrentPage(hash);
      } else {
        setCurrentPage("main");
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = urlRef.current?.value;
    const token = tokenRef.current?.value;
    const value = valueRef.current?.value;

    if (!url || !token) return;

    let apiUrl = `/api/counter?action=${mode}&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;

    if (mode === "set" && value) {
      apiUrl += `&total=${value}`;
    }

    try {
      const res = await fetch(apiUrl);
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));

      if (data.id) {
        setPublicId(data.id);
      }
    } catch (error) {
      setResponse(`Error: ${error}`);
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case "main":
        return (
          <>
            <div className="nostalgic-title-bar">
              ★☆★ Nostalgic Counter ★☆★
              <br />
              アクセスカウンター
            </div>

            <div className="nostalgic-marquee-box">
              <div className="nostalgic-marquee-text">
                懐かしのアクセスカウンターがここに復活！累計・今日・昨日・週間・月間のカウントを表示できます！
              </div>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆カウンターAPIテスト◆</b>
                </span>
              </p>
              
              <form onSubmit={handleSubmit}>
                <p>
                  <b>アクション選択：</b>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    style={{
                      padding: "2px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                  >
                    <option value="create">カウンター作成</option>
                    <option value="increment">カウントアップ</option>
                    <option value="set">カウント設定</option>
                  </select>
                </p>

                <p>
                  <b>URL：</b>
                  <br />
                  <input
                    ref={urlRef}
                    type="url"
                    placeholder="https://example.com"
                    style={{
                      width: "80%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                    required
                  />
                </p>

                <p>
                  <b>オーナートークン（8-16文字）：</b>
                  <br />
                  <input
                    ref={tokenRef}
                    type="text"
                    placeholder="8-16文字"
                    style={{
                      width: "50%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                    minLength={8}
                    maxLength={16}
                    required
                  />
                </p>

                {mode === "set" && (
                  <p>
                    <b>新しいカウント値：</b>
                    <br />
                    <input
                      ref={valueRef}
                      type="number"
                      placeholder="0"
                      style={{
                        width: "30%",
                        padding: "4px",
                        border: "1px solid #666",
                        fontFamily: "inherit",
                        fontSize: "16px"
                      }}
                      min="0"
                    />
                  </p>
                )}

                <p>
                  <button
                    type="submit"
                    style={{
                      padding: "5px 20px",
                      backgroundColor: "#008000",
                      color: "white",
                      border: "2px outset #00a000",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: "16px",
                      fontWeight: "bold"
                    }}
                  >
                    {mode === "create" ? "作成する" : mode === "increment" ? "カウントアップ" : "設定する"}
                  </button>
                </p>
              </form>
            </div>

            {response && (
              <div className="nostalgic-section">
                <p>
                  <span className="nostalgic-section-title">
                    <b>◆APIレスポンス◆</b>
                  </span>
                </p>
                <pre style={{ backgroundColor: "#000000", color: "#00ff00", padding: "10px", overflow: "auto", fontSize: "14px" }}>
                  {response}
                </pre>
              </div>
            )}

            {publicId && (
              <div className="nostalgic-counter-section">
                <p>
                  <span style={{ color: "#ff8c00" }}>
                    <b>◆カウンター設置方法◆</b>
                  </span>
                </p>
                <p>公開ID: <span style={{ backgroundColor: "#ffff00", padding: "2px 4px", fontFamily: "monospace" }}>{publicId}</span></p>
                <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px", wordBreak: "break-all" }}>
{`<script src="https://nostalgic.llll-ll.com/components/display.js"></script>
<nostalgic-counter id="${publicId}" type="total" theme="classic"></nostalgic-counter>`}
                </p>
                <p>表示URL:</p>
                <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px", wordBreak: "break-all" }}>
                  {`https://nostalgic.llll-ll.com/api/counter?action=display&id=${publicId}&type=total&theme=classic`}
                </p>
              </div>
            )}

            <div className="nostalgic-counter-section">
              <p>
                <span style={{ color: "#ff8c00" }}>
                  <b>◆実際のカウンター表示例◆</b>
                </span>
              </p>
              <div>
                <div className="nostalgic-counter-item">
                  <b>累計</b>
                  <br />
                  <div style={{ marginTop: "10px" }}>
                    <nostalgic-counter id="nostalgic-0f74e503" type="total" theme="classic" />
                  </div>
                </div>
                <div className="nostalgic-counter-item">
                  <b>今日</b>
                  <br />
                  <div style={{ marginTop: "10px" }}>
                    <nostalgic-counter id="nostalgic-0f74e503" type="today" theme="modern" />
                  </div>
                </div>
                <div className="nostalgic-counter-item">
                  <b>昨日</b>
                  <br />
                  <div style={{ marginTop: "10px" }}>
                    <nostalgic-counter id="nostalgic-0f74e503" type="yesterday" theme="retro" />
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case "usage":
        return (
          <>
            <div className="nostalgic-title-bar">★☆★ Counter - 使い方 ★☆★</div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆STEP 1: カウンター作成◆</b>
                </span>
              </p>
              <p>ブラウザのアドレスバーに以下のURLを入力してアクセス：</p>
              <p
                style={{
                  backgroundColor: "#f0f0f0",
                  padding: "10px",
                  fontFamily: "monospace",
                  fontSize: "14px",
                  wordBreak: "break-all",
                }}
              >
                https://nostalgic.llll-ll.com/api/counter?action=create&url=<span style={{ color: "#008000" }}>サイトURL</span>
                &token=<span style={{ color: "#008000" }}>オーナートークン</span>
              </p>
              <p>
                ※サイトURLには、カウンターを設置する予定のサイトを指定してください。「https://」から始まっている必要があります。
                <br />
                ※オーナートークンに、
                <span style={{ color: "#ff0000" }}>ほかのサイトでのパスワードを使い回さないでください</span>
                。（8〜16文字）
              </p>
              <p>上記URLにアクセスすると、JSONで公開IDが返されます。この公開IDをSTEP 2で使用してください。</p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆STEP 2: カウンター表示◆</b>
                </span>
              </p>
              <p>HTMLに以下のコードを追加：</p>
              <pre style={{ backgroundColor: "#f0f0f0", padding: "10px", overflow: "auto", fontSize: "14px", margin: "10px 0" }}>
                {`<script src="https://nostalgic.llll-ll.com/components/display.js"></script>
<nostalgic-counter id="`}
                <span style={{ color: "#008000" }}>あなたの公開ID</span>
                {`" type="`}
                <span style={{ color: "#008000" }}>total</span>
                {`" theme="`}
                <span style={{ color: "#008000" }}>classic</span>
                {`"></nostalgic-counter>`}
              </pre>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆type 表示タイプ◆</b>
                </span>
              </p>
              <p>
                • <span style={{ color: "#008000" }}>total</span> - 累計訪問数
                <br />• <span style={{ color: "#008000" }}>today</span> - 今日の訪問数
                <br />• <span style={{ color: "#008000" }}>yesterday</span> - 昨日の訪問数
                <br />• <span style={{ color: "#008000" }}>week</span> - 今週の訪問数
                <br />• <span style={{ color: "#008000" }}>month</span> - 今月の訪問数
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆theme デザインテーマ◆</b>
                </span>
              </p>
              <p>
                • <span style={{ color: "#008000" }}>classic</span> - クラシック（緑の7セグ）
                <br />• <span style={{ color: "#008000" }}>modern</span> - モダン（青のデジタル）
                <br />• <span style={{ color: "#008000" }}>retro</span> - レトロ（赤のドット）
              </p>
            </div>
          </>
        );

      case "features":
        return (
          <>
            <div className="nostalgic-title-bar">★☆★ Counter - 機能一覧 ★☆★</div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆基本機能◆</b>
                </span>
              </p>
              <p>
                <span>●</span> 累計・日別・週別・月別カウント
                <br />
                <span>●</span> 24時間重複カウント防止
                <br />
                <span>●</span> 3種類のデザインテーマ
                <br />
                <span>●</span> Web Componentsで簡単設置
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆管理機能◆</b>
                </span>
              </p>
              <p>
                <span>●</span> バレてはいけない「オーナートークン」で安全管理
                <br />
                <span>●</span> バレてもかまわない「公開ID」で表示専用アクセス
                <br />
                <span>●</span> カウンター値の手動設定（
                <span style={{ textDecoration: "line-through" }}>訪問者数を水増し可能</span> リセットされても再開可能）
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆技術仕様◆</b>
                </span>
              </p>
              <p>
                • Next.js + Vercel でホスティング
                <br />
                • Redis でデータ保存
                <br />
                • SVG画像で美しい表示
                <br />• 必要なすべての要素が無料プランの範囲で動作するため、完全無料・広告なしを実現
              </p>
            </div>

            <div className="nostalgic-counter-section">
              <p>
                <span style={{ color: "#ff8c00" }}>
                  <b>◆デザインサンプル◆</b>
                </span>
              </p>
              <div>
                <div className="nostalgic-counter-item">
                  <b>Classic</b>
                  <br />
                  <div style={{ marginTop: "10px" }}>
                    <img src="/api/counter?action=display&id=nostalgic-b89803bb&type=total&style=classic" alt="Classic" />
                  </div>
                </div>
                <div className="nostalgic-counter-item">
                  <b>Modern</b>
                  <br />
                  <div style={{ marginTop: "10px" }}>
                    <img src="/api/counter?action=display&id=nostalgic-b89803bb&type=total&style=modern" alt="Modern" />
                  </div>
                </div>
                <div className="nostalgic-counter-item">
                  <b>Retro</b>
                  <br />
                  <div style={{ marginTop: "10px" }}>
                    <img src="/api/counter?action=display&id=nostalgic-b89803bb&type=total&style=retro" alt="Retro" />
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case "api":
        return (
          <>
            <div className="nostalgic-title-bar">★☆★ Counter - API仕様 ★☆★</div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆カウンター作成・カウントアップ◆</b>
                </span>
              </p>
              <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px" }}>
                GET /api/counter?action=create&url=<span style={{ color: "#008000" }}>サイトURL</span>&token=
                <span style={{ color: "#008000" }}>オーナートークン</span>
              </p>
              <p style={{ lineHeight: "1.2" }}>
                初回アクセスでカウンター作成、2回目以降はカウントアップ。
                <br />
                レスポンス:{" "}
                <span
                  style={{ backgroundColor: "#000000", color: "#ffffff", padding: "2px 4px", fontFamily: "monospace" }}
                >{`{ "id": "公開ID", "total": 数値 }`}</span>
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆カウンター画像取得◆</b>
                </span>
              </p>
              <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px" }}>
                GET /api/counter?action=display&id=<span style={{ color: "#008000" }}>公開ID</span>&type=
                <span style={{ color: "#008000" }}>期間タイプ</span>&theme=
                <span style={{ color: "#008000" }}>デザインテーマ</span>
              </p>
              <p>
                SVG画像を返します。img タグの src に直接指定可能。
              </p>
              <p>
                ※typeとthemeは省略可能（type=total, theme=classicがデフォルト）
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆カウンターテキスト取得◆</b>
                </span>
              </p>
              <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px" }}>
                GET /api/counter?action=display&id=<span style={{ color: "#008000" }}>公開ID</span>&format=
                <span style={{ color: "#008000" }}>text</span>
              </p>
              <p>数値のみをテキスト形式で返します。JavaScriptでの処理に便利。</p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆管理操作◆</b>
                </span>
              </p>
              <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px" }}>
                GET /api/counter?action=set&url=<span style={{ color: "#008000" }}>サイトURL</span>&token=
                <span style={{ color: "#008000" }}>オーナートークン</span>&total=
                <span style={{ color: "#008000" }}>数値</span>
              </p>
              <p>カウンター値を手動で設定します。オーナートークンが必要。</p>
            </div>

            <hr />

            <p style={{ textAlign: "center" }}>
              これ以上の詳しい説明は{" "}
              <a href="https://github.com/kako-jun/nostalgic-counter" className="nostalgic-old-link">
                【GitHub】
              </a>{" "}
              へ
            </p>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* 構造化データ */}
      <ServiceStructuredData 
        name="Nostalgic Counter"
        description="懐かしいアクセスカウンターサービス。24時間重複防止機能付き、累計・日別・週別・月別カウントに対応。"
        url="https://nostalgic.llll-ll.com/counter"
        serviceType="Web Counter Service"
      />
      <BreadcrumbStructuredData 
        items={[
          { name: "Nostalgic", url: "https://nostalgic.llll-ll.com" },
          { name: "Counter", url: "https://nostalgic.llll-ll.com/counter" }
        ]}
      />
      
      <NostalgicLayout serviceName="Counter" serviceIcon="📊">
        {renderContent()}
      </NostalgicLayout>
    </>
  );
}