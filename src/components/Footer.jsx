import { Link } from 'react-router-dom'
import { t } from '../i18n/translations'

const SITE_URL = 'https://medvoice-collector.vercel.app'
const SHARE_TEXT = 'MedVoice Collector - AI-powered medical voice data collector that converts doctor-patient conversations into medical terminology in real-time.'

function handleShare() {
  if (navigator.share) {
    navigator.share({ title: 'MedVoice Collector | SPINAI', text: SHARE_TEXT, url: SITE_URL }).catch(() => {})
  } else {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(SITE_URL)}`, '_blank', 'noopener')
  }
}

export default function Footer({ lang, visitorCount }) {
  return (
    <footer className="bg-white/60 border-t border-blue-100 px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div className="text-sm text-gray-500">
            {t('builtBy', lang)} <span className="font-semibold text-blue-600">SPINAI</span> · <a href="mailto:spinaiceo@gmail.com" className="hover:text-blue-600 transition-colors">spinaiceo@gmail.com</a>
          </div>
          <div className="flex items-center gap-3">
            <nav className="flex flex-wrap items-center gap-4 text-xs text-gray-400" aria-label="Footer navigation">
              <Link to="/" className="hover:text-blue-600 transition-colors">{t('home', lang)}</Link>
              <Link to="/about" className="hover:text-blue-600 transition-colors">{t('about', lang)}</Link>
              <Link to="/how-to-use" className="hover:text-blue-600 transition-colors">{t('howToUse', lang)}</Link>
              <Link to="/privacy" className="hover:text-blue-600 transition-colors">{t('privacy', lang)}</Link>
              <Link to="/terms" className="hover:text-blue-600 transition-colors">{t('terms', lang)}</Link>
            </nav>
            <button
              onClick={handleShare}
              className="text-gray-400 hover:text-blue-600 transition-colors p-1"
              aria-label="Share"
              title="Share"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="text-center text-xs text-gray-400">
          <span>&#128065;</span> {visitorCount} {t('visitors', lang)} · &copy; 2025 SPINAI. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
