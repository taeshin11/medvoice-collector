import { useState, useEffect, useCallback, useRef } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { useSpeechRecognition } from './hooks/useSpeechRecognition'
import { convertToMedicalTerms } from './utils/medicalTerms'
import { convertLocal } from './utils/localMedicalDict'
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
  const [lastTranscript, setLastTranscript] = useState('')
  const [aiResult, setAiResult] = useState(null)
  const [showAiResult, setShowAiResult] = useState(false)
  const [conversionMode, setConversionMode] = useState(() => localStorage.getItem('medvoice_mode') || 'free')
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
    setLastTranscript(fullTranscript)
    updateField('transcript', (patients[capturedIdx]?.transcript || '') + fullTranscript)

    sendAnalytics({
      sessionId: patients[capturedIdx]?.id,
      patientCount: patients.length,
      duration: speech.duration,
      termsConverted: 0,
    })

    if (fullTranscript.trim()) {
      setIsConverting(true)
      setAiResult(null)
      try {
        let terms = null
        if (conversionMode === 'ai' && apiKey) {
          terms = await convertToMedicalTerms(fullTranscript, apiKey)
        } else {
          terms = convertLocal(fullTranscript)
        }
        if (terms) {
          setAiResult(terms)
          setShowAiResult(true)
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
          showToast(conversionMode === 'ai' ? t('conversionComplete', lang) : (lang === 'ko' ? '용어 변환 완료 (Free 모드)' : 'Terms converted (Free mode)'))
        } else {
          showToast(lang === 'ko' ? '인식된 의학 용어가 없습니다' : 'No medical terms detected')
        }
      } catch (err) {
        showToast(t('conversionFailed', lang) + err.message)
      }
      setIsConverting(false)
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
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${conversionMode === 'free' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
            {conversionMode === 'free' ? 'FREE' : 'AI'}
          </span>
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
        <div className="glass border-b border-white/40 px-4 py-4 space-y-4">
          {/* Mode toggle */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">
              {lang === 'ko' ? '변환 모드' : 'Conversion Mode'}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => { setConversionMode('free'); localStorage.setItem('medvoice_mode', 'free') }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${conversionMode === 'free' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md' : 'bg-white/60 border border-gray-200 text-gray-500 hover:border-emerald-300'}`}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span>{lang === 'ko' ? 'Free 모드' : 'Free Mode'}</span>
                  <span className={`text-[10px] ${conversionMode === 'free' ? 'text-emerald-100' : 'text-gray-400'}`}>
                    {lang === 'ko' ? 'API 키 불필요' : 'No API key needed'}
                  </span>
                </div>
              </button>
              <button
                onClick={() => { setConversionMode('ai'); localStorage.setItem('medvoice_mode', 'ai') }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${conversionMode === 'ai' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md' : 'bg-white/60 border border-gray-200 text-gray-500 hover:border-indigo-300'}`}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span>{lang === 'ko' ? 'AI 모드' : 'AI Mode'}</span>
                  <span className={`text-[10px] ${conversionMode === 'ai' ? 'text-indigo-200' : 'text-gray-400'}`}>
                    Claude API
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* API keys — only shown in AI mode */}
          {conversionMode === 'ai' && (
            <>
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
            </>
          )}

          {conversionMode === 'free' && (
            <p className="text-xs text-gray-400">
              {lang === 'ko'
                ? 'Free 모드는 내장 의학 용어 사전으로 변환합니다. 더 정확한 변환은 AI 모드를 사용하세요.'
                : 'Free mode uses a built-in medical dictionary. For more accurate conversion, use AI mode.'}
            </p>
          )}
        </div>
      )}

      {/* Recording banner — always visible when recording */}
      {speech.isListening && (
        <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-3 flex items-center justify-between recording-banner">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 bg-white rounded-full recording-pulse inline-block"></span>
            <span className="font-semibold text-sm">
              {speech.isPaused
                ? (lang === 'ko' ? '일시정지됨' : 'Paused')
                : (lang === 'ko' ? '녹음 중...' : 'Recording...')}
            </span>
            <span className="font-mono text-sm opacity-90">{formatDuration(speech.duration)}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Sound wave animation */}
            {!speech.isPaused && (
              <div className="flex items-end gap-0.5 h-5">
                <span className="w-1 bg-white/80 rounded-full sound-bar" style={{animationDelay: '0s'}}></span>
                <span className="w-1 bg-white/80 rounded-full sound-bar" style={{animationDelay: '0.15s'}}></span>
                <span className="w-1 bg-white/80 rounded-full sound-bar" style={{animationDelay: '0.3s'}}></span>
                <span className="w-1 bg-white/80 rounded-full sound-bar" style={{animationDelay: '0.45s'}}></span>
                <span className="w-1 bg-white/80 rounded-full sound-bar" style={{animationDelay: '0.6s'}}></span>
              </div>
            )}
            {!speech.isPaused ? (
              <button onClick={() => speech.pause()} className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-medium transition-all">
                {t('pause', lang)}
              </button>
            ) : (
              <button onClick={() => speech.resume()} className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-medium transition-all">
                {t('resume', lang)}
              </button>
            )}
            <button onClick={handleStop} className="px-3 py-1 rounded-lg bg-white text-red-600 text-xs font-semibold hover:bg-red-50 transition-all">
              {lang === 'ko' ? '중지 & AI 변환' : 'Stop & Convert'}
            </button>
          </div>
        </div>
      )}

      {/* AI Converting overlay */}
      {isConverting && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-3 flex items-center justify-center gap-3">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span className="font-semibold text-sm">{t('converting', lang)}</span>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col lg:flex-row gap-3 p-3">
        {/* Left: Transcript + Controls */}
        <section className="lg:w-[38%] flex flex-col card overflow-hidden">
          <div className="flex-1 p-4 overflow-y-auto max-h-[40vh] lg:max-h-[calc(100vh-240px)]">
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
                  REC
                </span>
              )}
            </div>
            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap min-h-[100px]">
              {/* Previous transcripts */}
              {activePatient.transcript && (
                <div className="text-gray-400 mb-3 pb-3 border-b border-gray-100 text-xs">
                  <span className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider block mb-1">
                    {lang === 'ko' ? '이전 기록' : 'Previous'}
                  </span>
                  {activePatient.transcript}
                </div>
              )}
              {/* Live transcript */}
              {speech.transcript && (
                <div className="mb-1">
                  <span className="text-gray-700">{speech.transcript}</span>
                </div>
              )}
              {speech.interimText && (
                <span className="text-indigo-400 italic">{speech.interimText}</span>
              )}
              {/* Last session transcript (after stop, before new recording) */}
              {!speech.isListening && !speech.transcript && lastTranscript && (
                <div className="bg-gray-50 rounded-lg p-3 mb-2">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                    {lang === 'ko' ? '마지막 녹음 내용' : 'Last Recording'}
                  </span>
                  <span className="text-gray-600 text-xs">{lastTranscript}</span>
                </div>
              )}
              {/* Placeholder */}
              {!activePatient.transcript && !speech.transcript && !speech.interimText && !lastTranscript && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-indigo-50 flex items-center justify-center">
                    <svg className="w-8 h-8 text-indigo-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                    </svg>
                  </div>
                  <p className="text-gray-300 italic text-sm">{t('transcriptPlaceholder', lang)}</p>
                </div>
              )}
              <div ref={transcriptEndRef} />
            </div>
          </div>

          {/* Controls */}
          <div className="p-5 border-t border-gray-100/50 flex items-center justify-center gap-4 bg-gradient-to-t from-white/40 to-transparent">
            {!speech.isListening ? (
              <button
                onClick={() => { setLastTranscript(''); speech.start() }}
                aria-label={t('startRecording', lang)}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center hover:from-indigo-600 hover:to-purple-700 transition-all shadow-xl mic-glow active:scale-95"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </button>
            ) : (
              <button
                onClick={handleStop}
                aria-label={t('stopAndConvert', lang)}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center hover:from-red-600 hover:to-rose-700 transition-all shadow-xl recording-pulse active:scale-95"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="7" y="7" width="10" height="10" rx="2"/>
                </svg>
              </button>
            )}
          </div>
          {speech.useWhisper && (
            <div className="text-center py-1.5 text-xs text-amber-600 bg-amber-50/60 border-t border-amber-100/30">
              {t('iosMode', lang)}
            </div>
          )}
          {/* AI Result button */}
          {aiResult && !speech.isListening && (
            <button
              onClick={() => setShowAiResult(true)}
              className="text-center py-2 text-xs text-indigo-600 bg-indigo-50/60 border-t border-indigo-100/30 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {lang === 'ko' ? 'AI 변환 결과 보기' : 'View AI Results'}
            </button>
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

      {/* AI Result Modal */}
      {showAiResult && aiResult && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4"
          onClick={() => setShowAiResult(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl p-5 w-full max-w-lg shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </span>
                {conversionMode === 'ai'
                  ? (lang === 'ko' ? 'AI 변환 결과' : 'AI Conversion Results')
                  : (lang === 'ko' ? '용어 변환 결과 (Free)' : 'Term Conversion (Free)')}
              </h3>
              <button onClick={() => setShowAiResult(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Original transcript */}
            {lastTranscript && (
              <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  {lang === 'ko' ? '원본 대화' : 'Original Transcript'}
                </span>
                <p className="text-sm text-gray-600">{lastTranscript}</p>
              </div>
            )}

            {/* Converted terms */}
            <div className="space-y-2">
              <span className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wider">
                {lang === 'ko' ? '의학 용어 변환' : 'Medical Term Mapping'}
              </span>
              {[
                { key: 'cc', label: 'C.C (Chief Complaint)' },
                { key: 'presentIllness', label: 'Present Illness' },
                { key: 'associatedSx', label: 'Associated Sx' },
                { key: 'pastHx', label: 'Past Hx' },
                { key: 'diagnosis', label: 'Diagnosis' },
                { key: 'plan', label: 'Plan' },
                { key: 'notes', label: 'Notes' },
              ].map(field => aiResult[field.key] ? (
                <div key={field.key} className="flex gap-3 p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100/50">
                  <span className="text-xs font-semibold text-indigo-600 min-w-[100px] shrink-0">{field.label}</span>
                  <span className="text-sm text-gray-700">{aiResult[field.key]}</span>
                </div>
              ) : null)}
              {Object.values(aiResult).every(v => !v) && (
                <p className="text-sm text-gray-400 italic text-center py-4">
                  {lang === 'ko' ? '변환된 내용이 없습니다.' : 'No terms were converted.'}
                </p>
              )}
            </div>

            <button
              onClick={() => setShowAiResult(false)}
              className="w-full mt-4 py-2.5 rounded-xl btn-primary text-sm"
            >
              {lang === 'ko' ? '확인' : 'OK'}
            </button>
          </div>
        </div>
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
