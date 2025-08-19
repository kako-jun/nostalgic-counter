"use client";

import { useState, useEffect, useRef } from "react";
import NostalgicLayout from "@/components/NostalgicLayout";
import { ServiceStructuredData, BreadcrumbStructuredData } from "@/components/StructuredData";

export default function RankingPage() {
  const [currentPage, setCurrentPage] = useState("main");
  const [response, setResponse] = useState("");
  const [publicId, setPublicId] = useState("");
  const [mode, setMode] = useState("create");

  const urlRef = useRef<HTMLInputElement>(null);
  const tokenRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const scoreRef = useRef<HTMLInputElement>(null);
  const maxRef = useRef<HTMLInputElement>(null);
  
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const url = urlRef.current?.value;
    const token = tokenRef.current?.value;
    const name = nameRef.current?.value;
    const score = scoreRef.current?.value;
    const max = maxRef.current?.value;

    if (!url || !token) return;

    let apiUrl = `/api/ranking?action=${mode}&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;

    if (mode === "submit" || mode === "update") {
      if (!name || !score) return;
      apiUrl += `&name=${encodeURIComponent(name)}&score=${score}`;
    } else if (mode === "remove") {
      if (!name) return;
      apiUrl += `&name=${encodeURIComponent(name)}`;
    } else if (mode === "create" && max) {
      apiUrl += `&max=${max}`;
    }

    // 1990年代スタイル：ブラウザでAPIのURLに直接遷移
    window.location.href = apiUrl;
  };

  const renderContent = () => {
    switch (currentPage) {
      case "main":
        return (
          <>
            <div className="nostalgic-title-bar">
              ★☆★ Nostalgic Ranking ★☆★
              <br />
              スコアランキング
            </div>

            <div className="nostalgic-marquee-box">
              <div className="nostalgic-marquee-text">
                🏆 ハイスコアランキング登場！ゲームやコンテストのスコアを競い合おう！自動ソートで上位者を表示！ 🏆
              </div>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆ランキングAPIテスト◆</b>
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
                    <option value="create">ランキング作成</option>
                    <option value="submit">スコア送信</option>
                    <option value="update">スコア更新</option>
                    <option value="remove">スコア削除</option>
                    <option value="clear">ランキングクリア（スコアデータのみ）</option>
                    <option value="delete">ランキング削除（完全削除）</option>
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

                {mode === "create" && (
                  <p>
                    <b>最大エントリー数（省略可）：</b>
                    <br />
                    <input
                      ref={maxRef}
                      type="number"
                      placeholder="100"
                      style={{
                        width: "30%",
                        padding: "4px",
                        border: "1px solid #666",
                        fontFamily: "inherit",
                        fontSize: "16px"
                      }}
                      min="1"
                      max="1000"
                    />
                  </p>
                )}

                {(mode === "submit" || mode === "update" || mode === "remove") && (
                  <p>
                    <b>プレイヤー名（最大20文字）：</b>
                    <br />
                    <input
                      ref={nameRef}
                      type="text"
                      placeholder="プレイヤー名"
                      style={{
                        width: "60%",
                        padding: "4px",
                        border: "1px solid #666",
                        fontFamily: "inherit",
                        fontSize: "16px"
                      }}
                      maxLength={20}
                      required
                    />
                  </p>
                )}

                {(mode === "submit" || mode === "update") && (
                  <p>
                    <b>スコア：</b>
                    <br />
                    <input
                      ref={scoreRef}
                      type="number"
                      placeholder="1000"
                      style={{
                        width: "40%",
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
                      padding: "5px 20px",
                      backgroundColor: "#ffd700",
                      color: "black",
                      border: "2px outset #ffec8b",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: "16px",
                      fontWeight: "bold"
                    }}
                  >
                    {mode === "create" ? "作成する" :
                     mode === "submit" ? "スコア送信" :
                     mode === "update" ? "スコア更新" :
                     mode === "remove" ? "スコア削除" :
                     mode === "clear" ? "ランキングクリア" : "完全削除"}
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
                    <b>◆ランキング表示方法◆</b>
                  </span>
                </p>
                <p>公開ID: <span style={{ backgroundColor: "#ffff00", padding: "2px 4px", fontFamily: "monospace" }}>{publicId}</span></p>
                <p>データ取得URL:</p>
                <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px", wordBreak: "break-all" }}>
                  {`https://nostalgic.llll-ll.com/api/ranking?action=get&id=${publicId}&limit=10`}
                </p>
              </div>
            )}

            <div className="nostalgic-counter-section">
              <p>
                <span style={{ color: "#ff8c00" }}>
                  <b>◆ランキング表示例◆</b>
                </span>
              </p>
              <div style={{ backgroundColor: "#fff", border: "2px solid #ddd", padding: "15px", fontFamily: "monospace" }}>
                <div style={{ textAlign: "center", fontSize: "18px", fontWeight: "bold", marginBottom: "10px", color: "#ffd700" }}>
                  🏆 ハイスコアランキング 🏆
                </div>
                <div style={{ fontSize: "16px" }}>
                  <div style={{ padding: "2px 0", borderBottom: "1px solid #ccc" }}>
                    <span style={{ color: "#ffd700" }}>👑 1位</span> Player1 .......... 9999点
                  </div>
                  <div style={{ padding: "2px 0", borderBottom: "1px solid #ccc" }}>
                    <span style={{ color: "#c0c0c0" }}>🥈 2位</span> Player2 .......... 8888点
                  </div>
                  <div style={{ padding: "2px 0", borderBottom: "1px solid #ccc" }}>
                    <span style={{ color: "#cd7f32" }}>🥉 3位</span> Player3 .......... 7777点
                  </div>
                  <div style={{ padding: "2px 0" }}>
                    <span>   4位</span> Player4 .......... 6666点
                  </div>
                  <div style={{ padding: "2px 0" }}>
                    <span>   5位</span> Player5 .......... 5555点
                  </div>
                </div>
              </div>
            </div>

            <div className="nostalgic-counter-section">
              <p>
                <span style={{ color: "#ff8c00" }}>
                  <b>◆デモ用ランキング◆</b>
                </span>
              </p>
              <div style={{ textAlign: "center", margin: "20px 0" }}>
                <p style={{ marginBottom: "10px" }}>このデモページのランキング（実際に動作します）：</p>
                <nostalgic-ranking id="nostalgic-9c044ad0" theme="classic" />
              </div>
              <p style={{ textAlign: "center", marginTop: "10px", fontSize: "14px", color: "#666" }}>
                ※実際にスコアを投稿するには上記のAPIテストフォームをお使いください
              </p>
            </div>
          </>
        );

      case "usage":
        return (
          <>
            <div className="nostalgic-title-bar">★☆★ Ranking - 使い方 ★☆★</div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆STEP 1: ランキング作成◆</b>
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
                https://nostalgic.llll-ll.com/api/ranking?action=create&url=<span style={{ color: "#008000" }}>サイトURL</span>
                &token=<span style={{ color: "#008000" }}>オーナートークン</span>&max=<span style={{ color: "#008000" }}>最大エントリー数</span>
              </p>
              <p>
                ※maxパラメータは省略可能です（デフォルト100件）
                <br />
                ※最大エントリー数を超えると、下位のスコアが自動削除されます
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆STEP 2: スコア送信◆</b>
                </span>
              </p>
              <p>ゲーム終了時などに以下のURLでスコアを送信：</p>
              <p
                style={{
                  backgroundColor: "#f0f0f0",
                  padding: "10px",
                  fontFamily: "monospace",
                  fontSize: "14px",
                  wordBreak: "break-all",
                }}
              >
                https://nostalgic.llll-ll.com/api/ranking?action=submit&url=<span style={{ color: "#008000" }}>サイトURL</span>
                &token=<span style={{ color: "#008000" }}>オーナートークン</span>&name=<span style={{ color: "#008000" }}>プレイヤー名</span>&score=<span style={{ color: "#008000" }}>スコア</span>
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆STEP 3: ランキング表示◆</b>
                </span>
              </p>
              <p>公開IDを使ってランキングデータを取得：</p>
              <p
                style={{
                  backgroundColor: "#f0f0f0",
                  padding: "10px",
                  fontFamily: "monospace",
                  fontSize: "14px",
                  wordBreak: "break-all",
                }}
              >
                https://nostalgic.llll-ll.com/api/ranking?action=get&id=<span style={{ color: "#008000" }}>公開ID</span>&limit=<span style={{ color: "#008000" }}>表示件数</span>
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆管理操作◆</b>
                </span>
              </p>
              <p>
                • <span style={{ color: "#008000" }}>update</span> - 既存プレイヤーのスコア更新
                <br />• <span style={{ color: "#008000" }}>remove</span> - 指定プレイヤーのスコア削除
                <br />• <span style={{ color: "#008000" }}>clear</span> - 全スコア削除
              </p>
            </div>
          </>
        );

      case "features":
        return (
          <>
            <div className="nostalgic-title-bar">★☆★ Ranking - 機能一覧 ★☆★</div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆基本機能◆</b>
                </span>
              </p>
              <p>
                <span>●</span> スコア自動ソート（降順）
                <br />
                <span>●</span> 最大エントリー数制限
                <br />
                <span>●</span> スコア更新・削除機能
                <br />
                <span>●</span> プレイヤー名重複管理
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆データ管理◆</b>
                </span>
              </p>
              <p>
                <span>●</span> Redis Sorted Setによる高速ソート
                <br />
                <span>●</span> プレイヤー名は20文字まで
                <br />
                <span>●</span> スコアは数値型（整数・小数点対応）
                <br />
                <span>●</span> 同名プレイヤーは最新スコアで更新
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆表示機能◆</b>
                </span>
              </p>
              <p>
                • 順位表示（1位、2位、3位...）
                <br />
                • 上位者の特別表示（👑🥈🥉）
                <br />
                • 件数制限付き取得
                <br />• JSON形式でのデータ提供
              </p>
            </div>

            <div className="nostalgic-counter-section">
              <p>
                <span style={{ color: "#ff8c00" }}>
                  <b>◆活用例◆</b>
                </span>
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", fontSize: "14px" }}>
                <div style={{ backgroundColor: "#fff0f0", padding: "10px", border: "2px solid #ff6b6b" }}>
                  <b>🎮 ゲームランキング</b>
                  <br />
                  ・Webゲームのハイスコア
                  <br />
                  ・タイムアタック記録
                  <br />
                  ・クリア回数ランキング
                </div>
                <div style={{ backgroundColor: "#f0f0ff", padding: "10px", border: "2px solid #6b6bff" }}>
                  <b>🏆 コンテスト</b>
                  <br />
                  ・プログラミングコンテスト
                  <br />
                  ・クイズ大会
                  <br />
                  ・創作コンテスト投票
                </div>
                <div style={{ backgroundColor: "#f0fff0", padding: "10px", border: "2px solid #6bff6b" }}>
                  <b>📊 計測記録</b>
                  <br />
                  ・サイト利用時間
                  <br />
                  ・アクション回数
                  <br />
                  ・達成度ランキング
                </div>
                <div style={{ backgroundColor: "#fffff0", padding: "10px", border: "2px solid #ffff6b" }}>
                  <b>🎯 目標管理</b>
                  <br />
                  ・読書冊数ランキング
                  <br />
                  ・運動記録
                  <br />
                  ・学習時間ランキング
                </div>
              </div>
            </div>
          </>
        );

      case "api":
        return (
          <>
            <div className="nostalgic-title-bar">★☆★ Ranking - API仕様 ★☆★</div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆ランキング作成◆</b>
                </span>
              </p>
              <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px" }}>
                GET /api/ranking?action=create&url=<span style={{ color: "#008000" }}>サイトURL</span>&token=
                <span style={{ color: "#008000" }}>オーナートークン</span>&max=<span style={{ color: "#008000" }}>最大エントリー数</span>
              </p>
              <p style={{ lineHeight: "1.2" }}>
                ランキングシステムを作成します。maxは省略可能（デフォルト100）。
                <br />
                レスポンス:{" "}
                <span
                  style={{ backgroundColor: "#000000", color: "#ffffff", padding: "2px 4px", fontFamily: "monospace" }}
                >{`{ "id": "公開ID", "max": 100, "scores": [] }`}</span>
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆スコア送信◆</b>
                </span>
              </p>
              <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px" }}>
                GET /api/ranking?action=submit&url=<span style={{ color: "#008000" }}>サイトURL</span>&token=
                <span style={{ color: "#008000" }}>オーナートークン</span>&name=<span style={{ color: "#008000" }}>プレイヤー名</span>&score=<span style={{ color: "#008000" }}>スコア</span>
              </p>
              <p>
                新しいスコアを送信します。同名プレイヤーが存在する場合はスコアを更新します。
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆ランキング取得◆</b>
                </span>
              </p>
              <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px" }}>
                GET /api/ranking?action=get&id=<span style={{ color: "#008000" }}>公開ID</span>&limit=<span style={{ color: "#008000" }}>取得件数</span>
              </p>
              <p>
                ランキングデータを取得します。limitは省略可能（デフォルト10件）。
                <br />
                レスポンス:{" "}
                <span
                  style={{ backgroundColor: "#000000", color: "#ffffff", padding: "2px 4px", fontFamily: "monospace" }}
                >{`{ "scores": [{"name": "Player1", "score": 1000, "rank": 1}] }`}</span>
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆スコア更新・削除◆</b>
                </span>
              </p>
              <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px" }}>
                GET /api/ranking?action=update&url=...&name=<span style={{ color: "#008000" }}>プレイヤー名</span>&score=<span style={{ color: "#008000" }}>新スコア</span>
                <br />
                GET /api/ranking?action=remove&url=...&name=<span style={{ color: "#008000" }}>プレイヤー名</span>
                <br />
                GET /api/ranking?action=clear&url=...（全削除）
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆データ制限◆</b>
                </span>
              </p>
              <p>
                • プレイヤー名: 最大20文字
                <br />
                • スコア: 数値型（負数も可能）
                <br />
                • 最大エントリー数: 1〜1000
                <br />• 同名プレイヤーは自動的に上書き
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
    <>
      {/* 構造化データ */}
      <ServiceStructuredData 
        name="Nostalgic Ranking"
        description="懐かしいランキングシステムサービス。スコア自動ソート機能、最大エントリー数制限対応。"
        url="https://nostalgic.llll-ll.com/ranking"
        serviceType="Ranking System Service"
      />
      <BreadcrumbStructuredData 
        items={[
          { name: "Nostalgic", url: "https://nostalgic.llll-ll.com" },
          { name: "Ranking", url: "https://nostalgic.llll-ll.com/ranking" }
        ]}
      />
      
      <NostalgicLayout serviceName="Ranking" serviceIcon="🏆">
        {renderContent()}
      </NostalgicLayout>
    </>
  );
}