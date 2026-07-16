'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Send } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  rsvpSchema,
  type RsvpFormInput,
  type RsvpInput,
} from '@/lib/validations/rsvp';
import { safeJsonParse } from '@/lib/utils';

export function RsvpForm({
  weddingId,
  initialName = '',
}: {
  weddingId: string;
  initialName?: string;
}) {
  const [demoMode, setDemoMode] = useState(false);
  const form = useForm<RsvpFormInput, unknown, RsvpInput>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      weddingId,
      guestName: initialName,
      attendanceStatus: 'hadir',
      guestCount: 1,
      phone: '',
      message: '',
      website: '',
    },
  });

  async function onSubmit(values: RsvpInput) {
    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(values),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        mode?: 'demo' | 'supabase';
        message?: string;
      };
      if (!response.ok || !result.ok)
        throw new Error(result.message || 'RSVP gagal dikirim.');
      if (result.mode === 'demo') {
        const previous = safeJsonParse<RsvpInput[]>(
          localStorage.getItem('wedding-demo-rsvps'),
          [],
        );
        localStorage.setItem(
          'wedding-demo-rsvps',
          JSON.stringify([{ ...values }, ...previous].slice(0, 100)),
        );
        setDemoMode(true);
      }
      toast.success(
        result.mode === 'demo'
          ? 'RSVP tersimpan di perangkat ini (mode demo).'
          : 'RSVP berhasil dikirim.',
      );
      form.reset({ ...values, message: '', website: '' });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Terjadi kesalahan.',
      );
    }
  }

  const inputClass =
    'mt-2 w-full rounded-2xl border border-black/15 bg-white/85 px-4 py-3 text-base shadow-sm outline-none transition focus:border-[#b8944d]';

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="mx-auto max-w-2xl space-y-5 rounded-[2rem] border border-[#b8944d]/25 bg-white/80 p-5 shadow-xl shadow-black/5 backdrop-blur sm:p-8"
      noValidate
    >
      {demoMode && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
          Supabase belum aktif. Data RSVP disimpan sementara di localStorage
          perangkat ini.
        </p>
      )}
      <div>
        <label htmlFor="guestName" className="font-semibold">
          Nama tamu
        </label>
        <input
          id="guestName"
          autoComplete="name"
          className={inputClass}
          {...form.register('guestName')}
        />
        <p className="mt-1 text-sm text-red-700">
          {form.formState.errors.guestName?.message}
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="attendanceStatus" className="font-semibold">
            Konfirmasi kehadiran
          </label>
          <select
            id="attendanceStatus"
            className={inputClass}
            {...form.register('attendanceStatus')}
          >
            <option value="hadir">Insyaallah hadir</option>
            <option value="ragu">Masih ragu</option>
            <option value="tidak_hadir">Tidak dapat hadir</option>
          </select>
        </div>
        <div>
          <label htmlFor="guestCount" className="font-semibold">
            Jumlah tamu
          </label>
          <input
            id="guestCount"
            type="number"
            inputMode="numeric"
            min="0"
            max="10"
            className={inputClass}
            {...form.register('guestCount')}
          />
          <p className="mt-1 text-sm text-red-700">
            {form.formState.errors.guestCount?.message}
          </p>
        </div>
      </div>
      <div>
        <label htmlFor="phone" className="font-semibold">
          Nomor WhatsApp{' '}
          <span className="font-normal text-black/50">(opsional)</span>
        </label>
        <input
          id="phone"
          inputMode="tel"
          autoComplete="tel"
          className={inputClass}
          {...form.register('phone')}
        />
      </div>
      <div>
        <label htmlFor="message" className="font-semibold">
          Ucapan dan doa
        </label>
        <textarea
          id="message"
          rows={4}
          className={inputClass}
          {...form.register('message')}
        />
        <p className="mt-1 text-sm text-red-700">
          {form.formState.errors.message?.message}
        </p>
      </div>
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          tabIndex={-1}
          autoComplete="off"
          {...form.register('website')}
        />
      </div>
      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#2f302b] px-6 font-bold text-white transition hover:bg-[#b8944d] disabled:opacity-60"
      >
        <Send size={18} />{' '}
        {form.formState.isSubmitting ? 'Mengirim...' : 'Kirim Konfirmasi'}
      </button>
    </form>
  );
}
