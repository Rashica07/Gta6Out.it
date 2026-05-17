import { useState, useEffect } from "react";

const RELEASE_DATE = new Date("2026-11-19T00:00:00");

function getTimeLeft() {
  const now = new Date();
  const diff = RELEASE_DATE.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="countdown-unit">
      <div className="countdown-number">{String(value).padStart(2, "0")}</div>
      <div className="countdown-label">{label}</div>
    </div>
  );
}

export default function Home() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    }, 4000);
    return () => clearInterval(glitchInterval);
  }, []);

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
