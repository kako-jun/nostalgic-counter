import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nostalgic - 懐かしいWebツール集',
  description: '昔懐かしいWebツール（カウンター・いいね・ランキング・BBS）を最新技術で復活。完全無料で利用でき、レトロな見た目を忠実に再現。',
  keywords: [
    'nostalgic',
    'アクセスカウンター',
    'いいねボタン',
    'ランキング',
    'BBS',
    '掲示板',
    '無料',
    'Web Components',
    'レトロ',
    '90年代',
    'ホームページ',
    'SVG',
    '埋め込み',
  ],
  authors: [{ name: 'kako-jun' }],
  creator: 'kako-jun',
  publisher: 'kako-jun',
  metadataBase: new URL('https://nostalgic.llll-ll.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Nostalgic - 懐かしいWebツール集',
    description: '昔懐かしいWebツール（カウンター・いいね・ランキング・BBS）を最新技術で復活。完全無料で利用できます。',
    type: 'website',
    locale: 'ja_JP',
    siteName: 'Nostalgic',
    url: 'https://nostalgic.llll-ll.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nostalgic - 懐かしいWebツール集',
    description: '昔懐かしいWebツール（カウンター・いいね・ランキング・BBS）を最新技術で復活。完全無料で利用できます。',
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