'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import ThreeExplosion from './ThreeExplosion'
import RopeFooter from './RopeFooter'
import ShareCard from './ShareCard'

const RELEASE_DATE = new Date('2026-11-19T00:00:00')
const TRAILER_URL = 'https://www.youtube.com/watch?v=VQRLujxTm3c'
const SITE_URL = 'https://gta6out.it'
const EASTER_EGG_TEXT = 'You discovered the real GTA VI'
const HOLD_DURATION = 3000

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']

const POLICE_MESSAGES = [
  'ALL UNITS — SUSPECT SPOTTED ON OCEAN DRIVE. RESPOND IMMEDIATELY.',
  'DISPATCH: CODE RED AT THE STRIP. ALL AVAILABLE UNITS.',
  'SUSPECT IS ARMED AND CONSIDERED EXTREMELY DANGEROUS.',
  'VCPD HELICOPTER IS IN PURSUIT. ALL UNITS STAND BY.',
  'OFFICER DOWN. REQUESTING IMMEDIATE BACKUP. NOT A DRILL.',
  'SUSPECT LAST SEEN HEADING SOUTHBOUND ON VICE BEACH BLVD.',
  'SUSPECT HAS STOLEN A POLICE VEHICLE. REPEAT: OFFICER\'S CRUISER IS GONE.',
  'ALL UNITS: DO NOT LET THEM REACH THE PORT. BLOCK ALL EXITS.',
]

const GTA_TIPS = [
  'If you\'ve got a wanted level, find a Pay N Spray and lay low — the cops will lose track of you fast.',
  'Need quick cash? Rob a store at night. Just keep moving before backup arrives.',
  'Always keep a snack in your pocket. Hospitals are expensive and respawning wastes time.',
  'Steal a fast car before a mission. You can\'t outrun trouble in a rusted hatchback.',
  'Wanted level getting high? Drive into the water — most cops won\'t follow you there.',
  'A suppressed weapon keeps things quiet. Loud guns wake up the whole neighbourhood.',
  'The longer you stay in one spot with a wanted level, the tighter the search radius gets. Keep moving.',
  'Buy property early. Passive income means you never have to rob a corner store again.',
  'Helicopters are game-changers. Learn where they spawn and claim one before the mission gets messy.',
  'Even if you\'re the best driver in Vice City, wearing a seatbelt doesn\'t hurt.',
  'Three stars? Get off the highway. Alleys and back streets confuse patrol routes.',
  'Blow up a police car blocking your path — it\'s faster than arguing with the bumper.',
  'Keep an eye on your minimap. A blinking dot means someone already called the cops on you.',
  'Max your armour before any big job. Body armour eats damage so your health doesn\'t have to.',
  'If the heat is too heavy, change your outfit. A fresh look resets witness recognition.',
]

const GTA_CHEATS = ['HESOYAM','LXGIWYL','FULLCLIP','OUIQDMW','AEZAKMI','BRINGITON','YECGAA','LJSPQK','CPKTNWT','AIYPWZQP']

// ─── Audio: synthesised police siren via Web Audio API ───
function playSiren(durationMs: number): () => void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return () => {}
    const ctx = new AudioCtx()

    const master = ctx.createGain()
    master.gain.value = 0.09
    master.connect(ctx.destination)

    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.connect(master)

    // WAIL pattern: 660 Hz → 1340 Hz cycle
    const cycle = 0.88
    const cycles = Math.ceil(durationMs / 1000 / cycle) + 2
    for (let i = 0; i < cycles; i++) {
      const t = ctx.currentTime + i * cycle
      osc.frequency.setValueAtTime(660, t)
      osc.frequency.exponentialRampToValueAtTime(1340, t + cycle * 0.48)
      osc.frequency.exponentialRampToValueAtTime(660, t + cycle)
    }

    // Fade out in last 0.6 s
    const end = ctx.currentTime + durationMs / 1000
    master.gain.setValueAtTime(0.09, end - 0.6)
    master.gain.linearRampToValueAtTime(0, end)

    osc.start()
    osc.stop(end)
    return () => { try { ctx.close() } catch { /* ignore */ } }
  } catch {
    return () => {}
  }
}

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

