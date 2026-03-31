import { t } from '../i18n/translations'
import PageLayout from '../components/PageLayout'

export default function About({ lang, visitorCount }) {
  return (
    <PageLayout lang={lang} visitorCount={visitorCount}>
      <article className="prose prose-blue max-w-none">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">{t('aboutTitle', lang)}</h1>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-50 whitespace-pre-line text-gray-700 leading-relaxed">
          {t('aboutContent', lang).split('\n').map((line, i) => {
            if (line.startsWith('**') && line.endsWith('**')) {
              return <h2 key={i} className="text-xl font-bold text-blue-700 mt-6 mb-2">{line.replace(/\*\*/g, '')}</h2>
            }
            if (line.startsWith('- ')) {
              return <li key={i} className="ml-4 mb-1">{line.slice(2)}</li>
            }
            if (!line.trim()) return <br key={i} />
            return <p key={i} className="mb-2">{line}</p>
          })}
        </div>

        <section className="mt-12 bg-white rounded-xl p-6 shadow-sm border border-blue-50">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {lang === 'ko' ? '기술 스택' : lang === 'ja' ? '技術スタック' : lang === 'zh' ? '技术栈' : 'Technology Stack'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Frontend', value: 'React 19 + Vite 8 + Tailwind CSS 4' },
              { label: 'STT (Android/PC)', value: 'Web Speech API (Free, Real-time)' },
              { label: 'STT (iOS)', value: 'OpenAI Whisper API (Auto-fallback)' },
              { label: 'AI Conversion', value: 'Anthropic Claude API (Sonnet 4)' },
              { label: 'Storage', value: 'Browser LocalStorage (No server)' },
              { label: 'Export', value: 'SheetJS (xlsx) + FileSaver.js' },
              { label: 'Hosting', value: 'Vercel (Free Tier)' },
              { label: 'PWA', value: 'Service Worker + Manifest' },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-2 p-2 rounded bg-blue-50/50">
                <span className="text-blue-600 font-semibold text-sm min-w-[120px]">{item.label}</span>
                <span className="text-gray-600 text-sm">{item.value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 bg-white rounded-xl p-6 shadow-sm border border-blue-50">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {lang === 'ko' ? '연락처' : lang === 'ja' ? 'お問い合わせ' : lang === 'zh' ? '联系方式' : 'Contact'}
          </h2>
          <p className="text-gray-600">
            {lang === 'ko' ? '개발' : lang === 'ja' ? '開発' : lang === 'zh' ? '开发' : 'Development'}: <strong>SPINAI</strong>
          </p>
          <p className="text-gray-600">
            {lang === 'ko' ? '이메일' : 'Email'}: <a href="mailto:spinaiceo@gmail.com" className="text-blue-600">spinaiceo@gmail.com</a>
          </p>
        </section>
      </article>
    </PageLayout>
  )
}
