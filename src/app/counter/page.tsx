"use client";

import { useState, useEffect, useRef } from "react";
import NostalgicLayout from "@/components/NostalgicLayout";
import { ServiceStructuredData, BreadcrumbStructuredData } from "@/components/StructuredData";

export default function CounterPage() {
  const [currentPage, setCurrentPage] = useState("features");
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
      setCurrentPage("features");
    }
    
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        setCurrentPage(hash);
      } else {
        setCurrentPage("features");
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
      const res = await fetch(apiUrl, { method: 'GET' });
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
      case "usage":
        return (
          <>
            <div className="nostalgic-title-bar">
              ★ Nostalgic Counter ★
              <br />
              使い方
            </div>


            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆STEP 1: カウンター作成◆</b>
                </span>
              </p>
              <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
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
                。（8-16文字）
              </p>
              <p>上記URLにアクセスすると、JSONで公開IDが返されます。この公開IDをSTEP 2で使用してください。</p>
              
              <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />
              
              <p style={{ marginTop: "20px" }}>
                または、以下のフォームで簡単に作成できます。
              </p>
              
              <form onSubmit={handleSubmit} style={{ marginTop: "10px" }}>
                <input type="hidden" name="mode" value="create" />
                <p>
                  <b>サイトURL：</b>
                  <input
                    ref={urlRef}
                    type="url"
                    placeholder="https://example.com"
                    style={{
                      marginLeft: "10px",
                      width: "60%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                    required
                  />
                </p>

                <p>
                  <b>オーナートークン：</b>
                  <input
                    ref={tokenRef}
                    type="text"
                    placeholder="8-16文字"
                    style={{
                      marginLeft: "10px",
                      width: "30%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                    required
                  />
                  <button
                    type="submit"
                    style={{
                      marginLeft: "10px",
                      padding: "4px 12px",
                      backgroundColor: "#4CAF50",
                      color: "white",
                      border: "2px outset #4CAF50",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontFamily: "inherit"
                    }}
                    onClick={() => setMode("create")}
                  >
                    作成
                  </button>
                </p>
              </form>

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
                <div
                  style={{
                    backgroundColor: "#ffffcc",
                    border: "2px solid #ff0000",
                    padding: "10px",
                    marginTop: "10px",
                    fontSize: "14px"
                  }}
                >
                  <b style={{ color: "#ff0000" }}>✨ 作成成功！</b>
                  <br />
                  あなたの公開ID：<span style={{ color: "#008000", fontWeight: "bold", fontSize: "16px", fontFamily: "monospace" }}>{publicId}</span>
                  <br />
                  <small>※この公開IDをSTEP 2で使用してください</small>
                </div>
              )}
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆STEP 2: カウンター表示◆</b>
                </span>
              </p>
              <p>あなたのサイトのHTMLに以下のコードを追加してください。</p>
              <pre style={{ backgroundColor: "#f0f0f0", padding: "10px", overflow: "auto", fontSize: "14px", margin: "10px 0" }}>
                {`<script src="https://nostalgic.llll-ll.com/components/counter.js"></script>
<nostalgic-counter id="`}
                <span style={{ color: "#008000" }}>公開ID</span>
                {`" type="`}
                <span style={{ color: "#008000" }}>total</span>
                {`" theme="`}
                <span style={{ color: "#008000" }}>classic</span>
                {`"></nostalgic-counter>`}
              </pre>
              
              <div className="nostalgic-section">
                <p>
                  <span className="nostalgic-section-title">
                    <b>◆type 期間タイプ◆</b>
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
                  • <span style={{ color: "#008000" }}>classic</span> - クラシック（緑のデジタル）
                  <br />• <span style={{ color: "#008000" }}>modern</span> - モダン（青のデジタル）
                  <br />• <span style={{ color: "#008000" }}>retro</span> - レトロ（赤のドット）
                </p>
              </div>

              {publicId && (
                <div className="nostalgic-section">
                  <p>
                    <span className="nostalgic-section-title">
                      <b>◆このように表示されます◆</b>
                    </span>
                  </p>
                  <div style={{ textAlign: "center", margin: "20px 0" }}>
                    <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "14px", marginBottom: "10px" }}>Classic</p>
                        <nostalgic-counter id={publicId} type="total" theme="classic" />
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "14px", marginBottom: "10px" }}>Modern</p>
                        <nostalgic-counter id={publicId} type="total" theme="modern" />
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "14px", marginBottom: "10px" }}>Retro</p>
                        <nostalgic-counter id={publicId} type="total" theme="retro" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆公開IDを再確認したいときは？◆</b>
                </span>
              </p>
              <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
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
              <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />
              
              <p>または、以下のフォームで確認できます。</p>
              
              <form onSubmit={handleSubmit} style={{ marginTop: "10px" }}>
                <p>
                  <b>サイトURL：</b>
                  <input
                    ref={urlRef}
                    type="url"
                    placeholder="https://example.com"
                    style={{
                      marginLeft: "10px",
                      width: "60%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                    required
                  />
                </p>

                <p>
                  <b>オーナートークン：</b>
                  <input
                    ref={tokenRef}
                    type="text"
                    placeholder="8-16文字"
                    style={{
                      marginLeft: "10px",
                      width: "30%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                    required
                  />
                  <button
                    type="submit"
                    style={{
                      marginLeft: "10px",
                      padding: "4px 12px",
                      backgroundColor: "#4CAF50",
                      color: "white",
                      border: "2px outset #4CAF50",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontFamily: "inherit"
                    }}
                    onClick={() => setMode("create")}
                  >
                    公開ID確認
                  </button>
                </p>
              </form>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆カウンター値を設定したいときは？◆</b>
                </span>
              </p>
              <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
              <p
                style={{
                  backgroundColor: "#f0f0f0",
                  padding: "10px",
                  fontFamily: "monospace",
                  fontSize: "14px",
                  wordBreak: "break-all",
                }}
              >
                https://nostalgic.llll-ll.com/api/counter?action=set&url=<span style={{ color: "#008000" }}>サイトURL</span>
                &token=<span style={{ color: "#008000" }}>オーナートークン</span>&total=<span style={{ color: "#008000" }}>数値</span>
              </p>
              <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />
              
              <p>または、以下のフォームで設定できます。</p>
              
              <form onSubmit={handleSubmit} style={{ marginTop: "10px" }}>
                <p>
                  <b>サイトURL：</b>
                  <input
                    ref={urlRef}
                    type="url"
                    placeholder="https://example.com"
                    style={{
                      marginLeft: "10px",
                      width: "60%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                    required
                  />
                </p>

                <p>
                  <b>オーナートークン：</b>
                  <input
                    ref={tokenRef}
                    type="text"
                    placeholder="8-16文字"
                    style={{
                      marginLeft: "10px",
                      width: "30%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                    required
                  />
                </p>

                <p>
                  <b>設定値：</b>
                  <input
                    ref={valueRef}
                    type="number"
                    min="0"
                    placeholder="0"
                    style={{
                      marginLeft: "10px",
                      width: "30%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                    required
                  />
                  <button
                    type="submit"
                    style={{
                      marginLeft: "10px",
                      padding: "4px 12px",
                      backgroundColor: "#4CAF50",
                      color: "white",
                      border: "2px outset #4CAF50",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontFamily: "inherit"
                    }}
                    onClick={() => setMode("set")}
                  >
                    値設定
                  </button>
                </p>
              </form>

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
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆カウンターを削除したいときは？◆</b>
                </span>
              </p>
              <p>ブラウザのアドレスバーに以下のURLを入力してアクセスしてください。</p>
              <p
                style={{
                  backgroundColor: "#f0f0f0",
                  padding: "10px",
                  fontFamily: "monospace",
                  fontSize: "14px",
                  wordBreak: "break-all",
                }}
              >
                https://nostalgic.llll-ll.com/api/counter?action=delete&url=<span style={{ color: "#008000" }}>サイトURL</span>
                &token=<span style={{ color: "#008000" }}>オーナートークン</span>
              </p>
              <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />
              
              <p>または、以下のフォームで削除できます。</p>
              <p style={{ color: "#ff0000", fontWeight: "bold" }}>
                ※削除すると復元できません。十分にご注意ください。
              </p>
              
              <form onSubmit={handleSubmit} style={{ marginTop: "10px" }}>
                <p>
                  <b>サイトURL：</b>
                  <input
                    ref={urlRef}
                    type="url"
                    placeholder="https://example.com"
                    style={{
                      marginLeft: "10px",
                      width: "60%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                    required
                  />
                </p>

                <p>
                  <b>オーナートークン：</b>
                  <input
                    ref={tokenRef}
                    type="text"
                    placeholder="8-16文字"
                    style={{
                      marginLeft: "10px",
                      width: "30%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
                    required
                  />
                  <button
                    type="submit"
                    style={{
                      marginLeft: "10px",
                      padding: "4px 12px",
                      backgroundColor: "#F44336",
                      color: "white",
                      border: "2px outset #F44336",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontFamily: "inherit"
                    }}
                    onClick={() => setMode("delete")}
                  >
                    削除
                  </button>
                </p>
              </form>

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
            </div>


            {publicId && (
              <div className="nostalgic-counter-section">
                <p>
                  <span style={{ color: "#ff8c00" }}>
                    <b>◆カウンター設置方法◆</b>
                  </span>
                </p>
                <p>公開ID: <span style={{ backgroundColor: "#ffff00", padding: "2px 4px", fontFamily: "monospace" }}>{publicId}</span></p>
                <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px", wordBreak: "break-all" }}>
{`<script src="https://nostalgic.llll-ll.com/components/counter.js"></script>
<nostalgic-counter id="${publicId}" type="total" theme="classic"></nostalgic-counter>`}
                </p>
                <p>表示URL:</p>
                <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px", wordBreak: "break-all" }}>
                  {`https://nostalgic.llll-ll.com/api/counter?action=display&id=${publicId}&type=total&theme=classic`}
                </p>
              </div>
            )}

          </>
        );


      case "features":
        return (
          <>
            <div className="nostalgic-title-bar">
              ★ Nostalgic Counter ★
              <br />
              機能一覧
            </div>

            <div className="nostalgic-marquee-box">
              <div className="nostalgic-marquee-text">
                懐かしのアクセスカウンターがここに復活！累計・今日・昨日・週間・月間のカウントを表示できます！
              </div>
            </div>

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

          </>
        );

      case "api":
        return (
          <>
            <div className="nostalgic-title-bar">
              ★ Nostalgic Counter ★
              <br />
              API仕様
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆カウンター作成◆</b>
                </span>
              </p>
              <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px" }}>
                GET /api/counter?action=create&url=<span style={{ color: "#008000" }}>サイトURL</span>&token=
                <span style={{ color: "#008000" }}>オーナートークン</span>
              </p>
              <p style={{ lineHeight: "1.2" }}>
                新しいカウンターを作成し、公開IDを取得します。
                <br />
                レスポンス:{" "}
                <span
                  style={{ backgroundColor: "#000000", color: "#ffffff", padding: "2px 4px", fontFamily: "monospace" }}
                >{`{ "id": "公開ID", "url": "サイトURL" }`}</span>
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆カウントアップ◆</b>
                </span>
              </p>
              <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px" }}>
                GET /api/counter?action=increment&id=<span style={{ color: "#008000" }}>公開ID</span>
              </p>
              <p style={{ lineHeight: "1.2" }}>
                カウンターの値を1増加します。24時間重複防止機能付き。
                <br />
                <br />
                ※Web Componentsを使用している場合は自動でカウントアップされるため、通常は直接呼ぶ必要はありません。
                <br />
                <br />
                レスポンス:{" "}
                <span
                  style={{ backgroundColor: "#000000", color: "#ffffff", padding: "2px 4px", fontFamily: "monospace" }}
                >{`{ "total": 数値, "today": 数値, "yesterday": 数値, ... }`}</span>
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
                  <b>◆カウンター値設定◆</b>
                </span>
              </p>
              <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px" }}>
                GET /api/counter?action=set&url=<span style={{ color: "#008000" }}>サイトURL</span>&token=
                <span style={{ color: "#008000" }}>オーナートークン</span>&total=
                <span style={{ color: "#008000" }}>数値</span>
              </p>
              <p>カウンター値を手動で設定します。オーナートークンが必要。</p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆カウンター削除◆</b>
                </span>
              </p>
              <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px" }}>
                GET /api/counter?action=delete&url=<span style={{ color: "#008000" }}>サイトURL</span>&token=
                <span style={{ color: "#008000" }}>オーナートークン</span>
              </p>
              <p>カウンターを完全に削除します。オーナートークンが必要。</p>
            </div>

            <hr />

            <p style={{ textAlign: "center" }}>
              これ以上の詳しい説明は{" "}
              <a href="https://github.com/kako-jun/nostalgic/blob/main/README_ja.md" className="nostalgic-old-link">
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