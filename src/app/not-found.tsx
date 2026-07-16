import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f0e6] p-6 text-center">
      <div>
        <p className="text-xs font-bold tracking-[.3em] text-[#9a783e] uppercase">
          404
        </p>
        <h1 className="font-display mt-3 text-5xl">Undangan tidak ditemukan</h1>
        <p className="mt-4 text-black/60">
          Periksa kembali tautan undangan yang Anda terima.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex rounded-full bg-[#2f302b] px-6 py-3 font-bold text-white"
        >
          Kembali
        </Link>
      </div>
    </main>
  );
}
