import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from '@/components/admin/LoginForm';
import { getAdminConfigurationError } from '@/lib/env';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Login Admin',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="paper-texture grid min-h-screen place-items-center bg-[#f5f0e6] p-5">
      <section className="w-full max-w-md rounded-[2rem] border border-[#b8944d]/25 bg-white/90 p-6 shadow-2xl shadow-black/10 sm:p-9">
        <p className="text-xs font-bold tracking-[.3em] text-[#9a783e] uppercase">
          Wedding Console
        </p>
        <h1 className="font-display mt-3 text-5xl leading-none">Admin Login</h1>
        <p className="mt-4 text-sm leading-relaxed text-black/60">
          Kelola undangan, tamu, RSVP, media, dan tampilan dari satu tempat.
        </p>
        <Suspense
          fallback={
            <div className="mt-8 h-64 animate-pulse rounded-2xl bg-black/5" />
          }
        >
          <LoginForm configurationError={getAdminConfigurationError()} />
        </Suspense>
      </section>
    </main>
  );
}
