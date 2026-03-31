import { t } from '../i18n/translations'
import PageLayout from '../components/PageLayout'

export default function HowToUse({ lang, visitorCount }) {
  const faq = t('faq', lang) || []

  return (
    <PageLayout lang={lang} visitorCount={visitorCount}>
      <article>
        <h1 className="text-3xl font-bold text-gray-800 mb-8">{t('howToUseTitle', lang)}</h1>

        <section className="mb-12">
          <div className="space-y-6">
            {[
              { title: t('step1Title', lang), content: t('step1Content', lang), icon: '1', color: 'blue' },
              { title: t('step2Title', lang), content: t('step2Content', lang), icon: '2', color: 'green' },
              { title: t('step3Title', lang), content: t('step3Content', lang), icon: '3', color: 'purple' },
            ].map((step) => (
              <div key={step.icon} className="bg-white rounded-xl p-6 shadow-sm border border-blue-50 flex gap-4">
                <div className={`w-10 h-10 rounded-full bg-${step.color}-100 text-${step.color}-600 flex items-center justify-center font-bold text-lg shrink-0`}>
                  {step.icon}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800 mb-2">{step.title}</h2>
                  <p className="text-gray-600 leading-relaxed">{step.content}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('faqTitle', lang)}</h2>
          <div className="space-y-4">
            {Array.isArray(faq) && faq.map((item, i) => (
              <details key={i} className="bg-white rounded-xl shadow-sm border border-blue-50 group">
                <summary className="p-4 cursor-pointer font-semibold text-gray-700 hover:text-blue-600 transition-colors list-none flex items-center justify-between">
                  <span>{item.q}</span>
                  <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-4 pb-4 text-gray-600 leading-relaxed border-t border-blue-50 pt-3">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>
      </article>
    </PageLayout>
  )
}
