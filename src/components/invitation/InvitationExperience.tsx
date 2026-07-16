'use client';

import AOS from 'aos';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowDown,
  AtSign,
  CalendarDays,
  CalendarPlus,
  ChevronUp,
  Clock3,
  ExternalLink,
  Gift,
  Heart,
  MailOpen,
  MapPin,
  Navigation,
  PlayCircle,
  Quote,
  Sparkles,
} from 'lucide-react';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { FALLBACK_MEDIA } from '@/config/fallback-content';
import { resolveThemeConfig } from '@/config/theme-presets';
import { resolveWeddingContent } from '@/lib/content-resolver';
import { safeJsonParse } from '@/lib/utils';
import type { WeddingContent, WeddingEvent } from '@/types/wedding';
import { ImageWithFallback } from '@/components/shared/ImageWithFallback';
import { CopyButton } from '@/components/shared/CopyButton';
import { Countdown } from '@/components/invitation/Countdown';
import { FloatingDock } from '@/components/invitation/FloatingDock';
import { Gallery } from '@/components/invitation/Gallery';
import { MusicPlayer } from '@/components/invitation/MusicPlayer';
import { OurStory } from '@/components/invitation/OurStory';
import { RsvpForm } from '@/components/invitation/RsvpForm';
import { ScrollProgress } from '@/components/invitation/ScrollProgress';
import { ResponsiveVideo } from '@/components/shared/ResponsiveVideo';
import { SectionHeading } from '@/components/invitation/SectionHeading';

function formatIndonesianDate(date: string) {
  const value = new Date(`${date}T12:00:00`);
  return Number.isNaN(value.getTime())
    ? 'Tanggal belum ditentukan'
    : new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Jakarta',
      }).format(value);
}

function formatCompactDate(date: string) {
  const value = new Date(`${date}T12:00:00`);
  return Number.isNaN(value.getTime())
    ? { day: '--', month: 'TBA', year: '----' }
    : {
        day: new Intl.DateTimeFormat('id-ID', { day: '2-digit' }).format(value),
        month: new Intl.DateTimeFormat('id-ID', { month: 'short' })
          .format(value)
          .replace('.', ''),
        year: new Intl.DateTimeFormat('id-ID', { year: 'numeric' }).format(
          value,
        ),
      };
}