// ─── Vice City star SVG ───
function VCStar({ index }: { index: number }) {
  const id = `sg${index}`
  return (
    <svg className="vc-star" viewBox="0 0 100 95" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={id} cx="50%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#ffffc0" />
          <stop offset="35%" stopColor="#ffd700" />
          <stop offset="80%" stopColor="#ff9500" />
          <stop offset="100%" stopColor="#cc5500" />
        </radialGradient>
        <filter id={`gf${index}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
          <feFlood floodColor="#ff8800" floodOpacity="0.7" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <polygon
        points="50,4 61.8,36 95,36 68.5,57 79,90 50,69.5 21,90 31.5,57 5,36 38.2,36"
        fill={`url(#${id})`}
        stroke="#b05000"
        strokeWidth="1.5"
        filter={`url(#gf${index})`}
      />
    </svg>
  )
}

// ─── Police light bar (red-white-blue strobe at top) ───
function PoliceLightBar() {
  return (
    <div className="police-bar" aria-hidden="true">
      <div className="police-segment red-a" />
      <div className="police-segment red-b" />
      <div className="police-segment white-m" />
      <div className="police-segment white-m2" />
      <div className="police-segment blue-a" />
      <div className="police-segment blue-b" />
    </div>
  )
}

// ─── Vice City Tip Overlay ───
function TipOverlay({ tip, onClose }: { tip: string; onClose: () => void }) {
  const typed = useTypewriter(tip, true, 28)
  const isDone = typed.length >= tip.length
  return (
    <div className="tip-overlay" onClick={onClose}>
      <div className="tip-modal" onClick={e => e.stopPropagation()}>
        <div className="tip-badge">VICE CITY TIP</div>
        <div className="tip-star">★</div>
        <p className="tip-text">
          {typed}{!isDone && <span className="egg-cursor">|</span>}
        </p>
        <div className="tip-dismiss">TAP ANYWHERE TO CLOSE</div>
      </div>
    </div>
  )
}

// ─── Easter Egg: Wanted Level Overlay ───
function WantedOverlay({ onClose }: { onClose: () => void }) {
  const msg = useRef(POLICE_MESSAGES[Math.floor(Math.random() * POLICE_MESSAGES.length)])
  const typed = useTypewriter(msg.current, true, 36)

  useEffect(() => {
    const stop = playSiren(5200)
    return stop
  }, [])

  return (
    <div className="wanted-overlay" onClick={onClose}>
      <PoliceLightBar />
      <div className="vc-stars-row">
        {Array.from({ length: 6 }).map((_, i) => <VCStar key={i} index={i} />)}
      </div>
      <div className="wanted-title">6-STAR WANTED LEVEL</div>
      <div className="wanted-radio">
        <span className="wanted-radio-label">VCPD DISPATCH ▶</span>
        <span className="wanted-radio-text">{typed}</span>
      </div>
      <div className="wanted-dismiss">TAP ANYWHERE TO ESCAPE</div>
    </div>
  )
}

// ─── Easter Egg: Rockstar Reveal ───
function RockstarReveal({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400)
    const t2 = setTimeout(() => setPhase(2), 1200)
    const t3 = setTimeout(() => { onClose() }, 3800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onClose])
  const presents = useTypewriter('PRESENTS', phase >= 2, 80)
  return (
    <div className="rockstar-overlay" onClick={onClose}>
      <div className={`rockstar-logo ${phase >= 1 ? 'visible' : ''}`}>R★</div>
      <div className={`rockstar-name ${phase >= 1 ? 'visible' : ''}`}>ROCKSTAR GAMES</div>
      <div className={`rockstar-presents ${phase >= 2 ? 'visible' : ''}`}>
        {presents}<span className="egg-cursor">|</span>
      </div>
    </div>
  )
}

// ─── Easter Egg: Cheat Code Flash ───
function CheatFlash({ code, onDone }: { code: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t) }, [onDone])
  return (
    <div className="cheat-flash">
      <div className="cheat-accepted">CHEAT CODE ACCEPTED</div>
      <div className="cheat-code">{code}</div>
    </div>
  )
}

function CountdownUnit({ value, label, onLongPress }: { value: number; label: string; onLongPress?: () => void }) {
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startLong = () => {
    if (!onLongPress) return
    holdTimer.current = setTimeout(() => { vibrate([50, 30, 80]); onLongPress() }, 2500)
  }
  const cancelLong = () => { if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null } }
  return (
    <div className="countdown-unit">
      <div
        className="countdown-number"
        onPointerDown={startLong}
        onPointerUp={cancelLong}
        onPointerLeave={cancelLong}
        style={onLongPress ? { cursor: 'pointer', userSelect: 'none', touchAction: 'none' } : undefined}
      >
        {String(value).padStart(2, '0')}
      </div>
      <div className="countdown-label">{label}</div>
    </div>
  )
}

