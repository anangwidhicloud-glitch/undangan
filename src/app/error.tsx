'use client';
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f0e6] p-6 text-center">
      <div>
        <h1 className="font-display text-5xl">Ada kendala kecil</h1>
        <p className="mt-4 text-black/60">
          Undangan belum dapat ditampilkan. Silakan coba kembali.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-7 rounded-full bg-[#2f302b] px-6 py-3 font-bold text-white"
        >
          Coba lagi
        </button>
      </div>
    </main>
  );
}
