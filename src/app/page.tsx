"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import NostalgicSidebar from "@/components/NostalgicSidebar";
import { 
  WebsiteStructuredData, 
  OrganizationStructuredData, 
  SoftwareApplicationStructuredData,
  BreadcrumbStructuredData 
} from "@/components/StructuredData";
import "./nostalgic.css";

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState("home");
  const [visitedPages, setVisitedPages] = useState<Set<string>>(new Set(["home"]));
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [votingResults, setVotingResults] = useState<any[]>([]);
  const [votingMessage, setVotingMessage] = useState("");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const sidebar = document.querySelector('.nostalgic-sidebar-left');
      const menuButton = document.querySelector('.nostalgic-mobile-menu-button');
      
      if (isMobileSidebarOpen && sidebar && !sidebar.contains(target) && !menuButton?.contains(target)) {
        setIsMobileSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileSidebarOpen]);

  useEffect(() => {
    // 初期ランキングデータを読み込み
    loadVotingResults();
  }, []);

  const voteForService = async (serviceName: string) => {
    console.log('Voting for:', serviceName); // デバッグ用
    try {
      const rankingId = "nostalgic-9c044ad0";
      
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
      console.log('Vote response status:', voteResponse.status); // デバッグ用
      
      if (voteResponse.ok) {
        const responseData = await voteResponse.json();
        console.log('Vote response data:', responseData); // デバッグ用
        setVotingMessage(`${serviceName}に投票しました！ありがとうございます 🎉`);
        setTimeout(() => setVotingMessage(''), 3000);
        // 結果を自動更新
        setTimeout(() => loadVotingResults(), 500);
      } else {
        const errorData = await voteResponse.text();
        console.error('Vote failed:', errorData);
        setVotingMessage('投票に失敗しました。もう一度お試しください。');
      }
    } catch (error) {
      setVotingMessage('エラーが発生しました。');
      console.error('Vote error:', error);
    }
  };
  
  const loadVotingResults = async () => {
    console.log('Loading voting results...'); // デバッグ用
    try {
      const rankingId = "nostalgic-9c044ad0";
      
      const response = await fetch(`/api/ranking?action=get&id=${rankingId}&limit=4`);
      console.log('Load results response status:', response.status); // デバッグ用
      if (response.ok) {
        const data = await response.json();
        console.log('Load results data:', data); // デバッグ用
        setVotingResults(data.entries || []);
      } else {
        const errorText = await response.text();
        console.error('Failed to load results:', errorText);
      }
    } catch (error) {
      console.error('Failed to load voting results:', error);
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case "home":
        return (
          <>
            <div className="nostalgic-title-bar">
              ★☆★ Nostalgic ★☆★
              <br />
              懐かしいWebツール集
            </div>

            <div className="nostalgic-marquee-box">
              <div className="nostalgic-marquee-text">
                ようこそ！Nostalgicへ！昔懐かしいWebツール（カウンター・いいね・ランキング・BBS）を無料で提供しています！
              </div>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆Nostalgicとは？◆</b>
                </span>
              </p>
              <p>昔のホームページによくあった懐かしいWebツール群を最新技術で復活させたサービスです。</p>
              <p>
                <span>●</span> 完全無料で利用可能
                <br />
                <span>●</span> 4つのサービス（Counter・Like・Ranking・BBS）
                <br />
                <span>●</span> 最新技術で高速・安定動作
              </p>
              <p>オープンソースプロジェクトです。こういうのがほしかった！と思った方は、ネタで設置してみてください。</p>
              
              <div style={{ textAlign: "center", margin: "20px 0" }}>
                <p style={{ marginBottom: "10px", fontWeight: "bold" }}>【サービス一覧】</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
                  <a href="/counter" className="nostalgic-old-link" style={{ padding: "5px 10px", border: "1px solid #666", backgroundColor: "#f0f0f0" }}>
                    📊 Nostalgic Counter
                  </a>
                  <a href="/like" className="nostalgic-old-link" style={{ padding: "5px 10px", border: "1px solid #666", backgroundColor: "#f0f0f0" }}>
                    💖 Nostalgic Like
                  </a>
                  <a href="/ranking" className="nostalgic-old-link" style={{ padding: "5px 10px", border: "1px solid #666", backgroundColor: "#f0f0f0" }}>
                    🏆 Nostalgic Ranking
                  </a>
                  <a href="/bbs" className="nostalgic-old-link" style={{ padding: "5px 10px", border: "1px solid #666", backgroundColor: "#f0f0f0" }}>
                    💬 Nostalgic BBS
                  </a>
                </div>
              </div>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆カウンターのサンプル◆</b>
                </span>
              </p>
              <div className="nostalgic-counter-section">
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <p style={{ fontSize: "20px", fontWeight: "bold", textAlign: "center", margin: "0" }}>
                    ようこそ！
                    <br />
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                      <nostalgic-counter id="nostalgic-b89803bb" type="total" theme="classic" />
                      回も閲覧されました！
                    </span>
                  </p>
                </div>
                <div className="nostalgic-counter-item">
                  <b>今日</b>
                  <br />
                  <div style={{ marginTop: "10px" }}>
                    <nostalgic-counter id="nostalgic-b89803bb" type="today" theme="modern" digits="3" />
                  </div>
                </div>
                <div className="nostalgic-counter-item">
                  <b>昨日</b>
                  <br />
                  <div style={{ marginTop: "10px" }}>
                    <nostalgic-counter id="nostalgic-b89803bb" type="yesterday" theme="modern" digits="3" />
                  </div>
                </div>
                <div style={{ margin: "0 15px" }}></div>
                <div className="nostalgic-counter-item">
                  <b>今週</b>
                  <br />
                  <div style={{ marginTop: "10px" }}>
                    <nostalgic-counter id="nostalgic-b89803bb" type="week" theme="retro" digits="4" />
                  </div>
                </div>
                <div className="nostalgic-counter-item">
                  <b>今月</b>
                  <br />
                  <div style={{ marginTop: "10px" }}>
                    <nostalgic-counter id="nostalgic-b89803bb" type="month" theme="retro" digits="4" />
                  </div>
                </div>
              </div>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆いいねボタンのサンプル◆</b>
                </span>
              </p>
              <div style={{ textAlign: "center", margin: "20px 0" }}>
                <p style={{ marginBottom: "10px" }}>このサイトが気に入ったら、いいねを押してください！</p>
                <nostalgic-like id="nostalgic-b89803bb" theme="classic" />
              </div>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆4サービス人気投票◆</b>
                </span>
              </p>
              
              <div style={{ margin: "20px 0" }}>
                <nostalgic-ranking id="nostalgic-9c044ad0" theme="classic" />
              </div>
              
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
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆ナンバークリックゲーム ハイスコア◆</b>
                </span>
              </p>
              <div style={{ margin: "20px 0" }}>
                <nostalgic-ranking id="llll-ll-a235b610" theme="modern" />
              </div>
              <div style={{ textAlign: "center", marginTop: "15px" }}>
                <a href="https://llll-ll.com/easter-egg" className="nostalgic-old-link" target="_blank" rel="noopener noreferrer">
                  🔢 ナンバークリックゲームをプレイ
                </a>
              </div>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆名詞性別クイズ ハイスコア◆</b>
                </span>
              </p>
              <div style={{ margin: "20px 0" }}>
                <nostalgic-ranking id="noun-gender-d0bb6d1f" theme="retro" />
              </div>
              <div style={{ textAlign: "center", marginTop: "15px" }}>
                <a href="https://noun-gender.llll-ll.com/quiz" className="nostalgic-old-link" target="_blank" rel="noopener noreferrer">
                  📝 名詞性別クイズをプレイ
                </a>
              </div>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆ゲストブックのサンプル◆</b>
                </span>
              </p>
              <div style={{ margin: "20px 0", display: "flex", justifyContent: "center" }}>
                <div>
                  <p style={{ marginBottom: "10px", textAlign: "center" }}>訪問の記念に、足あとを残していってください！</p>
                  <nostalgic-bbs id="nostalgic-b89803bb" theme="classic" />
                </div>
              </div>
            </div>

            <hr />

            <p style={{ textAlign: "center", fontSize: "20px", fontWeight: "bold", margin: "20px 0" }}>
              Sorry, This Homepage is Earthlings Only.
            </p>
          </>
        );

      case "usage":
        return (
          <>
            <div className="nostalgic-title-bar">★☆★ 使い方 ★☆★</div>

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
                https://nostalgic.llll-ll.com/api/visit?action=create&url=<span style={{ color: "#008000" }}>サイトURL</span>
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
                {`" style="`}
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
                  <b>◆style デザインスタイル◆</b>
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


      case "about":
        return (
          <>
            <div className="nostalgic-title-bar">★☆★ このサイトについて ★☆★</div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆開発者より◆</b>
                </span>
              </p>
              <p>
                1990年代後半〜2000年代前半のホームページには、必ずと言っていいほど設置されていたという「アクセスカウンター」。
              </p>
              <p>「キリ番」のワクワク感を味わってみたくて、このサービスを作りました。</p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆技術について◆</b>
                </span>
              </p>
              <p>見た目はレトロですが、中身は最新技術を使っています。</p>
              <p>
                • Next.js 15 (App Router)
                <br />
                • Vercel Edge Functions
                <br />
                • Redis
                <br />
                • Web Components
                <br />• SVG Graphics
              </p>
            </div>

            <div className="nostalgic-section">
              <p>
                <span className="nostalgic-section-title">
                  <b>◆お問い合わせ◆</b>
                </span>
              </p>
              <p>
                バグ報告・機能要望は{" "}
                <a href="https://github.com/kako-jun/nostalgic-counter/issues" className="nostalgic-old-link">
                  GitHub Issues
                </a>{" "}
                まで！
              </p>
            </div>

            <hr />

            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <img src="/footer.webp" alt="Footer" style={{ maxWidth: "100%", height: "auto" }} />
              <p style={{ marginTop: "10px", fontSize: "14px", color: "#666666" }}>Made in Kanazawa</p>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* 構造化データ */}
      <WebsiteStructuredData />
      <OrganizationStructuredData />
      <SoftwareApplicationStructuredData />
      <BreadcrumbStructuredData 
        items={[
          { name: "Nostalgic", url: "https://nostalgic.llll-ll.com" }
        ]}
      />
      
      <Script src="https://nostalgic.llll-ll.com/components/visit.js" strategy="beforeInteractive" />
      <Script src="https://nostalgic.llll-ll.com/components/like.js" strategy="beforeInteractive" />
      <Script src="https://nostalgic.llll-ll.com/components/ranking.js" strategy="beforeInteractive" />
      <Script src="https://nostalgic.llll-ll.com/components/bbs.js" strategy="beforeInteractive" />
      <div className="nostalgic-main-frame">
        <button 
          className="nostalgic-mobile-menu-button"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          aria-label="メニューを開く"
        >
          ☰
        </button>
        
        {isMobileSidebarOpen && <div className="nostalgic-mobile-overlay" onClick={() => setIsMobileSidebarOpen(false)} />}
        
        <NostalgicSidebar 
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          currentPage={currentPage}
          visitedPages={visitedPages}
          onPageChange={(page) => {
            setCurrentPage(page);
            setVisitedPages((prev) => new Set([...prev, page]));
          }}
        />

      <div className="nostalgic-content-area">{renderContent()}</div>


      {/* フッター - 右下固定 */}
      <div
        style={{
          position: "fixed",
          bottom: "10px",
          right: "10px",
          fontSize: "12px",
          color: "#666666",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          padding: "5px 8px",
          fontStyle: "italic",
          borderRadius: "4px",
        }}
      >
        1997年風のデザインを再現しています
      </div>
    </div>
    </>
  );
}
