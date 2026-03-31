const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbz_y6G7Is61lUoJNKK66wJFKqbmE-6lLpTTjle8eE9uB6TQgROAvhqV0hAxG9cNez4h/exec'

function getDeviceType() {
  const w = window.innerWidth
  if (w < 640) return 'mobile'
  if (w < 1024) return 'tablet'
  return 'desktop'
}

function getBrowser() {
  const ua = navigator.userAgent
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome'
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Edg')) return 'Edge'
  return 'Other'
}

export function sendAnalytics(data) {
  if (WEBHOOK_URL.includes('PLACEHOLDER')) return
  try {
    const payload = JSON.stringify({
      ...data,
      device: getDeviceType(),
      browser: getBrowser(),
      timestamp: new Date().toISOString(),
    })
    if (navigator.sendBeacon) {
      navigator.sendBeacon(WEBHOOK_URL, payload)
    } else {
      fetch(WEBHOOK_URL, { method: 'POST', body: payload, keepalive: true }).catch(() => {})
    }
  } catch {
    // silent fail
  }
}
