'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import ThreeExplosion from './ThreeExplosion'
import RopeFooter from './RopeFooter'

const RELEASE_DATE = new Date('2026-11-19T00:00:00')
const TRAILER_URL = 'https://www.youtube.com/watch?v=VQRLujxTm3c'
const SITE_URL = 'https://gta6out.it'
const EASTER_EGG_TEXT = 'You discovered the real GTA VI'
const HOLD_DURATION = 3000

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}

function getTimeLeft() {
  const now = new Date()
  const diff = RELEASE_DATE.getTime() - now.getTime()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    done: false,
  }
}

function getAutoHype() {
  const remaining = RELEASE_DATE.getTime() - Date.now()
  const oneYear = 365 * 24 * 60 * 60 * 1000
  return Math.min(100, Math.max(0, (remaining / oneYear) * 100))
}

function useTypewriter(text: string, active: boolean, speed = 55) {
  const [displayed, setDisplayed] = useState('')
  useEffect(() => {
    if (!active) { setDisplayed(''); return }
    setDisplayed('')
    let i = 0
    const t = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) clearInterval(t)
    }, speed)
    return () => clearInterval(t)
  }, [active, text, speed])
  return displayed
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="countdown-unit">
      <div className="countdown-number">{String(value).padStart(2, '0')}</div>
      <div className="countdown-label">{label}</div>
    </div>
  )
}

function Fireworks() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const colors = ['#ff00cc', '#cc00ff', '#ff50aa', '#fff', '#aa00ff', '#ff8c00', '#ffcc00', '#ff4500']
    const particles: { x: number; y: number; vx: number; vy: number; a: number; c: string; s: number }[] = []
    const burst = (x: number, y: number) => {
      for (let i = 0; i < 90; i++) {
        const angle = (Math.PI * 2 * i) / 90
        const speed = 3 + Math.random() * 9
        particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, a: 1, c: colors[Math.floor(Math.random() * colors.length)], s: 2 + Math.random() * 4 })
      }
    }
    let frame = 0
    let id: number
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (frame % 38 === 0) burst(100 + Math.random() * (canvas.width - 200), 50 + Math.random() * (canvas.height / 2))
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.a -= 0.012
        if (p.a <= 0) { particles.splice(i, 1); continue }
        ctx.save(); ctx.globalAlpha = p.a; ctx.fillStyle = p.c
        ctx.shadowBlur = 10; ctx.shadowColor = p.c
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill(); ctx.restore()
      }
      frame++; id = requestAnimationFrame(tick)
    }
    burst(canvas.width / 2, canvas.height / 3); tick()
    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', onResize) }
  }, [])
  return <canvas ref={ref} className="fireworks-canvas" />
}

function CelebrationScreen() {
  return (
    <div className="released-wrapper">
      <Fireworks />
      <div className="released-content">
        <div className="released-label">IT&apos;S HERE</div>
        <img src="/media/gta6-logo.svg" alt="Grand Theft Auto VI" className="gta-logo released-logo" />
        <div className="released-title">GTA 6 IS OUT NOW!</div>
        <p className="released-sub">The wait is finally over. Vice City awaits.</p>
        <a href={TRAILER_URL} target="_blank" rel="noopener noreferrer" className="btn-trailer">▶ WATCH THE TRAILER</a>
      </div>
      <footer className="footer">
        <div className="footer-line" />
        <p className="footer-text">Created by <span className="footer-author" style={{ cursor: 'default' }}>Rashica07</span></p>
        <div className="footer-line" />
      </footer>
    </div>
  )
}

function EasterEggModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const typed = useTypewriter(EASTER_EGG_TEXT, isOpen)
  const isDone = typed.length >= EASTER_EGG_TEXT.length
  if (!isOpen) return null
  return (
    <div className="egg-backdrop" onClick={onClose}>
      <div className="egg-modal" onClick={e => e.stopPropagation()}>
        <img src="/media/gta6-official.jpeg" alt="Official GTA VI Logo" className="egg-logo" />
        <p className="egg-typewriter">
          {typed}
          {!isDone && <span className="egg-cursor">|</span>}
        </p>
        <button className="egg-close" onClick={onClose}>CLOSE [ESC]</button>
      </div>
    </div>
  )
}

