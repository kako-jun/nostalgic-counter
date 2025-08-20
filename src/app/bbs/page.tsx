"use client";

import { useState, useEffect, useRef } from "react";
import NostalgicLayout from "@/components/NostalgicLayout";
import { ServiceStructuredData, BreadcrumbStructuredData } from "@/components/StructuredData";

export default function BBSPage() {
  const [currentPage, setCurrentPage] = useState("features");
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
    const author = authorRef.current?.value;
    const message = messageRef.current?.value;
    const messageId = messageIdRef.current?.value;
    const max = maxRef.current?.value;
    const perPage = perPageRef.current?.value;
    const icons = iconsRef.current?.value;

    if (!url || !token) return;

    let apiUrl = `/api/bbs?action=${mode}&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;

    if (mode === "post" && author && message) {
      apiUrl += `&author=${encodeURIComponent(author)}&message=${encodeURIComponent(message)}`;
    }
    if (mode === "update" && messageId && author && message) {
      apiUrl += `&messageId=${messageId}&author=${encodeURIComponent(author)}&message=${encodeURIComponent(message)}`;
    }
    if (mode === "remove" && messageId && author) {
      apiUrl += `&messageId=${messageId}&author=${encodeURIComponent(author)}`;
    }
    if (mode === "create") {
      if (max) apiUrl += `&max=${max}`;
      if (perPage) apiUrl += `&perPage=${perPage}`;
      if (icons) apiUrl += `&icons=${encodeURIComponent(icons)}`;
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
              ★ Nostalgic BBS ★
              <br />
              使い方
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆STEP 1: BBS作成◆</b>
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
                https://nostalgic.llll-ll.com/api/bbs?action=create&url=<span style={{ color: "#008000" }}>サイトURL</span>
                &token=<span style={{ color: "#008000" }}>オーナートークン</span>
              </p>
              <p>
                ※サイトURLには、BBSを設置する予定のサイトを指定してください。「https://」から始まっている必要があります。
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

                <p>
                  <b>最大メッセージ数（オプション）：</b>
                  <input
                    ref={maxRef}
                    type="number"
                    min="1"
                    max="1000"
                    placeholder="100"
                    style={{
                      marginLeft: "10px",
                      width: "20%",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px"
                    }}
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
                  <b>◆STEP 2: BBS表示◆</b>
                </span>
              </p>
              <p>あなたのサイトのHTMLに以下のコードを追加してください。</p>
              <pre style={{ backgroundColor: "#f0f0f0", padding: "10px", overflow: "auto", fontSize: "14px", margin: "10px 0" }}>
                {`<script src="https://nostalgic.llll-ll.com/components/bbs.js"></script>
<nostalgic-bbs id="`}
                <span style={{ color: "#008000" }}>公開ID</span>
                {`"></nostalgic-bbs>`}
              </pre>
              
              <div className="nostalgic-section">
                <p>
                  <span className="nostalgic-section-title">
                    <b>◆動作仕様◆</b>
                  </span>
                </p>
                <p>
                  • 作者名とメッセージを入力して投稿
                  <br />• アイコン選択機能（3つのドロップダウン）
                  <br />• 投稿者による自分の投稿編集・削除
                  <br />• ページネーション機能
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
                    <div style={{ backgroundColor: "#f0f0f0", border: "1px solid #ccc", padding: "15px", borderRadius: "4px" }}>
                      <p style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "15px" }}>HTTPリクエストデモ</p>
                      <div style={{ marginBottom: "15px" }}>
                        <p style={{ fontSize: "14px", marginBottom: "10px" }}>BBSメッセージを取得：</p>
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch(`/api/bbs?action=get&id=${publicId}&page=1`)
                              const data = await response.json()
                              const messages = data.data?.messages || []
                              const messageText = messages.length > 0 
                                ? messages.map(msg => `${msg.author}: ${msg.message}`).join('\n')
                                : 'まだメッセージがありません'
                              alert(`BBS メッセージ:\n${messageText}`)
                            } catch (error) {
                              alert('エラーが発生しました')
                            }
                          }}
                          style={{
                            padding: "8px 16px",
                            backgroundColor: "#9C27B0",
                            color: "white",
                            border: "1px solid #7B1FA2",
                            borderRadius: "3px",
                            cursor: "pointer",
                            fontSize: "14px",
                            marginRight: "10px"
                          }}
                        >
                          メッセージ取得
                        </button>
                        <button
                          onClick={async () => {
                            const author = prompt('お名前を入力してください:') || '匿名'
                            const message = prompt('メッセージを入力してください:')
                            if (!message) return
                            
                            try {
                              const response = await fetch(`/api/bbs?action=post&id=${publicId}&author=${encodeURIComponent(author)}&message=${encodeURIComponent(message)}`)
                              const data = await response.json()
                              alert(data.success ? 'メッセージを投稿しました！' : 'エラーが発生しました')
                            } catch (error) {
                              alert('エラーが発生しました')
                            }
                          }}
                          style={{
                            padding: "8px 16px",
                            backgroundColor: "#FF5722",
                            color: "white",
                            border: "1px solid #D84315",
                            borderRadius: "3px",
                            cursor: "pointer",
                            fontSize: "14px"
                          }}
                        >
                          テスト投稿
                        </button>
                      </div>
                      <p style={{ fontSize: "12px", color: "#666" }}>
                        ※この例では、Web ComponentsではなくHTTPリクエストを直接送信してBBSと連携しています
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆メッセージ投稿テスト◆</b>
                </span>
              </p>
              <form onSubmit={handleSubmit} style={{ marginTop: "10px" }}>
                <input type="hidden" name="mode" value="post" />
                <p>
                  <b>サイトURL：</b>
                  <input
                    ref={urlRef}
                    type="url"
                    placeholder="https://example.com"
                    style={{
                      marginLeft: "10px",
                      width: "50%",
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
                  <b>投稿者名：</b>
                  <input
                    ref={authorRef}
                    type="text"
                    placeholder="名無し"
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
                  <b>メッセージ：</b>
                  <br />
                  <textarea
                    ref={messageRef}
                    placeholder="メッセージを入力してください"
                    style={{
                      width: "80%",
                      height: "100px",
                      padding: "4px",
                      border: "1px solid #666",
                      fontFamily: "inherit",
                      fontSize: "16px",
                      marginTop: "5px"
                    }}
                    required
                  />
                  <br />
                  <button
                    type="submit"
                    style={{
                      marginTop: "10px",
                      padding: "4px 12px",
                      backgroundColor: "#4CAF50",
                      color: "white",
                      border: "2px outset #4CAF50",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontFamily: "inherit"
                    }}
                    onClick={() => setMode("post")}
                  >
                    投稿
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
          </>
        );

      case "features":
        return (
          <>
            <div className="nostalgic-title-bar">
              ★ Nostalgic BBS ★
              <br />
              機能一覧
            </div>

            <div className="nostalgic-marquee-box">
              <div className="nostalgic-marquee-text">
                💬 懐かしの掲示板！メッセージ投稿・アイコン選択・編集削除・ページネーション！昔の掲示板がここに復活！ 💬
              </div>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆基本機能◆</b>
                </span>
              </p>
              <p>
                <span>●</span> メッセージ投稿・取得
                <br />
                <span>●</span> カスタマイズ可能なドロップダウン（3つ）
                <br />
                <span>●</span> アイコン選択機能
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
                <span>●</span> 投稿者による自分の投稿編集・削除
                <br />
                <span>●</span> ページネーション
                <br />
                <span>●</span> 最大メッセージ数制限
                <br />
                <span>●</span> 完全削除・クリア機能
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
                • Redis List でメッセージ保存
                <br />
                • 純粋なGET、1990年代スタイル
                <br />• 必要なすべての要素が無料プランの範囲で動作するため、完全無料・広告なしを実現
              </p>
            </div>

          </>
        );

      case "api":
        return (
          <>
            <div className="nostalgic-title-bar">
              ★ Nostalgic BBS ★
              <br />
              API仕様
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆BBS作成◆</b>
                </span>
              </p>
              <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px" }}>
                GET /api/bbs?action=create&url=<span style={{ color: "#008000" }}>サイトURL</span>&token=
                <span style={{ color: "#008000" }}>オーナートークン</span>
              </p>
              <p style={{ lineHeight: "1.2" }}>
                BBSを作成します。
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
                  <b>◆メッセージ投稿◆</b>
                </span>
              </p>
              <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px" }}>
                GET /api/bbs?action=post&url=<span style={{ color: "#008000" }}>サイトURL</span>&token=
                <span style={{ color: "#008000" }}>オーナートークン</span>&author=
                <span style={{ color: "#008000" }}>投稿者名</span>&message=
                <span style={{ color: "#008000" }}>メッセージ</span>
              </p>
              <p>
                新しいメッセージを投稿します。（純粋なGET、1990年代スタイル）
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆メッセージ取得◆</b>
                </span>
              </p>
              <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px" }}>
                GET /api/bbs?action=get&id=<span style={{ color: "#008000" }}>公開ID</span>
              </p>
              <p>
                メッセージ一覧を取得します。
                <br />
                レスポンス:{" "}
                <span
                  style={{ backgroundColor: "#000000", color: "#ffffff", padding: "2px 4px", fontFamily: "monospace" }}
                >{`{ "messages": [{"id": "1", "author": "名前", "message": "内容", ...}] }`}</span>
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆メッセージ編集◆</b>
                </span>
              </p>
              <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px" }}>
                GET /api/bbs?action=update&url=<span style={{ color: "#008000" }}>サイトURL</span>&token=
                <span style={{ color: "#008000" }}>オーナートークン</span>&messageId=
                <span style={{ color: "#008000" }}>メッセージID</span>&author=
                <span style={{ color: "#008000" }}>投稿者名</span>&message=
                <span style={{ color: "#008000" }}>新メッセージ</span>
              </p>
              <p>投稿者確認によりメッセージを編集します。</p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆メッセージ削除◆</b>
                </span>
              </p>
              <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px" }}>
                GET /api/bbs?action=remove&url=<span style={{ color: "#008000" }}>サイトURL</span>&token=
                <span style={{ color: "#008000" }}>オーナートークン</span>&messageId=
                <span style={{ color: "#008000" }}>メッセージID</span>&author=
                <span style={{ color: "#008000" }}>投稿者名</span>
              </p>
              <p>投稿者確認によりメッセージを削除します。</p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆BBS全削除◆</b>
                </span>
              </p>
              <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px" }}>
                GET /api/bbs?action=clear&url=<span style={{ color: "#008000" }}>サイトURL</span>&token=
                <span style={{ color: "#008000" }}>オーナートークン</span>
              </p>
              <p>すべてのメッセージをクリアします。</p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆BBS削除◆</b>
                </span>
              </p>
              <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px" }}>
                GET /api/bbs?action=delete&url=<span style={{ color: "#008000" }}>サイトURL</span>&token=
                <span style={{ color: "#008000" }}>オーナートークン</span>
              </p>
              <p>BBSを完全に削除します。</p>
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
        name="Nostalgic BBS"
        description="懐かしい掲示板サービス。メッセージ投稿・取得、アイコン選択、編集・削除機能付き。"
        url="https://nostalgic.llll-ll.com/bbs"
        serviceType="BBS Service"
      />
      <BreadcrumbStructuredData 
        items={[
          { name: "Nostalgic", url: "https://nostalgic.llll-ll.com" },
          { name: "BBS", url: "https://nostalgic.llll-ll.com/bbs" }
        ]}
      />
      
      <NostalgicLayout serviceName="BBS" serviceIcon="💬">
        {renderContent()}
      </NostalgicLayout>
    </>
  );
}