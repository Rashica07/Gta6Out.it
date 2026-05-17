import { useState, useEffect, useRef, useCallback } from "react";

const RELEASE_DATE = new Date("2026-11-19T00:00:00");
const ANNOUNCE_DATE = new Date("2023-12-05T00:00:00");
const TRAILER_URL = "https://www.youtube.com/watch?v=QdBZExpvEZs";

function getTimeLeft() {
  const now = new Date();
  const diff = RELEASE_DATE.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds, done: false };
}

function getHypeProgress() {
  const total = RELEASE_DATE.getTime() - ANNOUNCE_DATE.getTime();
  const elapsed = Date.now() - ANNOUNCE_DATE.getTime();
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="countdown-unit">
      <div className="countdown-number">{String(value).padStart(2, "0")}</div>
      <div className="countdown-label">{label}</div>
    </div>
  );
}

function Fireworks({ canvasRef }: { canvasRef: React.RefObject<HTMLCanvasElement | null> }) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#ff00cc", "#cc00ff", "#ff50aa", "#ffffff", "#aa00ff", "#ff80ee", "#00ffee"];
    const particles: {
      x: number; y: number; vx: number; vy: number;
      alpha: number; color: string; size: number;
    }[] = [];

    function spawnBurst(x: number, y: number) {
      for (let i = 0; i < 80; i++) {
        const angle = (Math.PI * 2 * i) / 80;
        const speed = 3 + Math.random() * 8;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 2 + Math.random() * 4,
        });
      }
    }

    let frame = 0;
    let animId: number;

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      if (frame % 40 === 0) {
        spawnBurst(
          100 + Math.random() * (canvas!.width - 200),
          50 + Math.random() * (canvas!.height / 2)
        );
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.alpha -= 0.012;
        if (p.alpha <= 0) { particles.splice(i, 1); continue; }
        ctx!.save();
        ctx!.globalAlpha = p.alpha;
        ctx!.fillStyle = p.color;
        ctx!.shadowBlur = 10;
        ctx!.shadowColor = p.color;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      }

      frame++;
      animId = requestAnimationFrame(animate);
    }

    spawnBurst(canvas.width / 2, canvas.height / 3);
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [canvasRef]);

  return null;
}

export default function Home() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());
  const [glitch, setGlitch] = useState(false);
  const [hype] = useState(getHypeProgress);
  const [shareFlash, setShareFlash] = useState(false);
  const fireworksRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timeLeft.done) return;
    const glitchInterval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    }, 4000);
    return () => clearInterval(glitchInterval);
  }, [timeLeft.done]);

  const handleShare = useCallback(() => {
    const text = `GTA 6 drops in ${timeLeft.days} days! 🎮🔥 Are you ready? #GTA6 #GrandTheftAuto`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setShareFlash(true);
    setTimeout(() => setShareFlash(false), 1000);
  }, [timeLeft.days]);

  if (timeLeft.done) {
    return (
      <div className="page-wrapper released-wrapper">
        <canvas ref={fireworksRef} className="fireworks-canvas" />
        <Fireworks canvasRef={fireworksRef} />
        <div className="released-content">
          <div className="released-label">IT'S HERE</div>
          <img
            src="/media/gta6-logo.svg"
            alt="Grand Theft Auto VI"
            className="gta-logo released-logo"
          />
          <div className="released-title">GTA 6 IS OUT NOW!</div>
          <p className="released-sub">The wait is finally over. Vice City awaits.</p>
          <a
            href={TRAILER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-trailer"
          >
            ▶ WATCH THE TRAILER
          </a>
        </div>
        <footer className="footer">
          <div className="footer-line" />
          <p className="footer-text">Created by <span className="footer-author">Rashica07</span></p>
          <div className="footer-line" />
        </footer>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="bg-layer" />
      <div className="noise-overlay" />
      <div className="grid-overlay" />

      <main className="content">
        <div className="logo-section">
          <img
            src="/media/gta6-logo.svg"
            alt="Grand Theft Auto VI"
            className={`gta-logo ${glitch ? "glitch" : ""}`}
          />
        </div>

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

        <div className="hype-section">
          <div className="hype-header">
            <span className="hype-label">HYPE METER</span>
            <span className="hype-pct">{hype.toFixed(1)}%</span>
          </div>
          <div className="hype-track">
            <div className="hype-fill" style={{ width: `${hype}%` }} />
            <div className="hype-glow" style={{ left: `${hype}%` }} />
          </div>
          <div className="hype-ends">
            <span>DEC 2023</span>
            <span>NOV 2026</span>
          </div>
        </div>

        <div className="buttons-row">
          <a
            href={TRAILER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-trailer"
          >
            ▶ WATCH THE TRAILER
          </a>
          <button
            className={`btn-share ${shareFlash ? "share-flash" : ""}`}
            onClick={handleShare}
          >
            𝕏 SHARE THE HYPE
          </button>
        </div>

        <div className="tagline-section">
          <p className="tagline">
            <span className="tagline-accent">Welcome</span> to Vice City
          </p>
          <p className="tagline-sub">The wait is almost over. Get ready.</p>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-line" />
        <p className="footer-text">Created by <span className="footer-author">Rashica07</span></p>
        <div className="footer-line" />
      </footer>
    </div>
  );
}