export default function HomeClient() {
  const [timeLeft, setTimeLeft] = useState({ days: 185, hours: 0, minutes: 0, seconds: 0, done: false })
  const [glitch, setGlitch] = useState(false)
  const [shareFlash, setShareFlash] = useState(false)
  const [easterEggOpen, setEasterEggOpen] = useState(false)
  const [showExplosion, setShowExplosion] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  // Logo click counter via refs to avoid React batching issues
  const logoClickCount = useRef(0)
  const logoClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Hype bar
  const trackRef = useRef<HTMLDivElement>(null)
  const [ballPos, setBallPos] = useState(50.8)
  const [isDragging, setIsDragging] = useState(false)
  const [isHolding, setIsHolding] = useState(false)
  const [holdProgress, setHoldProgress] = useState(0)
  const holdInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const holdStart = useRef(0)
  const isDraggingRef = useRef(false)

  // Init
  useEffect(() => {
    setTimeLeft(getTimeLeft())
    setBallPos(getAutoHype())
    const iv = setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => clearInterval(iv)
  }, [])

  // Glitch effect
  useEffect(() => {
    if (timeLeft.done) return
    const gi = setInterval(() => { setGlitch(true); setTimeout(() => setGlitch(false), 220) }, 4200)
    return () => clearInterval(gi)
  }, [timeLeft.done])

  // ESC closes easter egg
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setEasterEggOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ─── Logo Easter Egg ───
  const handleLogoClick = useCallback(() => {
    logoClickCount.current += 1
    if (logoClickCount.current >= 5) {
      logoClickCount.current = 0
      if (logoClickTimer.current) clearTimeout(logoClickTimer.current)
      vibrate([80, 40, 160])
      setEasterEggOpen(true)
      return
    }
    if (logoClickTimer.current) clearTimeout(logoClickTimer.current)
    logoClickTimer.current = setTimeout(() => { logoClickCount.current = 0 }, 1800)
  }, [])

  // ─── Hype Bar Drag ───
  const clearHold = useCallback(() => {
    if (holdInterval.current) { clearInterval(holdInterval.current); holdInterval.current = null }
    setIsHolding(false)
    setHoldProgress(0)
  }, [])

  const startHold = useCallback(() => {
    if (holdInterval.current) return
    holdStart.current = Date.now()
    setIsHolding(true)
    vibrate(40)
    holdInterval.current = setInterval(() => {
      const elapsed = Date.now() - holdStart.current
      const pct = Math.min(100, (elapsed / HOLD_DURATION) * 100)
      setHoldProgress(pct)
      if (pct >= 100) {
        clearInterval(holdInterval.current!)
        holdInterval.current = null
        setIsHolding(false)
        setHoldProgress(0)
        vibrate([60, 30, 60, 30, 120, 30, 200])
        setShowExplosion(true)
      }
    }, 50)
  }, [])

  const updateBall = useCallback((clientX: number) => {
    if (!trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const pos = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
    setBallPos(pos)
    if (pos >= 99) startHold()
    else clearHold()
  }, [startHold, clearHold])

  useEffect(() => {
    if (!isDragging) return
    const onMove = (e: MouseEvent) => { if (isDraggingRef.current) updateBall(e.clientX) }
    const onTouch = (e: TouchEvent) => { if (isDraggingRef.current) updateBall(e.touches[0].clientX) }
    const onEnd = () => { setIsDragging(false); isDraggingRef.current = false; clearHold() }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onTouch, { passive: false })
    window.addEventListener('mouseup', onEnd)
    window.addEventListener('touchend', onEnd)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onTouch)
      window.removeEventListener('mouseup', onEnd)
      window.removeEventListener('touchend', onEnd)
    }
  }, [isDragging, updateBall, clearHold])

  const handleTrackDown = (clientX: number) => {
    setIsDragging(true)
    isDraggingRef.current = true
    updateBall(clientX)
  }

  const handleShare = useCallback(() => {
    const text = `🚨 GTA 6 drops in ${timeLeft.days} days, ${timeLeft.hours} hours & ${timeLeft.minutes} minutes!\nVice City is almost here 🎮🔥\n\nTrack it 👉 ${SITE_URL}\n\n#GTA6 #GrandTheftAutoVI #RockstarGames`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
    setShareFlash(true)
    setTimeout(() => setShareFlash(false), 1000)
  }, [timeLeft.days, timeLeft.hours, timeLeft.minutes])

  if (showCelebration || timeLeft.done) return <CelebrationScreen />

  return (
    <div className="page-wrapper">
      {showExplosion && (
        <ThreeExplosion onComplete={() => { setShowExplosion(false); setShowCelebration(true) }} />
      )}

      <div className="bg-layer" />
      <div className="noise-overlay" />
      <div className="grid-overlay" />

      <EasterEggModal isOpen={easterEggOpen} onClose={() => setEasterEggOpen(false)} />

      <main className="content">
        {/* LOGO — click 5× for easter egg */}
        <div className="logo-section">
          <img
            src="/media/gta6-logo.svg"
            alt="Grand Theft Auto VI"
            className={`gta-logo${glitch ? ' glitch' : ''}`}
            onClick={handleLogoClick}
            draggable={false}
          />
        </div>

        {/* COUNTDOWN */}
        <div className="countdown-section">
          <p className="countdown-heading">RELEASING NOVEMBER 19, 2026</p>
          <div className="countdown-grid">
            <CountdownUnit value={timeLeft.days} label="DAYS" />
            <div className="countdown-sep">:</div>
            <CountdownUnit value={timeLeft.hours} label="HOURS" />
            <div className="countdown-sep">:</div>
            <CountdownUnit value={timeLeft.minutes} label="MINUTES" />
            <div className="countdown-sep">:</div>
            <CountdownUnit value={timeLeft.seconds} label="SECONDS" />
          </div>
        </div>

        {/* HYPE BAR */}
        <div className="hype-section">
          <div className="hype-header">
            <span className="hype-label">HYPE METER</span>
            <span className="hype-pct">{ballPos.toFixed(1)}%</span>
          </div>

          <div className="hype-track-wrapper">
            {isHolding && (
              <>
                <div className="hype-hold-line hype-hold-top" style={{ width: `${holdProgress}%` }} />
                <div className="hype-hold-line hype-hold-bottom" style={{ width: `${holdProgress}%` }} />
              </>
            )}
            <div
              ref={trackRef}
              className="hype-track"
              onMouseDown={e => handleTrackDown(e.clientX)}
              onTouchStart={e => { e.preventDefault(); handleTrackDown(e.touches[0].clientX) }}
            >
              <div className="hype-fill" style={{ width: `${ballPos}%` }} />
              <div className={`hype-ball${isDragging ? ' dragging' : ''}`} style={{ left: `${ballPos}%` }} />
            </div>
          </div>

          <div className="hype-ends">
            <span>LAUNCH DAY</span>
            <span>365 DAYS OUT</span>
          </div>
          <p className="hype-hint">
            {isHolding
              ? `⚡ HOLD... ${Math.round(holdProgress)}% — DON'T LET GO`
              : 'DRAG THE BALL → HOLD AT 100% FOR 3s'}
          </p>
        </div>

        {/* BUTTONS */}
        <div className="buttons-row">
          <a href={TRAILER_URL} target="_blank" rel="noopener noreferrer" className="btn-trailer">▶ WATCH THE TRAILER</a>
          <button className={`btn-share${shareFlash ? ' share-flash' : ''}`} onClick={handleShare}>𝕏 SHARE THE HYPE</button>
        </div>

        {/* TAGLINE */}
        <div className="tagline-section">
          <p className="tagline"><span className="tagline-accent">Welcome</span> to Vice City</p>
          <p className="tagline-sub">The wait is almost over. Get ready.</p>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-line" />
        <p className="footer-text">
          Created by&nbsp;<RopeFooter />
        </p>
        <div className="footer-line" />
      </footer>
    </div>
  )
}
