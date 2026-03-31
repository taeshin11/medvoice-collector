export async function convertToMedicalTerms(transcript, apiKey) {
  if (!transcript.trim() || !apiKey) return null

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `당신은 한국 병원의 외과/내과 전문의 수준의 의학 용어 전문가입니다.
아래 의사-환자 대화 텍스트를 분석하여, 각 정보를 의학 용어(영문 약어 포함)로 변환하고 적절한 의무기록 필드에 매핑해주세요.

변환 규칙:
- 환자의 구어체 표현을 표준 의학 용어/약어로 변환 (예: "오른쪽 윗배" → "RUQ", "명치" → "Epigastric area")
- 증상은 영문 의학 약어 우선 사용
- 시간 표현은 "Onset: X days ago" 형태로
- 진단명은 영문 의학 용어로

반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "cc": "Chief Complaint - 주소",
  "presentIllness": "Present Illness - 현병력",
  "associatedSx": "Associated Symptoms - 동반증상",
  "pastHx": "Past History - 과거력",
  "diagnosis": "Diagnosis - 진단",
  "plan": "Plan - 치료계획",
  "notes": "기타 메모"
}

해당 필드에 정보가 없으면 빈 문자열("")로 두세요.

대화 텍스트:
${transcript}`
      }],
    }),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  const result = await response.json()
  if (!result.content || !result.content[0] || !result.content[0].text) {
    throw new Error('Invalid API response')
  }
  const text = result.content[0].text

  const jsonMatch = text.match(/\{[\s\S]*?\}/)
  if (!jsonMatch) throw new Error('No JSON in response')

  return JSON.parse(jsonMatch[0])
}
