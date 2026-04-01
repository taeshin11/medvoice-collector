import { t } from '../i18n/translations'
import PageLayout from '../components/PageLayout'

const content = {
  en: {
    lastUpdated: 'Last Updated: March 31, 2025',
    sections: [
      {
        title: '1. Introduction',
        body: `Welcome to MedVoice Collector ("we," "our," or "us"), operated by SPINAI. This Privacy Policy explains how we collect, use, and protect information when you use our web application at medvoice-collector.vercel.app (the "Service").

We are deeply committed to protecting user privacy, especially given the sensitive nature of medical data. Our Service is designed with a privacy-first architecture where no patient data ever leaves your browser.`,
      },
      {
        title: '2. Information We Collect',
        body: `**Information You Provide:**
- API keys (Claude API, OpenAI API) — stored exclusively in your browser's localStorage
- Patient data entered into the application — stored exclusively in your browser's localStorage
- Feedback messages — sent directly to our email via your email client

**Information Collected Automatically:**
- Anonymous usage analytics: session ID (random UUID, not linked to any person), number of patients per session, session duration, number of terms converted, device type, and browser type
- These analytics contain NO personal information, NO patient data, and NO medical records

**Information We Do NOT Collect:**
- Audio recordings or voice data (processed entirely within your browser)
- Patient names, medical records, or any Protected Health Information (PHI)
- Your API keys (never transmitted to our servers)
- IP addresses or precise geolocation`,
      },
      {
        title: '3. How We Use Information',
        body: `We use the anonymous analytics data solely to:
- Understand general usage patterns to improve the Service
- Monitor service reliability and performance
- Plan future feature development

We do NOT use any collected data for advertising, marketing, or sale to third parties.`,
      },
      {
        title: '4. Data Storage and Security',
        body: `All patient data and API keys are stored exclusively in your browser's localStorage. This means:
- Data never leaves your device unless you explicitly export it
- Clearing your browser data will permanently delete all stored information
- No data is stored on our servers
- No data is transmitted to any third party (except when you use the Claude or Whisper APIs with your own API keys)

Analytics data is stored in a private Google Sheets document accessible only to SPINAI administrators.`,
      },
      {
        title: '5. Cookies and Tracking Technologies',
        body: `MedVoice Collector uses:
- **localStorage**: To save your preferences, API keys, and patient data locally in your browser
- **Google AdSense**: May use cookies to serve relevant advertisements. These cookies are managed by Google and are subject to Google's Privacy Policy
- **Google Analytics**: May be used to collect anonymous website traffic data

You can control cookie settings through your browser preferences. Disabling cookies may affect some functionality of the Service.`,
      },
      {
        title: '6. Third-Party Services',
        body: `The Service integrates with the following third-party services when you provide your own API keys:
- **Anthropic Claude API**: For medical term conversion. Subject to Anthropic's Privacy Policy
- **OpenAI Whisper API**: For iOS speech recognition fallback. Subject to OpenAI's Privacy Policy
- **Google AdSense**: For displaying advertisements. Subject to Google's Privacy Policy
- **Vercel**: For hosting the Service. Subject to Vercel's Privacy Policy

We recommend reviewing the privacy policies of these third-party services.`,
      },
      {
        title: '7. Children\'s Privacy',
        body: 'The Service is designed for medical professionals and is not intended for use by individuals under the age of 18. We do not knowingly collect information from children.',
      },
      {
        title: '8. Your Rights',
        body: `You have the right to:
- Access all your data (stored in your browser's localStorage)
- Delete all your data at any time by clearing browser storage or using browser developer tools
- Export your data before deletion using the built-in export features
- Opt out of analytics by using a browser extension that blocks network requests

Since all personal data is stored locally on your device, you have complete control over it at all times.`,
      },
      {
        title: '9. Changes to This Policy',
        body: 'We may update this Privacy Policy from time to time. We will notify users of significant changes by updating the "Last Updated" date. Continued use of the Service after changes constitutes acceptance of the updated policy.',
      },
      {
        title: '10. Contact Us',
        body: `If you have any questions about this Privacy Policy, please contact us:
- Email: taeshinkim11@gmail.com
- Organization: SPINAI (spinaiceo@gmail.com)`,
      },
    ],
  },
  ko: {
    lastUpdated: '최종 수정일: 2025년 3월 31일',
    sections: [
      {
        title: '1. 소개',
        body: 'MedVoice Collector("당사")는 SPINAI에서 운영하는 서비스입니다. 본 개인정보처리방침은 medvoice-collector.vercel.app("서비스")을 이용할 때 정보를 수집, 사용 및 보호하는 방법을 설명합니다.\n\n당사는 의료 데이터의 민감한 특성을 고려하여 사용자 프라이버시 보호에 깊이 전념하고 있습니다. 본 서비스는 환자 데이터가 브라우저를 떠나지 않는 프라이버시 우선 아키텍처로 설계되었습니다.',
      },
      {
        title: '2. 수집하는 정보',
        body: '**사용자가 제공하는 정보:**\n- API 키 (Claude API, OpenAI API) — 브라우저 localStorage에만 저장\n- 애플리케이션에 입력한 환자 데이터 — 브라우저 localStorage에만 저장\n- 피드백 메시지 — 이메일 클라이언트를 통해 직접 전송\n\n**자동으로 수집되는 정보:**\n- 익명 사용 분석: 세션 ID(무작위 UUID), 세션당 환자 수, 세션 길이, 변환된 용어 수, 기기 유형, 브라우저 유형\n- 이 분석 데이터에는 개인정보, 환자 데이터, 의료 기록이 포함되지 않습니다\n\n**수집하지 않는 정보:**\n- 음성 녹음 또는 음성 데이터\n- 환자 이름, 의료 기록 또는 보호 건강 정보(PHI)\n- 사용자의 API 키\n- IP 주소 또는 정확한 위치 정보',
      },
      {
        title: '3. 정보 사용 방법',
        body: '익명 분석 데이터는 서비스 개선, 안정성 모니터링, 향후 기능 개발 계획에만 사용됩니다. 광고, 마케팅 또는 제3자 판매에는 사용하지 않습니다.',
      },
      {
        title: '4. 데이터 저장 및 보안',
        body: '모든 환자 데이터와 API 키는 브라우저의 localStorage에만 저장됩니다. 데이터는 명시적으로 내보내지 않는 한 기기를 떠나지 않으며, 브라우저 데이터를 삭제하면 영구적으로 삭제됩니다. 서버에 데이터가 저장되지 않습니다.',
      },
      {
        title: '5. 쿠키 및 추적 기술',
        body: 'MedVoice Collector는 localStorage를 사용하여 설정, API 키, 환자 데이터를 로컬에 저장합니다. Google AdSense는 관련 광고를 제공하기 위해 쿠키를 사용할 수 있습니다. 브라우저 설정을 통해 쿠키 설정을 제어할 수 있습니다.',
      },
      {
        title: '6. 제3자 서비스',
        body: '본 서비스는 사용자가 제공한 API 키를 통해 Anthropic Claude API, OpenAI Whisper API와 연동됩니다. 또한 Google AdSense(광고), Vercel(호스팅)을 사용합니다.',
      },
      {
        title: '7. 아동 개인정보',
        body: '본 서비스는 의료 전문가를 위해 설계되었으며 18세 미만의 개인은 사용 대상이 아닙니다.',
      },
      {
        title: '8. 사용자 권리',
        body: '모든 개인 데이터는 브라우저에 로컬로 저장되므로 항상 완전한 제어권을 가집니다. 브라우저 저장소를 삭제하여 언제든지 모든 데이터를 삭제할 수 있습니다.',
      },
      {
        title: '9. 정책 변경',
        body: '본 개인정보처리방침은 수시로 업데이트될 수 있습니다. 중요한 변경 사항은 "최종 수정일"을 업데이트하여 알려드립니다.',
      },
      {
        title: '10. 문의',
        body: '문의사항: taeshinkim11@gmail.com\n조직: SPINAI (spinaiceo@gmail.com)',
      },
    ],
  },
}

export default function Privacy({ lang, visitorCount }) {
  const c = content[lang] || content.en

  return (
    <PageLayout lang={lang} visitorCount={visitorCount}>
      <article>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('privacyTitle', lang)}</h1>
        <p className="text-sm text-gray-400 mb-8">{c.lastUpdated}</p>
        <div className="space-y-8">
          {c.sections.map((section, i) => (
            <section key={i} className="bg-white rounded-xl p-6 shadow-sm border border-blue-50">
              <h2 className="text-xl font-bold text-gray-800 mb-3">{section.title}</h2>
              <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                {section.body.split('\n').map((line, j) => {
                  if (line.startsWith('**') && line.includes(':**')) {
                    const clean = line.replace(/\*\*/g, '')
                    return <p key={j} className="font-semibold text-gray-700 mt-3 mb-1">{clean}</p>
                  }
                  if (line.startsWith('- ')) {
                    return <li key={j} className="ml-4 mb-1 list-disc">{line.slice(2)}</li>
                  }
                  if (!line.trim()) return <br key={j} />
                  return <p key={j} className="mb-1">{line}</p>
                })}
              </div>
            </section>
          ))}
        </div>
      </article>
    </PageLayout>
  )
}
