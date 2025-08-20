"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { usePathname } from 'next/navigation';
import NostalgicSidebar from "./NostalgicSidebar";
import "../app/nostalgic.css";

interface NostalgicLayoutProps {
  children: React.ReactNode;
  serviceName: string;
  serviceIcon: string;
}

export default function NostalgicLayout({ children, serviceName, serviceIcon }: NostalgicLayoutProps) {
  const pathname = usePathname();
  const [currentPage, setCurrentPage] = useState("main");
  const [visitedPages, setVisitedPages] = useState<Set<string>>(new Set(["main"]));
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      setCurrentPage(hash);
      setVisitedPages(prev => new Set([...prev, hash]));
    } else {
      setCurrentPage("main");
    }
    
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        setCurrentPage(hash);
        setVisitedPages(prev => new Set([...prev, hash]));
      } else {
        setCurrentPage("main");
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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

  const getServicePath = () => {
    return pathname.split('/')[1] || '';
  };

  const currentService = getServicePath();

  return (
    <>
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

        <div className="nostalgic-content-area">
          {children}
        </div>

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