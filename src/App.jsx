import { useState, useEffect, useCallback, useRef } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { useSpeechRecognition } from './hooks/useSpeechRecognition'
import { convertToMedicalTerms } from './utils/medicalTerms'
import { exportXlsx, exportCsv, copyToClipboard, COLUMNS } from './utils/exportData'
import { sendAnalytics } from './utils/analytics'
import { t, getLang, setLang, getSupportedLangs } from './i18n/translations'
import Footer from './components/Footer'
import About from './pages/About'
import HowToUse from './pages/HowToUse'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'

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

function safeParse(key, fallback) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function MainApp({ lang, visitorCount }) {
  const [patients, setPatients] = useState(() => safeParse('medvoice_patients', [DEFAULT_PATIENT()]))
  const [activeIdx, setActiveIdx] = useState(0)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('claude_api_key') || '')
  const [whisperKey, setWhisperKey] = useState(() => localStorage.getItem('openai_api_key') || '')
  const [showSettings, setShowSettings] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [toast, setToast] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [showExport, setShowExport] = useState(false)
  const transcriptEndRef = useRef(null)
  const activeIdxRef = useRef(activeIdx)
  activeIdxRef.current = activeIdx

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }, [])

  const speech = useSpeechRecognition(showToast, lang)

  useEffect(() => {
    localStorage.setItem('medvoice_patients', JSON.stringify(patients))
  }, [patients])

  useEffect(() => {
    if (apiKey) localStorage.setItem('claude_api_key', apiKey)
  }, [apiKey])
  useEffect(() => {
    if (whisperKey) localStorage.setItem('openai_api_key', whisperKey)
  }, [whisperKey])

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [speech.transcript, speech.interimText])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        setShowFeedback(false)
        setShowExport(false)
        setShowSettings(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const updateField = useCallback((field, value) => {
    setPatients(prev => prev.map((p, i) => i === activeIdxRef.current ? { ...p, [field]: value } : p))
  }, [])

  const addPatient = useCallback(() => {
    const p = DEFAULT_PATIENT()
    p.patientId = `P${String(patients.length + 1).padStart(3, '0')}`
    setPatients(prev => [...prev, p])
    setActiveIdx(patients.length)
    speech.resetTranscript()
  }, [patients.length, speech])

  const deletePatient = useCallback((idx) => {
    if (patients.length <= 1) {
      showToast(t('minOnePatient', lang))
      return
    }
    setPatients(prev => prev.filter((_, i) => i !== idx))
    setActiveIdx(prev => prev >= idx ? Math.max(0, prev - 1) : prev)
  }, [patients.length, showToast, lang])

  const handleStop = useCallback(async () => {
    const capturedIdx = activeIdxRef.current
    speech.stop()

    const fullTranscript = speech.transcript
    updateField('transcript', (patients[capturedIdx]?.transcript || '') + fullTranscript)

    sendAnalytics({
      sessionId: patients[capturedIdx]?.id,
      patientCount: patients.length,
      duration: speech.duration,
      termsConverted: 0,
    })

    if (fullTranscript.trim() && apiKey) {
      setIsConverting(true)
      try {
        const terms = await convertToMedicalTerms(fullTranscript, apiKey)
        if (terms) {
          setPatients(prev => prev.map((p, i) => {
            if (i !== capturedIdx) return p
            return {
              ...p,
              cc: [p.cc, terms.cc].filter(Boolean).join(', '),
              presentIllness: [p.presentIllness, terms.presentIllness].filter(Boolean).join(' '),
              associatedSx: [p.associatedSx, terms.associatedSx].filter(Boolean).join(', '),
              pastHx: [p.pastHx, terms.pastHx].filter(Boolean).join(' '),
              diagnosis: [p.diagnosis, terms.diagnosis].filter(Boolean).join(', '),
              plan: [p.plan, terms.plan].filter(Boolean).join(' '),
              notes: [p.notes, terms.notes].filter(Boolean).join(' '),
            }
          }))
          showToast(t('conversionComplete', lang))
        }
      } catch (err) {
        showToast(t('conversionFailed', lang) + err.message)
      }
      setIsConverting(false)
    } else if (!apiKey && fullTranscript.trim()) {
      showToast(t('setApiKey', lang))
    }

    speech.resetTranscript()
  }, [speech, apiKey, patients, updateField, showToast, lang])

  const handleExportXlsx = () => {
    exportXlsx(patients)
    sendAnalytics({ sessionId: 'export', patientCount: patients.length, duration: 0, termsConverted: 0 })
    setShowExport(false)
    showToast(t('xlsxDownloaded', lang))
  }
  const handleExportCsv = () => {
    exportCsv(patients)
    sendAnalytics({ sessionId: 'export', patientCount: patients.length, duration: 0, termsConverted: 0 })
    setShowExport(false)
    showToast(t('csvDownloaded', lang))
  }
  const handleCopy = async () => {
    await copyToClipboard(patients)
    setShowExport(false)
    showToast(t('copiedToClipboard', lang))
  }

  const handleFeedback = () => {
    if (!feedbackText.trim()) return
    window.open(`mailto:taeshinkim11@gmail.com?subject=MedVoice Feedback&body=${encodeURIComponent(feedbackText)}`)
    setFeedbackText('')
    setShowFeedback(false)
    showToast(t('feedbackSent', lang))
  }

  const activePatient = patients[activeIdx] || patients[0]

  return (
    <>
      {/* Header */}
      <header className="glass border-b border-white/60 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            M
          </div>
          <span className="text-base font-semibold text-gray-800 tracking-tight">MedVoice</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            aria-label={t('settings', lang)}
            className="p-2 rounded-xl hover:bg-white/60 text-gray-400 hover:text-gray-600 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button onClick={addPatient} className="btn-primary px-3 py-1.5 text-xs">
            {t('newPatient', lang)}
          </button>
          <div className="relative">
            <button onClick={() => setShowExport(!showExport)} className="btn-success px-3 py-1.5 text-xs">
              {t('export', lang)}
            </button>
            {showExport && (
              <div className="absolute right-0 top-full mt-2 card py-1 z-50 min-w-[160px] shadow-lg" role="menu">
                <button onClick={handleExportXlsx} role="menuitem" className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">{t('excelExport', lang)}</button>
                <button onClick={handleExportCsv} role="menuitem" className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">{t('csvExport', lang)}</button>
                <button onClick={handleCopy} role="menuitem" className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">{t('clipboardCopy', lang)}</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Settings panel */}
      {showSettings && (
        <div className="glass border-b border-white/40 px-4 py-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('claudeApiKey', lang)}</label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full px-3 py-2.5 bg-white/60 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all"
            />
          </div>
          {speech.useWhisper && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('whisperApiKey', lang)}</label>
              <input
                type="password"
                value={whisperKey}
                onChange={e => setWhisperKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2.5 bg-white/60 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all"
              />
            </div>
          )}
          <p className="text-xs text-gray-400">{t('apiKeyNote', lang)}</p>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col lg:flex-row gap-3 p-3">
        {/* Left: Transcript + Controls */}
        <section className="lg:w-[38%] flex flex-col card overflow-hidden">
          <div className="flex-1 p-4 overflow-y-auto max-h-[35vh] lg:max-h-[calc(100vh-240px)]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                {t('realTimeConversation', lang)}
              </h2>
              {speech.isListening && (
                <span className="inline-flex items-center gap-1.5 text-red-500 text-xs font-mono bg-red-50 px-2 py-1 rounded-full">
                  <span className="w-2 h-2 bg-red-500 rounded-full recording-pulse inline-block"></span>
                  {formatDuration(speech.duration)}
                </span>
              )}
            </div>
            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {activePatient.transcript && (
                <div className="text-gray-300 mb-2 pb-2 border-b border-gray-100">{activePatient.transcript}</div>
              )}
              {speech.transcript && <span className="text-gray-700">{speech.transcript}</span>}
              {speech.interimText && (
                <span className="text-indigo-400 italic">{speech.interimText}</span>
              )}
              {!activePatient.transcript && !speech.transcript && !speech.interimText && (
                <p className="text-gray-300 italic text-center py-8">{t('transcriptPlaceholder', lang)}</p>
              )}
              <div ref={transcriptEndRef} />
            </div>
          </div>

          {/* Controls */}
          <div className="p-5 border-t border-gray-100/50 flex items-center justify-center gap-4 bg-gradient-to-t from-white/40 to-transparent">
            {!speech.isListening ? (
              <button
                onClick={() => speech.start()}
                aria-label={t('startRecording', lang)}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center hover:from-indigo-600 hover:to-purple-700 transition-all shadow-xl mic-glow active:scale-95"
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
                    aria-label={t('pause', lang)}
                    className="w-14 h-14 rounded-full bg-amber-400 text-white flex items-center justify-center hover:bg-amber-500 transition-all shadow-lg active:scale-95"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={() => speech.resume()}
                    aria-label={t('resume', lang)}
                    className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-all shadow-lg active:scale-95"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                )}
                <button
                  onClick={handleStop}
                  aria-label={t('stopAndConvert', lang)}
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center hover:from-red-600 hover:to-rose-700 transition-all shadow-xl recording-pulse active:scale-95"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="7" y="7" width="10" height="10" rx="2"/>
                  </svg>
                </button>
              </>
            )}
          </div>
          {isConverting && (
            <div className="text-center py-2.5 text-xs text-indigo-600 bg-indigo-50/60 border-t border-indigo-100/40 flex items-center justify-center gap-2">
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {t('converting', lang)}
            </div>
          )}
          {speech.useWhisper && (
            <div className="text-center py-1.5 text-xs text-amber-600 bg-amber-50/60 border-t border-amber-100/30">
              {t('iosMode', lang)}
            </div>
          )}
        </section>

        {/* Right: Data Table */}
        <section className="lg:w-[62%] flex flex-col card overflow-hidden">
          <div className="p-4 overflow-auto flex-1">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              {t('patientDataTable', lang)}
            </h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200/60">
              <table className="data-table w-full border-collapse min-w-[600px]">
                <thead>
                  <tr>
                    <th className="w-8" scope="col" aria-label="Actions"></th>
                    {COLUMNS.map(col => (
                      <th key={col.key} scope="col">{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient, pIdx) => (
                    <tr
                      key={patient.id}
                      className={`${pIdx === activeIdx ? 'bg-indigo-50/40' : ''} cursor-pointer transition-colors`}
                      onClick={() => {
                        setActiveIdx(pIdx)
                        if (!speech.isListening) speech.resetTranscript()
                      }}
                    >
                      <td className="text-center !p-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); deletePatient(pIdx) }}
                          aria-label={`${t('deletePatient', lang)} ${pIdx + 1}`}
                          className="text-gray-300 hover:text-red-400 transition-colors text-xs px-1.5 py-1.5"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </td>
                      {COLUMNS.map(col => (
                        <td key={col.key}>
                          <input
                            value={patient[col.key] || ''}
                            onChange={e => {
                              const val = e.target.value
                              setPatients(prev => prev.map((p, i) => i === pIdx ? { ...p, [col.key]: val } : p))
                            }}
                            aria-label={`${col.label} - Patient ${pIdx + 1}`}
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
      <nav className="px-4 py-2.5 flex items-center gap-2 overflow-x-auto" aria-label={t('patientList', lang)}>
        <span className="text-xs text-gray-400 shrink-0 font-medium">{t('patientList', lang)}</span>
        {patients.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => {
              setActiveIdx(idx)
              if (!speech.isListening) speech.resetTranscript()
            }}
            className={`patient-pill shrink-0 ${idx === activeIdx ? 'active' : ''}`}
          >
            {p.name || p.patientId || `Patient ${idx + 1}`}
          </button>
        ))}
        <button
          onClick={addPatient}
          aria-label={t('addPatient', lang)}
          className="w-7 h-7 rounded-full bg-white/70 border border-gray-200 text-gray-400 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-500 hover:border-indigo-200 text-sm shrink-0 transition-all"
        >
          +
        </button>
      </nav>

      {/* Footer */}
      <Footer lang={lang} visitorCount={visitorCount} />

      {/* Feedback button */}
      {!speech.isListening && (
        <button
          onClick={() => setShowFeedback(true)}
          aria-label={t('sendFeedback', lang)}
          className="fixed bottom-20 right-4 w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all z-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}

      {/* Feedback modal */}
      {showFeedback && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4"
          onClick={() => setShowFeedback(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-dialog-title"
        >
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 id="feedback-dialog-title" className="font-semibold text-gray-800 mb-3">{t('feedbackTitle', lang)}</h3>
            <textarea
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              placeholder={t('feedbackPlaceholder', lang)}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none h-24 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all"
              autoFocus
            />
            <div className="flex gap-2 mt-3">
              <button type="button" onClick={() => setShowFeedback(false)} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors">{t('cancel', lang)}</button>
              <button type="button" onClick={handleFeedback} className="flex-1 py-2.5 rounded-xl btn-primary text-sm">{t('send', lang)}</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur-sm text-white px-4 py-2.5 rounded-xl text-sm shadow-xl z-50 toast-animate" role="status">
          {toast}
        </div>
      )}

      {showExport && (
        <div className="fixed inset-0 z-30" onClick={() => setShowExport(false)} />
      )}
    </>
  )
}

export default function App() {
  const [lang, setCurrentLang] = useState(getLang)
  const [visitorCount] = useState(() => {
    const c = parseInt(localStorage.getItem('medvoice_visitors') || '0')
    const newC = c + 1
    localStorage.setItem('medvoice_visitors', String(newC))
    return newC
  })

  const handleLangChange = (newLang) => {
    setLang(newLang)
    setCurrentLang(newLang)
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        {/* Language selector */}
        <div className="fixed top-16 right-3 z-50">
          <select
            value={lang}
            onChange={e => handleLangChange(e.target.value)}
            className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs text-gray-500 shadow-sm cursor-pointer focus:ring-2 focus:ring-indigo-400 outline-none transition-all hover:border-indigo-300"
            aria-label="Language"
          >
            {getSupportedLangs().map(l => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>

        <Routes>
          <Route path="/" element={<MainApp lang={lang} visitorCount={visitorCount} />} />
          <Route path="/about" element={<About lang={lang} visitorCount={visitorCount} />} />
          <Route path="/how-to-use" element={<HowToUse lang={lang} visitorCount={visitorCount} />} />
          <Route path="/privacy" element={<Privacy lang={lang} visitorCount={visitorCount} />} />
          <Route path="/terms" element={<Terms lang={lang} visitorCount={visitorCount} />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