function calendarUrl(event: WeddingEvent) {
  const start = `${event.date.replaceAll('-', '')}T${event.startTime.replace(':', '')}00`;
  const end = `${event.date.replaceAll('-', '')}T${event.endTime.replace(':', '')}00`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${start}/${end}`,
    details: [
      event.notes,
      event.dressCode ? `Dress code: ${event.dressCode}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    location: `${event.venueName}, ${event.address}`,
    ctz: event.timezone,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function osmEmbed(event: WeddingEvent) {
  const lat = event.latitude ?? -6.2615;
  const lng = event.longitude ?? 106.8106;
  const delta = 0.008;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}&layer=mapnik&marker=${lat}%2C${lng}`;
}

export function InvitationExperience({
  content: initialContent,
  guestName,
  dataSource,
}: {
  content: WeddingContent;
  guestName: string;
  dataSource: 'supabase' | 'fallback';
}) {
  const reducedMotion = useReducedMotion();
  const [content, setContent] = useState(initialContent);
  const [opened, setOpened] = useState(false);
  const displayGuest = guestName.trim() || 'Bapak/Ibu/Saudara/i';
  const resolvedTheme = useMemo(
    () => resolveThemeConfig(content.theme),
    [content.theme],
  );

  const couples = useMemo(
    () => [...content.couples].sort((a, b) => a.sortOrder - b.sortOrder),
    [content.couples],
  );
  const events = useMemo(
    () => [...content.events].sort((a, b) => a.sortOrder - b.sortOrder),
    [content.events],
  );
  const stories = useMemo(
    () => [...content.loveStories].sort((a, b) => a.sortOrder - b.sortOrder),
    [content.loveStories],
  );

  useEffect(() => {
    if (dataSource !== 'fallback') return;
    const draft = safeJsonParse<WeddingContent | null>(
      localStorage.getItem(`wedding-admin-draft:${initialContent.slug}`),
      null,
    );
    if (!draft) return;
    const timer = window.setTimeout(
      () => setContent(resolveWeddingContent(draft)),
      0,
    );
    return () => window.clearTimeout(timer);
  }, [dataSource, initialContent.slug]);

  const groom = couples[0];
  const bride = couples[1];
  const firstEvent = events[0];
  const eventDate = firstEvent?.date ?? content.eventDate.slice(0, 10);
  const eventDateLabel = useMemo(
    () => formatIndonesianDate(eventDate),
    [eventDate],
  );
  const compactDate = useMemo(() => formatCompactDate(eventDate), [eventDate]);

  useEffect(() => {
    const stored =
      sessionStorage.getItem(`invitation-opened:${content.slug}`) === '1';
    const stateTimer = window.setTimeout(() => setOpened(stored), 0);
    const animationDuration =
      resolvedTheme.animationIntensity === 'low'
        ? 550
        : resolvedTheme.animationIntensity === 'high'
          ? 1050
          : 850;
    AOS.init({
      duration: reducedMotion ? 0 : animationDuration,
      once: true,
      offset: 72,
      easing: 'ease-out-cubic',
    });
    fetch('/api/visitor', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        weddingId: content.id,
        pagePath: location.pathname,
      }),
    }).catch(() => undefined);
    return () => window.clearTimeout(stateTimer);
  }, [
    content.id,
    content.slug,
    reducedMotion,
    resolvedTheme.animationIntensity,
  ]);

  function openInvitation() {
    setOpened(true);
    sessionStorage.setItem(`invitation-opened:${content.slug}`, '1');
    window.setTimeout(
      () =>
        document
          .getElementById('home')
          ?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' }),
      500,
    );
  }

  const themeStyle = {
    '--gold': resolvedTheme.accent,
    '--deep': resolvedTheme.primary,
    '--cream': resolvedTheme.secondary,
    '--ink': resolvedTheme.text,
    '--theme-primary': resolvedTheme.primary,
    '--theme-secondary': resolvedTheme.secondary,
    '--theme-accent': resolvedTheme.accent,
    '--theme-text': resolvedTheme.text,
    '--theme-surface': resolvedTheme.surface,
    '--theme-muted': resolvedTheme.muted,
    '--theme-heading-font': `${resolvedTheme.headingFont}, Georgia, serif`,
    '--theme-body-font': `${resolvedTheme.bodyFont}, Inter, sans-serif`,
  } as CSSProperties;

  const coverExitLeft =
    resolvedTheme.coverStyle === 'door'
      ? { rotateY: -105, opacity: 0 }
      : resolvedTheme.coverStyle === 'envelope'
        ? { y: '-110%', rotateX: 18, opacity: 0 }
        : resolvedTheme.coverStyle === 'paper'
          ? { y: '-105%', opacity: 0 }
          : resolvedTheme.coverStyle === 'floral'
            ? { scale: 1.45, rotate: -8, opacity: 0 }
            : { x: '-100%' };
  const coverExitRight =
    resolvedTheme.coverStyle === 'door'
      ? { rotateY: 105, opacity: 0 }
      : resolvedTheme.coverStyle === 'envelope'
        ? { y: '110%', rotateX: -18, opacity: 0 }
        : resolvedTheme.coverStyle === 'paper'
          ? { y: '105%', opacity: 0 }
          : resolvedTheme.coverStyle === 'floral'
            ? { scale: 1.45, rotate: 8, opacity: 0 }
            : { x: '100%' };

  return (
    <main
      style={themeStyle}
      data-theme-preset={resolvedTheme.preset}
      data-layout-preset={resolvedTheme.layoutPreset}
      data-cover-style={resolvedTheme.coverStyle}
      data-navigation-style={resolvedTheme.navigationStyle}
      data-gallery-style={resolvedTheme.galleryStyle}
      data-story-style={resolvedTheme.storyStyle}
      data-layout-style={resolvedTheme.layoutStyle}
      data-ornament-style={resolvedTheme.ornamentStyle}
      data-hero-style={resolvedTheme.heroStyle}
      data-surface-style={resolvedTheme.surfaceStyle}
      data-corner-style={resolvedTheme.cornerStyle}
      data-theme-mode={resolvedTheme.mode}
      className="wedding-theme premium-canvas min-h-screen overflow-x-clip bg-[var(--cream)] text-[var(--ink)]"
    >
      <div className="theme-atmosphere" aria-hidden="true" />
      <ScrollProgress />

      <AnimatePresence>
        {!opened && (
          <motion.section
            key="cover"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.9 }}
            className="theme-cover fixed inset-0 z-[80] min-h-[100dvh] overflow-hidden bg-[#11120e] text-white"
            role="dialog"
            aria-modal="true"
            aria-label="Pembuka undangan"
          >
            <ImageWithFallback
              src={content.heroImageUrl}
              fallbackSrc={FALLBACK_MEDIA.hero}
              alt={`Cover ${content.groomName} dan ${content.brideName}`}
              fill
              priority
              sizes="100vw"
              className="theme-hero-image cinematic-zoom object-cover opacity-60"
            />
            <div className="theme-cover-overlay absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,transparent_0%,rgba(0,0,0,.18)_32%,rgba(0,0,0,.88)_100%)]" />
            <div className="luxury-noise absolute inset-0" />
            <motion.div
              exit={coverExitLeft}
              transition={{
                duration: reducedMotion ? 0 : 1.15,
                ease: [0.76, 0, 0.24, 1],
              }}
              className="cover-transition-panel cover-panel-left absolute inset-y-0 left-0 w-1/2 origin-left border-r border-[#e4c978]/15 bg-[#151610]/88 backdrop-blur-sm"
            />
            <motion.div
              exit={coverExitRight}
              transition={{
                duration: reducedMotion ? 0 : 1.15,
                ease: [0.76, 0, 0.24, 1],
              }}
              className="cover-transition-panel cover-panel-right absolute inset-y-0 right-0 w-1/2 origin-right border-l border-[#e4c978]/15 bg-[#151610]/88 backdrop-blur-sm"
            />
            <div className="pointer-events-none absolute inset-4 border border-white/15 sm:inset-7" />
            <div className="pointer-events-none absolute inset-7 border border-[#d9bd73]/15 sm:inset-11" />
            <div className="pointer-events-none absolute top-0 left-1/2 h-28 w-px -translate-x-1/2 bg-gradient-to-b from-[#e8cf90] to-transparent" />

            <div className="relative z-10 grid min-h-[100dvh] place-items-center px-5 py-10">
              <motion.div
                initial={{ opacity: 0, y: 22, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: reducedMotion ? 0 : 0.9, delay: 0.15 }}
                className="w-full max-w-lg text-center"
              >
                <motion.div
                  animate={reducedMotion ? undefined : { rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 28,
                    ease: 'linear',
                  }}
                  className="relative mx-auto mb-7 grid size-24 place-items-center rounded-full border border-[#d9bd73]/35 sm:size-28"
                >
                  <span className="absolute inset-2 rounded-full border border-white/10" />
                  <Sparkles
                    className="absolute -top-2 text-[#ead28f]"
                    size={16}
                  />
                  <span className="font-display text-3xl text-[#f0d99d] sm:text-4xl">
                    {groom?.nickname?.charAt(0) || 'N'}
                    <span className="mx-1 text-base text-white/35">&</span>
                    {bride?.nickname?.charAt(0) || 'A'}
                  </span>
                </motion.div>

                <p className="text-[10px] font-bold tracking-[.46em] text-[#e7d19a]/75 uppercase sm:text-xs">
                  The Wedding Celebration
                </p>
                <h1 className="font-display mt-5 text-6xl leading-[.78] text-balance sm:text-8xl">
                  <span className="block">
                    {groom?.nickname || content.groomName}
                  </span>
                  <span className="my-3 block text-2xl font-light text-[#d9bd73] sm:text-3xl">
                    together with
                  </span>
                  <span className="block">
                    {bride?.nickname || content.brideName}
                  </span>
                </h1>
                <p className="mt-7 text-xs font-semibold tracking-[.24em] text-white/65 uppercase sm:text-sm">
                  {eventDateLabel}
                </p>

                <div className="theme-card-dark glass-premium mx-auto mt-8 max-w-md rounded-[2rem] px-5 py-6 sm:px-8">
                  <p className="text-[9px] font-bold tracking-[.3em] text-white/45 uppercase">
                    Kepada Yth.
                  </p>
                  <p className="font-display mt-2 text-3xl text-white sm:text-4xl">
                    {displayGuest}
                  </p>
                  <p className="mx-auto mt-3 max-w-sm text-[11px] leading-5 text-white/45">
                    Tanpa mengurangi rasa hormat, kami mengundang Anda untuk
                    menjadi bagian dari hari bahagia kami.
                  </p>
                  <motion.button
                    whileHover={
                      reducedMotion ? undefined : { y: -3, scale: 1.01 }
                    }
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={openInvitation}
                    className="gold-button mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-7 text-sm font-extrabold text-[#1e1d18]"
                  >
                    <MailOpen size={17} /> Buka Undangan
                  </motion.button>
                </div>
                <p className="mt-7 text-[9px] tracking-[.26em] text-white/30 uppercase">
                  Tap to enter our story
                </p>
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <MusicPlayer
        src={content.musicUrl}
        title={content.musicTitle}
        canStart={opened}
      />

      <section
        id="home"
        className="theme-hero relative flex min-h-[100dvh] items-end overflow-hidden bg-[#10110d] text-white"
      >
        <ImageWithFallback
          src={content.heroImageUrl}
          fallbackSrc={FALLBACK_MEDIA.hero}
          alt={`Foto utama ${content.groomName} dan ${content.brideName}`}
          fill
          priority
          sizes="100vw"
          className="theme-hero-image cinematic-zoom object-cover opacity-75"
        />
        <div className="theme-hero-overlay absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-[#10110d]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.38),transparent_42%,transparent_58%,rgba(0,0,0,.25))]" />
        <div className="luxury-noise absolute inset-0" />
        <div className="pointer-events-none absolute inset-4 border border-white/12 sm:inset-8" />
        <div className="pointer-events-none absolute top-8 right-8 bottom-8 hidden w-px bg-gradient-to-b from-transparent via-[#d7ba72]/50 to-transparent lg:block" />

        <div className="absolute top-6 right-5 left-5 z-10 flex items-center justify-between text-[9px] font-bold tracking-[.28em] text-white/60 uppercase sm:top-9 sm:right-10 sm:left-10">
          <span>Digital Invitation</span>
          <span className="hidden items-center gap-2 sm:flex">
            <span className="size-1.5 animate-pulse rounded-full bg-[#ddc47f]" />
            {dataSource === 'fallback'
              ? 'Demo Experience'
              : 'Personal Invitation'}
          </span>
        </div>

        <div className="theme-hero-content relative z-10 mx-auto grid w-full max-w-7xl items-end gap-10 px-5 pb-24 sm:px-8 sm:pb-28 lg:grid-cols-[1fr_auto] lg:px-12">
          <div className="max-w-5xl">
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: opened ? 1 : 0, y: opened ? 0 : 18 }}
              transition={{ delay: 0.25, duration: 0.7 }}
              className="flex items-center gap-3 text-[10px] font-extrabold tracking-[.4em] text-[#ead394] uppercase sm:text-xs"
            >
              <span className="h-px w-9 bg-[#ead394]/70" /> Save the date
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: opened ? 1 : 0, y: opened ? 0 : 26 }}
              transition={{ delay: 0.34, duration: 0.85 }}
              className="font-display mt-5 text-[4.3rem] leading-[.75] tracking-[-.045em] text-balance sm:text-[7.5rem] lg:text-[10rem]"
            >
              {groom?.nickname || content.groomName}
              <span className="mx-3 inline-block align-middle text-3xl font-light tracking-normal text-[#d9bd73] sm:mx-6 sm:text-5xl">
                &
              </span>
              {bride?.nickname || content.brideName}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: opened ? 1 : 0, y: opened ? 0 : 18 }}
              transition={{ delay: 0.5, duration: 0.75 }}
              className="mt-8 flex max-w-3xl flex-col gap-6 border-l border-[#d9bd73]/55 pl-5 sm:flex-row sm:items-end sm:justify-between sm:pl-7"
            >
              <p className="max-w-xl font-serif text-base leading-7 text-white/70 italic sm:text-xl sm:leading-8">
                “{content.quote}”
              </p>
              <div className="flex shrink-0 gap-3">
                {firstEvent && (
                  <>
                    <a
                      href={calendarUrl(firstEvent)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#d4b568] px-4 text-xs font-extrabold text-[#1c1c17] transition hover:-translate-y-0.5"
                    >
                      <CalendarPlus size={15} /> Simpan Tanggal
                    </a>
                    <a
                      href={
                        firstEvent.googleMapsUrl ||
                        `https://maps.google.com/?q=${encodeURIComponent(firstEvent.address)}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Buka lokasi"
                      className="grid size-11 place-items-center rounded-full border border-white/25 bg-white/5 backdrop-blur transition hover:bg-white/15"
                    >
                      <MapPin size={16} />
                    </a>
                  </>
                )}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: opened ? 1 : 0, scale: opened ? 1 : 0.92 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="hidden w-36 rounded-full border border-white/15 bg-black/20 px-4 py-8 text-center backdrop-blur-xl lg:block"
          >
            <span className="font-display block text-5xl text-[#efd994]">
              {compactDate.day}
            </span>
            <span className="mt-1 block text-[10px] font-extrabold tracking-[.28em] text-white/55 uppercase">
              {compactDate.month}
            </span>
            <span className="mt-4 block text-xs tracking-[.2em] text-white/35">
              {compactDate.year}
            </span>
          </motion.div>
        </div>

        <a
          href="#countdown"
          className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-[8px] font-bold tracking-[.26em] text-white/40 uppercase"
        >
          Scroll <ArrowDown className="animate-bounce" size={14} />
        </a>
      </section>

      <section
        id="countdown"
        className="theme-section-dark relative overflow-hidden bg-[#181914] px-5 py-20 text-white sm:py-28"
      >
        <div className="luxury-grid absolute inset-0 opacity-50" />
        <div className="ambient-orb absolute -top-28 -left-24 size-72 rounded-full bg-[#b8934d]/18 blur-3xl" />
        <div className="ambient-orb ambient-delay absolute -right-28 -bottom-28 size-80 rounded-full bg-[#768066]/12 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-[10px] font-extrabold tracking-[.38em] text-[#e4c77e] uppercase">
              Counting every moment
            </p>
            <h2 className="font-display mt-4 text-6xl leading-[.85] sm:text-8xl">
              Menuju
              <span className="block text-[#e5cb88] italic">hari bahagia.</span>
            </h2>
            <p className="mt-6 max-w-md text-sm leading-7 text-white/50">
              Setiap detik membawa kami lebih dekat pada satu janji, satu rumah,
              dan satu perjalanan panjang bersama.
            </p>
          </div>
          <div className="theme-card-dark glass-premium rounded-[2.4rem] p-4 sm:p-7">
            <Countdown
              target={content.eventDate}
              pastMessage={content.pastEventMessage}
              variant="dark"
            />
            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-[9px] font-bold tracking-[.18em] text-white/35 uppercase">
              <span>{eventDateLabel}</span>
              <span>{content.timezone}</span>
            </div>
          </div>
        </div>
      </section>

      <section
        id="couple"
        className="theme-section-light section-light relative overflow-hidden px-5 py-20 sm:py-32"
      >
        <span className="editorial-watermark font-display pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 text-[9rem] leading-none text-black/[.025] sm:text-[15rem]">
          Us
        </span>
        <div className="relative mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Bride & Groom"
            title="Dua cerita, satu tujuan"
            description="Dengan restu keluarga dan penuh rasa syukur, kami bersiap memulai perjalanan sebagai satu keluarga."
          />
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-8">
            {couples.map((couple, index) => (
              <article
                key={couple.id}
                data-aos={index === 0 ? 'fade-right' : 'fade-left'}
                className={`group relative ${index === 1 ? 'lg:mt-24' : ''}`}
              >
                <div className="theme-portrait relative mx-auto aspect-[4/5] max-w-[32rem] overflow-hidden rounded-[48%_48%_3rem_3rem/24%_24%_3rem_3rem] bg-[#ddd3c1] shadow-[0_35px_90px_rgba(44,39,29,.16)]">
                  <ImageWithFallback
                    src={couple.photoUrl}
                    fallbackSrc={
                      index === 0 ? FALLBACK_MEDIA.groom : FALLBACK_MEDIA.bride
                    }
                    alt={`Foto ${couple.fullName}`}
                    fill
                    sizes="(max-width: 1024px) 90vw, 46vw"
                    className="object-cover transition duration-1000 ease-out group-hover:scale-[1.035]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-75" />
                  <div className="absolute right-6 bottom-6 left-6 text-white">
                    <span className="text-[9px] font-bold tracking-[.28em] text-[#ead394] uppercase">
                      {couple.role === 'groom' ? 'The Groom' : 'The Bride'}
                    </span>
                    <h3 className="font-display mt-1 text-4xl sm:text-5xl">
                      {couple.fullName}
                    </h3>
                  </div>
                </div>
                <div
                  className={`theme-card relative mx-auto -mt-3 max-w-md rounded-[2rem] border border-black/5 bg-white/80 p-6 shadow-xl backdrop-blur-xl sm:p-7 ${index === 0 ? 'lg:ml-0' : 'lg:mr-0'}`}
                >
                  <p className="text-sm leading-7 text-black/55">
                    {couple.description}
                  </p>
                  <p className="mt-4 text-xs leading-6 font-semibold text-[#6f5831]">
                    {couple.parentNames}
                  </p>
                  {couple.instagramUrl && (
                    <a
                      href={couple.instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold tracking-[.12em] text-[#8d692c] uppercase"
                    >
                      <AtSign size={15} /> Instagram
                    </a>
                  )}
                </div>
                <span
                  className={`font-display absolute top-8 hidden text-8xl text-[var(--gold)]/12 lg:block ${index === 0 ? '-left-8' : '-right-8'}`}
                >
                  0{index + 1}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="events"
        className="theme-section-alt relative overflow-hidden bg-[#efeadf] px-5 py-20 sm:py-32"
      >
        <div className="batik-elegant absolute inset-0 opacity-40" />
        <div className="relative mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="The Celebration"
            title="Rangkaian acara"
            description="Kami akan sangat berbahagia menyambut kehadiran Anda pada rangkaian hari istimewa kami."
          />
          <div className="grid gap-5 lg:grid-cols-2">
            {events.map((event, index) => (
              <motion.article
                key={event.id}
                whileHover={reducedMotion ? undefined : { y: -5 }}
                data-aos="fade-up"
                data-aos-delay={index * 80}
                className="theme-card event-card relative overflow-hidden rounded-[2.5rem] border border-black/5 bg-white/75 p-6 shadow-[0_26px_80px_rgba(46,41,31,.09)] backdrop-blur-xl sm:p-8"
              >
                <span className="font-display absolute top-0 right-0 text-[8rem] leading-none text-black/[.025]">
                  0{index + 1}
                </span>
                <div className="relative flex items-start justify-between gap-5">
                  <div>
                    <p className="text-[9px] font-extrabold tracking-[.3em] text-[#8a682e] uppercase">
                      {event.eventType}
                    </p>
                    <h3 className="font-display mt-2 text-4xl sm:text-5xl">
                      {event.title}
                    </h3>
                  </div>
                  <div className="theme-date-badge shrink-0 rounded-[1.4rem] bg-[#24251f] px-4 py-3 text-center text-white shadow-lg">
                    <span className="font-display block text-3xl leading-none text-[#ebd18c]">
                      {formatCompactDate(event.date).day}
                    </span>
                    <span className="mt-1 block text-[8px] font-bold tracking-[.22em] uppercase">
                      {formatCompactDate(event.date).month}
                    </span>
                  </div>
                </div>
                <div className="gold-rule my-6" />
                <div className="grid gap-4 text-sm text-black/60 sm:grid-cols-2">
                  <p className="flex gap-3">
                    <CalendarDays
                      className="mt-0.5 shrink-0 text-[#9a783e]"
                      size={17}
                    />
                    <span>{formatIndonesianDate(event.date)}</span>
                  </p>
                  <p className="flex gap-3">
                    <Clock3
                      className="mt-0.5 shrink-0 text-[#9a783e]"
                      size={17}
                    />
                    <span>
                      {event.startTime}–{event.endTime} WIB
                    </span>
                  </p>
                  <p className="flex gap-3 sm:col-span-2">
                    <MapPin
                      className="mt-0.5 shrink-0 text-[#9a783e]"
                      size={17}
                    />
                    <span>
                      <strong className="block text-black/75">
                        {event.venueName}
                      </strong>
                      {event.address}
                    </span>
                  </p>
                </div>
                {(event.dressCode || event.notes) && (
                  <div className="mt-5 rounded-2xl bg-[#f2ede4] p-4 text-xs leading-6 text-black/55">
                    {event.dressCode && (
                      <p>
                        <strong className="text-black/70">Dress code:</strong>{' '}
                        {event.dressCode}
                      </p>
                    )}
                    {event.notes && (
                      <p>
                        <strong className="text-black/70">Catatan:</strong>{' '}
                        {event.notes}
                      </p>
                    )}
                  </div>
                )}
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={
                      event.googleMapsUrl ||
                      `https://maps.google.com/?q=${encodeURIComponent(event.address)}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="theme-button-primary inline-flex min-h-11 items-center gap-2 rounded-full bg-[#272822] px-4 text-xs font-extrabold text-white"
                  >
                    <Navigation size={15} /> Petunjuk Arah
                  </a>
                  <a
                    href={calendarUrl(event)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-black/15 bg-white/50 px-4 text-xs font-extrabold"
                  >
                    <CalendarPlus size={15} /> Kalender
                  </a>
                  <CopyButton value={event.address} label="Salin alamat" />
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {firstEvent && (
        <section className="theme-section-dark relative overflow-hidden bg-[#171812] px-5 py-20 text-white sm:py-28">
          <div className="luxury-noise absolute inset-0" />
          <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.68fr_1.32fr] lg:items-center">
            <div>
              <SectionHeading
                eyebrow="Location"
                title="Temukan tempatnya"
                description="Gunakan peta interaktif atau buka petunjuk arah langsung melalui Google Maps."
                align="left"
                tone="light"
              />
              <div className="theme-card-dark rounded-[2rem] border border-white/10 bg-white/[.045] p-6 backdrop-blur-xl">
                <MapPin className="text-[#e2c77e]" />
                <h3 className="font-display mt-4 text-4xl">
                  {firstEvent.venueName}
                </h3>
                <p className="mt-3 text-sm leading-7 text-white/55">
                  {firstEvent.address}
                </p>
                <a
                  href={
                    firstEvent.googleMapsUrl ||
                    `https://maps.google.com/?q=${encodeURIComponent(firstEvent.address)}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="gold-button mt-6 inline-flex min-h-12 items-center gap-2 rounded-full px-5 text-xs font-extrabold text-[#1e1d18]"
                >
                  <ExternalLink size={16} /> Buka Google Maps
                </a>
              </div>
            </div>
            <div className="theme-card-dark map-frame overflow-hidden rounded-[2.6rem] border border-white/10 bg-white/5 p-2 shadow-[0_35px_100px_rgba(0,0,0,.35)]">
              <iframe
                title={`Peta ${firstEvent.venueName}`}
                src={osmEmbed(firstEvent)}
                loading="lazy"
                className="h-[420px] w-full rounded-[2.1rem] border-0 grayscale-[.15] sm:h-[540px]"
              />
            </div>
          </div>
        </section>
      )}

      <OurStory
        stories={stories}
        media={content.media}
        coupleNames={`${groom?.nickname || content.groomName} & ${bride?.nickname || content.brideName}`}
        style={resolvedTheme.storyStyle}
      />

      <section
        id="gallery"
        className="theme-section-alt relative overflow-hidden bg-[#e9e2d4] px-5 py-20 sm:py-32"
      >
        <div className="batik-elegant absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Captured Moments"
            title="Galeri kenangan"
            description="Potongan waktu yang kami simpan sebagai pengingat bahwa bahagia sering hadir dalam hal-hal sederhana."
          />
          <Gallery items={content.media} style={resolvedTheme.galleryStyle} />
        </div>
      </section>

      <section className="theme-section-dark relative overflow-hidden bg-[#12130f] px-5 py-20 text-white sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(184,148,77,.16),transparent_34%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-10 grid gap-7 lg:grid-cols-[.65fr_1.35fr] lg:items-end">
            <SectionHeading
              eyebrow="Wedding Film"
              title="Sepenggal cerita"
              align="left"
              tone="light"
            />
            <p className="max-w-xl text-sm leading-7 text-white/50 lg:justify-self-end">
              Tekan tombol putar untuk menikmati cuplikan perjalanan kami. Video
              tidak diputar otomatis agar tetap nyaman dan hemat data.
            </p>
          </div>
          <div
            data-aos="zoom-in"
            className="theme-card-dark video-shell relative mx-auto aspect-video overflow-hidden rounded-[2.5rem] border border-white/10 bg-black shadow-[0_40px_120px_rgba(0,0,0,.45)]"
          >
            <ResponsiveVideo
              src={content.videoUrl}
              poster={content.videoPosterUrl}
              title={`Video pernikahan ${content.groomName} dan ${content.brideName}`}
            />
            <span className="pointer-events-none absolute top-4 left-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-[9px] font-bold tracking-[.14em] text-white/70 uppercase backdrop-blur">
              <PlayCircle size={14} /> Play on demand
            </span>
          </div>
        </div>
      </section>

      <section
        id="rsvp"
        className="theme-section-light section-light relative overflow-hidden px-5 py-20 sm:py-32"
      >
        <span className="editorial-watermark font-display pointer-events-none absolute top-16 right-0 text-[9rem] leading-none text-black/[.025] sm:text-[14rem]">
          RSVP
        </span>
        <div className="relative mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Konfirmasi Kehadiran"
            title="Kami menantikan kehadiran Anda"
            description="Konfirmasi Anda membantu kami mempersiapkan hari bahagia dengan lebih baik."
          />
          <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
            <div className="theme-card rounded-[2.5rem] border border-black/5 bg-white/75 p-3 shadow-[0_30px_90px_rgba(44,39,29,.09)] backdrop-blur-xl sm:p-6">
              <RsvpForm weddingId={content.id} initialName={guestName} />
            </div>
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-extrabold tracking-[.28em] text-[#8a682e] uppercase">
                    Warm Wishes
                  </p>
                  <h3 className="font-display mt-1 text-4xl">Ucapan Tamu</h3>
                </div>
                <Quote className="text-[var(--gold)]/35" size={40} />
              </div>
              <div className="hide-scrollbar max-h-[36rem] space-y-4 overflow-y-auto pr-1">
                {content.messages
                  .filter((message) => message.approved)
                  .slice(0, 8)
                  .map((message, index) => (
                    <blockquote
                      key={message.id}
                      className="theme-card rounded-[1.8rem] border border-black/5 bg-white/65 p-5 shadow-sm backdrop-blur"
                      data-aos="fade-up"
                      data-aos-delay={(index % 3) * 60}
                    >
                      <p className="text-sm leading-7 text-black/60">
                        “{message.message}”
                      </p>
                      <footer className="mt-4 flex items-center justify-between gap-4 text-xs">
                        <strong>{message.guestName}</strong>
                        <span className="rounded-full bg-[#eee6d7] px-3 py-1 text-[9px] font-bold tracking-[.12em] text-black/45 uppercase">
                          {message.attendanceStatus.replace('_', ' ')}
                        </span>
                      </footer>
                    </blockquote>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="theme-section-alt relative overflow-hidden bg-[#ede6d8] px-5 py-20 sm:py-32">
        <div className="batik-elegant absolute inset-0 opacity-35" />
        <div className="relative mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Wedding Gift"
            title="Tanda kasih"
            description="Doa restu Anda adalah hadiah paling berharga. Bagi yang ingin mengirimkan tanda kasih, tersedia pilihan berikut."
          />
          <div className="grid gap-5 md:grid-cols-2">
            {content.gifts.map((gift, index) => (
              <motion.article
                key={gift.id}
                whileHover={reducedMotion ? undefined : { y: -5, rotateX: 1.5 }}
                data-aos="fade-up"
                data-aos-delay={index * 70}
                className="theme-card gift-card relative overflow-hidden rounded-[2.4rem] border border-white/70 bg-white/70 p-7 shadow-[0_28px_80px_rgba(46,41,31,.1)] backdrop-blur-xl"
              >
                <span className="absolute -top-8 -right-8 size-36 rounded-full border border-[var(--gold)]/15" />
                <span className="absolute top-1 right-1 grid size-24 place-items-center rounded-full border border-[var(--gold)]/10 text-[var(--gold)]/20">
                  <Gift size={34} />
                </span>
                <Gift className="text-[#916d30]" />
                <p className="mt-5 text-[9px] font-extrabold tracking-[.28em] text-black/40 uppercase">
                  {gift.bankName || 'Wedding Gift'}
                </p>
                <h3 className="font-display mt-2 text-4xl">
                  {gift.accountHolder}
                </h3>
                {gift.accountNumber && (
                  <>
                    <p className="mt-5 font-mono text-lg tracking-[.16em] text-black/60">
                      •••• •••• {gift.accountNumber.slice(-4)}
                    </p>
                    <CopyButton
                      value={gift.accountNumber}
                      label="Tampilkan & salin rekening"
                      className="mt-5"
                    />
                  </>
                )}
                {gift.qrisUrl && (
                  <div className="relative mt-5 aspect-square w-full max-w-60 overflow-hidden rounded-2xl border bg-white">
                    <ImageWithFallback
                      src={gift.qrisUrl}
                      fallbackSrc="/images/ornament.svg"
                      alt={`QRIS ${gift.accountHolder || 'hadiah pernikahan'}`}
                      fill
                      sizes="240px"
                      className="object-contain p-3"
                    />
                  </div>
                )}
                {gift.shippingAddress && (
                  <>
                    <p className="mt-5 text-sm leading-7 text-black/55">
                      {gift.shippingAddress}
                    </p>
                    <CopyButton
                      value={gift.shippingAddress}
                      label="Salin alamat"
                      className="mt-5"
                    />
                  </>
                )}
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <footer className="theme-footer relative overflow-hidden bg-[#11120e] px-5 pt-24 pb-32 text-center text-white sm:pt-32">
        <div className="luxury-noise absolute inset-0" />
        <div className="batik-elegant absolute inset-0 opacity-15" />
        <div className="pointer-events-none absolute top-0 left-1/2 h-24 w-px -translate-x-1/2 bg-gradient-to-b from-[#d9bd73] to-transparent" />
        <div className="relative mx-auto max-w-3xl">
          <div className="mx-auto grid size-16 place-items-center rounded-full border border-[#d9bd73]/30 text-[#e4cb88]">
            <Heart fill="currentColor" size={22} />
          </div>
          <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-white/55">
            {content.thankYouMessage}
          </p>
          <h2 className="font-display mt-8 text-6xl leading-[.8] text-[#f0d99d] sm:text-8xl">
            {groom?.nickname || content.groomName}
            <span className="mx-3 text-2xl text-white/30">&</span>
            {bride?.nickname || content.brideName}
          </h2>
          <p className="mt-9 text-[9px] font-bold tracking-[.26em] text-white/30 uppercase">
            © {new Date().getFullYear()} · Crafted for a beautiful beginning
          </p>
          <button
            type="button"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: reducedMotion ? 'auto' : 'smooth',
              })
            }
            className="mx-auto mt-8 grid size-12 place-items-center rounded-full border border-white/20 bg-white/5 transition hover:bg-white/10"
            aria-label="Kembali ke atas"
          >
            <ChevronUp />
          </button>
        </div>
      </footer>

      {opened && (
        <FloatingDock
          title={content.seo.title}
          variant={resolvedTheme.navigationStyle}
        />
      )}
    </main>
  );
}
