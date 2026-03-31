import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const splash = document.createElement('div')
splash.id = 'splash'
splash.innerHTML = '<div class="logo">&#9670; SPINAI</div>'
document.body.prepend(splash)

setTimeout(() => {
  splash.classList.add('fade-out')
  setTimeout(() => splash.remove(), 300)
}, 800)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
