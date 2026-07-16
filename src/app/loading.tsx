export default function Loading() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f5f0e6]">
      <div className="text-center">
        <div className="mx-auto size-12 animate-spin rounded-full border-2 border-[#b8944d] border-t-transparent" />
        <p className="mt-4 text-sm text-black/60">Menyiapkan undangan...</p>
      </div>
    </div>
  );
}
