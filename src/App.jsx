import { useState, useEffect, useCallback, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useSpeechRecognition } from './hooks/useSpeechRecognition'
import { convertToMedicalTerms } from './utils/medicalTerms'
import { exportXlsx, exportCsv, copyToClipboard, COLUMNS } from './utils/exportData'
import { sendAnalytics } from './utils/analytics'

const DEFAULT_PATIENT = () => ({
  id: uuidv4(),
  patientId: '',
  name: '',
  date: new Date().toISOString().slice(0, 10),
  cc: '',
  presentIllness: '',
  associatedSx: '',
  pastHx: '',
  diagnosis: '',
  plan: '',
  notes: '',
  transcript: '',
})

function formatDuration(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export default function App() {
  const [patients, setPatients] = useState(() => {
    const saved = localStorage.getItem('medvoice_patients')
    return saved ? JSON.parse(saved) : [DEFAULT_PATIENT()]
  })
  const [activeIdx, setActiveIdx] = useState(0)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('claude_api_key') || '')
  const [whisperKey, setWhisperKey] = useState(() => localStorage.getItem('openai_api_key') || '')
  const [showSettings, setShowSettings] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [toast, setToast] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [showExport, setShowExport] = useState(false)
  const [visitorCount, setVisitorCount] = useState(() => {
    const c = parseInt(localStorage.getItem('medvoice_visitors') || '0')
    const newC = c + 1
    localStorage.setItem('medvoice_visitors', String(newC))
    return newC
  })
  const transcriptEndRef = useRef(null)

  const speech = useSpeechRecognition()

  // Save patients to localStorage
  useEffect(() => {
    localStorage.setItem('medvoice_patients', JSON.stringify(patients))
  }, [patients])

  // Save API keys
  useEffect(() => {
    if (apiKey) localStorage.setItem('claude_api_key', apiKey)
  }, [apiKey])
  useEffect(() => {
    if (whisperKey) localStorage.setItem('openai_api_key', whisperKey)
  }, [whisperKey])

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [speech.transcript, speech.interimText])

  // Show toast
  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2000)
  }, [])

  // Update active patient field
  const updateField = useCallback((field, value) => {
    setPatients(prev => prev.map((p, i) => i === activeIdx ? { ...p, [field]: value } : p))
  }, [activeIdx])

  // Add new patient
  const addPatient = useCallback(() => {
    const p = DEFAULT_PATIENT()
    p.patientId = `P${String(patients.length + 1).padStart(3, '0')}`
    setPatients(prev => [...prev, p])
    setActiveIdx(patients.length)
    speech.resetTranscript()
  }, [patients.length, speech])

  // Handle stop — convert + analytics
  const handleStop = useCallback(async () => {
    speech.stop()

    // Save transcript to patient
    const fullTranscript = speech.transcript
    updateField('transcript', (patients[activeIdx]?.transcript || '') + fullTranscript)

    // Send analytics silently
    sendAnalytics({
      sessionId: patients[activeIdx]?.id,
      patientCount: patients.length,
      duration: speech.duration,
      termsConverted: 0,
    })

    // Convert via Claude API
    if (fullTranscript.trim() && apiKey) {
      setIsConverting(true)
      try {
        const terms = await convertToMedicalTerms(fullTranscript, apiKey)
        if (terms) {
          setPatients(prev => prev.map((p, i) => {
            if (i !== activeIdx) return p
            return {
              ...p,
              cc: p.cc ? p.cc + ', ' + terms.cc : terms.cc,
              presentIllness: p.presentIllness ? p.presentIllness + ' ' + terms.presentIllness : terms.presentIllness,
              associatedSx: p.associatedSx ? p.associatedSx + ', ' + terms.associatedSx : terms.associatedSx,
              pastHx: p.pastHx ? p.pastHx + ' ' + terms.pastHx : terms.pastHx,
              diagnosis: p.diagnosis ? p.diagnosis + ', ' + terms.diagnosis : terms.diagnosis,
              plan: p.plan ? p.plan + ' ' + terms.plan : terms.plan,
              notes: p.notes ? p.notes + ' ' + terms.notes : terms.notes,
            }
          }))
          showToast('AI 변환 완료!')
        }
      } catch (err) {
        showToast('AI 변환 실패: ' + err.message)
      }
      setIsConverting(false)
    } else if (!apiKey && fullTranscript.trim()) {
      showToast('Claude API 키를 설정해주세요')
    }

    speech.resetTranscript()
  }, [speech, apiKey, activeIdx, patients, updateField, showToast])

  // Export handlers
  const handleExportXlsx = () => {
    exportXlsx(patients)
    sendAnalytics({ sessionId: 'export', patientCount: patients.length, duration: 0, termsConverted: 0 })
    setShowExport(false)
    showToast('XLSX 다운로드 완료!')
  }
  const handleExportCsv = () => {
    exportCsv(patients)
    sendAnalytics({ sessionId: 'export', patientCount: patients.length, duration: 0, termsConverted: 0 })
    setShowExport(false)
    showToast('CSV 다운로드 완료!')
  }
  const handleCopy = async () => {
    await copyToClipboard(patients)
    setShowExport(false)
    showToast('클립보드에 복사 완료!')
  }

  // Feedback submit
  const handleFeedback = () => {
    if (!feedbackText.trim()) return
    window.open(`mailto:taeshinkim11@gmail.com?subject=MedVoice Feedback&body=${encodeURIComponent(feedbackText)}`)
    setFeedbackText('')
    setShowFeedback(false)
    showToast('감사합니다! 피드백이 전달되었습니다')
  }

  const activePatient = patients[activeIdx] || patients[0]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <h1 className="text-lg font-bold text-blue-600 flex items-center gap-1">
          <span className="text-xl">&#9670;</span>
          <span>SPINAI</span>
          <span className="text-gray-400 font-normal mx-1">·</span>
          <span className="text-gray-700 font-semibold text-sm sm:text-base">MedVoice Collector</span>
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 transition-colors"
            title="설정"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button
            onClick={addPatient}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + 새 환자
          </button>
          <div className="relative">
            <button
              onClick={() => setShowExport(!showExport)}
              className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              내보내기
            </button>
            {showExport && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border py-1 z-50 min-w-[140px]">
                <button onClick={handleExportXlsx} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">.xlsx (엑셀)</button>
                <button onClick={handleExportCsv} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">.csv</button>
                <button onClick={handleCopy} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">클립보드 복사</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Settings panel */}
      {showSettings && (
        <div className="bg-white border-b border-blue-100 px-4 py-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Claude API Key (의학 용어 변환)</label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          {speech.useWhisper && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">OpenAI API Key (iOS 음성인식 Whisper)</label>
              <input
                type="password"
                value={whisperKey}
                onChange={e => setWhisperKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          )}
          <p className="text-xs text-gray-400">API 키는 브라우저에만 저장되며 외부로 전송되지 않습니다.</p>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col lg:flex-row gap-0 lg:gap-0">
        {/* Left: Transcript + Controls */}
        <section className="lg:w-[40%] flex flex-col border-b lg:border-b-0 lg:border-r border-blue-100 bg-white/40">
          {/* Transcript area */}
          <div className="flex-1 p-4 overflow-y-auto max-h-[40vh] lg:max-h-[calc(100vh-220px)]">
            <h2 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
              <span>&#127897;</span> 실시간 대화
              {speech.isListening && (
                <span className="inline-flex items-center gap-1 text-red-500 text-xs">
                  <span className="w-2 h-2 bg-red-500 rounded-full recording-pulse inline-block"></span>
                  REC {formatDuration(speech.duration)}
                </span>
              )}
            </h2>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {activePatient.transcript && (
                <div className="text-gray-400 mb-2">{activePatient.transcript}</div>
              )}
              {speech.transcript && (
                <span>{speech.transcript}</span>
              )}
              {speech.interimText && (
                <span className="text-blue-400 italic">{speech.interimText}</span>
              )}
              {!activePatient.transcript && !speech.transcript && !speech.interimText && (
                <p className="text-gray-300 italic">음성 인식을 시작하면 대화 내용이 여기에 표시됩니다...</p>
              )}
              <div ref={transcriptEndRef} />
            </div>
          </div>

          {/* Controls */}
          <div className="p-4 border-t border-blue-100 bg-white/60 flex items-center justify-center gap-3">
            {!speech.isListening ? (
              <button
                onClick={() => speech.start()}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                title="음성 인식 시작"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </button>
            ) : (
              <>
                {!speech.isPaused ? (
                  <button
                    onClick={() => speech.pause()}
                    className="w-12 h-12 rounded-full bg-yellow-500 text-white flex items-center justify-center hover:bg-yellow-600 transition-all"
                    title="일시정지"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={() => speech.resume()}
                    className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-all"
                    title="재개"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                )}
                <button
                  onClick={handleStop}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-lg recording-pulse active:scale-95"
                  title="중지 및 AI 변환"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h12v12H6z"/>
                  </svg>
                </button>
              </>
            )}
          </div>
          {isConverting && (
            <div className="text-center py-2 text-xs text-blue-600 bg-blue-50 border-t border-blue-100">
              AI가 의학 용어로 변환 중...
            </div>
          )}
          {speech.useWhisper && (
            <div className="text-center py-1 text-xs text-amber-600 bg-amber-50">
              iOS 모드: Whisper API 사용 중
            </div>
          )}
        </section>

        {/* Right: Data Table */}
        <section className="lg:w-[60%] flex flex-col bg-white/30">
          <div className="p-4 overflow-auto flex-1">
            <h2 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
              <span>&#128202;</span> 환자 데이터 테이블
            </h2>
            <div className="overflow-x-auto">
              <table className="data-table w-full border-collapse min-w-[600px]">
                <thead>
                  <tr>
                    {COLUMNS.map(col => (
                      <th key={col.key}>{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient, pIdx) => (
                    <tr
                      key={patient.id}
                      className={`${pIdx === activeIdx ? 'bg-blue-50/50' : 'hover:bg-gray-50/50'} cursor-pointer`}
                      onClick={() => {
                        setActiveIdx(pIdx)
                        if (!speech.isListening) speech.resetTranscript()
                      }}
                    >
                      {COLUMNS.map(col => (
                        <td key={col.key}>
                          <input
                            value={patient[col.key] || ''}
                            onChange={e => {
                              const val = e.target.value
                              setPatients(prev => prev.map((p, i) => i === pIdx ? { ...p, [col.key]: val } : p))
                            }}
                            placeholder={col.label}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* Patient tabs */}
      <nav className="bg-white/80 border-t border-blue-100 px-4 py-2 flex items-center gap-2 overflow-x-auto">
        <span className="text-xs text-gray-400 shrink-0">환자 목록:</span>
        {patients.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => {
              setActiveIdx(idx)
              if (!speech.isListening) speech.resetTranscript()
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
              idx === activeIdx
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {p.name || p.patientId || `Patient ${idx + 1}`}
          </button>
        ))}
        <button
          onClick={addPatient}
          className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 text-lg shrink-0"
        >
          +
        </button>
      </nav>

      {/* Footer */}
      <footer className="bg-white/60 border-t border-blue-100 px-4 py-3 text-center text-xs text-gray-400">
        Built by <span className="font-semibold text-blue-600">SPINAI</span> · spinaiceo@gmail.com · <span>&#128065;</span> {visitorCount} visitors
      </footer>

      {/* Feedback button — hidden during recording */}
      {!speech.isListening && (
        <button
          onClick={() => setShowFeedback(true)}
          className="fixed bottom-20 right-4 w-10 h-10 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all z-50"
          title="피드백"
        >
          <span className="text-lg">&#128172;</span>
        </button>
      )}

      {/* Feedback modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50 p-4" onClick={() => setShowFeedback(false)}>
          <div className="bg-white rounded-xl p-4 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-700 mb-2">피드백 보내기</h3>
            <textarea
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              placeholder="의견이나 개선 사항을 알려주세요..."
              className="w-full border rounded-lg p-3 text-sm resize-none h-24 focus:ring-2 focus:ring-blue-500 outline-none"
              autoFocus
            />
            <div className="flex gap-2 mt-3">
              <button onClick={() => setShowFeedback(false)} className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm">취소</button>
              <button onClick={handleFeedback} className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium">전송</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm shadow-lg z-50 toast-animate">
          {toast}
        </div>
      )}

      {/* Click outside to close export */}
      {showExport && (
        <div className="fixed inset-0 z-30" onClick={() => setShowExport(false)} />
      )}
    </div>
  )
}
