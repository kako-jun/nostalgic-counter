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

    if (!url || !token) return;

    let apiUrl = `/api/ranking?action=${mode}&url=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`;

    if (mode === "submit" && name && score) {
      apiUrl += `&name=${encodeURIComponent(name)}&score=${score}`;
    }
    if (mode === "create" && max) {
      apiUrl += `&max=${max}`;
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
      // TODO: 実際の公開IDに置き換える（ランキング作成後）
      const rankingId = "ranking-xxxxxxxx"; // プレースホルダー
      
      // 現在の票数を取得
      const getCurrentResponse = await fetch(`/api/ranking?action=get&id=${rankingId}`);
      let currentScore = 1;
      
      if (getCurrentResponse.ok) {
        const currentData = await getCurrentResponse.json();
        const currentEntry = currentData.entries?.find((entry: any) => entry.name === serviceName);
        if (currentEntry) {
          currentScore = currentEntry.score + 1;
        }
      }
      
      // 正しいAPI呼び出し: 公開IDのみ使用
      const voteResponse = await fetch(`/api/ranking?action=submit&id=${rankingId}&name=${encodeURIComponent(serviceName)}&score=${currentScore}`);
      
      if (voteResponse.ok) {
        setVotingMessage(`${serviceName}に投票しました！ありがとうございます 🎉`);
        setTimeout(() => setVotingMessage(''), 3000);
        // 結果を自動更新
        loadVotingResults();
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
      // TODO: 実際の公開IDに置き換える（ランキング作成後）
      const rankingId = "ranking-xxxxxxxx"; // プレースホルダー
      
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
                  <b>◆STEP 2: ランキング表示◆</b>
                </span>
              </p>
              <p>あなたのサイトのHTMLに以下のコードを追加してください。</p>
              <pre style={{ backgroundColor: "#f0f0f0", padding: "10px", overflow: "auto", fontSize: "14px", margin: "10px 0" }}>
                {`<script src="https://nostalgic.llll-ll.com/components/ranking.js"></script>
<nostalgic-ranking id="`}
                <span style={{ color: "#008000" }}>公開ID</span>
                {`"></nostalgic-ranking>`}
              </pre>
              
              <div className="nostalgic-section">
                <p>
                  <span className="nostalgic-section-title">
                    <b>◆動作仕様◆</b>
                  </span>
                </p>
                <p>
                  • 名前とスコアを入力してランキングに参加
                  <br />• 自動でスコア順にソート
                  <br />• 最大エントリー数で制限可能
                  <br />• リアルタイムでランキングが更新
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
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆STEP 3: スコア送信テスト◆</b>
                </span>
              </p>
              <p>作成したランキングにテストスコアを送信できます。</p>
              <form onSubmit={handleSubmit} style={{ marginTop: "10px" }}>
                <input type="hidden" name="mode" value="submit" />
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
                      backgroundColor: "#4CAF50",
                      color: "white",
                      border: "2px outset #4CAF50",
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
                  <b>◆体験デモ：4サービス人気投票◆</b>
                </span>
              </p>
              <p>どのサービスが一番人気か投票してみよう！</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', margin: '15px 0' }}>
                <button
                  onClick={() => voteForService('Counter')}
                  style={{
                    padding: '15px',
                    backgroundColor: '#e3f2fd',
                    border: '2px solid #1976d2',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s',
                    fontFamily: 'inherit'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#bbdefb'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#e3f2fd'; }}
                >
                  📊 Counter<br/>
                  <small style={{fontWeight: 'normal'}}>アクセス数カウンター</small>
                </button>
                
                <button
                  onClick={() => voteForService('Like')}
                  style={{
                    padding: '15px',
                    backgroundColor: '#fce4ec',
                    border: '2px solid #c2185b',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s',
                    fontFamily: 'inherit'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f8bbd9'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fce4ec'; }}
                >
                  💖 Like<br/>
                  <small style={{fontWeight: 'normal'}}>いいねボタン</small>
                </button>
                
                <button
                  onClick={() => voteForService('Ranking')}
                  style={{
                    padding: '15px',
                    backgroundColor: '#fff3e0',
                    border: '2px solid #f57c00',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s',
                    fontFamily: 'inherit'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#ffe0b2'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fff3e0'; }}
                >
                  🏆 Ranking<br/>
                  <small style={{fontWeight: 'normal'}}>ランキングシステム</small>
                </button>
                
                <button
                  onClick={() => voteForService('BBS')}
                  style={{
                    padding: '15px',
                    backgroundColor: '#e8f5e8',
                    border: '2px solid #388e3c',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s',
                    fontFamily: 'inherit'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#c8e6c9'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#e8f5e8'; }}
                >
                  💬 BBS<br/>
                  <small style={{fontWeight: 'normal'}}>掲示板システム</small>
                </button>
              </div>
              
              <div style={{ textAlign: 'center', margin: '15px 0' }}>
                <button
                  onClick={loadVotingResults}
                  style={{
                    padding: '8px 20px',
                    backgroundColor: '#4caf50',
                    color: 'white',
                    border: '2px outset #4caf50',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    fontFamily: 'inherit'
                  }}
                >
                  📈 投票結果を見る
                </button>
              </div>
              
              {votingMessage && (
                <div style={{
                  backgroundColor: votingMessage.includes('失敗') || votingMessage.includes('エラー') ? '#ffebee' : '#e8f5e8',
                  color: votingMessage.includes('失敗') || votingMessage.includes('エラー') ? '#c62828' : '#2e7d32',
                  border: `2px solid ${votingMessage.includes('失敗') || votingMessage.includes('エラー') ? '#ef5350' : '#4caf50'}`,
                  borderRadius: '8px',
                  padding: '10px',
                  margin: '10px 0',
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}>
                  {votingMessage}
                </div>
              )}
              
              {votingResults.length > 0 && (
                <div style={{
                  backgroundColor: '#f5f5f5',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  margin: '10px 0'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', textAlign: 'center' }}>📈 現在の人気ランキング</h4>
                  <ol style={{ margin: 0, paddingLeft: '20px' }}>
                    {votingResults.map((entry: any, index: number) => (
                      <li key={entry.name} style={{ margin: '8px 0' }}>
                        <strong>{entry.name}</strong>: {entry.score}票
                        {index === 0 && ' 🏆'}
                        {index === 1 && ' 🏅'}
                        {index === 2 && ' 🏉'}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              
              <p style={{ fontSize: '14px', color: '#666', textAlign: 'center', marginTop: '15px' }}>
                ※ このデモでは、実際にNostalgicランキングAPIを使用して投票しています
              </p>
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
                  <b>◆スコア送信◆</b>
                </span>
              </p>
              <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px" }}>
                GET /api/ranking?action=submit&url=<span style={{ color: "#008000" }}>サイトURL</span>&token=
                <span style={{ color: "#008000" }}>オーナートークン</span>&name=
                <span style={{ color: "#008000" }}>プレイヤー名</span>&score=
                <span style={{ color: "#008000" }}>スコア</span>
              </p>
              <p>
                新しいスコアをランキングに追加します。既存の名前の場合は更新されます。
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
                  <b>◆ランキングクリア◆</b>
                </span>
              </p>
              <p style={{ backgroundColor: "#f0f0f0", padding: "10px", fontFamily: "monospace", fontSize: "14px" }}>
                GET /api/ranking?action=clear&url=<span style={{ color: "#008000" }}>サイトURL</span>&token=
                <span style={{ color: "#008000" }}>オーナートークン</span>
              </p>
              <p>ランキングをすべてクリアします。</p>
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