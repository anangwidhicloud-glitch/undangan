'use client';

import { Music2, Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function MusicPlayer({
  src,
  title,
  canStart,
}: {
  src: string;
  title: string;
  canStart: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!canStart || !audioRef.current) return;
    audioRef.current.volume = 0.25;
    audioRef.current
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, [canStart]);

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      await audio.play();
      setPlaying(true);
    } else {
      audio.pause();
      setPlaying(false);
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full border border-white/15 bg-[#171812]/88 p-1.5 pr-3 text-white shadow-[0_18px_55px_rgba(0,0,0,.28)] backdrop-blur-2xl sm:top-5 sm:right-5">
      <audio
        ref={audioRef}
        src={src}
        loop
        preload="none"
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
      />
      <button
        type="button"
        onClick={toggle}
        disabled={!canStart}
        className="gold-button grid size-10 place-items-center rounded-full text-[#1d1e19] disabled:cursor-not-allowed disabled:opacity-50 sm:size-11"
        aria-label={playing ? 'Jeda musik' : 'Putar musik'}
      >
        {playing ? <Pause size={18} /> : <Play size={18} />}
      </button>
      <span className="hidden max-w-40 truncate text-xs sm:block">
        <Music2 className="mr-1 inline" size={14} />
        {title}
      </span>
    </div>
  );
}
