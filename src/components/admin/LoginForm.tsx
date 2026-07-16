'use client';

import { LockKeyhole, Mail } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export function LoginForm({
  configurationError,
}: {
  configurationError: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(result.message || 'Login gagal.');
      toast.success('Login berhasil.');
      router.replace(searchParams.get('next') || '/admin');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login gagal.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'w-full rounded-2xl border border-black/15 bg-white px-11 py-3 outline-none transition focus:border-[#b8944d]';
  return (
    <form onSubmit={submit} className="mt-8 space-y-5">
      {configurationError && (
        <p className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Konfigurasi belum lengkap:</strong> {configurationError} Salin
          `.env.example` menjadi `.env.local`, lalu isi kredensial admin.
        </p>
      )}
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-semibold">
          Email admin
        </label>
        <div className="relative">
          <Mail className="absolute top-3.5 left-4 text-black/40" size={18} />
          <input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-semibold">
          Password
        </label>
        <div className="relative">
          <LockKeyhole
            className="absolute top-3.5 left-4 text-black/40"
            size={18}
          />
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading || Boolean(configurationError)}
        className="min-h-12 w-full rounded-full bg-[#2f302b] px-6 font-bold text-white transition hover:bg-[#b8944d] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}
      </button>
    </form>
  );
}
