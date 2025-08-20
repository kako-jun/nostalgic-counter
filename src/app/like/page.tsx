"use client";

import { useState, useEffect, useRef } from "react";
import NostalgicLayout from "@/components/NostalgicLayout";
import { ServiceStructuredData, BreadcrumbStructuredData } from "@/components/StructuredData";

export default function LikePage() {
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

    let apiUrl = `/api/like?action=${mode}&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;
    
    if (mode === "set" && value) {
      apiUrl += `&value=${encodeURIComponent(value)}`;
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
              ★ Nostalgic Like ★
              <br />
              使い方
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆STEP 1: いいねボタン作成◆</b>
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
                https://nostalgic.llll-ll.com/api/like?action=create&url=<span style={{ color: "#008000" }}>サイトURL</span>
                &token=<span style={{ color: "#008000" }}>オーナートークン</span>
              </p>
              <p>
                ※サイトURLには、いいねボタンを設置する予定のサイトを指定してください。「https://」から始まっている必要があります。
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
                </p>

                {mode === "set" && (
                  <p>
                    <b>いいね数：</b>
                    <input
                      ref={valueRef}
                      type="number"
                      min="0"
                      placeholder="100"
                      style={{
                        marginLeft: "10px",
                        width: "20%",
                        padding: "4px",
                        border: "1px solid #666",
                        fontFamily: "inherit",
                        fontSize: "16px"
                      }}
                      required
                    />
                  </p>
                )}

                <p>
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
                  <button
                    type="submit"
                    style={{
                      marginLeft: "10px",
                      padding: "4px 12px",
                      backgroundColor: "#2196F3",
                      color: "white",
                      border: "2px outset #2196F3",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontFamily: "inherit"
                    }}
                    onClick={() => setMode("set")}
                  >
                    値設定
                  </button>
                  <button
                    type="submit"
                    style={{
                      marginLeft: "10px",
                      padding: "4px 12px",
                      backgroundColor: "#f44336",
                      color: "white",
                      border: "2px outset #f44336",
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
                  <b>◆STEP 2: いいねボタン表示◆</b>
                </span>
              </p>
              <p>あなたのサイトのHTMLに以下のコードを追加してください。</p>
              <pre style={{ backgroundColor: "#f0f0f0", padding: "10px", overflow: "auto", fontSize: "14px", margin: "10px 0" }}>
                {`<script src="https://nostalgic.llll-ll.com/components/like.js"></script>
<nostalgic-like id="`}
                <span style={{ color: "#008000" }}>公開ID</span>
                {`" icon="heart"></nostalgic-like>`}
              </pre>
              <p style={{ fontSize: "14px", color: "#666" }}>
                ※ icon属性で表示を変更できます: "heart"（ハート）, "star"（スター）, "thumbup"（サムズアップ）
              </p>
              
              <div className="nostalgic-section">
                <p>
                  <span className="nostalgic-section-title">
                    <b>◆動作仕様◆</b>
                  </span>
                </p>
                <p>
                  • クリックで「いいね」と「取り消し」が切り替わります
                  <br />• ユーザーごとに状態を管理（IP+UserAgent）
                  <br />• 24時間で状態がリセットされます
                  <br />• リアルタイムで数値が更新されます
                </p>
              </div>
            </div>

            {publicId && (
              <div className="nostalgic-counter-section">
                <p>
                  <span style={{ color: "#ff8c00" }}>
                    <b>◆いいねボタン設置方法◆</b>
                  </span>
                </p>
                <p>公開ID: <span style={{ backgroundColor: "#ffff00", padding: "2px 4px", fontFamily: "monospace" }}>{publicId}</span></p>
                <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px", wordBreak: "break-all" }}>
{`<script src="https://nostalgic.llll-ll.com/components/like.js"></script>
<nostalgic-like id="${publicId}" icon="heart"></nostalgic-like>`}
                </p>
                
                <div className="nostalgic-counter-section">
                  <p>
                    <span style={{ color: "#ff8c00" }}>
                      <b>◆実際のいいねボタン表示例◆</b>
                    </span>
                  </p>
                  <div style={{ textAlign: "center", margin: "20px 0" }}>
                    <p style={{ marginBottom: "10px" }}>作成されたいいねボタン：</p>
                    <nostalgic-like id={publicId} theme="classic" />
                  </div>
                </div>
              </div>
            )}

            <div className="nostalgic-counter-section">
              <p>
                <span style={{ color: "#ff8c00" }}>
                  <b>◆デモ用いいねボタン◆</b>
                </span>
              </p>
              <div style={{ textAlign: "center", margin: "20px 0" }}>
                <p style={{ marginBottom: "10px" }}>このデモページのいいねボタン（実際に動作します）：</p>
                <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "14px", marginBottom: "5px" }}>ハート</p>
                    {/* @ts-ignore */}
                    <nostalgic-like id="nostalgic-865b5349" theme="classic" icon="heart" />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "14px", marginBottom: "5px" }}>スター</p>
                    {/* @ts-ignore */}
                    <nostalgic-like id="nostalgic-865b5349" theme="classic" icon="star" />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "14px", marginBottom: "5px" }}>サムズアップ</p>
                    {/* @ts-ignore */}
                    <nostalgic-like id="nostalgic-865b5349" theme="classic" icon="thumbup" />
                  </div>
                </div>
              </div>
              <p style={{ textAlign: "center", marginTop: "10px", fontSize: "14px", color: "#666" }}>
                ※クリックしてお試しください！状態が即座に切り替わります
              </p>
            </div>
          </>
        );

      case "features":
        return (
          <>
            <div className="nostalgic-title-bar">
              ★ Nostalgic Like ★
              <br />
              機能一覧
            </div>

            <div className="nostalgic-marquee-box">
              <div className="nostalgic-marquee-text">
                💖 かわいいいいねボタン！訪問者が気に入ったコンテンツに「いいね」できます！取り消しも自由自在！ 💖
              </div>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆基本機能◆</b>
                </span>
              </p>
              <p>
                <span>●</span> トグル型いいね/取り消し機能
                <br />
                <span>●</span> ユーザー状態管理（IP+UserAgent）
                <br />
                <span>●</span> 即座のフィードバック
                <br />
                <span>●</span> Web Componentsで簡単設置
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆ユーザー体験◆</b>
                </span>
              </p>
              <p>
                <span>●</span> ワンクリックで「いいね」
                <br />
                <span>●</span> もう一度クリックで取り消し
                <br />
                <span>●</span> 24時間は状態を記憶
                <br />
                <span>●</span> ログイン不要で利用可能
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
                • かわいいハートアイコン 💖
                <br />• 必要なすべての要素が無料プランの範囲で動作するため、完全無料・広告なしを実現
              </p>
            </div>

            <div className="nostalgic-counter-section">
              <p>
                <span style={{ color: "#ff8c00" }}>
                  <b>◆状態表示の例◆</b>
                </span>
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "30px", flexWrap: "wrap" }}>
                <div style={{ textAlign: "center" }}>
                  <p><b>未いいね状態</b></p>
                  <div style={{ display: "inline-block", padding: "10px 20px", backgroundColor: "#fff", border: "2px solid #ddd", borderRadius: "5px" }}>
                    <span style={{ fontSize: "24px", marginRight: "10px", filter: "grayscale(100%)" }}>💖</span>
                    <span style={{ fontSize: "20px", color: "#999" }}>いいね 123</span>
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p><b>いいね済み状態</b></p>
                  <div style={{ display: "inline-block", padding: "10px 20px", backgroundColor: "#fff0f5", border: "2px solid #ff69b4", borderRadius: "5px" }}>
                    <span style={{ fontSize: "24px", marginRight: "10px" }}>💖</span>
                    <span style={{ fontSize: "20px", fontWeight: "bold", color: "#ff1493" }}>いいね！ 124</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case "api":
        return (
          <>
            <div className="nostalgic-title-bar">
              ★ Nostalgic Like ★
              <br />
              API仕様
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆いいねボタン作成◆</b>
                </span>
              </p>
              <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px" }}>
                GET /api/like?action=create&url=<span style={{ color: "#008000" }}>サイトURL</span>&token=
                <span style={{ color: "#008000" }}>オーナートークン</span>
              </p>
              <p style={{ lineHeight: "1.2" }}>
                いいねボタンを作成します。
                <br />
                レスポンス:{" "}
                <span
                  style={{ backgroundColor: "#000000", color: "#ffffff", padding: "2px 4px", fontFamily: "monospace" }}
                >{`{ "id": "公開ID", "total": 0, "liked": false }`}</span>
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆いいねトグル◆</b>
                </span>
              </p>
              <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px" }}>
                GET /api/like?action=toggle&url=<span style={{ color: "#008000" }}>サイトURL</span>&token=
                <span style={{ color: "#008000" }}>オーナートークン</span>
              </p>
              <p>
                現在のユーザーの「いいね」状態を切り替えます。
                <br />
                いいね済みの場合は取り消し、未いいねの場合はいいねを追加します。
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆いいねデータ取得◆</b>
                </span>
              </p>
              <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px" }}>
                GET /api/like?action=get&id=<span style={{ color: "#008000" }}>公開ID</span>
              </p>
              <p>
                現在のいいね数とユーザーの状態を取得します。
                <br />
                レスポンス:{" "}
                <span
                  style={{ backgroundColor: "#000000", color: "#ffffff", padding: "2px 4px", fontFamily: "monospace" }}
                >{`{ "total": 123, "liked": true }`}</span>
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆いいね数設定◆</b>
                </span>
              </p>
              <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px" }}>
                GET /api/like?action=set&url=<span style={{ color: "#008000" }}>サイトURL</span>&token=
                <span style={{ color: "#008000" }}>オーナートークン</span>&value=
                <span style={{ color: "#008000" }}>いいね数</span>
              </p>
              <p>いいね数を指定した値に設定します。オーナートークンが必要。</p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆いいねボタン削除◆</b>
                </span>
              </p>
              <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px" }}>
                GET /api/like?action=delete&url=<span style={{ color: "#008000" }}>サイトURL</span>&token=
                <span style={{ color: "#008000" }}>オーナートークン</span>
              </p>
              <p>いいねボタンを完全に削除します。オーナートークンが必要。</p>
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
        name="Nostalgic Like"
        description="懐かしいいいねボタンサービス。トグル型のいいね・取り消し機能付き、即座のフィードバック表示。"
        url="https://nostalgic.llll-ll.com/like"
        serviceType="Like Button Service"
      />
      <BreadcrumbStructuredData 
        items={[
          { name: "Nostalgic", url: "https://nostalgic.llll-ll.com" },
          { name: "Like", url: "https://nostalgic.llll-ll.com/like" }
        ]}
      />
      
      <NostalgicLayout serviceName="Like" serviceIcon="💖">
        {renderContent()}
      </NostalgicLayout>
    </>
  );
}