'use client'
import { useEffect, useRef, useState } from 'react'

interface Props {
  days: number
  hours: number
  minutes: number
  seconds: number
  hype: number
  onClose: () => void
}

function drawCard(
  canvas: HTMLCanvasElement,
  days: number,
  hours: number,
  minutes: number,
  hype: number,
) {
  const W = 600
  const H = 314
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // ── Background ──
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#0a0010')
  bg.addColorStop(0.5, '#160025')
  bg.addColorStop(1, '#0a001a')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // ── Grid lines ──
  ctx.strokeStyle = 'rgba(180,0,255,0.05)'
  ctx.lineWidth = 1
  for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
  for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }

  // ── Glow blobs ──
  const glow1 = ctx.createRadialGradient(W * 0.2, H * 0.3, 0, W * 0.2, H * 0.3, 200)
  glow1.addColorStop(0, 'rgba(180,0,255,0.18)')
  glow1.addColorStop(1, 'transparent')
  ctx.fillStyle = glow1
  ctx.fillRect(0, 0, W, H)

  const glow2 = ctx.createRadialGradient(W * 0.8, H * 0.7, 0, W * 0.8, H * 0.7, 180)
  glow2.addColorStop(0, 'rgba(255,100,0,0.12)')
  glow2.addColorStop(1, 'transparent')
  ctx.fillStyle = glow2
  ctx.fillRect(0, 0, W, H)

  // ── Border ──
  ctx.strokeStyle = 'rgba(180,0,255,0.3)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(1, 1, W - 2, H - 2)

  // ── Inner accent lines ──
  ctx.strokeStyle = 'rgba(255,140,0,0.15)'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(20, 20); ctx.lineTo(W - 20, 20); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(20, H - 20); ctx.lineTo(W - 20, H - 20); ctx.stroke()

  // ── "GRAND THEFT AUTO" label ──
  ctx.font = '700 13px Rajdhani, sans-serif'
  ctx.letterSpacing = '0.3em'
  ctx.fillStyle = 'rgba(208,128,255,0.85)'
  ctx.textAlign = 'left'
  ctx.fillText('GRAND THEFT AUTO', 32, 50)

  // ── "VI" big ──
  ctx.font = '900 72px "Bebas Neue", sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = 'rgba(200,0,255,0.9)'
  ctx.shadowBlur = 28
  ctx.fillText('VI', 28, 128)
  ctx.shadowBlur = 0

  // ── Divider ──
  const div = ctx.createLinearGradient(28, 0, 220, 0)
  div.addColorStop(0, 'rgba(200,0,255,0.8)')
  div.addColorStop(0.5, 'rgba(255,140,0,0.6)')
  div.addColorStop(1, 'transparent')
  ctx.strokeStyle = div
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(28, 138); ctx.lineTo(220, 138); ctx.stroke()

  // ── Days countdown ──
  ctx.font = '900 96px "Bebas Neue", sans-serif'
  const dayGrad = ctx.createLinearGradient(28, 140, 28, 240)
  dayGrad.addColorStop(0, '#ffffff')
  dayGrad.addColorStop(0.4, '#ff9000')
  dayGrad.addColorStop(1, '#e080ff')
  ctx.fillStyle = dayGrad
  ctx.shadowColor = 'rgba(255,140,0,0.5)'
  ctx.shadowBlur = 20
  ctx.fillText(String(days), 28, 240)
  ctx.shadowBlur = 0

  ctx.font = '700 14px Rajdhani, sans-serif'
  ctx.fillStyle = 'rgba(176,96,232,0.9)'
  ctx.fillText('DAYS UNTIL RELEASE', 28, 262)

  // ── Hours / minutes sub-line ──
  ctx.font = '600 12px Rajdhani, sans-serif'
  ctx.fillStyle = 'rgba(150,80,200,0.7)'
  ctx.fillText(`${String(hours).padStart(2,'0')}h  ${String(minutes).padStart(2,'0')}m`, 28, 285)

  // ── Right panel: hype ──
  const RX = 340
  const RW = 230

  // Hype label
  ctx.font = '700 10px Rajdhani, sans-serif'
  ctx.fillStyle = 'rgba(208,128,255,0.7)'
  ctx.textAlign = 'left'
  ctx.fillText('HYPE METER', RX, 72)

  // Hype percentage big
  ctx.font = '900 62px "Bebas Neue", sans-serif'
  const hypeGrad = ctx.createLinearGradient(RX, 80, RX + 160, 140)
  hypeGrad.addColorStop(0, '#ff8c00')
  hypeGrad.addColorStop(0.5, '#e080ff')
  hypeGrad.addColorStop(1, '#ff50cc')
  ctx.fillStyle = hypeGrad
  ctx.shadowColor = 'rgba(200,0,255,0.6)'
  ctx.shadowBlur = 16
  ctx.fillText(`${hype.toFixed(1)}%`, RX, 148)
  ctx.shadowBlur = 0

  // Hype bar track
  const BAR_Y = 164
  const BAR_H = 8
  ctx.fillStyle = 'rgba(255,255,255,0.06)'
  ctx.beginPath()
  ctx.roundRect(RX, BAR_Y, RW, BAR_H, 4)
  ctx.fill()

  // Hype bar fill
  const fillW = (hype / 100) * RW
  const barGrad = ctx.createLinearGradient(RX, 0, RX + RW, 0)
  barGrad.addColorStop(0, '#7b00ff')
  barGrad.addColorStop(0.4, '#c000ff')
  barGrad.addColorStop(0.7, '#ff50cc')
  barGrad.addColorStop(1, '#ff8c00')
  ctx.fillStyle = barGrad
  ctx.shadowColor = 'rgba(200,0,255,0.8)'
  ctx.shadowBlur = 10
  ctx.beginPath()
  ctx.roundRect(RX, BAR_Y, fillW, BAR_H, 4)
  ctx.fill()
  ctx.shadowBlur = 0

  // Hype bar ball
  const ballX = RX + fillW
  ctx.beginPath()
  ctx.arc(ballX, BAR_Y + BAR_H / 2, 7, 0, Math.PI * 2)
  ctx.fillStyle = '#fff'
  ctx.shadowColor = '#ff50cc'
  ctx.shadowBlur = 14
  ctx.fill()
  ctx.shadowBlur = 0

  // "MY HYPE" sub-label
  ctx.font = '600 10px Rajdhani, sans-serif'
  ctx.fillStyle = 'rgba(150,80,200,0.7)'
  ctx.fillText('DRAG TO 100% IN THE REAL SITE →', RX, 190)

  // ── Release date ──
  ctx.font = '700 11px Rajdhani, sans-serif'
  ctx.fillStyle = 'rgba(180,90,230,0.6)'
  ctx.fillText('NOV 19, 2026  ·  VICE CITY AWAITS', RX, 225)

  // ── URL badge ──
  ctx.fillStyle = 'rgba(255,140,0,0.12)'
  ctx.beginPath()
  ctx.roundRect(RX, 240, RW, 28, 6)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,140,0,0.3)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(RX, 240, RW, 28, 6)
  ctx.stroke()

  ctx.font = '700 12px Rajdhani, sans-serif'
  ctx.fillStyle = '#ff9040'
  ctx.textAlign = 'center'
  ctx.fillText('gta6out.it', RX + RW / 2, 259)

  // ── Corner accent dots ──
  for (const [cx, cy] of [[20, 20], [W - 20, 20], [20, H - 20], [W - 20, H - 20]] as [number,number][]) {
    ctx.beginPath()
    ctx.arc(cx, cy, 3, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(200,0,255,0.6)'
    ctx.fill()
  }
}

