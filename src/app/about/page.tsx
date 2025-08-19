"use client";

import { useState } from "react";
import NostalgicSidebar from "@/components/NostalgicSidebar";
import "@/app/nostalgic.css";

export default function AboutPage() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
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
      />

      <div className="nostalgic-content-area">
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
      </div>

      {/* フッター */}
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
  );
}