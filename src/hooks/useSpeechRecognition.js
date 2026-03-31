import { useState, useRef, useCallback, useEffect } from 'react'

function isIOSSafari() {
  const ua = navigator.userAgent
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

function hasWebSpeechAPI() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
}

export function useSpeechRecognition(onError, lang = 'ko') {
  const [isListening, setIsListening] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimText, setInterimText] = useState('')
  const [useWhisper, setUseWhisper] = useState(false)
  const [duration, setDuration] = useState(0)
  const recognitionRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)
  const onErrorRef = useRef(onError)
  const isListeningRef = useRef(false)
  const isPausedRef = useRef(false)
  const chunkIntervalRef = useRef(null)
  onErrorRef.current = onError

  useEffect(() => {
    isListeningRef.current = isListening
  }, [isListening])

  useEffect(() => {
    isPausedRef.current = isPaused
  }, [isPaused])

  useEffect(() => {
    if (isIOSSafari() && !hasWebSpeechAPI()) {
      setUseWhisper(true)
    }
  }, [])

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now() - duration * 1000
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
  }, [duration])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const sttLang = lang === 'ja' ? 'ja-JP' : lang === 'zh' ? 'zh-CN' : lang === 'en' ? 'en-US' : 'ko-KR'

  const startWebSpeech = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setUseWhisper(true)
      return false
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = sttLang

    recognition.onresult = (event) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += t + ' '
        } else {
          interim += t
        }
      }
      if (final) {
        setTranscript(prev => prev + final)
      }
      setInterimText(interim)
    }

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        setIsListening(false)
        isListeningRef.current = false
        stopTimer()
        onErrorRef.current?.('Microphone access denied')
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        onErrorRef.current?.('Speech recognition error: ' + event.error)
      }
    }

    recognition.onend = () => {
      if (recognitionRef.current && isListeningRef.current && !isPausedRef.current) {
        try { recognition.start() } catch {}
      }
    }

    recognitionRef.current = recognition
    recognition.start()
    return true
  }, [sttLang, stopTimer])

  const startWhisper = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        if (chunksRef.current.length === 0) return
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        chunksRef.current = []

        const apiKey = localStorage.getItem('openai_api_key')
        if (!apiKey) return

        const formData = new FormData()
        formData.append('file', blob, 'audio.webm')
        formData.append('model', 'whisper-1')
        formData.append('language', lang === 'ja' ? 'ja' : lang === 'zh' ? 'zh' : lang === 'en' ? 'en' : 'ko')

        try {
          const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}` },
            body: formData,
          })
          const data = await res.json()
          if (data.text) {
            setTranscript(prev => prev + data.text + ' ')
          }
        } catch {}
      }

      mediaRecorderRef.current = recorder
      recorder.start()

      chunkIntervalRef.current = setInterval(() => {
        if (recorder.state === 'recording') {
          recorder.stop()
          recorder.start()
        }
      }, 5000)

      return true
    } catch {
      return false
    }
  }, [lang])

  const start = useCallback(async () => {
    setIsListening(true)
    isListeningRef.current = true
    setIsPaused(false)
    isPausedRef.current = false
    startTimer()

    if (useWhisper) {
      await startWhisper()
    } else {
      const ok = startWebSpeech()
      if (!ok) await startWhisper()
    }
  }, [useWhisper, startWebSpeech, startWhisper, startTimer])

  const stop = useCallback(() => {
    setIsListening(false)
    isListeningRef.current = false
    setIsPaused(false)
    isPausedRef.current = false
    stopTimer()
    setInterimText('')

    if (recognitionRef.current) {
      recognitionRef.current.onend = null
      recognitionRef.current.abort()
      recognitionRef.current = null
    }

    if (chunkIntervalRef.current) {
      clearInterval(chunkIntervalRef.current)
      chunkIntervalRef.current = null
    }

    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
      mediaRecorderRef.current.stream?.getTracks().forEach(t => t.stop())
      mediaRecorderRef.current = null
    }
  }, [stopTimer])

  const pause = useCallback(() => {
    setIsPaused(true)
    isPausedRef.current = true
    stopTimer()
    if (recognitionRef.current) {
      recognitionRef.current.onend = null
      recognitionRef.current.abort()
    }
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause()
    }
  }, [stopTimer])

  const resume = useCallback(() => {
    setIsPaused(false)
    isPausedRef.current = false
    startTimer()
    if (useWhisper) {
      if (mediaRecorderRef.current?.state === 'paused') {
        mediaRecorderRef.current.resume()
      }
    } else {
      startWebSpeech()
    }
  }, [useWhisper, startWebSpeech, startTimer])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setInterimText('')
    setDuration(0)
  }, [])

  return {
    isListening,
    isPaused,
    transcript,
    interimText,
    duration,
    useWhisper,
    start,
    stop,
    pause,
    resume,
    resetTranscript,
  }
}
