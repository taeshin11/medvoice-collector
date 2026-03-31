import { Link } from 'react-router-dom'
import { t } from '../i18n/translations'

export default function Footer({ lang, visitorCount }) {
  return (
    <footer className="bg-white/60 border-t border-blue-100 px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div className="text-sm text-gray-500">
            {t('builtBy', lang)} <span className="font-semibold text-blue-600">SPINAI</span> · spinaiceo@gmail.com
          </div>
          <nav className="flex flex-wrap items-center gap-4 text-xs text-gray-400" aria-label="Footer navigation">
            <Link to="/" className="hover:text-blue-600 transition-colors">{t('home', lang)}</Link>
            <Link to="/about" className="hover:text-blue-600 transition-colors">{t('about', lang)}</Link>
            <Link to="/how-to-use" className="hover:text-blue-600 transition-colors">{t('howToUse', lang)}</Link>
            <Link to="/privacy" className="hover:text-blue-600 transition-colors">{t('privacy', lang)}</Link>
            <Link to="/terms" className="hover:text-blue-600 transition-colors">{t('terms', lang)}</Link>
          </nav>
        </div>
        <div className="text-center text-xs text-gray-400">
          <span>&#128065;</span> {visitorCount} {t('visitors', lang)} · &copy; {new Date().getFullYear()} MedVoice Collector by SPINAI. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
