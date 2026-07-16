'use client';

import { Expand, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FALLBACK_MEDIA } from '@/config/fallback-content';
import type { GalleryStyle, MediaItem } from '@/types/wedding';
import { ImageWithFallback } from '@/components/shared/ImageWithFallback';

function GalleryImage({
  item,
  index,
  className,
  imageClassName = 'object-cover transition duration-1000 ease-out group-hover:scale-[1.06]',
  onOpen,
}: {
  item: MediaItem;
  index: number;
  className: string;
  imageClassName?: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group gallery-tile relative overflow-hidden text-left ${className}`}
      aria-label={`Buka ${item.altText}`}
      data-aos="fade-up"
      data-aos-delay={(index % 3) * 70}
    >
      <ImageWithFallback
        src={item.url}
        fallbackSrc={
          FALLBACK_MEDIA.gallery[index % FALLBACK_MEDIA.gallery.length]
        }
        alt={item.altText}
        fill
        sizes="(max-width: 768px) 92vw, (max-width: 1200px) 48vw, 34vw"
        className={imageClassName}
      />
      <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent opacity-70 transition group-hover:opacity-95" />
      <span className="absolute top-4 right-4 grid size-9 translate-y-2 place-items-center rounded-full border border-white/25 bg-black/20 text-white opacity-0 backdrop-blur transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <Expand size={15} />
      </span>
      <span className="absolute right-4 bottom-4 left-4 translate-y-2 text-white transition duration-500 group-hover:translate-y-0">
        <span className="text-[8px] font-bold tracking-[.25em] text-[var(--theme-accent)] uppercase">
          Moment {String(index + 1).padStart(2, '0')}
        </span>
        <span className="font-display mt-1 block text-2xl">
          {item.caption || 'Captured with love'}
        </span>
      </span>
    </button>
  );
}

export function Gallery({
  items,
  style = 'masonry',
}: {
  items: MediaItem[];
  style?: GalleryStyle;
}) {
  const images = items.filter((item) => item.type === 'image');
  const [selected, setSelected] = useState<MediaItem | null>(null);

  useEffect(() => {
    if (!selected) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', close);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', close);
    };
  }, [selected]);

  const slideshow = (
    <Swiper
      modules={[Pagination]}
      pagination={{ clickable: true }}
      spaceBetween={16}
      slidesPerView={1.06}
      centeredSlides
      breakpoints={{
        768: { slidesPerView: 1.28, spaceBetween: 24 },
        1200: { slidesPerView: 1.5, spaceBetween: 28 },
      }}
      className="gallery-slideshow !overflow-visible"
    >
      {images.map((item, index) => (
        <SwiperSlide key={item.id}>
          <GalleryImage
            item={item}
            index={index}
            onOpen={() => setSelected(item)}
            className="h-[31rem] w-full rounded-[2rem] shadow-2xl sm:h-[38rem]"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );

  return (
    <>
      <div data-gallery-layout={style}>
        {style === 'slideshow' && slideshow}

        {style === 'filmstrip' && (
          <div className="hide-scrollbar flex snap-x gap-4 overflow-x-auto pb-6 sm:gap-6">
            {images.map((item, index) => (
              <GalleryImage
                key={item.id}
                item={item}
                index={index}
                onOpen={() => setSelected(item)}
                className="h-[30rem] w-[82vw] shrink-0 snap-center rounded-[1.8rem] shadow-xl sm:h-[36rem] sm:w-[34rem]"
              />
            ))}
          </div>
        )}

        {style === 'polaroid' && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-8">
            {images.map((item, index) => (
              <div
                key={item.id}
                className={`${index % 2 === 0 ? '-rotate-2' : 'rotate-2'} bg-white p-2 pb-9 shadow-[0_24px_70px_rgba(0,0,0,.16)] transition hover:z-10 hover:scale-[1.03] hover:rotate-0 sm:p-3 sm:pb-12`}
              >
                <GalleryImage
                  item={item}
                  index={index}
                  onOpen={() => setSelected(item)}
                  className="aspect-[4/5] w-full rounded-sm"
                />
                <p className="font-script mt-2 text-center text-sm text-black/55 sm:text-lg">
                  {item.caption || `Memory ${index + 1}`}
                </p>
              </div>
            ))}
          </div>
        )}

        {style === 'classic-grid' && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
            {images.map((item, index) => (
              <GalleryImage
                key={item.id}
                item={item}
                index={index}
                onOpen={() => setSelected(item)}
                className="aspect-square w-full rounded-lg border border-[var(--theme-accent)]/15"
              />
            ))}
          </div>
        )}

        {style === 'masonry' && (
          <>
            <div className="hidden auto-rows-[15rem] grid-cols-12 gap-4 sm:grid">
              {images.map((item, index) => {
                const layouts = [
                  'col-span-7 row-span-2',
                  'col-span-5 row-span-1',
                  'col-span-5 row-span-1',
                  'col-span-4 row-span-1',
                  'col-span-4 row-span-1',
                  'col-span-4 row-span-1',
                ];
                return (
                  <GalleryImage
                    key={item.id}
                    item={item}
                    index={index}
                    onOpen={() => setSelected(item)}
                    className={`rounded-[2rem] ${layouts[index % layouts.length]}`}
                  />
                );
              })}
            </div>
            <div className="sm:hidden">{slideshow}</div>
          </>
        )}
      </div>

      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau foto"
          className="fixed inset-0 z-[90] grid place-items-center bg-[#0b0c09]/96 p-4 backdrop-blur-xl"
          onClick={() => setSelected(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 z-10 grid size-12 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur"
            onClick={() => setSelected(null)}
            aria-label="Tutup pratinjau"
          >
            <X />
          </button>
          <div
            className="relative h-[78vh] w-full max-w-6xl"
            onClick={(event) => event.stopPropagation()}
          >
            <ImageWithFallback
              src={selected.url}
              fallbackSrc={FALLBACK_MEDIA.hero}
              alt={selected.altText}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
          {selected.caption && (
            <p className="font-display absolute right-4 bottom-5 left-4 text-center text-2xl text-white/80">
              {selected.caption}
            </p>
          )}
        </div>
      )}
    </>
  );
}
