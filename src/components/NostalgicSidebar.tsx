"use client";

import { useState, useEffect } from "react";
import { usePathname } from 'next/navigation';

interface NostalgicSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  currentPage?: string;
  visitedPages?: Set<string>;
  onPageChange?: (page: string) => void;
}

export default function NostalgicSidebar({ 
  isOpen = true, 
  onClose,
  currentPage = "home",
  visitedPages = new Set(["home"]),
  onPageChange
}: NostalgicSidebarProps) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const currentService = pathname.split('/')[1] || '';

  const handlePageClick = (page: string) => {
    if (onPageChange) {
      onPageChange(page);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className={`nostalgic-sidebar-left ${isOpen ? 'mobile-open' : ''}`}>
      <div className="nostalgic-mobile-menu-title" style={{ fontSize: "20px", margin: "0 -10px 10px -10px", height: "67px", background: "rgb(204, 255, 204)", color: "black", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "3px double #808080" }}>MENU</div>
      <p>
        {isHomePage && currentPage === "home" ? (
          <>
            <span className="nostalgic-blink">●</span>
            <span className="nostalgic-nav-active">ホーム</span>
          </>
        ) : (
          <>
            <span>●</span>
            {isHomePage ? (
              <a
                href="#"
                className={visitedPages.has("home") ? "nostalgic-old-link-visited" : "nostalgic-old-link"}
                onClick={(e) => {
                  e.preventDefault();
                  handlePageClick("home");
                }}
              >
                ホーム
              </a>
            ) : (
              <a href="/" className="nostalgic-old-link" onClick={() => onClose?.()}>
                ホーム
              </a>
            )}
          </>
        )}
        <br />
        <span>●</span>
        <a href="/counter" className={currentService === 'counter' ? "nostalgic-old-link-visited" : "nostalgic-old-link"} onClick={() => onClose?.()}>
          Nostalgic Counter
        </a>
        <br />
        {isHomePage ? (
          <>
            <span style={{ marginLeft: "1em" }}>├</span>
            {currentPage === "counter-usage" ? (
              <span className="nostalgic-nav-active">使い方</span>
            ) : (
              <a href="/counter#usage" className="nostalgic-old-link" onClick={() => onClose?.()}>使い方</a>
            )}
            <br />
            <span style={{ marginLeft: "1em" }}>├</span>
            {currentPage === "counter-features" ? (
              <span className="nostalgic-nav-active">機能一覧</span>
            ) : (
              <a href="/counter#features" className="nostalgic-old-link" onClick={() => onClose?.()}>機能一覧</a>
            )}
            <br />
            <span style={{ marginLeft: "1em" }}>└</span>
            {currentPage === "counter-api" ? (
              <span className="nostalgic-nav-active">API仕様</span>
            ) : (
              <a href="/counter#api" className="nostalgic-old-link" onClick={() => onClose?.()}>API仕様</a>
            )}
            <br />
          </>
        ) : currentService === 'counter' && (
          <>
            <span style={{ marginLeft: "1em" }}>├</span>
            {currentPage === "main" ? (
              <span className="nostalgic-nav-active">トップ</span>
            ) : (
              <a href="/counter" className="nostalgic-old-link" onClick={() => onClose?.()}>トップ</a>
            )}
            <br />
            <span style={{ marginLeft: "1em" }}>├</span>
            {currentPage === "usage" ? (
              <span className="nostalgic-nav-active">使い方</span>
            ) : (
              <a href="/counter#usage" className="nostalgic-old-link" onClick={() => onClose?.()}>使い方</a>
            )}
            <br />
            <span style={{ marginLeft: "1em" }}>├</span>
            {currentPage === "features" ? (
              <span className="nostalgic-nav-active">機能一覧</span>
            ) : (
              <a href="/counter#features" className="nostalgic-old-link" onClick={() => onClose?.()}>機能一覧</a>
            )}
            <br />
            <span style={{ marginLeft: "1em" }}>└</span>
            {currentPage === "api" ? (
              <span className="nostalgic-nav-active">API仕様</span>
            ) : (
              <a href="/counter#api" className="nostalgic-old-link" onClick={() => onClose?.()}>API仕様</a>
            )}
            <br />
          </>
        )}
        <span>●</span>
        <a href="/like" className={currentService === 'like' ? "nostalgic-old-link-visited" : "nostalgic-old-link"} onClick={() => onClose?.()}>
          Nostalgic Like
        </a>
        <br />
        {isHomePage ? (
          <>
            <span style={{ marginLeft: "1em" }}>├</span>
            {currentPage === "like-usage" ? (
              <span className="nostalgic-nav-active">使い方</span>
            ) : (
              <a href="/like#usage" className="nostalgic-old-link" onClick={() => onClose?.()}>使い方</a>
            )}
            <br />
            <span style={{ marginLeft: "1em" }}>├</span>
            {currentPage === "like-features" ? (
              <span className="nostalgic-nav-active">機能一覧</span>
            ) : (
              <a href="/like#features" className="nostalgic-old-link" onClick={() => onClose?.()}>機能一覧</a>
            )}
            <br />
            <span style={{ marginLeft: "1em" }}>└</span>
            {currentPage === "like-api" ? (
              <span className="nostalgic-nav-active">API仕様</span>
            ) : (
              <a href="/like#api" className="nostalgic-old-link" onClick={() => onClose?.()}>API仕様</a>
            )}
            <br />
          </>
        ) : currentService === 'like' && (
          <>
            <span style={{ marginLeft: "1em" }}>├</span>
            {currentPage === "main" ? (
              <span className="nostalgic-nav-active">トップ</span>
            ) : (
              <a href="/like" className="nostalgic-old-link" onClick={() => onClose?.()}>トップ</a>
            )}
            <br />
            <span style={{ marginLeft: "1em" }}>├</span>
            {currentPage === "usage" ? (
              <span className="nostalgic-nav-active">使い方</span>
            ) : (
              <a href="/like#usage" className="nostalgic-old-link" onClick={() => onClose?.()}>使い方</a>
            )}
            <br />
            <span style={{ marginLeft: "1em" }}>├</span>
            {currentPage === "features" ? (
              <span className="nostalgic-nav-active">機能一覧</span>
            ) : (
              <a href="/like#features" className="nostalgic-old-link" onClick={() => onClose?.()}>機能一覧</a>
            )}
            <br />
            <span style={{ marginLeft: "1em" }}>└</span>
            {currentPage === "api" ? (
              <span className="nostalgic-nav-active">API仕様</span>
            ) : (
              <a href="/like#api" className="nostalgic-old-link" onClick={() => onClose?.()}>API仕様</a>
            )}
            <br />
          </>
        )}
        <span>●</span>
        <a href="/ranking" className={currentService === 'ranking' ? "nostalgic-old-link-visited" : "nostalgic-old-link"} onClick={() => onClose?.()}>
          Nostalgic Ranking
        </a>
        <br />
        {isHomePage ? (
          <>
            <span style={{ marginLeft: "1em" }}>├</span>
            {currentPage === "ranking-usage" ? (
              <span className="nostalgic-nav-active">使い方</span>
            ) : (
              <a href="/ranking#usage" className="nostalgic-old-link" onClick={() => onClose?.()}>使い方</a>
            )}
            <br />
            <span style={{ marginLeft: "1em" }}>├</span>
            {currentPage === "ranking-features" ? (
              <span className="nostalgic-nav-active">機能一覧</span>
            ) : (
              <a href="/ranking#features" className="nostalgic-old-link" onClick={() => onClose?.()}>機能一覧</a>
            )}
            <br />
            <span style={{ marginLeft: "1em" }}>└</span>
            {currentPage === "ranking-api" ? (
              <span className="nostalgic-nav-active">API仕様</span>
            ) : (
              <a href="/ranking#api" className="nostalgic-old-link" onClick={() => onClose?.()}>API仕様</a>
            )}
            <br />
          </>
        ) : currentService === 'ranking' && (
          <>
            <span style={{ marginLeft: "1em" }}>├</span>
            {currentPage === "main" ? (
              <span className="nostalgic-nav-active">トップ</span>
            ) : (
              <a href="/ranking" className="nostalgic-old-link" onClick={() => onClose?.()}>トップ</a>
            )}
            <br />
            <span style={{ marginLeft: "1em" }}>├</span>
            {currentPage === "usage" ? (
              <span className="nostalgic-nav-active">使い方</span>
            ) : (
              <a href="/ranking#usage" className="nostalgic-old-link" onClick={() => onClose?.()}>使い方</a>
            )}
            <br />
            <span style={{ marginLeft: "1em" }}>├</span>
            {currentPage === "features" ? (
              <span className="nostalgic-nav-active">機能一覧</span>
            ) : (
              <a href="/ranking#features" className="nostalgic-old-link" onClick={() => onClose?.()}>機能一覧</a>
            )}
            <br />
            <span style={{ marginLeft: "1em" }}>└</span>
            {currentPage === "api" ? (
              <span className="nostalgic-nav-active">API仕様</span>
            ) : (
              <a href="/ranking#api" className="nostalgic-old-link" onClick={() => onClose?.()}>API仕様</a>
            )}
            <br />
          </>
        )}
        <span>●</span>
        <a href="/bbs" className={currentService === 'bbs' ? "nostalgic-old-link-visited" : "nostalgic-old-link"} onClick={() => onClose?.()}>
          Nostalgic BBS
        </a>
        <br />
        {isHomePage ? (
          <>
            <span style={{ marginLeft: "1em" }}>├</span>
            {currentPage === "bbs-usage" ? (
              <span className="nostalgic-nav-active">使い方</span>
            ) : (
              <a href="/bbs#usage" className="nostalgic-old-link" onClick={() => onClose?.()}>使い方</a>
            )}
            <br />
            <span style={{ marginLeft: "1em" }}>├</span>
            {currentPage === "bbs-features" ? (
              <span className="nostalgic-nav-active">機能一覧</span>
            ) : (
              <a href="/bbs#features" className="nostalgic-old-link" onClick={() => onClose?.()}>機能一覧</a>
            )}
            <br />
            <span style={{ marginLeft: "1em" }}>└</span>
            {currentPage === "bbs-api" ? (
              <span className="nostalgic-nav-active">API仕様</span>
            ) : (
              <a href="/bbs#api" className="nostalgic-old-link" onClick={() => onClose?.()}>API仕様</a>
            )}
            <br />
          </>
        ) : currentService === 'bbs' && (
          <>
            <span style={{ marginLeft: "1em" }}>├</span>
            {currentPage === "main" ? (
              <span className="nostalgic-nav-active">トップ</span>
            ) : (
              <a href="/bbs" className="nostalgic-old-link" onClick={() => onClose?.()}>トップ</a>
            )}
            <br />
            <span style={{ marginLeft: "1em" }}>├</span>
            {currentPage === "usage" ? (
              <span className="nostalgic-nav-active">使い方</span>
            ) : (
              <a href="/bbs#usage" className="nostalgic-old-link" onClick={() => onClose?.()}>使い方</a>
            )}
            <br />
            <span style={{ marginLeft: "1em" }}>├</span>
            {currentPage === "features" ? (
              <span className="nostalgic-nav-active">機能一覧</span>
            ) : (
              <a href="/bbs#features" className="nostalgic-old-link" onClick={() => onClose?.()}>機能一覧</a>
            )}
            <br />
            <span style={{ marginLeft: "1em" }}>└</span>
            {currentPage === "api" ? (
              <span className="nostalgic-nav-active">API仕様</span>
            ) : (
              <a href="/bbs#api" className="nostalgic-old-link" onClick={() => onClose?.()}>API仕様</a>
            )}
            <br />
          </>
        )}
        {isHomePage && currentPage === "about" ? (
          <>
            <span className="nostalgic-blink">●</span>
            <span className="nostalgic-nav-active">このサイトについて</span>
          </>
        ) : (
          <>
            <span>●</span>
            {isHomePage ? (
              <a
                href="#"
                className={visitedPages.has("about") ? "nostalgic-old-link-visited" : "nostalgic-old-link"}
                onClick={(e) => {
                  e.preventDefault();
                  handlePageClick("about");
                }}
              >
                このサイトについて
              </a>
            ) : (
              <a href="/about" className="nostalgic-old-link" onClick={() => onClose?.()}>
                このサイトについて
              </a>
            )}
          </>
        )}
      </p>
      <hr />
      <p>
        <b>◆リンク集◆</b>
      </p>
      <p>
        <span>●</span>
        <a
          href="https://mixi.social/@kako_jun"
          className="nostalgic-old-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          mixi2
        </a>
        <br />
        <span>●</span>
        <a
          href="https://github.com/kako-jun/nostalgic-counter"
          className="nostalgic-old-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        <br />
        <span>●</span>
        <a href="https://llll-ll.com/" className="nostalgic-old-link" target="_blank" rel="noopener noreferrer">
          llll-ll.com
        </a>
        <br />
        <span style={{ marginLeft: "1em" }}>(作者のサイト)</span>
        <br />
        <span>●</span>
        <a href="https://x.com/kako_jun_42" className="nostalgic-old-link" target="_blank" rel="noopener noreferrer">
          Twitter
        </a>
        <br />
        <span>●</span>
        <a
          href="https://www.instagram.com/kako_jun_42"
          className="nostalgic-old-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Instagram
        </a>
        <br />
        <span>●</span>
        <a href="https://zenn.dev/kako_jun" className="nostalgic-old-link" target="_blank" rel="noopener noreferrer">
          Zenn
        </a>
        <br />
        <span>●</span>
        <a href="https://note.com/kako_jun" className="nostalgic-old-link" target="_blank" rel="noopener noreferrer">
          note
        </a>
      </p>
      <p style={{ fontSize: "14px", color: "#ff0000" }}>
        <b>相互リンク募集中です！</b>
      </p>
      <div style={{ marginTop: "10px" }}>
        <img src="/nostalgic-banner.webp" alt="Nostalgic" style={{ display: "block" }} />
      </div>
      <hr />
      <div className="nostalgic-update-box">
        <p style={{ margin: "5px 0", textAlign: "center" }}>
          <b style={{ color: "#008000" }}>◆更新履歴◆</b>
        </p>
        <p style={{ margin: "5px 0" }}>
          <span style={{ color: "red" }}>NEW!</span>
          <br />
          ・2025/08/07
          <br />
          サービス開始！
          <br />
          （のび太の誕生日）
        </p>
        <p style={{ margin: "5px 0" }}>
          ・2025/06/10
          <br />
          アイデアが浮かぶ
        </p>
      </div>
      <p style={{ textAlign: "center", fontSize: "14px" }}>
        Netscape Navigator 4.2<span style={{ textDecoration: "line-through" }}>対応</span>
      </p>
    </div>
  );
}