function Fireworks() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    canvas.width = window.innerWidth; canvas.height = window.innerHeight
    const colors = ['#ff00cc','#cc00ff','#ff50aa','#fff','#aa00ff','#ff8c00','#ffcc00','#ff4500']
    const particles: { x: number; y: number; vx: number; vy: number; a: number; c: string; s: number }[] = []
    const burst = (x: number, y: number) => {
      for (let i = 0; i < 90; i++) {
        const angle = (Math.PI * 2 * i) / 90; const speed = 3 + Math.random() * 9
        particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, a: 1, c: colors[Math.floor(Math.random() * colors.length)], s: 2 + Math.random() * 4 })
      }
    }
    let frame = 0; let id: number
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
          {typed}{!isDone && <span className="egg-cursor">|</span>}
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
  const [showShareCard, setShowShareCard] = useState(false)
  const [showWanted, setShowWanted] = useState(false)
  const [showRockstar, setShowRockstar] = useState(false)
  const [cheatCode, setCheatCode] = useState<string | null>(null)
  const [showTip, setShowTip] = useState(false)
  const [currentTip, setCurrentTip] = useState('')

  // Keyboard tracking refs
  const konamiProgress = useRef<string[]>([])
  const typedBuffer = useRef('')

  // Logo click counter
  const logoClickCount = useRef(0)
  const logoClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Hype ball triple-click
  const ballClickCount = useRef(0)
  const ballClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Tagline long-press (mobile ROCKSTAR)
  const taglinePressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Hype bar
  const trackRef = useRef<HTMLDivElement>(null)
  const [ballPos, setBallPos] = useState(50.8)
  const [isDragging, setIsDragging] = useState(false)
  const [isHolding, setIsHolding] = useState(false)
  const [holdProgress, setHoldProgress] = useState(0)
  const holdInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const holdStart = useRef(0)
  const isDraggingRef = useRef(false)

  // Init — countdown + hype bar tick every second
  useEffect(() => {
    setTimeLeft(getTimeLeft())
    setBallPos(getAutoHype())
    const iv = setInterval(() => {
      setTimeLeft(getTimeLeft())
      if (!isDraggingRef.current) setBallPos(getAutoHype())
    }, 1000)
    return () => clearInterval(iv)
  }, [])

  // Glitch effect
  useEffect(() => {
    if (timeLeft.done) return
    const gi = setInterval(() => { setGlitch(true); setTimeout(() => setGlitch(false), 220) }, 4200)
    return () => clearInterval(gi)
  }, [timeLeft.done])

  // ─── Global keyboard easter eggs ───
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEasterEggOpen(false); setShowWanted(false)
        setShowRockstar(false); setShowTip(false); return
      }
      // Konami Code
      const expected = KONAMI[konamiProgress.current.length]
      if (e.key === expected) {
        konamiProgress.current.push(e.key)
        if (konamiProgress.current.length === KONAMI.length) {
          konamiProgress.current = []
          vibrate([200, 100, 200, 100, 200])
          setShowWanted(true)
        }
      } else {
        konamiProgress.current = e.key === KONAMI[0] ? [e.key] : []
      }
      // Type "ROCKSTAR"
      if (/^[a-zA-Z]$/.test(e.key)) {
        typedBuffer.current = (typedBuffer.current + e.key.toLowerCase()).slice(-8)
        if (typedBuffer.current === 'rockstar') {
          typedBuffer.current = ''
          vibrate([60, 40, 120])
          setShowRockstar(true)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ─── Shake detection (mobile Konami alternative) ───
  useEffect(() => {
    if (typeof window === 'undefined') return
    let lastShakeTime = 0
    let prevMag = 0

    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity
      if (!acc) return
      const mag = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2)
      const delta = Math.abs(mag - prevMag)
      prevMag = mag
      if (delta > 20) {
        const now = Date.now()
        if (now - lastShakeTime > 3000) {
          lastShakeTime = now
          vibrate([100, 50, 100, 50, 200])
          setShowWanted(true)
        }
      }
    }

    const setup = async () => {
      if (typeof (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function') {
        try {
          const perm = await (DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission()
          if (perm === 'granted') window.addEventListener('devicemotion', handleMotion)
        } catch { /* iOS permission denied */ }
      } else {
        window.addEventListener('devicemotion', handleMotion)
      }
    }
    setup()
    return () => window.removeEventListener('devicemotion', handleMotion)
  }, [])

  // ─── Logo Easter Egg (5 clicks) ───
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

  // ─── Tagline long-press → ROCKSTAR reveal (mobile) ───
  const startTaglineLong = useCallback(() => {
    taglinePressTimer.current = setTimeout(() => {
      vibrate([60, 40, 120])
      setShowRockstar(true)
    }, 2500)
  }, [])
  const cancelTaglineLong = useCallback(() => {
    if (taglinePressTimer.current) { clearTimeout(taglinePressTimer.current); taglinePressTimer.current = null }
  }, [])

  // ─── Hype ball triple-click → cheat code ───
  const handleBallClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    ballClickCount.current += 1
    if (ballClickCount.current >= 3) {
      ballClickCount.current = 0
      if (ballClickTimer.current) clearTimeout(ballClickTimer.current)
      const code = GTA_CHEATS[Math.floor(Math.random() * GTA_CHEATS.length)]
      vibrate([30, 20, 30, 20, 80])
      setCheatCode(code)
      return
    }
    if (ballClickTimer.current) clearTimeout(ballClickTimer.current)
    ballClickTimer.current = setTimeout(() => { ballClickCount.current = 0 }, 600)
  }, [])

  // ─── Hype Bar Drag ───
  const clearHold = useCallback(() => {
    if (holdInterval.current) { clearInterval(holdInterval.current); holdInterval.current = null }
    setIsHolding(false); setHoldProgress(0)
  }, [])

  const startHold = useCallback(() => {
    if (holdInterval.current) return
    holdStart.current = Date.now()
    setIsHolding(true); vibrate(40)
    holdInterval.current = setInterval(() => {
      const elapsed = Date.now() - holdStart.current
      const pct = Math.min(100, (elapsed / HOLD_DURATION) * 100)
      setHoldProgress(pct)
      if (pct >= 100) {
        clearInterval(holdInterval.current!); holdInterval.current = null
        setIsHolding(false); setHoldProgress(0)
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
    if (pos >= 99) startHold(); else clearHold()
  }, [startHold, clearHold])

  useEffect(() => {
    if (!isDragging) return
    const onMove = (e: MouseEvent) => { if (isDraggingRef.current) updateBall(e.clientX) }
    const onTouch = (e: TouchEvent) => { if (isDraggingRef.current) updateBall(e.touches[0].clientX) }
    const onEnd = () => {
      setIsDragging(false); isDraggingRef.current = false
      clearHold(); setBallPos(getAutoHype())
    }
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
    setIsDragging(true); isDraggingRef.current = true; updateBall(clientX)
  }

  const handleShare = useCallback(() => {
    const text = `🚨 GTA 6 drops in ${timeLeft.days} days, ${timeLeft.hours} hours & ${timeLeft.minutes} minutes!\nVice City is almost here 🎮🔥\n\nTrack it 👉 ${SITE_URL}\n\n#GTA6 #GrandTheftAutoVI #RockstarGames`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
    setShareFlash(true); setTimeout(() => setShareFlash(false), 1000)
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

      {/* Easter Egg Overlays */}
      <EasterEggModal isOpen={easterEggOpen} onClose={() => setEasterEggOpen(false)} />
      {showWanted && <WantedOverlay onClose={() => setShowWanted(false)} />}
      {showTip && <TipOverlay tip={currentTip} onClose={() => setShowTip(false)} />}
      {showRockstar && <RockstarReveal onClose={() => setShowRockstar(false)} />}
      {cheatCode && <CheatFlash code={cheatCode} onDone={() => setCheatCode(null)} />}
      {showShareCard && (
        <ShareCard
          days={timeLeft.days} hours={timeLeft.hours}
          minutes={timeLeft.minutes} seconds={timeLeft.seconds}
          hype={ballPos} onClose={() => setShowShareCard(false)}
        />
      )}

      <main className="content">
        {/* LOGO — 5 clicks for easter egg */}
        <div className="logo-section">
          <img
            src="/media/gta6-logo.svg"
            alt="Grand Theft Auto VI"
            className={`gta-logo${glitch ? ' glitch' : ''}`}
            onClick={handleLogoClick}
            draggable={false}
          />
        </div>

        {/* COUNTDOWN — long-press DAYS for wanted level */}
        <div className="countdown-section">
          <p className="countdown-heading">RELEASING NOVEMBER 19, 2026</p>
          <div className="countdown-grid">
            <CountdownUnit value={timeLeft.days} label="DAYS" onLongPress={() => { vibrate([100,50,100,50,200]); setCurrentTip(GTA_TIPS[Math.floor(Math.random() * GTA_TIPS.length)]); setShowTip(true) }} />
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
              <div
                className="hype-fill"
                style={{
                  width: `${ballPos}%`,
                  transition: isDragging ? 'none' : 'width 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                }}
              />
              <div
                className={`hype-ball${isDragging ? ' dragging' : ''}`}
                style={{
                  left: `${ballPos}%`,
                  transition: isDragging
                    ? 'transform 0.1s ease, box-shadow 0.2s ease'
                    : 'left 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.1s ease, box-shadow 0.2s ease',
                }}
                onClick={handleBallClick}
              />
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
          <button className="btn-card" onClick={() => setShowShareCard(true)}>🎴 MY HYPE CARD</button>
        </div>

        {/* TAGLINE — long-press for ROCKSTAR reveal on mobile */}
        <div
          className="tagline-section"
          onPointerDown={startTaglineLong}
          onPointerUp={cancelTaglineLong}
          onPointerLeave={cancelTaglineLong}
          style={{ touchAction: 'none', userSelect: 'none' }}
        >
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
