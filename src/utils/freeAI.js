import { convertLocal } from './localMedicalDict'

const POLLINATIONS_URL = 'https://text.pollinations.ai/openai'

const SYSTEM_PROMPT = `You are a Korean hospital medical record assistant. Convert Korean doctor-patient conversation into structured medical records.

FIELD DEFINITIONS:
- cc: Chief Complaint (main symptoms like pain, fever, cough - convert to English medical terms)
- presentIllness: History of Present Illness (when it started, how it progressed)
- associatedSx: Associated Symptoms (other symptoms besides the main complaint)
- pastHx: Past History (previous diseases, surgeries, medications)
- diagnosis: Diagnosis (disease names in English medical terms)
- plan: Plan (treatment plans, tests ordered, surgery scheduled)
- notes: Everything else (greetings, non-medical conversation, general remarks)

EXAMPLES:
Input: "안녕하세요 배가 아파요"
Output: {"cc":"Abdominal pain","presentIllness":"","associatedSx":"","pastHx":"","diagnosis":"","plan":"","notes":"인사: 안녕하세요"}

Input: "오른쪽 윗배가 3일 전부터 아프고 열이 나요 담석이래요"
Output: {"cc":"RUQ pain, Fever","presentIllness":"Onset: 3 days ago","associatedSx":"","pastHx":"","diagnosis":"Cholelithiasis","plan":"","notes":""}

Input: "배가 아파요 예전에 아미 걸려 가지고 치료 받은 적"
Output: {"cc":"Abdominal pain","presentIllness":"","associatedSx":"","pastHx":"History of previous illness/treatment","diagnosis":"","plan":"","notes":""}

IMPORTANT: Pain complaints (아파요, 아프다, 통증) MUST go in cc field. NEVER put symptoms in notes.
Respond ONLY with JSON, no other text:
{"cc":"","presentIllness":"","associatedSx":"","pastHx":"","diagnosis":"","plan":"","notes":""}`

export async function convertWithFreeAI(transcript) {
  if (!transcript || !transcript.trim()) return null

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const response = await fetch(POLLINATIONS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'openai',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: transcript },
        ],
        temperature: 0.3,
      }),
    })

    clearTimeout(timeout)

    if (!response.ok) throw new Error('API error')

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content
    if (!text) throw new Error('Empty response')

    const jsonMatch = text.match(/\{[\s\S]*?\}/)
    if (!jsonMatch) throw new Error('No JSON')

    const result = JSON.parse(jsonMatch[0])

    // Ensure notes has the full transcript if nothing else was captured
    const hasFields = [result.cc, result.presentIllness, result.associatedSx, result.pastHx, result.diagnosis, result.plan].some(v => v)
    if (!hasFields && !result.notes) {
      result.notes = transcript.trim()
    }

    return result
  } catch {
    // Fallback to local dictionary if API fails
    return convertLocal(transcript)
  }
}
