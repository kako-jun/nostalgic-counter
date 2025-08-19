"use client";

import { useState, useEffect, useRef } from "react";
import NostalgicLayout from "@/components/NostalgicLayout";

export default function BBSPage() {
  const [currentPage, setCurrentPage] = useState("main");
  const [response, setResponse] = useState("");
  const [publicId, setPublicId] = useState("");
  const [mode, setMode] = useState("create");

  const urlRef = useRef<HTMLInputElement>(null);
  const tokenRef = useRef<HTMLInputElement>(null);
  const authorRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const messageIdRef = useRef<HTMLInputElement>(null);
  const maxRef = useRef<HTMLInputElement>(null);
  const perPageRef = useRef<HTMLInputElement>(null);
  const iconsRef = useRef<HTMLInputElement>(null);
  
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
    const author = authorRef.current?.value;
    const message = messageRef.current?.value;
    const messageId = messageIdRef.current?.value;
    const max = maxRef.current?.value;
    const perPage = perPageRef.current?.value;
    const icons = iconsRef.current?.value;

    if (!url) return;

    let apiUrl = `/api/bbs?action=${mode}&url=${encodeURIComponent(url)}`;

    if (mode !== "get" && token) {
      apiUrl += `&token=${encodeURIComponent(token)}`;
    }

    if (mode === "post" || mode === "update") {
      if (!message) return;
      apiUrl += `&message=${encodeURIComponent(message)}`;
      if (author) {
        apiUrl += `&author=${encodeURIComponent(author)}`;
      }
    }

    if (mode === "remove" || mode === "update") {
      if (!messageId) return;
      apiUrl += `&messageId=${encodeURIComponent(messageId)}`;
    }

    if (mode === "create") {
      if (max) apiUrl += `&max=${max}`;
      if (perPage) apiUrl += `&perPage=${perPage}`;
      if (icons) apiUrl += `&icons=${encodeURIComponent(icons)}`;
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
              ★☆★ Nostalgic BBS ★☆★
              <br />
              掲示板システム
            </div>

            <div className="nostalgic-marquee-box">
              <div className="nostalgic-marquee-text">
                💬 懐かしの掲示板が復活！メッセージを投稿して交流しよう！編集・削除・アイコン選択機能付き！ 💬
              </div>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆BBSAPIテスト◆</b>
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
                    <option value="create">BBS作成</option>
                    <option value="post">メッセージ投稿</option>
                    <option value="update">メッセージ更新</option>
                    <option value="remove">メッセージ削除</option>
                    <option value="clear">全メッセージ削除</option>
                    <option value="get">メッセージ取得</option>
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

                {mode !== "get" && (
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
                )}

                {mode === "create" && (
                  <>
                    <p>
                      <b>最大メッセージ数（省略可）：</b>
                      <br />
                      <input
                        ref={maxRef}
                        type="number"
                        placeholder="1000"
                        style={{
                          width: "30%",
                          padding: "4px",
                          border: "1px solid #666",
                          fontFamily: "inherit",
                          fontSize: "16px"
                        }}
                        min="1"
                        max="10000"
                      />
                    </p>
                    <p>
                      <b>1ページあたりのメッセージ数（省略可）：</b>
                      <br />
                      <input
                        ref={perPageRef}
                        type="number"
                        placeholder="10"
                        style={{
                          width: "30%",
                          padding: "4px",
                          border: "1px solid #666",
                          fontFamily: "inherit",
                          fontSize: "16px"
                        }}
                        min="1"
                        max="100"
                      />
                    </p>
                    <p>
                      <b>使用可能アイコン（カンマ区切り、省略可）：</b>
                      <br />
                      <input
                        ref={iconsRef}
                        type="text"
                        placeholder="😀,😎,😍,🤔,😢"
                        style={{
                          width: "80%",
                          padding: "4px",
                          border: "1px solid #666",
                          fontFamily: "inherit",
                          fontSize: "16px"
                        }}
                      />
                    </p>
                  </>
                )}

                {(mode === "post" || mode === "update") && (
                  <>
                    <p>
                      <b>投稿者名（省略可）：</b>
                      <br />
                      <input
                        ref={authorRef}
                        type="text"
                        placeholder="名無しさん"
                        style={{
                          width: "60%",
                          padding: "4px",
                          border: "1px solid #666",
                          fontFamily: "inherit",
                          fontSize: "16px"
                        }}
                        maxLength={50}
                      />
                    </p>
                    <p>
                      <b>メッセージ（最大1000文字）：</b>
                      <br />
                      <textarea
                        ref={messageRef}
                        placeholder="メッセージを入力してください..."
                        style={{
                          width: "90%",
                          height: "100px",
                          padding: "4px",
                          border: "1px solid #666",
                          fontFamily: "inherit",
                          fontSize: "16px",
                          resize: "vertical"
                        }}
                        maxLength={1000}
                        required
                      />
                    </p>
                  </>
                )}

                {(mode === "remove" || mode === "update") && (
                  <p>
                    <b>メッセージID：</b>
                    <br />
                    <input
                      ref={messageIdRef}
                      type="text"
                      placeholder="修正するメッセージのID"
                      style={{
                        width: "60%",
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
                      backgroundColor: "#32cd32",
                      color: "white",
                      border: "2px outset #90ee90",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: "16px",
                      fontWeight: "bold"
                    }}
                  >
                    {mode === "create" ? "作成する" :
                     mode === "post" ? "投稿する" :
                     mode === "update" ? "更新する" :
                     mode === "remove" ? "削除する" :
                     mode === "clear" ? "全削除" : "取得する"}
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
                    <b>◆BBS表示方法◆</b>
                  </span>
                </p>
                <p>公開ID: <span style={{ backgroundColor: "#ffff00", padding: "2px 4px", fontFamily: "monospace" }}>{publicId}</span></p>
                <p>メッセージ取得URL:</p>
                <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px", wordBreak: "break-all" }}>
                  {`https://nostalgic.llll-ll.com/api/bbs?action=get&id=${publicId}&page=1`}
                </p>
              </div>
            )}

            <div className="nostalgic-counter-section">
              <p>
                <span style={{ color: "#ff8c00" }}>
                  <b>◆BBS表示例◆</b>
                </span>
              </p>
              <div style={{ backgroundColor: "#fff", border: "2px solid #ddd", padding: "15px", fontFamily: "monospace" }}>
                <div style={{ textAlign: "center", fontSize: "18px", fontWeight: "bold", marginBottom: "15px", color: "#32cd32" }}>
                  💬 懐かしBBS 💬
                </div>
                <div style={{ fontSize: "14px" }}>
                  <div style={{ border: "1px solid #ccc", margin: "5px 0", padding: "8px", backgroundColor: "#f9f9f9" }}>
                    <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
                      1. 名無しさん 😀 2025/08/17 12:34:56
                    </div>
                    <div>こんにちは！懐かしいBBSですね！</div>
                  </div>
                  <div style={{ border: "1px solid #ccc", margin: "5px 0", padding: "8px", backgroundColor: "#f9f9f9" }}>
                    <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
                      2. 通りすがり 😎 2025/08/17 13:45:21
                    </div>
                    <div>1990年代を思い出しますね～</div>
                  </div>
                  <div style={{ border: "1px solid #ccc", margin: "5px 0", padding: "8px", backgroundColor: "#f9f9f9" }}>
                    <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
                      3. 老人ホーマー 🤔 2025/08/17 14:12:09
                    </div>
                    <div>昔はこういうBBSでよく議論したものじゃ</div>
                  </div>
                </div>
                <div style={{ textAlign: "center", marginTop: "15px", fontSize: "12px", color: "#666" }}>
                  ページ: [1] [2] [3] [次へ]
                </div>
              </div>
            </div>

            <div className="nostalgic-counter-section">
              <p>
                <span style={{ color: "#ff8c00" }}>
                  <b>◆デモ用BBS◆</b>
                </span>
              </p>
              <div style={{ textAlign: "center", margin: "20px 0" }}>
                <p style={{ marginBottom: "10px" }}>このデモページのBBS（実際に動作します）：</p>
                <nostalgic-bbs id="nostalgic-bbs-demo" theme="classic" />
              </div>
              <p style={{ textAlign: "center", marginTop: "10px", fontSize: "14px", color: "#666" }}>
                ※実際にメッセージを投稿するには上記のAPIテストフォームをお使いください
              </p>
            </div>
          </>
        );

      case "usage":
        return (
          <>
            <div className="nostalgic-title-bar">★☆★ BBS - 使い方 ★☆★</div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆STEP 1: BBS作成◆</b>
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
                https://nostalgic.llll-ll.com/api/bbs?action=create&url=<span style={{ color: "#008000" }}>サイトURL</span>
                &token=<span style={{ color: "#008000" }}>オーナートークン</span>
              </p>
              <p>
                ※オプション：max（最大メッセージ数）、perPage（1ページあたりメッセージ数）、icons（使用可能アイコン）
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆STEP 2: メッセージ投稿◆</b>
                </span>
              </p>
              <p>メッセージを投稿するには：</p>
              <p
                style={{
                  backgroundColor: "#f0f0f0",
                  padding: "10px",
                  fontFamily: "monospace",
                  fontSize: "14px",
                  wordBreak: "break-all",
                }}
              >
                https://nostalgic.llll-ll.com/api/bbs?action=post&url=<span style={{ color: "#008000" }}>サイトURL</span>
                &token=<span style={{ color: "#008000" }}>オーナートークン</span>&message=<span style={{ color: "#008000" }}>メッセージ</span>&author=<span style={{ color: "#008000" }}>投稿者名</span>
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆STEP 3: メッセージ表示◆</b>
                </span>
              </p>
              <p>公開IDを使ってメッセージを取得：</p>
              <p
                style={{
                  backgroundColor: "#f0f0f0",
                  padding: "10px",
                  fontFamily: "monospace",
                  fontSize: "14px",
                  wordBreak: "break-all",
                }}
              >
                https://nostalgic.llll-ll.com/api/bbs?action=get&id=<span style={{ color: "#008000" }}>公開ID</span>&page=<span style={{ color: "#008000" }}>ページ番号</span>
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆メッセージ管理◆</b>
                </span>
              </p>
              <p>
                • <span style={{ color: "#008000" }}>update</span> - 自分の投稿を更新（投稿者のみ）
                <br />• <span style={{ color: "#008000" }}>remove</span> - メッセージ削除（投稿者またはオーナー）
                <br />• <span style={{ color: "#008000" }}>clear</span> - 全メッセージ削除（オーナーのみ）
              </p>
            </div>
          </>
        );

      case "features":
        return (
          <>
            <div className="nostalgic-title-bar">★☆★ BBS - 機能一覧 ★☆★</div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆基本機能◆</b>
                </span>
              </p>
              <p>
                <span>●</span> メッセージ投稿・取得・編集・削除
                <br />
                <span>●</span> カスタマイズ可能なドロップダウン（3つ）
                <br />
                <span>●</span> アイコン選択機能
                <br />
                <span>●</span> ページネーション機能
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆権限管理◆</b>
                </span>
              </p>
              <p>
                <span>●</span> 投稿者による自分の投稿編集・削除
                <br />
                <span>●</span> オーナーによる全投稿管理
                <br />
                <span>●</span> IP+UserAgent+日付による投稿者識別
                <br />
                <span>●</span> 匿名投稿対応（投稿者名省略可）
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆カスタマイズ機能◆</b>
                </span>
              </p>
              <p>
                • 最大メッセージ数設定（1〜10000）
                <br />
                • 1ページあたりメッセージ数設定（1〜100）
                <br />
                • 使用可能アイコンのカスタマイズ
                <br />• メッセージ長制限（最大1000文字）
              </p>
            </div>

            <div className="nostalgic-counter-section">
              <p>
                <span style={{ color: "#ff8c00" }}>
                  <b>◆活用例◆</b>
                </span>
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", fontSize: "14px" }}>
                <div style={{ backgroundColor: "#f0fff0", padding: "10px", border: "2px solid #32cd32" }}>
                  <b>💬 コミュニティ</b>
                  <br />
                  ・ファンサイトの感想掲示板
                  <br />
                  ・趣味仲間の交流スペース
                  <br />
                  ・イベント参加者の情報交換
                </div>
                <div style={{ backgroundColor: "#f0f0ff", padding: "10px", border: "2px solid #6666ff" }}>
                  <b>📝 フィードバック</b>
                  <br />
                  ・サイトへの感想・要望
                  <br />
                  ・商品レビューボード
                  <br />
                  ・サービス改善提案
                </div>
                <div style={{ backgroundColor: "#fff5f5", padding: "10px", border: "2px solid #ff6666" }}>
                  <b>📢 お知らせ</b>
                  <br />
                  ・更新情報の共有
                  <br />
                  ・重要連絡事項
                  <br />
                  ・メンテナンス情報
                </div>
                <div style={{ backgroundColor: "#fffff0", padding: "10px", border: "2px solid #ffcc00" }}>
                  <b>🎪 エンターテイメント</b>
                  <br />
                  ・キリ番報告BBS
                  <br />
                  ・一言メッセージボード
                  <br />
                  ・ゲストブック
                </div>
              </div>
            </div>
          </>
        );

      case "api":
        return (
          <>
            <div className="nostalgic-title-bar">★☆★ BBS - API仕様 ★☆★</div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆BBS作成◆</b>
                </span>
              </p>
              <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px" }}>
                GET /api/bbs?action=create&url=<span style={{ color: "#008000" }}>サイトURL</span>&token=
                <span style={{ color: "#008000" }}>オーナートークン</span>&max=<span style={{ color: "#008000" }}>最大メッセージ数</span>&perPage=<span style={{ color: "#008000" }}>1ページメッセージ数</span>&icons=<span style={{ color: "#008000" }}>使用可能アイコン</span>
              </p>
              <p style={{ lineHeight: "1.2" }}>
                BBSシステムを作成します。max、perPage、iconsは省略可能。
                <br />
                レスポンス:{" "}
                <span
                  style={{ backgroundColor: "#000000", color: "#ffffff", padding: "2px 4px", fontFamily: "monospace" }}
                >{`{ "id": "公開ID", "max": 1000, "perPage": 10 }`}</span>
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆メッセージ投稿◆</b>
                </span>
              </p>
              <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px" }}>
                GET /api/bbs?action=post&url=<span style={{ color: "#008000" }}>サイトURL</span>&token=
                <span style={{ color: "#008000" }}>オーナートークン</span>&message=<span style={{ color: "#008000" }}>メッセージ</span>&author=<span style={{ color: "#008000" }}>投稿者名</span>
              </p>
              <p>
                新しいメッセージを投稿します。authorは省略可能（デフォルト：名無しさん）。
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆メッセージ取得◆</b>
                </span>
              </p>
              <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px" }}>
                GET /api/bbs?action=get&id=<span style={{ color: "#008000" }}>公開ID</span>&page=<span style={{ color: "#008000" }}>ページ番号</span>
              </p>
              <p>
                メッセージ一覧を取得します。pageは省略可能（デフォルト1）。
                <br />
                レスポンス:{" "}
                <span
                  style={{ backgroundColor: "#000000", color: "#ffffff", padding: "2px 4px", fontFamily: "monospace" }}
                >{`{ "messages": [...], "totalPages": 5, "currentPage": 1 }`}</span>
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆メッセージ更新・削除◆</b>
                </span>
              </p>
              <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px" }}>
                GET /api/bbs?action=update&url=...&messageId=<span style={{ color: "#008000" }}>メッセージID</span>&message=<span style={{ color: "#008000" }}>新メッセージ</span>
                <br />
                GET /api/bbs?action=remove&url=...&messageId=<span style={{ color: "#008000" }}>メッセージID</span>
                <br />
                GET /api/bbs?action=clear&url=...（全削除）
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆データ制限・権限◆</b>
                </span>
              </p>
              <p>
                • 投稿者名: 最大50文字（省略時：名無しさん）
                <br />
                • メッセージ: 最大1000文字
                <br />
                • 投稿者確認: IP+UserAgent+日付（24時間）
                <br />
                • 編集権限: 投稿者本人またはオーナー
                <br />• 削除権限: 投稿者本人またはオーナー
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
    <NostalgicLayout serviceName="BBS" serviceIcon="💬">
      {renderContent()}
    </NostalgicLayout>
  );
}