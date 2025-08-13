import Link from 'next/link'

interface LayoutProps {
  children: React.ReactNode
  title: string
  description: string
}

export default function Layout({ children, title, description }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-2xl font-bold text-gray-800 hover:text-blue-600">
                Nostalgic
              </Link>
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
            
            <nav className="hidden md:flex space-x-6">
              <Link href="/counter" className="text-gray-600 hover:text-blue-600 transition-colors">
                Counter
              </Link>
              <Link href="/like" className="text-gray-600 hover:text-pink-600 transition-colors">
                Like
              </Link>
              <Link href="/ranking" className="text-gray-600 hover:text-yellow-600 transition-colors">
                Ranking
              </Link>
              <Link href="/bbs" className="text-gray-600 hover:text-green-600 transition-colors">
                BBS
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="py-6">
        {children}
      </main>
      
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">Nostalgic - 懐かしいWebツール集</p>
            <p className="text-sm">
              <Link href="https://github.com/kako-jun/nostalgic" className="text-blue-600 hover:underline">
                GitHub
              </Link>
              {' | '}
              <Link href="/" className="text-blue-600 hover:underline">
                Home
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}