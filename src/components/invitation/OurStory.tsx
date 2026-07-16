'use client';

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { CalendarDays, Heart, Sparkles } from 'lucide-react';
import { useMemo, useRef } from 'react';
import { FALLBACK_MEDIA } from '@/config/fallback-content';
import { ImageWithFallback } from '@/components/shared/ImageWithFallback';
import { SectionHeading } from '@/components/invitation/SectionHeading';
import type { LoveStoryItem, MediaItem, StoryStyle } from '@/types/wedding';

function formatStoryDate(date: string) {
  const value = new Date(`${date}T12:00:00`);
  if (Number.isNaN(value.getTime())) return 'Tanggal istimewa';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(value);
}

function StoryChapter({
  story,
  index,
  total,
  media,
  coupleNames,
}: {
  story: LoveStoryItem;
  index: number;
  total: number;
  media: MediaItem[];
  coupleNames: string;
}) {
  const reducedMotion = useReducedMotion();
  const chapterRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: chapterRef,
    offset: ['start end', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ['9%', '-9%']);
  const imageScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [1.08, 1, 1.08],
  );
  const captionY = useTransform(scrollYProgress, [0, 1], [18, -18]);
  const reverse = index % 2 === 1;
  const imageItems = media.filter((item) => item.type === 'image');
  const primaryImage =
    story.imageUrl ||
    imageItems[index % Math.max(imageItems.length, 1)]?.url ||
    FALLBACK_MEDIA.story[index % FALLBACK_MEDIA.story.length];
  const secondaryImage =
    imageItems[(index + 2) % Math.max(imageItems.length, 1)]?.url ||
    FALLBACK_MEDIA.story[(index + 1) % FALLBACK_MEDIA.story.length];

  return (
    <motion.article
      ref={chapterRef}
      data-story-chapter={index + 1}
      initial={reducedMotion ? false : { opacity: 0, y: 72 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      className="story-chapter relative grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:gap-20 lg:py-24"
    >
      <div
        className={`relative ${reverse ? 'lg:order-2' : ''}`}
        aria-label={`Foto ${story.title}`}
      >
        <motion.div
          whileHover={
            reducedMotion
              ? undefined
              : { rotate: reverse ? 0.6 : -0.6, scale: 1.01 }
          }
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="story-photo-stage relative mx-auto max-w-[580px]"
        >
          <div className="story-photo-glow absolute -inset-8 rounded-[3rem] opacity-70 blur-3xl" />
          <div
            className={`story-photo-frame relative aspect-[4/5] overflow-hidden border border-white/50 bg-[var(--theme-surface)] shadow-[0_38px_100px_rgba(32,29,21,.22)] ${reverse ? 'rotate-[1.7deg]' : '-rotate-[1.7deg]'}`}
          >
            <motion.div
              style={
                reducedMotion ? undefined : { y: imageY, scale: imageScale }
              }
              className="absolute -inset-[12%]"
            >
              <ImageWithFallback
                src={primaryImage}
                fallbackSrc={
                  FALLBACK_MEDIA.story[index % FALLBACK_MEDIA.story.length]
                }
                alt={`${story.title} — ${coupleNames}`}
                fill
                sizes="(max-width: 1024px) 92vw, 44vw"
                className="object-cover"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-white/10" />
            <div className="luxury-noise absolute inset-0" />
            <motion.div
              style={reducedMotion ? undefined : { y: captionY }}
              className="absolute right-5 bottom-5 left-5 flex items-end justify-between gap-4 text-white"
            >
              <div>
                <span className="text-[9px] font-extrabold tracking-[.32em] text-white/65 uppercase">
                  Memory {String(index + 1).padStart(2, '0')}
                </span>
                <p className="font-display mt-1 text-2xl leading-none sm:text-3xl">
                  {story.title}
                </p>
              </div>
              <Heart className="size-5 fill-white/20 text-white/80" />
            </motion.div>
          </div>

          <motion.div
            initial={
              reducedMotion
                ? false
                : { opacity: 0, scale: 0.8, rotate: reverse ? -8 : 8 }
            }
            whileInView={
              reducedMotion
                ? undefined
                : { opacity: 1, scale: 1, rotate: reverse ? -4 : 4 }
            }
            whileHover={reducedMotion ? undefined : { rotate: 0, y: -8 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{
              delay: 0.28,
              duration: 0.75,
              ease: [0.22, 1, 0.36, 1],
            }}
            className={`story-polaroid absolute -bottom-7 z-10 w-[38%] min-w-32 bg-[#fffdf7] p-2 pb-7 shadow-[0_22px_65px_rgba(22,19,13,.24)] sm:-bottom-10 sm:w-[34%] ${reverse ? '-left-3 sm:-left-10' : '-right-3 sm:-right-10'}`}
          >
            <div className="relative aspect-square overflow-hidden bg-[#ebe5d8]">
              <ImageWithFallback
                src={secondaryImage}
                fallbackSrc={
                  FALLBACK_MEDIA.story[
                    (index + 1) % FALLBACK_MEDIA.story.length
                  ]
                }
                alt={`Kenangan tambahan ${coupleNames}`}
                fill
                sizes="220px"
                className="object-cover transition duration-700 hover:scale-110"
              />
            </div>
            <span className="font-script absolute right-0 bottom-1 left-0 text-center text-sm text-[#6d6254] sm:text-base">
              our favorite moment
            </span>
          </motion.div>

          <motion.span
            animate={
              reducedMotion
                ? undefined
                : {
                    y: [0, -10, 0],
                    rotate: [0, 8, 0],
                    opacity: [0.55, 1, 0.55],
                  }
            }
            transition={{ duration: 4.8, repeat: Infinity, delay: index * 0.4 }}
            className={`absolute top-5 z-20 grid size-11 place-items-center rounded-full border border-[var(--gold)]/30 bg-[var(--theme-surface)]/90 text-[var(--gold)] shadow-lg backdrop-blur ${reverse ? '-right-3 sm:-right-7' : '-left-3 sm:-left-7'}`}
            aria-hidden="true"
          >
            <Sparkles size={17} />
          </motion.span>
        </motion.div>
      </div>

      <motion.div
        initial={reducedMotion ? false : { opacity: 0, x: reverse ? -42 : 42 }}
        whileInView={reducedMotion ? undefined : { opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        className={`relative ${reverse ? 'lg:order-1 lg:text-right' : ''}`}
      >
        <span className="story-watermark pointer-events-none absolute -top-14 text-[7rem] leading-none font-semibold text-[var(--gold)]/[.07] sm:text-[10rem] lg:-top-24 lg:text-[13rem]">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className={`relative ${reverse ? 'lg:ml-auto' : ''} max-w-xl`}>
          <div
            className={`mb-6 flex items-center gap-3 ${reverse ? 'lg:justify-end' : ''}`}
          >
            <span className="h-px w-12 bg-[var(--gold)]/55" />
            <span className="text-[9px] font-extrabold tracking-[.32em] text-[var(--gold)] uppercase">
              Chapter {String(index + 1).padStart(2, '0')} /{' '}
              {String(total).padStart(2, '0')}
            </span>
          </div>
          <div
            className={`flex items-center gap-2 text-xs text-[var(--ink)]/45 ${reverse ? 'lg:justify-end' : ''}`}
          >
            <CalendarDays size={15} className="text-[var(--gold)]" />
            <time>{formatStoryDate(story.date)}</time>
          </div>
          <h3 className="font-display mt-4 text-5xl leading-[.95] text-balance sm:text-6xl lg:text-7xl">
            {story.title}
          </h3>
          <p className="mt-7 text-sm leading-8 text-[var(--ink)]/60 sm:text-base sm:leading-9">
            {story.story}
          </p>
          <div
            className={`mt-8 flex items-center gap-3 ${reverse ? 'lg:justify-end' : ''}`}
          >
            <span className="size-1.5 rounded-full bg-[var(--gold)]" />
            <span className="font-script text-xl text-[var(--gold)]">
              Nathan & Aulia
            </span>
          </div>
        </div>
      </motion.div>

      <span className="story-timeline-dot absolute top-1/2 left-1/2 z-20 hidden size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-[var(--cream)] bg-[var(--gold)] lg:block" />
    </motion.article>
  );
}

function AlternateStoryLayout({
  stories,
  media,
  coupleNames,
  style,
}: {
  stories: LoveStoryItem[];
  media: MediaItem[];
  coupleNames: string;
  style: Exclude<StoryStyle, 'cinematic' | 'zigzag'>;
}) {
  const reducedMotion = useReducedMotion();
  const images = media.filter((item) => item.type === 'image');

  if (style === 'vertical') {
    return (
      <div className="relative mx-auto mt-12 max-w-4xl space-y-8 before:absolute before:top-0 before:bottom-0 before:left-5 before:w-px before:bg-[var(--gold)]/30 sm:before:left-1/2">
        {stories.map((story, index) => {
          const image =
            story.imageUrl ||
            images[index % Math.max(images.length, 1)]?.url ||
            FALLBACK_MEDIA.story[index % FALLBACK_MEDIA.story.length];
          return (
            <motion.article
              key={story.id}
              initial={reducedMotion ? false : { opacity: 0, y: 36 }}
              whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              className={`relative ml-12 grid gap-5 rounded-xl border border-[var(--gold)]/20 bg-[var(--theme-surface)] p-4 shadow-lg sm:ml-0 sm:w-[calc(50%-2rem)] sm:grid-cols-[120px_1fr] ${index % 2 ? 'sm:ml-auto' : 'sm:mr-auto'}`}
            >
              <span
                className={`absolute top-7 -left-[2.2rem] size-4 rounded-full border-4 border-[var(--cream)] bg-[var(--gold)] ${index % 2 ? 'sm:-left-[2.55rem]' : 'sm:right-[-2.55rem] sm:left-auto'}`}
              />
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
                <ImageWithFallback
                  src={image}
                  fallbackSrc={
                    FALLBACK_MEDIA.story[index % FALLBACK_MEDIA.story.length]
                  }
                  alt={`${story.title} — ${coupleNames}`}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>
              <div className="py-2">
                <time className="text-[9px] font-black tracking-[.2em] text-[var(--gold)] uppercase">
                  {formatStoryDate(story.date)}
                </time>
                <h3 className="font-display mt-2 text-3xl">{story.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--ink)]/60">
                  {story.story}
                </p>
              </div>
            </motion.article>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={`mt-12 grid gap-7 ${style === 'scrapbook' ? 'sm:grid-cols-12' : 'sm:grid-cols-2 lg:grid-cols-3'}`}
    >
      {stories.map((story, index) => {
        const image =
          story.imageUrl ||
          images[index % Math.max(images.length, 1)]?.url ||
          FALLBACK_MEDIA.story[index % FALLBACK_MEDIA.story.length];
        const rotation = index % 2 === 0 ? '-rotate-1' : 'rotate-1';
        const scrapbookSpan =
          index % 3 === 0
            ? 'sm:col-span-7'
            : index % 3 === 1
              ? 'sm:col-span-5'
              : 'sm:col-span-6';
        return (
          <motion.article
            key={story.id}
            initial={reducedMotion ? false : { opacity: 0, scale: 0.92, y: 34 }}
            whileInView={
              reducedMotion ? undefined : { opacity: 1, scale: 1, y: 0 }
            }
            whileHover={reducedMotion ? undefined : { rotate: 0, y: -8 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.65, delay: (index % 3) * 0.08 }}
            className={`${rotation} ${style === 'scrapbook' ? scrapbookSpan : ''} relative bg-[#fffdf7] p-3 pb-7 shadow-[0_28px_80px_rgba(35,29,19,.17)]`}
          >
            <span className="absolute -top-3 left-1/2 h-7 w-20 -translate-x-1/2 rotate-[-2deg] bg-[var(--theme-accent)]/25 backdrop-blur" />
            <div
              className={`relative overflow-hidden ${style === 'scrapbook' && index % 3 === 0 ? 'aspect-[16/10]' : 'aspect-[4/5]'}`}
            >
              <ImageWithFallback
                src={image}
                fallbackSrc={
                  FALLBACK_MEDIA.story[index % FALLBACK_MEDIA.story.length]
                }
                alt={`${story.title} — ${coupleNames}`}
                fill
                sizes="(max-width: 768px) 90vw, 42vw"
                className="object-cover transition duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              <span className="absolute right-4 bottom-4 left-4 text-[9px] font-black tracking-[.22em] text-white/75 uppercase">
                Chapter {String(index + 1).padStart(2, '0')}
              </span>
            </div>
            <div className="px-2 pt-5 text-center">
              <time className="text-[9px] font-bold tracking-[.16em] text-[var(--gold)] uppercase">
                {formatStoryDate(story.date)}
              </time>
              <h3 className="font-display mt-2 text-3xl text-[var(--ink)]">
                {story.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--ink)]/55">
                {story.story}
              </p>
              <p className="font-script mt-4 text-lg text-[var(--gold)]">
                {coupleNames}
              </p>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}

export function OurStory({
  stories,
  media,
  coupleNames,
  style = 'cinematic',
}: {
  stories: LoveStoryItem[];
  media: MediaItem[];
  coupleNames: string;
  style?: StoryStyle;
}) {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 75%', 'end 25%'],
  });
  const lineProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 24,
    mass: 0.35,
  });
  const sortedStories = useMemo(
    () => [...stories].sort((a, b) => a.sortOrder - b.sortOrder),
    [stories],
  );

  if (!sortedStories.length) return null;

  return (
    <section
      ref={sectionRef}
      id="story"
      data-testid="our-story-section"
      data-story-layout={style}
      className="our-story-section theme-section-light section-light relative overflow-hidden px-5 py-24 sm:py-36"
    >
      <div className="story-orb story-orb-one absolute -top-32 -left-32 size-80 rounded-full blur-3xl" />
      <div className="story-orb story-orb-two absolute top-1/2 -right-40 size-96 rounded-full blur-3xl" />
      <div className="batik-elegant pointer-events-none absolute inset-0 opacity-20" />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Our Story"
          title="Dari pertemuan sederhana menuju selamanya"
          description="Setiap foto menyimpan satu musim, setiap cerita membawa kami semakin dekat pada rumah yang sama."
        />

        {style === 'cinematic' || style === 'zigzag' ? (
          <div className="relative mt-8 sm:mt-14">
            <div className="absolute top-8 bottom-8 left-1/2 hidden w-px -translate-x-1/2 overflow-hidden bg-[var(--gold)]/15 lg:block">
              <motion.div
                style={reducedMotion ? { scaleY: 1 } : { scaleY: lineProgress }}
                className="h-full origin-top bg-gradient-to-b from-transparent via-[var(--gold)] to-transparent"
              />
            </div>

            {sortedStories.map((story, index) => (
              <StoryChapter
                key={story.id}
                story={story}
                index={index}
                total={sortedStories.length}
                media={media}
                coupleNames={coupleNames}
              />
            ))}
          </div>
        ) : (
          <AlternateStoryLayout
            stories={sortedStories}
            media={media}
            coupleNames={coupleNames}
            style={style}
          />
        )}
      </div>
    </section>
  );
}
