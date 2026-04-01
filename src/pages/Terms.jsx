import { t } from '../i18n/translations'
import PageLayout from '../components/PageLayout'

const content = {
  en: {
    lastUpdated: 'Last Updated: March 31, 2025',
    sections: [
      {
        title: '1. Acceptance of Terms',
        body: 'By accessing or using MedVoice Collector ("the Service"), operated by SPINAI, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service. The Service is available at medvoice-collector.vercel.app.',
      },
      {
        title: '2. Description of Service',
        body: 'MedVoice Collector is a free, browser-based web application that provides AI-powered real-time speech recognition and medical terminology conversion for healthcare professionals. The Service converts doctor-patient conversation transcripts into standardized medical terms using artificial intelligence.\n\nThe Service operates entirely within your web browser. No patient data, audio recordings, or personal medical information is stored on our servers.',
      },
      {
        title: '3. User Responsibilities',
        body: `By using the Service, you agree to:
- Provide your own API keys (Anthropic Claude, OpenAI) as required for functionality
- Use the Service in compliance with all applicable laws, regulations, and institutional policies
- Verify and review all AI-generated medical terminology before using it in clinical documentation
- Not rely solely on the Service for medical decision-making or diagnosis
- Ensure compliance with your institution's policies regarding the use of AI tools during patient encounters
- Not attempt to reverse-engineer, decompile, or disrupt the Service`,
      },
      {
        title: '4. Medical Disclaimer',
        body: `IMPORTANT: MedVoice Collector is a productivity tool designed to assist with clinical documentation. It is NOT a medical device and should NOT be used as a substitute for professional medical judgment.

- AI-generated medical term conversions may contain errors or inaccuracies
- All converted terms must be reviewed and verified by a qualified healthcare professional before use
- The Service does not provide medical advice, diagnosis, or treatment recommendations
- SPINAI assumes no liability for clinical decisions made based on the Service's output`,
      },
      {
        title: '5. API Keys and Third-Party Services',
        body: 'The Service requires users to provide their own API keys for Anthropic Claude and/or OpenAI Whisper. You are solely responsible for:\n- The security of your API keys\n- Any costs incurred from API usage with your keys\n- Compliance with the terms of service of Anthropic and OpenAI\n\nSPINAI does not store, transmit, or have access to your API keys. They are stored exclusively in your browser\'s localStorage.',
      },
      {
        title: '6. Intellectual Property',
        body: 'MedVoice Collector, including its design, code, and branding, is the intellectual property of SPINAI. You are granted a limited, non-exclusive, non-transferable license to use the Service for its intended purpose.\n\nAll patient data and exported documents you create using the Service belong to you. SPINAI claims no ownership over your data.',
      },
      {
        title: '7. Limitation of Liability',
        body: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, SPINAI AND ITS DEVELOPERS SHALL NOT BE LIABLE FOR:
- Any indirect, incidental, special, consequential, or punitive damages
- Loss of data, revenue, or profits
- Errors or inaccuracies in AI-generated medical terminology
- Service interruptions, downtime, or technical failures
- Any damages arising from the use or inability to use the Service

THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.`,
      },
      {
        title: '8. Acceptable Use Policy',
        body: 'You agree NOT to:\n- Use the Service for any unlawful purpose\n- Attempt to gain unauthorized access to the Service or its infrastructure\n- Transmit malicious code, viruses, or harmful content through the Service\n- Use the Service to process data in violation of patient privacy regulations (HIPAA, GDPR, etc.)\n- Resell, redistribute, or commercially exploit the Service without written permission\n- Use automated bots or scripts to access the Service',
      },
      {
        title: '9. Service Availability',
        body: 'The Service is provided on a best-effort basis. SPINAI does not guarantee uninterrupted or error-free operation. We reserve the right to modify, suspend, or discontinue the Service at any time without prior notice.\n\nAs the Service is currently in its MVP (Minimum Viable Product) phase, features may change significantly between updates.',
      },
      {
        title: '10. Changes to Terms',
        body: 'SPINAI reserves the right to update these Terms at any time. Changes will be effective immediately upon posting. The "Last Updated" date at the top of this page indicates the most recent revision. Continued use of the Service after changes constitutes acceptance of the updated Terms.',
      },
      {
        title: '11. Governing Law',
        body: 'These Terms shall be governed by and construed in accordance with applicable laws. Any disputes arising from these Terms or the use of the Service shall be resolved through good-faith negotiation before pursuing legal remedies.',
      },
      {
        title: '12. Contact',
        body: 'For questions about these Terms of Service, please contact:\n- Email: taeshinkim11@gmail.com\n- Organization: SPINAI (spinaiceo@gmail.com)',
      },
    ],
  },
  ko: {
    lastUpdated: '최종 수정일: 2025년 3월 31일',
    sections: [
      {
        title: '1. 약관 동의',
        body: 'SPINAI에서 운영하는 MedVoice Collector("서비스")에 접근하거나 사용함으로써 본 이용약관("약관")에 동의하는 것으로 간주됩니다. 본 약관에 동의하지 않는 경우 서비스를 사용하지 마십시오.',
      },
      {
        title: '2. 서비스 설명',
        body: 'MedVoice Collector는 의료 전문가를 위한 무료 브라우저 기반 웹 애플리케이션으로, AI 기반 실시간 음성 인식 및 의학 용어 변환 기능을 제공합니다. 서비스는 전적으로 웹 브라우저 내에서 작동하며, 환자 데이터, 음성 녹음 또는 개인 의료 정보는 당사 서버에 저장되지 않습니다.',
      },
      {
        title: '3. 사용자 책임',
        body: '서비스를 사용함으로써 다음에 동의합니다:\n- 기능에 필요한 자체 API 키(Anthropic Claude, OpenAI)를 제공할 것\n- 모든 관련 법률, 규정 및 기관 정책을 준수하여 서비스를 사용할 것\n- AI가 생성한 의학 용어를 임상 문서에 사용하기 전에 반드시 검토할 것\n- 의료 의사결정이나 진단에 서비스에만 의존하지 않을 것\n- 서비스를 역분석, 디컴파일하거나 방해하지 않을 것',
      },
      {
        title: '4. 의료 면책조항',
        body: '중요: MedVoice Collector는 임상 문서 작성을 지원하기 위한 생산성 도구입니다. 의료 기기가 아니며 전문적인 의학적 판단을 대체하는 용도로 사용해서는 안 됩니다.\n\n- AI가 생성한 의학 용어 변환에는 오류가 포함될 수 있습니다\n- 모든 변환된 용어는 자격을 갖춘 의료 전문가가 사용 전 검토해야 합니다\n- 서비스는 의학적 조언, 진단 또는 치료 권고를 제공하지 않습니다\n- SPINAI는 서비스 출력에 기반한 임상 결정에 대해 책임을 지지 않습니다',
      },
      {
        title: '5. API 키 및 제3자 서비스',
        body: '사용자는 API 키의 보안, API 사용으로 인한 비용, Anthropic 및 OpenAI의 이용약관 준수에 대해 전적으로 책임집니다. SPINAI는 API 키를 저장, 전송하거나 접근하지 않습니다.',
      },
      {
        title: '6. 지적 재산권',
        body: 'MedVoice Collector의 디자인, 코드 및 브랜딩은 SPINAI의 지적 재산입니다. 서비스를 사용하여 생성한 모든 환자 데이터와 내보낸 문서는 사용자의 소유입니다.',
      },
      {
        title: '7. 책임 제한',
        body: '법이 허용하는 최대 범위 내에서 SPINAI는 간접적, 부수적, 특별, 결과적 또는 징벌적 손해에 대해 책임을 지지 않습니다. 서비스는 어떠한 종류의 보증 없이 "있는 그대로" 제공됩니다.',
      },
      {
        title: '8. 허용되는 사용',
        body: '서비스를 불법적인 목적으로 사용하거나, 무단 접근을 시도하거나, 악성 코드를 전송하거나, 환자 프라이버시 규정을 위반하여 데이터를 처리하거나, 서면 허가 없이 서비스를 재판매하는 것은 금지됩니다.',
      },
      {
        title: '9. 서비스 가용성',
        body: '서비스는 최선의 노력으로 제공됩니다. SPINAI는 서비스의 중단 없는 운영을 보장하지 않습니다. 현재 MVP 단계로, 업데이트 간에 기능이 크게 변경될 수 있습니다.',
      },
      {
        title: '10. 약관 변경',
        body: 'SPINAI는 언제든지 본 약관을 업데이트할 권리를 보유합니다. 변경 후 계속 사용하면 업데이트된 약관에 동의하는 것으로 간주됩니다.',
      },
      {
        title: '11. 문의',
        body: '문의사항: taeshinkim11@gmail.com\n조직: SPINAI (spinaiceo@gmail.com)',
      },
    ],
  },
}

export default function Terms({ lang, visitorCount }) {
  const c = content[lang] || content.en

  return (
    <PageLayout lang={lang} visitorCount={visitorCount}>
      <article>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('termsTitle', lang)}</h1>
        <p className="text-sm text-gray-400 mb-8">{c.lastUpdated}</p>
        <div className="space-y-8">
          {c.sections.map((section, i) => (
            <section key={i} className="bg-white rounded-xl p-6 shadow-sm border border-blue-50">
              <h2 className="text-xl font-bold text-gray-800 mb-3">{section.title}</h2>
              <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                {section.body.split('\n').map((line, j) => {
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
