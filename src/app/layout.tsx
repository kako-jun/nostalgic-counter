import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nostalgic Counter',
  description: 'A nostalgic website counter service with modern technology',
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