export default function ShareCard({ days, hours, minutes, seconds, hype, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [imgUrl, setImgUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    document.fonts.ready.then(() => {
      drawCard(canvas, days, hours, minutes, hype)
      setImgUrl(canvas.toDataURL('image/png'))
    })
  }, [days, hours, minutes, hype])

  const handleDownload = () => {
    if (!imgUrl) return
    const a = document.createElement('a')
    a.href = imgUrl
    a.download = `gta6-hype-${hype.toFixed(0)}pct.png`
    a.click()
  }

  const handleShare = () => {
    const text = `🎮 ${days} days until GTA 6 drops — my hype is at ${hype.toFixed(1)}%!\n\nVice City awaits. Are you ready? 🔥\n\n#GTA6 #GrandTheftAutoVI\ngta6out.it`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  }

  const handleCopy = async () => {
    if (!canvasRef.current) return
    canvasRef.current.toBlob(async (blob) => {
      if (!blob) return
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        handleDownload()
      }
    })
  }

  return (
    <div className="sharecard-backdrop" onClick={onClose}>
      <div className="sharecard-modal" onClick={e => e.stopPropagation()}>
        <div className="sharecard-header">
          <span className="sharecard-title">YOUR HYPE CARD</span>
          <button className="sharecard-x" onClick={onClose}>✕</button>
        </div>

        <div className="sharecard-preview">
          <canvas ref={canvasRef} style={{ display: imgUrl ? 'none' : 'block', width: '100%' }} />
          {imgUrl && (
            <img src={imgUrl} alt="GTA 6 Hype Card" className="sharecard-img" />
          )}
          {!imgUrl && <div className="sharecard-generating">Generating...</div>}
        </div>

        <div className="sharecard-actions">
          <button className="sharecard-btn sharecard-download" onClick={handleDownload}>
            ↓ SAVE IMAGE
          </button>
          <button className="sharecard-btn sharecard-copy" onClick={handleCopy}>
            {copied ? '✓ COPIED!' : '⊡ COPY IMAGE'}
          </button>
          <button className="sharecard-btn sharecard-tweet" onClick={handleShare}>
            𝕏 SHARE ON X
          </button>
        </div>

        <p className="sharecard-hint">Save the image and attach it to your post for maximum hype</p>
      </div>
    </div>
  )
}
