'use client'
import { useState, useRef, useEffect } from 'react'

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}

const THRESHOLD_RATIO = 0.35

export default function RopeFooter() {
  const [revealed, setRevealed] = useState(false)
  const [pulling, setPulling] = useState(false)
  const [dragY, setDragY] = useState(0)

  const textRef = useRef<HTMLSpanElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDragging = useRef(false)
  const startClientY = useRef(0)
  const currentX = useRef(0)
  const currentY = useRef(0)
  const animRef = useRef<number>(0)
  const dragYRef = useRef(0)

  // AudioContext created on pointerdown (user gesture) so browsers/iframes allow it
  const audioCtxRef = useRef<AudioContext | null>(null)

  // Rope nodes for Verlet physics
  const nodes = useRef<{ x: number; y: number; px: number; py: number; pinned: boolean }[]>([])

  const SEGS = 20
  const SEG_LEN = 18
  const GRAVITY = 0.6
  const ITERS = 8

  const initRope = (anchorX: number, anchorY: number) => {
    const n = []
    for (let i = 0; i < SEGS; i++) {
      const y = anchorY - i * SEG_LEN
      n.push({ x: anchorX, y, px: anchorX, py: y, pinned: false })
    }
    n[0].pinned = true
    nodes.current = n
  }

  const stepRope = (cursorX: number, cursorY: number) => {
    const n = nodes.current
    if (!n.length) return

    n[SEGS - 1].x = cursorX
    n[SEGS - 1].y = cursorY

    for (let i = 0; i < SEGS; i++) {
      if (n[i].pinned || i === SEGS - 1) continue
      const vx = n[i].x - n[i].px
      const vy = n[i].y - n[i].py
      n[i].px = n[i].x
      n[i].py = n[i].y
      n[i].x += vx * 0.97
      n[i].y += vy * 0.97 + GRAVITY
    }

    for (let iter = 0; iter < ITERS; iter++) {
      if (n[0].pinned) { /* keep */ }
      for (let i = 0; i < SEGS - 1; i++) {
        const a = n[i]
        const b = n[i + 1]
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001
        const diff = (dist - SEG_LEN) / dist / 2
        if (!a.pinned && i !== SEGS - 1) {
          a.x += dx * diff
          a.y += dy * diff
        }
        if (!b.pinned && i + 1 !== SEGS - 1) {
          b.x -= dx * diff
          b.y -= dy * diff
        }
      }
    }
  }

  const drawRope = (ctx: CanvasRenderingContext2D) => {
    const n = nodes.current
    if (n.length < 2) return
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    const progress = Math.min(1, dragYRef.current / (window.innerHeight * THRESHOLD_RATIO))

    ctx.beginPath()
    ctx.moveTo(n[0].x, n[0].y)
    for (let i = 1; i < n.length; i++) {
      ctx.lineTo(n[i].x, n[i].y)
    }

    const g = Math.round(140 + progress * 100)
    ctx.strokeStyle = `rgb(255,${g},0)`
    ctx.lineWidth = 3 + progress * 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.shadowColor = `rgba(255, 160, 0, ${0.4 + progress * 0.4})`
    ctx.shadowBlur = 8 + progress * 12
    ctx.stroke()

    for (let i = 0; i < n.length; i += 4) {
      ctx.beginPath()
      ctx.arc(n[i].x, n[i].y, 2.5, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 200, 80, ${0.5 + progress * 0.5})`
      ctx.fill()
    }
  }

  const startLoop = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const loop = () => {
      stepRope(currentX.current, currentY.current)
      drawRope(ctx)
      animRef.current = requestAnimationFrame(loop)
    }
    loop()
  }

  const stopLoop = () => {
    cancelAnimationFrame(animRef.current)
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
  }

  useEffect(() => {
    if (!pulling) { stopLoop(); return }
    startLoop()
    return () => stopLoop()
  }, [pulling])

  const playBillieJean = async () => {
    try {
      const ctx = audioCtxRef.current
      if (!ctx) {
        // fallback: try regular Audio element
        const audio = new Audio('/media/billie-jean.mp3')
        audio.volume = 0.8
        audio.play().catch(() => {})
        return
      }
      if (ctx.state === 'suspended') {
        await ctx.resume()
      }
      const response = await fetch('/media/billie-jean.mp3')
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
      const source = ctx.createBufferSource()
      source.buffer = audioBuffer
      const gainNode = ctx.createGain()
      gainNode.gain.value = 0.8
      source.connect(gainNode)
      gainNode.connect(ctx.destination)
      source.start(0)
    } catch {
      // silently fail
    }
  }

  useEffect(() => {
    if (!pulling) return

    const handleMove = (e: PointerEvent) => {
      if (!isDragging.current) return
      const dy = startClientY.current - e.clientY
      const clamped = Math.max(0, dy)
      setDragY(clamped)
      dragYRef.current = clamped
      currentX.current = e.clientX
      currentY.current = e.clientY

      vibrate(1)

      const threshold = window.innerHeight * THRESHOLD_RATIO
      if (dy >= threshold) {
        isDragging.current = false
        stopLoop()
        setPulling(false)
        setDragY(0)
        dragYRef.current = 0
        vibrate([80, 40, 120, 40, 200])
        setRevealed(true)
        playBillieJean()
      }
    }

    const handleUp = () => {
      if (!isDragging.current) return
      isDragging.current = false
      stopLoop()
      setPulling(false)
      dragYRef.current = 0
      requestAnimationFrame(() => setDragY(0))
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [pulling])

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    if (!textRef.current) return

    // Create AudioContext here — inside user gesture — so browsers unlock audio
    if (!audioCtxRef.current) {
      try {
        type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext }
        const AudioCtx = window.AudioContext || (window as unknown as WebkitWindow).webkitAudioContext
        if (AudioCtx) audioCtxRef.current = new AudioCtx()
      } catch { /* ignore */ }
    } else if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {})
    }

    const rect = textRef.current.getBoundingClientRect()
    const anchorX = rect.left + rect.width / 2
    const anchorY = rect.top + rect.height / 2
    isDragging.current = true
    startClientY.current = e.clientY
    currentX.current = e.clientX
    currentY.current = e.clientY
    dragYRef.current = 0
    initRope(anchorX, anchorY)
    setPulling(true)
    vibrate(30)
  }

  const screenH = typeof window !== 'undefined' ? window.innerHeight : 800
  const pullProgress = Math.min(1, dragY / (screenH * THRESHOLD_RATIO))
  const textTranslateY = pulling ? -dragY * 0.9 : 0

  if (revealed) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        <img
          src="/media/flash-fm.webp"
          alt="Flash FM"
          style={{
            height: '38px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 14px rgba(255, 180, 0, 0.9)) drop-shadow(0 0 30px rgba(255, 100, 0, 0.5))',
            animation: 'modal-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both',
          }}
        />
      </span>
    )
  }

  return (
    <>
      {pulling && (
        <canvas
          ref={canvasRef}
          width={typeof window !== 'undefined' ? window.innerWidth : 1280}
          height={typeof window !== 'undefined' ? window.innerHeight : 800}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            pointerEvents: 'none',
          }}
        />
      )}
      <span
        ref={textRef}
        className={`footer-author${pulling ? ' pulling' : ''}`}
        onPointerDown={handlePointerDown}
        title="Drag up to reveal!"
        style={{
          transform: `translateY(${textTranslateY}px)`,
          transition: pulling ? 'none' : 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          filter: pulling
            ? `brightness(${1 + pullProgress}) drop-shadow(0 0 ${6 + pullProgress * 18}px rgba(255,160,0,0.9))`
            : undefined,
          display: 'inline-block',
          cursor: pulling ? 'grabbing' : 'grab',
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        Rashica07
      </span>
    </>
  )
}
