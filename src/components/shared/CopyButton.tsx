'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function CopyButton({
  value,
  label = 'Salin',
  className = '',
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success('Berhasil disalin.');
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('Tidak dapat menyalin. Silakan salin secara manual.');
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-current px-4 text-sm font-semibold transition hover:-translate-y-0.5',
        className,
      )}
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? 'Tersalin' : label}
    </button>
  );
}
