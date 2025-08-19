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

            <div className="nostalgic-counter-section">
              <p>
                <span style={{ color: "#ff8c00" }}>
                  <b>◆このサイトのアクセスカウンター◆</b>
                </span>
              </p>
              <div style={{ textAlign: "center", marginBottom: "20px", marginTop: "30px" }}>
                <p style={{ fontSize: "20px", fontWeight: "bold", textAlign: "center" }}>
                  ようこそ！
                  <br />
                  今まで
                  <span style={{ transform: "scale(2)", display: "inline-block", transformOrigin: "center", margin: "0 30px" }}>
                    <nostalgic-counter id="nostalgic-b89803bb" type="total" theme="classic" />
                  </span>
                  回も閲覧されました！
                </p>
              </div>
              <div>
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
                <span style={{ color: "#ff8c00" }}>
                  <b>◆このサイトへの評価をお願いします◆</b>
                </span>
              </p>
              <div style={{ textAlign: "center", margin: "20px 0" }}>
                <p style={{ marginBottom: "10px" }}>このサイトが気に入ったら、いいねを押してください！</p>
                <nostalgic-like id="nostalgic-b89803bb" theme="classic" />
              </div>
            </div>

            <div className="nostalgic-section">
              <p>
                <span style={{ color: "#ff8c00" }}>
                  <b>◆サービス人気ランキング◆</b>
                </span>
              </p>
              <div style={{ textAlign: "center", margin: "20px 0" }}>
                <p style={{ marginBottom: "10px" }}>どのサービスが人気か見てみよう！</p>
                <nostalgic-ranking id="nostalgic-services-ranking" theme="classic" />
              </div>
            </div>

            <div className="nostalgic-section">
              <p>
                <span style={{ color: "#ff8c00" }}>
                  <b>◆足跡帳・ゲストブック◆</b>
                </span>
              </p>
              <div style={{ margin: "20px 0" }}>
                <p style={{ marginBottom: "10px", textAlign: "center" }}>訪問の記念に、何かコメントを残していってください！</p>
                <nostalgic-bbs id="nostalgic-b89803bb" theme="classic" />
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

      case "features":
        return (
          <>
            <div className="nostalgic-title-bar">★☆★ 機能一覧 ★☆★</div>

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
                <span>●</span> 3種類のデザイン
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
                    <img src="/api/counter?action=display&id=nostalgi-5e343478&type=total&style=classic" alt="Classic" />
                  </div>
                </div>
                <div className="nostalgic-counter-item">
                  <b>Modern</b>
                  <br />
                  <div style={{ marginTop: "10px" }}>
                    <img src="/api/counter?action=display&id=nostalgi-5e343478&type=total&style=modern" alt="Modern" />
                  </div>
                </div>
                <div className="nostalgic-counter-item">
                  <b>Retro</b>
                  <br />
                  <div style={{ marginTop: "10px" }}>
                    <img src="/api/counter?action=display&id=nostalgi-5e343478&type=total&style=retro" alt="Retro" />
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case "api":
        return (
          <>
            <div className="nostalgic-title-bar">★☆★ API仕様 ★☆★</div>

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
                <span style={{ color: "#008000" }}>期間タイプ</span>&style=
                <span style={{ color: "#008000" }}>デザインスタイル</span>
              </p>
              <p>
                SVG画像を返します。img タグの src に直接指定可能。
              </p>
              <p>
                ※typeとstyleは省略可能（type=total, style=classicがデフォルト）
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
      
      <Script src="https://nostalgic.llll-ll.com/components/counter.js" strategy="beforeInteractive" />
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
          backgroundColor: "transparent",
          padding: "5px 8px",
          fontStyle: "italic",
        }}
      >
        1997年風のデザインを再現しています
      </div>
    </div>
    </>
  );
}
