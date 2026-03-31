import { convertLocal } from './localMedicalDict'

const POLLINATIONS_URL = 'https://text.pollinations.ai/openai'

const SYSTEM_PROMPT = `You are a Korean medical terminology expert at the level of a surgical/internal medicine specialist.
Analyze the doctor-patient conversation below and:
1. Convert colloquial Korean expressions into standard medical terms (English abbreviations preferred)
2. Map each piece of information to the appropriate medical record field
3. ANY content that doesn't fit specific medical fields goes into "notes" - never discard anything

Rules:
- Symptoms: use English medical abbreviations (e.g., "오른쪽 윗배" → "RUQ pain")
- Time expressions: "Onset: X days ago" format
- Diagnoses: English medical terms
- If the conversation contains non-medical content, put it in notes verbatim
- ALL spoken content must appear somewhere - nothing should be lost

Respond ONLY with this JSON (no other text):
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
