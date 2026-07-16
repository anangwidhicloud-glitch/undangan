'use client';

import {
  BookHeart,
  CalendarDays,
  Heart,
  Home,
  Images,
  Menu,
  MessageCircleHeart,
  Share2,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { NavigationStyle } from '@/types/wedding';

const items = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'couple', label: 'Mempelai', icon: Heart },
  { id: 'events', label: 'Acara', icon: CalendarDays },
  { id: 'story', label: 'Our Story', icon: BookHeart },
  { id: 'gallery', label: 'Galeri', icon: Images },
  { id: 'rsvp', label: 'RSVP', icon: MessageCircleHeart },
];

export function FloatingDock({
  title,
  variant = 'floating-dock',
}: {
  title: string;
  variant?: NavigationStyle;
}) {
  const [active, setActive] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const targets = items
      .map((item) => document.getElementById(item.id))
      .filter((item): item is HTMLElement => Boolean(item));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: '-25% 0px -58% 0px', threshold: [0.1, 0.35, 0.6] },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success('Tautan undangan disalin.');
    } catch {
      // User cancellation should not show an error.
    }
  }

  function goTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  }

  if (variant === 'top-bar') {
    return (
      <nav
        aria-label="Navigasi undangan"
        data-navigation-variant={variant}
        className="theme-floating-dock safe-top fixed top-3 right-3 left-3 z-40 mx-auto flex max-w-3xl items-center justify-between rounded-full border border-white/20 bg-[var(--theme-primary)]/88 px-2 py-1.5 text-white shadow-2xl backdrop-blur-2xl sm:top-5 sm:px-3"
      >
        {items.map((item) => {
          const Icon = item.icon;
          const selected = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(item.id)}
              aria-current={selected ? 'location' : undefined}
              className={`flex min-h-10 items-center gap-2 rounded-full px-3 text-[10px] font-bold transition sm:text-xs ${
                selected
                  ? 'bg-[var(--theme-accent)] text-[var(--theme-primary)]'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={share}
          aria-label="Bagikan undangan"
          className="grid size-10 shrink-0 place-items-center rounded-full text-white/65 transition hover:bg-white/10 hover:text-white"
        >
          <Share2 size={16} />
        </button>
      </nav>
    );
  }

  if (variant === 'side-dots') {
    return (
      <nav
        aria-label="Navigasi undangan"
        data-navigation-variant={variant}
        className="theme-floating-dock fixed top-1/2 right-3 z-40 flex -translate-y-1/2 flex-col items-center gap-2 rounded-full border border-white/15 bg-[var(--theme-primary)]/88 p-2 text-white shadow-2xl backdrop-blur-2xl sm:right-5"
      >
        {items.map((item) => {
          const Icon = item.icon;
          const selected = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(item.id)}
              aria-label={item.label}
              aria-current={selected ? 'location' : undefined}
              className={`group relative grid size-9 place-items-center rounded-full transition ${
                selected
                  ? 'bg-[var(--theme-accent)] text-[var(--theme-primary)]'
                  : 'text-white/45 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={15} />
              <span className="pointer-events-none absolute right-12 rounded-full bg-black/85 px-2 py-1 text-[9px] whitespace-nowrap opacity-0 transition group-hover:opacity-100">
                {item.label}
              </span>
            </button>
          );
        })}
        <span className="h-px w-5 bg-white/15" />
        <button
          type="button"
          onClick={share}
          aria-label="Bagikan undangan"
          className="grid size-9 place-items-center rounded-full text-white/50 hover:bg-white/10 hover:text-white"
        >
          <Share2 size={15} />
        </button>
      </nav>
    );
  }

  if (variant === 'menu-button') {
    return (
      <div
        data-navigation-variant={variant}
        className="safe-bottom fixed right-4 bottom-4 z-40 flex flex-col items-end gap-2 sm:right-6 sm:bottom-6"
      >
        {menuOpen && (
          <nav
            aria-label="Navigasi undangan"
            className="theme-floating-dock grid min-w-48 gap-1 rounded-3xl border border-white/15 bg-[var(--theme-primary)]/94 p-2 text-white shadow-2xl backdrop-blur-2xl"
          >
            {items.map((item) => {
              const Icon = item.icon;
              const selected = active === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goTo(item.id)}
                  className={`flex min-h-11 items-center gap-3 rounded-2xl px-3 text-left text-xs font-bold transition ${
                    selected
                      ? 'bg-[var(--theme-accent)] text-[var(--theme-primary)]'
                      : 'text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={16} /> {item.label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={share}
              className="flex min-h-11 items-center gap-3 rounded-2xl px-3 text-left text-xs font-bold text-white/60 hover:bg-white/10 hover:text-white"
            >
              <Share2 size={16} /> Bagikan
            </button>
          </nav>
        )}
        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
          className="theme-floating-dock grid size-14 place-items-center rounded-full border border-white/15 bg-[var(--theme-primary)] text-white shadow-2xl transition hover:scale-105"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <nav
        aria-label="Navigasi undangan Indonesia Heritage"
        data-navigation-variant={variant}
        className="theme-floating-dock safe-bottom fixed right-1/2 bottom-3 z-40 grid w-[min(calc(100vw-1rem),34rem)] translate-x-1/2 grid-cols-7 items-stretch overflow-hidden rounded-[1.55rem] border border-[var(--theme-accent)]/35 bg-[var(--theme-primary)]/94 p-1.5 text-white shadow-[0_22px_70px_rgba(0,0,0,.35)] backdrop-blur-2xl sm:bottom-5 sm:p-2"
      >
        {items.map((item) => {
          const Icon = item.icon;
          const selected = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(item.id)}
              aria-label={item.label}
              aria-current={selected ? 'location' : undefined}
              className={`group relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-[1.05rem] px-0.5 py-2 transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)] ${
                selected
                  ? 'bg-[var(--theme-accent)] text-[var(--theme-primary)] shadow-lg shadow-black/20'
                  : 'text-white/58 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon
                size={16}
                strokeWidth={selected ? 2.4 : 1.8}
                aria-hidden="true"
              />
              <span className="max-w-full truncate text-[7px] leading-none font-bold tracking-[-0.01em] max-[350px]:hidden min-[390px]:text-[8px] sm:text-[9px]">
                {item.id === 'couple'
                  ? 'Mempelai'
                  : item.id === 'story'
                    ? 'Our Story'
                    : item.label}
              </span>
              {selected && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-0.5 h-px w-5 rounded-full bg-[var(--theme-primary)]/55"
                />
              )}
            </button>
          );
        })}
        <button
          type="button"
          onClick={share}
          aria-label="Bagikan undangan"
          className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-[1.05rem] px-0.5 py-2 text-white/58 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)]"
        >
          <Share2 size={16} aria-hidden="true" />
          <span className="text-[7px] leading-none font-bold max-[350px]:hidden min-[390px]:text-[8px] sm:text-[9px]">
            Bagikan
          </span>
        </button>
      </nav>
    );
  }

  return (
    <nav
      aria-label="Navigasi undangan"
      data-navigation-variant="floating-dock"
      className="theme-floating-dock safe-bottom fixed right-1/2 bottom-3 z-40 flex translate-x-1/2 items-center gap-1 rounded-[1.45rem] border border-white/15 bg-[var(--theme-primary)]/86 p-1.5 text-white shadow-[0_22px_70px_rgba(0,0,0,.32)] backdrop-blur-2xl max-[380px]:gap-0 max-[380px]:p-1 sm:bottom-5 sm:gap-1.5"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const selected = active === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => goTo(item.id)}
            aria-label={item.label}
            aria-current={selected ? 'location' : undefined}
            className={`group relative grid size-10 place-items-center rounded-2xl transition duration-300 max-[380px]:size-9 sm:size-11 ${
              selected
                ? 'bg-[var(--theme-accent)] text-[var(--theme-primary)] shadow-lg shadow-black/20'
                : 'text-white/55 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon size={17} strokeWidth={selected ? 2.4 : 1.8} />
            <span className="pointer-events-none absolute -top-9 hidden rounded-full bg-black/85 px-2 py-1 text-[9px] whitespace-nowrap opacity-0 transition group-hover:opacity-100 sm:block">
              {item.label}
            </span>
          </button>
        );
      })}
      <span className="mx-0.5 h-6 w-px bg-white/12" />
      <button
        type="button"
        onClick={share}
        aria-label="Bagikan undangan"
        className="grid size-10 place-items-center rounded-2xl text-white/60 transition hover:bg-white/10 hover:text-white max-[380px]:size-9 sm:size-11"
      >
        <Share2 size={17} />
      </button>
    </nav>
  );
}