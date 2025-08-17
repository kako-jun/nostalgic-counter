"use client";

import { useState, useEffect, useRef } from "react";
import NostalgicLayout from "@/components/NostalgicLayout";

export default function LikePage() {
  const [currentPage, setCurrentPage] = useState("main");
  const [response, setResponse] = useState("");
  const [publicId, setPublicId] = useState("");
  const [mode, setMode] = useState("create");

  const urlRef = useRef<HTMLInputElement>(null);
  const tokenRef = useRef<HTMLInputElement>(null);
  
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

    if (!url || !token) return;

    const apiUrl = `/api/like?action=${mode}&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;

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
            <div className="nostalgic-title-bar">★☆★ Like Service - いいねボタン ★☆★</div>

            <div className="nostalgic-marquee-box">
              <div className="nostalgic-marquee-text">
                💖 かわいいいいねボタン！訪問者が気に入ったコンテンツに「いいね」できます！取り消しも自由自在！ 💖
              </div>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆いいねボタンAPIテスト◆</b>
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
                    <option value="create">いいねボタン作成</option>
                    <option value="toggle">いいねトグル</option>
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

                <p>
                  <button
                    type="submit"
                    style={{
                      padding: "5px 20px",
                      backgroundColor: "#ff1493",
                      color: "white",
                      border: "2px outset #ff69b4",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: "16px",
                      fontWeight: "bold"
                    }}
                  >
                    {mode === "create" ? "作成する" : "いいね！"}
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
                    <b>◆いいねボタン設置方法◆</b>
                  </span>
                </p>
                <p>公開ID: <span style={{ backgroundColor: "#ffff00", padding: "2px 4px", fontFamily: "monospace" }}>{publicId}</span></p>
                <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px", wordBreak: "break-all" }}>
{`<script src="https://nostalgic.llll-ll.com/components/like.js"></script>
<nostalgic-like id="${publicId}"></nostalgic-like>`}
                </p>
                <p>データ取得URL:</p>
                <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px", wordBreak: "break-all" }}>
                  {`https://nostalgic.llll-ll.com/api/like?action=get&id=${publicId}`}
                </p>
              </div>
            )}

            <div className="nostalgic-counter-section">
              <p>
                <span style={{ color: "#ff8c00" }}>
                  <b>◆実際のいいねボタン表示例◆</b>
                </span>
              </p>
              <div style={{ textAlign: "center", padding: "20px" }}>
                <div style={{ display: "inline-block", padding: "10px 20px", backgroundColor: "#fff0f5", border: "2px solid #ff69b4", borderRadius: "5px", cursor: "pointer" }}>
                  <span style={{ fontSize: "24px", marginRight: "10px" }}>💖</span>
                  <span style={{ fontSize: "20px", fontWeight: "bold", color: "#ff1493" }}>いいね！ 123</span>
                </div>
                <p style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
                  （クリックでいいね/取り消しが切り替わります）
                </p>
              </div>
            </div>
          </>
        );

      case "usage":
        return (
          <>
            <div className="nostalgic-title-bar">★☆★ Like - 使い方 ★☆★</div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆STEP 1: いいねボタン作成◆</b>
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
                https://nostalgic.llll-ll.com/api/like?action=create&url=<span style={{ color: "#008000" }}>サイトURL</span>
                &token=<span style={{ color: "#008000" }}>オーナートークン</span>
              </p>
              <p>
                ※サイトURLには、いいねボタンを設置する予定のサイトを指定してください。
                <br />
                ※オーナートークンは8〜16文字で設定してください。
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆STEP 2: いいねボタン表示◆</b>
                </span>
              </p>
              <p>HTMLに以下のコードを追加：</p>
              <pre style={{ backgroundColor: "#f0f0f0", padding: "10px", overflow: "auto", fontSize: "14px", margin: "10px 0" }}>
                {`<script src="https://nostalgic.llll-ll.com/components/like.js"></script>
<nostalgic-like id="`}
                <span style={{ color: "#008000" }}>あなたの公開ID</span>
                {`"></nostalgic-like>`}
              </pre>
            </div>

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
          </>
        );

      case "features":
        return (
          <>
            <div className="nostalgic-title-bar">★☆★ Like - 機能一覧 ★☆★</div>

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
                  <b>◆デザイン特徴◆</b>
                </span>
              </p>
              <p>
                • かわいいハートアイコン 💖
                <br />
                • ピンクを基調とした優しい配色
                <br />
                • ホバー時のアニメーション
                <br />• モバイルフレンドリーなサイズ
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
            <div className="nostalgic-title-bar">★☆★ Like - API仕様 ★☆★</div>

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
                  <b>◆ユーザー識別◆</b>
                </span>
              </p>
              <p>
                ユーザーの識別には以下の情報を使用：
                <br />
                • IPアドレス
                <br />
                • User-Agent
                <br />
                • 日付（24時間で状態リセット）
              </p>
              <p style={{ color: "#ff0000", marginTop: "10px" }}>
                ※個人情報は一切保存しません
              </p>
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
    <NostalgicLayout serviceName="Like" serviceIcon="💖">
      {renderContent()}
    </NostalgicLayout>
  );
}