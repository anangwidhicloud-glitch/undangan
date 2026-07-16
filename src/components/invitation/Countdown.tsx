'use client';

import { useEffect, useMemo, useState } from 'react';

export function calculateCountdown(target: string, now = Date.now()) {
  const targetTime = new Date(target).getTime();
  if (!Number.isFinite(targetTime))
    return {
      valid: false,
      ended: false,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  const difference = targetTime - now;
  if (difference <= 0)
    return {
      valid: true,
      ended: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  return {
    valid: true,
    ended: false,
    days: Math.floor(difference / 86_400_000),
    hours: Math.floor((difference / 3_600_000) % 24),
    minutes: Math.floor((difference / 60_000) % 60),
    seconds: Math.floor((difference / 1_000) % 60),
  };
}

export function Countdown({
  target,
  pastMessage,
  variant = 'light',
}: {
  target: string;
  pastMessage: string;
  variant?: 'light' | 'dark';
}) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const timer = window.setTimeout(tick, 0);
    const interval = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, []);
  const countdown = useMemo(
    () => calculateCountdown(target, now),
    [target, now],
  );

  const isDark = variant === 'dark';

  if (now === 0)
    return (
      <div
        className={`h-28 animate-pulse rounded-[2rem] ${isDark ? 'bg-white/8' : 'bg-black/5'}`}
        aria-label="Memuat hitung mundur"
      />
    );
  if (!countdown.valid)
    return (
      <p className="rounded-3xl border border-amber-300 bg-amber-50 p-5 text-center text-amber-950">
        Tanggal pernikahan belum ditentukan.
      </p>
    );
  if (countdown.ended)
    return (
      <p
        className={`mx-auto max-w-xl text-center text-lg leading-relaxed ${isDark ? 'text-white/75' : ''}`}
      >
        {pastMessage}
      </p>
    );

  const units = [
    ['Hari', countdown.days],
    ['Jam', countdown.hours],
    ['Menit', countdown.minutes],
    ['Detik', countdown.seconds],
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4" aria-live="polite">
      {units.map(([label, value], index) => (
        <div
          key={String(label)}
          className={`theme-countdown-cell countdown-cell relative overflow-hidden rounded-[1.35rem] px-1 py-4 text-center sm:rounded-[1.8rem] sm:px-3 sm:py-6 ${
            isDark
              ? 'border border-white/12 bg-white/[.055] text-white shadow-[0_24px_70px_rgba(0,0,0,.2)] backdrop-blur-xl'
              : 'border border-[var(--gold)]/20 bg-white/70 shadow-[0_22px_50px_rgba(33,29,22,.07)] backdrop-blur-xl'
          }`}
        >
          <span
            className={`absolute top-2 left-3 text-[8px] font-bold tracking-[.22em] ${isDark ? 'text-white/20' : 'text-black/15'}`}
          >
            0{index + 1}
          </span>
          <div
            className={`font-display text-3xl leading-none font-medium text-[var(--theme-accent)] tabular-nums sm:text-5xl lg:text-6xl`}
          >
            {String(value).padStart(2, '0')}
          </div>
          <div
            className={`mt-2 text-[9px] font-bold tracking-[.18em] uppercase sm:text-[11px] ${isDark ? 'text-white/45' : 'text-black/45'}`}
          >
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
