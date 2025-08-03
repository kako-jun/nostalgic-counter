import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nostalgic Counter - 無料アクセスカウンターサービス',
  description: '昔懐かしいWebカウンターを最新技術で復活。完全無料で利用でき、レトロな見た目を忠実に再現。Next.js + Redis で高速・安定動作。',
  keywords: [
    'アクセスカウンター',
    '無料',
    'Webカウンター',
    '訪問者カウンター',
    'nostalgic counter',
    'レトロ',
    '90年代',
    'ホームページ',
    'SVG',
    '埋め込み',
    'Web Components',
  ],
  authors: [{ name: 'kako-jun' }],
  creator: 'kako-jun',
  publisher: 'kako-jun',
  metadataBase: new URL('https://nostalgic-counter.llll-ll.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Nostalgic Counter - 無料アクセスカウンターサービス',
    description: '昔懐かしいWebカウンターを最新技術で復活。完全無料で利用できます。',
    type: 'website',
    locale: 'ja_JP',
    siteName: 'Nostalgic Counter',
    url: 'https://nostalgic-counter.llll-ll.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nostalgic Counter - 無料アクセスカウンターサービス',
    description: '昔懐かしいWebカウンターを最新技術で復活。完全無料で利用できます。',
    creator: '@kako_jun_42',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}