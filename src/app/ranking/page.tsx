"use client";

import { useState, useEffect, useRef } from "react";
import NostalgicLayout from "@/components/NostalgicLayout";
import { ServiceStructuredData, BreadcrumbStructuredData } from "@/components/StructuredData";

export default function RankingPage() {
  const [currentPage, setCurrentPage] = useState("features");
  const [response, setResponse] = useState("");
  const [publicId, setPublicId] = useState("");
  const [mode, setMode] = useState("create");
  const [votingResults, setVotingResults] = useState<any[]>([]);
  const [votingMessage, setVotingMessage] = useState("");

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
    const name = nameRef.current?.value;
    const score = scoreRef.current?.value;
    const max = maxRef.current?.value;

    let apiUrl = '';

    if (mode === "submit") {
      // submitモードでは公開IDを使用
      if (!publicId || !name || !score) return;
      apiUrl = `/api/ranking?action=submit&id=${encodeURIComponent(publicId)}&name=${encodeURIComponent(name)}&score=${score}`;
    } else {
      // その他のモードでは従来通りurl+tokenを使用
      if (!url || !token) return;
      apiUrl = `/api/ranking?action=${mode}&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;
      
      if (mode === "create" && max) {
        apiUrl += `&max=${max}`;
      }
      if (mode === "update" && name && score) {
        apiUrl += `&name=${encodeURIComponent(name)}&score=${score}`;
      }
      if (mode === "remove" && name) {
        apiUrl += `&name=${encodeURIComponent(name)}`;
      }
    }

    try {
      const res = await fetch(apiUrl, { method: 'GET' });
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));

      if (data.id) {
        setPublicId(data.id);
      }
    } catch (error) {
      setResponse(`エラー: ${error}`);
    }
  };

  const voteForService = async (serviceName: string) => {
    try {
      const rankingId = "nostalgic-9c044ad0";
      
      // 現在のスコアを取得してインクリメント
      const getCurrentResponse = await fetch(`/api/ranking?action=get&id=${rankingId}`);
      let newScore = 1;
      if (getCurrentResponse.ok) {
        const currentData = await getCurrentResponse.json();
        console.log('Current ranking data:', currentData);
        const currentEntry = currentData.data?.entries?.find((entry: any) => entry.name === serviceName);
        console.log('Found current entry:', currentEntry);
        if (currentEntry) {
          newScore = currentEntry.score + 1;
          console.log('New score will be:', newScore);
        } else {
          console.log('No existing entry found for:', serviceName);
        }
      } else {
        console.log('Failed to get current ranking');
      }
      
      console.log('Submitting vote with score:', newScore);
      const voteResponse = await fetch(`/api/ranking?action=submit&id=${rankingId}&name=${encodeURIComponent(serviceName)}&score=${newScore}`);
      
      if (voteResponse.ok) {
        const voteData = await voteResponse.json();
        console.log('Vote response data:', voteData);
        setVotingMessage(`${serviceName}に投票しました！ありがとうございます 🎉`);
        setTimeout(() => setVotingMessage(''), 3000);
        // APIレスポンスから直接最新のランキングデータを取得して表示
        if (voteData.data && voteData.data.entries) {
          setVotingResults(voteData.data.entries.slice(0, 4));
        } else {
          // フォールバック: 少し遅延を入れてリロード
          setTimeout(() => loadVotingResults(), 100);
        }
      } else {
        setVotingMessage('投票に失敗しました。もう一度お試しください。');
      }
    } catch (error) {
      setVotingMessage('エラーが発生しました。');
      console.error('Vote error:', error);
    }
  };
  
  const loadVotingResults = async () => {
    try {
      const rankingId = "nostalgic-9c044ad0";
      
      const response = await fetch(`/api/ranking?action=get&id=${rankingId}&limit=4`);
      if (response.ok) {
        const data = await response.json();
        setVotingResults(data.entries || []);
      }
    } catch (error) {
      console.error('Failed to load voting results:', error);
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case "usage":
        return (
          <>
            <div className="nostalgic-title-bar">
              ★ Nostalgic Ranking ★
              <br />
              使い方
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆STEP 1: ランキング作成◆</b>
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
                https://nostalgic.llll-ll.com/api/ranking?action=create&url=<span style={{ color: "#008000" }}>サイトURL</span>
                &token=<span style={{ color: "#008000" }}>オーナートークン</span>
              </p>
              <p>
                ※サイトURLには、ランキングを設置する予定のサイトを指定してください。「https://」から始まっている必要があります。
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
                  <b>最大エントリー数（オプション）：</b>
                  <input
                    ref={maxRef}
                    type="number"
                    min="1"
                    max="100"
                    placeholder="10"
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
                      backgroundColor: "#2196F3",
                      color: "white",
                      border: "2px outset #2196F3",
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
                  <b>◆STEP 2: ランキング表示◆</b>
                </span>
              </p>
              <p>あなたのサイトのHTMLに以下のコードを追加してください。</p>
              <pre style={{ backgroundColor: "#f0f0f0", padding: "10px", overflow: "auto", fontSize: "14px", margin: "10px 0" }}>
                {`<script src="https://nostalgic.llll-ll.com/components/ranking.js"></script>
<nostalgic-ranking id="`}
                <span style={{ color: "#008000" }}>公開ID</span>
                {`" theme="`}
                <span style={{ color: "#008000" }}>classic</span>
                {`"></nostalgic-ranking>`}
              </pre>
              
              <div className="nostalgic-section">
                <p>
                  <span className="nostalgic-section-title">
                    <b>◆theme デザインテーマ◆</b>
                  </span>
                </p>
                <p>
                  • <span style={{ color: "#008000" }}>classic</span> - クラシック（シンプル）
                  <br />• <span style={{ color: "#008000" }}>modern</span> - モダン（青系）
                  <br />• <span style={{ color: "#008000" }}>retro</span> - レトロ（黄系）
                </p>
              </div>

              <div className="nostalgic-section">
                <p>
                  <span className="nostalgic-section-title">
                    <b>◆TypeScript使用時の設定◆</b>
                  </span>
                </p>
                <p>TypeScriptプロジェクトでWeb Componentsを使用する場合、プロジェクトルートに <code>types.d.ts</code> ファイルを作成してください。</p>
                <pre style={{ backgroundColor: "#f0f0f0", padding: "10px", overflow: "auto", fontSize: "12px", margin: "10px 0" }}>
{`// types.d.ts
import 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'nostalgic-ranking': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        id?: string;
        max?: string;
        theme?: 'classic' | 'modern' | 'retro';
        limit?: string;
      };
    }
  }
}`}
                </pre>
                <p style={{ fontSize: "14px", color: "#666" }}>
                  ※この設定により、TypeScriptでWeb Componentsを使用してもビルドエラーが発生しません。
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
                      <p style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "15px" }}>REST APIデモ</p>
                      <div style={{ marginBottom: "15px" }}>
                        <p style={{ fontSize: "14px", marginBottom: "10px" }}>現在のランキングデータを取得：</p>
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch(`/api/ranking?action=get&id=${publicId}&limit=5`)
                              const data = await response.json()
                              const entries = data.entries || []
                              const rankingText = entries.length > 0 
                                ? entries.map((entry: any, index: number) => `${index + 1}位: ${entry.name} - ${entry.score}点`).join('\n')
                                : 'まだエントリーがありません'
                              alert(`ランキング（上位5位）:\n${rankingText}`)
                            } catch (error) {
                              alert('エラーが発生しました')
                            }
                          }}
                          style={{
                            padding: "8px 16px",
                            backgroundColor: "#4CAF50",
                            color: "white",
                            border: "1px solid #45a049",
                            borderRadius: "3px",
                            cursor: "pointer",
                            fontSize: "14px"
                          }}
                        >
                          ランキング取得（API直接呼び出し）
                        </button>
                      </div>
                      <p style={{ fontSize: "12px", color: "#666" }}>
                        ※この例では、Web ComponentsではなくREST APIを直接使用してランキングデータを取得しています
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {publicId && (
                <div className="nostalgic-section">
                  <p>
                    <span className="nostalgic-section-title">
                      <b>◆このように表示されます◆</b>
                    </span>
                  </p>
                  <div style={{ textAlign: "center", margin: "20px 0" }}>
                    <div style={{ backgroundColor: "#fffacd", border: "2px solid #ffa500", padding: "20px", borderRadius: "4px" }}>
                      <p style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "15px" }}>◆デモ用ランキング◆</p>
                      <p style={{ marginBottom: "15px" }}>このデモページのランキング（実際に動作します）：</p>
                      
                      <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
                        <div>
                          <p style={{ fontSize: "14px", marginBottom: "10px", fontWeight: "bold" }}>Classic</p>
                          <nostalgic-ranking id={publicId} theme="classic" limit="5" />
                        </div>
                        
                        <div>
                          <p style={{ fontSize: "14px", marginBottom: "10px", fontWeight: "bold" }}>Modern</p>
                          <nostalgic-ranking id={publicId} theme="modern" limit="5" />
                        </div>
                        
                        <div>
                          <p style={{ fontSize: "14px", marginBottom: "10px", fontWeight: "bold" }}>Retro</p>
                          <nostalgic-ranking id={publicId} theme="retro" limit="5" />
                        </div>
                      </div>
                      
                      <p style={{ fontSize: "12px", color: "#666", marginTop: "15px" }}>
                        ※スコア投稿フォームからテストデータを送信してください！
                      </p>
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
                https://nostalgic.llll-ll.com/api/ranking?action=create&url=<span style={{ color: "#008000" }}>サイトURL</span>
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
                      backgroundColor: "#2196F3",
                      color: "white",
                      border: "2px outset #2196F3",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontFamily: "inherit"
                    }}
                    onClick={() => setMode("create")}
                  >
                    確認
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
                  <b>◆スコアを送信したいときは？◆</b>
                </span>
              </p>
              <p>作成したランキングの公開IDを使用してスコアを送信できます。</p>
              <form onSubmit={handleSubmit} style={{ marginTop: "10px" }}>
                <input type="hidden" name="mode" value="submit" />
                <p>
                  <b>公開ID：</b>
                  <span style={{ marginLeft: "10px", fontFamily: "monospace", fontSize: "16px", fontWeight: "bold", color: publicId ? "#008000" : "#999" }}>
                    {publicId || "STEP 1で作成後に表示されます"}
                  </span>
                </p>

                <p>
                  <b>プレイヤー名：</b>
                  <input
                    ref={nameRef}
                    type="text"
                    placeholder="Player1"
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
                  <b>スコア：</b>
                  <input
                    ref={scoreRef}
                    type="number"
                    min="0"
                    placeholder="1000"
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
                    onClick={() => setMode("submit")}
                  >
                    スコア送信
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
                  <b>◆スコアを更新したいときは？◆</b>
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
                https://nostalgic.llll-ll.com/api/ranking?action=update&url=<span style={{ color: "#008000" }}>サイトURL</span>
                &token=<span style={{ color: "#008000" }}>オーナートークン</span>&name=<span style={{ color: "#008000" }}>プレイヤー名</span>&score=<span style={{ color: "#008000" }}>新スコア</span>
              </p>
              <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />
              
              <p>または、以下のフォームで更新できます。</p>
              
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
                  <b>プレイヤー名：</b>
                  <input
                    ref={nameRef}
                    type="text"
                    placeholder="Player1"
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
                  <b>新スコア：</b>
                  <input
                    ref={scoreRef}
                    type="number"
                    min="0"
                    placeholder="2000"
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
                    onClick={() => setMode("update")}
                  >
                    更新
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
                  <b>◆エントリーを削除したいときは？◆</b>
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
                https://nostalgic.llll-ll.com/api/ranking?action=remove&url=<span style={{ color: "#008000" }}>サイトURL</span>
                &token=<span style={{ color: "#008000" }}>オーナートークン</span>&name=<span style={{ color: "#008000" }}>プレイヤー名</span>
              </p>
              <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />
              
              <p>または、以下のフォームで削除できます。</p>
              
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
                  <b>削除するプレイヤー名：</b>
                  <input
                    ref={nameRef}
                    type="text"
                    placeholder="Player1"
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
                    onClick={() => setMode("remove")}
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

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆エントリーを全削除したいときは？◆</b>
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
                https://nostalgic.llll-ll.com/api/ranking?action=clear&url=<span style={{ color: "#008000" }}>サイトURL</span>
                &token=<span style={{ color: "#008000" }}>オーナートークン</span>
              </p>
              <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />
              
              <p>または、以下のフォームでクリアできます。</p>
              <p style={{ color: "#ff0000", fontWeight: "bold" }}>
                ※すべてのエントリーが削除されます。十分にご注意ください。
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
                    onClick={() => setMode("clear")}
                  >
                    全削除
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
                  <b>◆ランキングを完全削除したいときは？◆</b>
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
                https://nostalgic.llll-ll.com/api/ranking?action=delete&url=<span style={{ color: "#008000" }}>サイトURL</span>
                &token=<span style={{ color: "#008000" }}>オーナートークン</span>
              </p>
              <hr style={{ margin: "20px 0", border: "1px dashed #ccc" }} />
              
              <p>または、以下のフォームで削除できます。</p>
              <p style={{ color: "#ff0000", fontWeight: "bold" }}>
                ※ランキングが完全に削除され復元できません。十分にご注意ください。
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
                    完全削除
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
              ★ Nostalgic Ranking ★
              <br />
              機能一覧
            </div>

            <div className="nostalgic-marquee-box">
              <div className="nostalgic-marquee-text">
                🏆 究極のランキングシステム！ゲームスコア・人気投票・何でもランキング化できます！ 🏆
              </div>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆基本機能◆</b>
                </span>
              </p>
              <p>
                <span>●</span> Redis Sorted Setによる自動ソート
                <br />
                <span>●</span> スコア管理（submit/update/remove/clear）
                <br />
                <span>●</span> 最大エントリー数制限
                <br />
                <span>●</span> Web Componentsで簡単設置
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆利用シーン◆</b>
                </span>
              </p>
              <p>
                <span>●</span> ゲームの高得点ランキング
                <br />
                <span>●</span> 人気投票システム
                <br />
                <span>●</span> クイズの成績表
                <br />
                <span>●</span> コンテストの順位表
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
                • Redis Sorted Set で高速ソート
                <br />
                • 金・銀・銅メダル表示 🥇🥈🥉
                <br />• 必要なすべての要素が無料プランの範囲で動作するため、完全無料・広告なしを実現
              </p>
            </div>

          </>
        );

      case "api":
        return (
          <>
            <div className="nostalgic-title-bar">
              ★ Nostalgic Ranking ★
              <br />
              API仕様
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆ランキング作成◆</b>
                </span>
              </p>
              <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px" }}>
                GET /api/ranking?action=create&url=<span style={{ color: "#008000" }}>サイトURL</span>&token=
                <span style={{ color: "#008000" }}>オーナートークン</span>&max=
                <span style={{ color: "#008000" }}>最大エントリー数</span>
              </p>
              <p style={{ lineHeight: "1.2" }}>
                ランキングを作成します。maxパラメータで最大エントリー数を制限可能。
                <br />
                レスポンス:{" "}
                <span
                  style={{ backgroundColor: "#000000", color: "#ffffff", padding: "2px 4px", fontFamily: "monospace" }}
                >{`{ "id": "公開ID", "url": "サイトURL", "max": 10 }`}</span>
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆スコア送信（公開アクセス）◆</b>
                </span>
              </p>
              <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px" }}>
                GET /api/ranking?action=submit&id=<span style={{ color: "#008000" }}>公開ID</span>&name=
                <span style={{ color: "#008000" }}>プレイヤー名</span>&score=
                <span style={{ color: "#008000" }}>スコア</span>
              </p>
              <p>
                公開IDを使用してスコアを送信します。トークン不要で誰でもスコア登録可能。
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆ランキング取得◆</b>
                </span>
              </p>
              <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px" }}>
                GET /api/ranking?action=get&id=<span style={{ color: "#008000" }}>公開ID</span>
              </p>
              <p>
                現在のランキングデータを取得します。
                <br />
                レスポンス:{" "}
                <span
                  style={{ backgroundColor: "#000000", color: "#ffffff", padding: "2px 4px", fontFamily: "monospace" }}
                >{`{ "ranking": [{"name": "Player1", "score": 1000}, ...] }`}</span>
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆スコア削除◆</b>
                </span>
              </p>
              <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px" }}>
                GET /api/ranking?action=remove&url=<span style={{ color: "#008000" }}>サイトURL</span>&token=
                <span style={{ color: "#008000" }}>オーナートークン</span>&name=
                <span style={{ color: "#008000" }}>プレイヤー名</span>
              </p>
              <p>指定したプレイヤーをランキングから削除します。</p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆エントリークリア◆</b>
                </span>
              </p>
              <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px" }}>
                GET /api/ranking?action=clear&url=<span style={{ color: "#008000" }}>サイトURL</span>&token=
                <span style={{ color: "#008000" }}>オーナートークン</span>
              </p>
              <p>すべてのエントリーをクリアします。</p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆ランキング削除◆</b>
                </span>
              </p>
              <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px" }}>
                GET /api/ranking?action=delete&url=<span style={{ color: "#008000" }}>サイトURL</span>&token=
                <span style={{ color: "#008000" }}>オーナートークン</span>
              </p>
              <p>ランキングを完全に削除します。</p>
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
        name="Nostalgic Ranking"
        description="懐かしいランキングサービス。Redis Sorted Setによる自動ソート、スコア管理機能付き。"
        url="https://nostalgic.llll-ll.com/ranking"
        serviceType="Ranking Service"
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