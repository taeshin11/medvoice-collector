import { Link } from 'react-router-dom'
import Footer from './Footer'

export default function PageLayout({ children, lang, visitorCount }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="text-lg font-bold text-blue-600 flex items-center gap-1 no-underline">
          <span className="text-xl">&#9670;</span>
          <span>SPINAI</span>
          <span className="text-gray-400 font-normal mx-1">·</span>
          <span className="text-gray-700 font-semibold text-sm sm:text-base">MedVoice Collector</span>
        </Link>
        <Link to="/" className="text-sm text-blue-600 hover:text-blue-800 no-underline font-medium">
          &larr; App
        </Link>
      </header>
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {children}
      </main>
      <Footer lang={lang} visitorCount={visitorCount} />
    </div>
  )
}
