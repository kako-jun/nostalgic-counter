"use client";

import { useEffect } from "react";
import "./nostalgic.css";

export default function Test1Page() {
  return (
    <div className="nostalgic-main-frame">
      <div className="nostalgic-sidebar-left">
        <div className="nostalgic-title-bar">メニュー</div>
        <p>
          <b>◆リンク集◆</b>
        </p>
        <p>
          <span className="nostalgic-blink">●</span>
          <a href="/" className="nostalgic-old-link">
            ホーム
          </a>
          <br />
          <span className="nostalgic-blink">●</span>
          <a href="/test2" className="nostalgic-old-link">
            テスト2
          </a>
          <br />
          <span className="nostalgic-blink">●</span>
          <a href="/blog" className="nostalgic-old-link">
            ブログ
          </a>
        </p>
        <hr />
        <p>
          <b>◆お知らせ◆</b>
        </p>
        <p>
          <span style={{ color: "red" }}>
            <b>※重要※</b>
          </span>
        </p>
        <p>IE3.0以上推奨</p>
      </div>

      <div className="nostalgic-content-area">
        <div className="nostalgic-title-bar">★☆★ テストページ1 - カウンターテスト ★☆★</div>

        <div className="nostalgic-marquee-box">
          <div className="nostalgic-marquee-text">
            カウンターテスト用のページです！このページを訪問するとカウンターが増加します！24時間以内の重複訪問は除外されます。
          </div>
        </div>

        <div className="nostalgic-counter-section">
          <p>
            <b>◆このページのアクセスカウンター◆</b>
          </p>
          <div>
            <div className="nostalgic-counter-item">
              <b>総訪問数</b>
              <br />
              <img src="/api/counter?url=http://localhost:3000/test1&type=total&style=classic" alt="総訪問数" />
            </div>
            <div className="nostalgic-counter-item">
              <b>今日の訪問数</b>
              <br />
              <img src="/api/counter?url=http://localhost:3000/test1&type=today&style=modern" alt="今日の訪問数" />
            </div>
            <div className="nostalgic-counter-item">
              <b>今週の訪問数</b>
              <br />
              <img src="/api/counter?url=http://localhost:3000/test1&type=week&style=retro" alt="今週の訪問数" />
            </div>
          </div>
        </div>

        <hr />

        <div className="nostalgic-section">
          <p>
            <span style={{ fontSize: "14px" }}>
              <b>■ナビゲーション■</b>
            </span>
          </p>
          <p>
            <span className="nostalgic-blink">●</span>
            <a href="/" className="nostalgic-old-link">
              【ホームページに戻る】
            </a>
            <br />
            <span className="nostalgic-blink">●</span>
            <a href="/test2" className="nostalgic-old-link">
              【テストページ2へ】
            </a>
            <br />
            <span className="nostalgic-blink">●</span>
            <a href="/blog" className="nostalgic-old-link">
              【ブログサンプルへ】
            </a>
          </p>
        </div>

        <hr />

        <div className="nostalgic-section">
          <p>
            <span style={{ color: "red" }}>
              <b>※重要なお知らせ※</b>
            </span>
          </p>
          <p>
            このサイトは<u>Internet Explorer 3.0以上</u>でご覧ください。
          </p>
          <p>
            <span className="nostalgic-blink">Netscape Navigator</span>でも動作します！
          </p>
        </div>

        <hr />

        <p style={{ textAlign: "center", fontSize: "10px", color: "#666666" }}>
          <i>このページは1997年風のデザインで作成されています</i>
          <br />
          Last Updated: 2025/06/12
          <br />© 2025 Nostalgic Counter
        </p>
      </div>

      <div className="nostalgic-sidebar-right">
        <div className="nostalgic-title-bar">カウンター</div>
        <p>
          <b>◆アクセス情報◆</b>
        </p>
        <p>
          今日: <span className="nostalgic-blink">123</span>
        </p>
        <p>昨日: 98</p>
        <p>累計: 4567</p>
        <hr />
        <p>
          <b>◆更新履歴◆</b>
        </p>
        <p>
          <span style={{ fontSize: "10px" }}>
            2025/06/12
            <br />
            カウンター機能追加
          </span>
        </p>
      </div>

      {/* カウント用スクリプト */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            fetch('/api/count?url=' + encodeURIComponent(window.location.href))
              .then(r => r.json())
              .then(d => console.log('カウント完了:', d))
              .catch(e => console.error('カウントエラー:', e));
          `,
        }}
      />
    </div>
  );
}
