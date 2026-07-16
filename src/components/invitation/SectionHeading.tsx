import Image from 'next/image';

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  tone = 'dark',
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'center' | 'left';
  tone?: 'dark' | 'light';
}) {
  const centered = align === 'center';
  const light = tone === 'light';

  return (
    <div
      className={`mb-10 max-w-3xl sm:mb-14 ${centered ? 'mx-auto text-center' : ''}`}
      data-aos="fade-up"
    >
      <div
        className={`flex items-center gap-3 ${centered ? 'justify-center' : ''}`}
      >
        <span
          className={`h-px w-8 ${light ? 'bg-[var(--theme-accent)]/70' : 'bg-[var(--theme-accent)]/70'}`}
        />
        <p
          className={`text-[10px] font-extrabold tracking-[.34em] uppercase sm:text-xs ${light ? 'text-[var(--theme-accent)]' : 'text-[var(--theme-accent)]'}`}
        >
          {eyebrow}
        </p>
        <span
          className={`h-px w-8 ${light ? 'bg-[var(--theme-accent)]/70' : 'bg-[var(--theme-accent)]/70'}`}
        />
      </div>
      <h2
        className={`theme-heading font-display mt-4 text-5xl leading-[.88] font-medium text-balance sm:text-7xl ${light ? 'text-white' : ''}`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-5 max-w-2xl text-sm leading-7 sm:text-base ${centered ? 'mx-auto' : ''} ${light ? 'text-white/60' : 'text-[var(--theme-muted)]'}`}
        >
          {description}
        </p>
      )}
      <Image
        src="/images/ornament.svg"
        alt=""
        width={224}
        height={56}
        className={`theme-heading-ornament mt-4 h-12 w-48 opacity-70 ${centered ? 'mx-auto' : ''} ${light ? 'brightness-0 invert' : ''}`}
      />
    </div>
  );
}
