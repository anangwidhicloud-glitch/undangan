'use client';

import {
  BarChart3,
  BookHeart,
  Check,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  CircleUserRound,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  Gift,
  HeartHandshake,
  ImageIcon,
  LayoutDashboard,
  Link2,
  LogOut,
  MapPinned,
  Menu,
  MessageCircle,
  Music2,
  Palette,
  Plus,
  RotateCcw,
  Save,
  Search,
  Settings,
  Sparkles,
  Trash2,
  Upload,
  Users,
  Video,
  X,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { FALLBACK_MEDIA } from '@/config/fallback-content';
import { LAYOUT_PRESETS, getLayoutPreset } from '@/config/layout-presets';
import { THEME_PRESETS, getThemePreset } from '@/config/theme-presets';
import { ImageWithFallback } from '@/components/shared/ImageWithFallback';
import { ResponsiveVideo } from '@/components/shared/ResponsiveVideo';
import { resolveWeddingContent } from '@/lib/content-resolver';
import { parseGuestWorkbook } from '@/lib/excel';
import {
  buildWhatsAppLink,
  createGuestSlug,
  normalizeIndonesianPhone,
} from '@/lib/guest-utils';
import { safeJsonParse } from '@/lib/utils';
import type {
  CoupleProfile,
  GiftAccount,
  GuestRecord,
  MediaItem,
  ThemeConfig,
  WeddingContent,
  WeddingEvent,
} from '@/types/wedding';

const menu = [
  ['dashboard', 'Dashboard', LayoutDashboard],
  ['profile', 'Profil pengantin', CircleUserRound],
  ['events', 'Informasi acara', CalendarDays],
  ['story', 'Our Story', BookHeart],
  ['gallery', 'Galeri', ImageIcon],
  ['video', 'Video', Video],
  ['music', 'Musik', Music2],
  ['location', 'Lokasi dan peta', MapPinned],
  ['messages', 'Buku tamu', MessageCircle],
  ['rsvp', 'RSVP', HeartHandshake],
  ['guests', 'Daftar tamu', Users],
  ['import', 'Import Excel', FileSpreadsheet],
  ['gifts', 'Rekening dan hadiah', Gift],
  ['theme', 'Tema & UI/UX Layout', Palette],
  ['settings', 'Pengaturan undangan', Settings],
  ['preview', 'Preview undangan', Eye],
  ['analytics', 'Statistik pengunjung', BarChart3],
] as const;

type Tab = (typeof menu)[number][0];
const inputClass =
  'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-amber-600';

function Panel({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          {description && (
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      {children}
      {hint && (
        <span className="mt-1 block text-xs font-normal text-slate-400">
          {hint}
        </span>
      )}
    </label>
  );
}

function CloudinaryUploadButton({
  label,
  accept,
  expected,
  onUploaded,
  help,
}: {
  label: string;
  accept: string;
  expected: 'image' | 'video' | 'audio';
  onUploaded: (result: {
    url: string;
    publicId?: string;
    thumbnailUrl?: string;
  }) => void;
  help?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);

  function upload(file: File) {
    setProgress(1);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/cloudinary/upload');
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(
          Math.max(1, Math.round((event.loaded / event.total) * 100)),
        );
      }
    };
    xhr.onload = () => {
      const result = safeJsonParse<{
        ok?: boolean;
        url?: string;
        publicId?: string;
        thumbnailUrl?: string;
        resourceType?: 'image' | 'video';
        mediaKind?: 'image' | 'video' | 'audio';
        message?: string;
      }>(xhr.responseText, {});
      setProgress(0);
      const actualKind = result.mediaKind || result.resourceType;
      if (
        xhr.status >= 400 ||
        !result.ok ||
        !result.url ||
        (expected === 'image' && actualKind !== 'image') ||
        (expected === 'video' && actualKind !== 'video') ||
        (expected === 'audio' && actualKind !== 'audio')
      ) {
        toast.error(result.message || `Upload ${expected} gagal.`);
        return;
      }
      onUploaded({
        url: result.url,
        publicId: result.publicId,
        thumbnailUrl: result.thumbnailUrl,
      });
      toast.success(`${label} berhasil diupload. Klik Simpan Perubahan.`);
    };
    xhr.onerror = () => {
      setProgress(0);
      toast.error(`Upload ${expected} gagal.`);
    };
    const form = new FormData();
    form.append('file', file);
    xhr.send(form);
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={progress > 0}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) upload(file);
          event.currentTarget.value = '';
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={progress > 0}
        className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
      >
        <Upload size={16} />
        {progress > 0 ? `Mengupload ${progress}%` : label}
      </button>
      {help && <p className="text-xs leading-5 text-slate-500">{help}</p>}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

function moveItem<T>(items: T[], from: number, direction: -1 | 1): T[] {
  const to = from + direction;
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

export function AdminDashboard({
  initialContent,
  dataSource,
}: {
  initialContent: WeddingContent;
  dataSource: 'supabase' | 'fallback';
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = (searchParams.get('tab') || 'dashboard') as Tab;
  const [content, setContent] = useState(initialContent);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const storageKey = `wedding-admin-draft:${initialContent.slug}`;

useEffect(() => {
  // Draft browser hanya digunakan ketika Supabase belum aktif.
  if (dataSource !== 'fallback') {
    localStorage.removeItem(storageKey);
    return;
  }

  const local = safeJsonParse<WeddingContent | null>(
    localStorage.getItem(storageKey),
    null,
  );

  if (!local) return;

  const timer = window.setTimeout(() => {
    setContent(resolveWeddingContent(local));
  }, 0);

  return () => window.clearTimeout(timer);
}, [dataSource, storageKey]);

  function update(patch: Partial<WeddingContent>) {
    setContent((value) => ({ ...value, ...patch }));
    setDirty(true);
  }
  function selectTab(tab: Tab) {
    router.push(`/admin?tab=${tab}`);
    setMobileOpen(false);
  }

  async function save() {
  setSaving(true);

  try {
    const response = await fetch('/api/admin/content', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(content),
    });

    const result = (await response.json()) as {
      ok?: boolean;
      mode?: 'supabase' | 'demo';
      message?: string;
      content?: WeddingContent;
    };

    if (!response.ok || !result.ok) {
      throw new Error(result.message || 'Penyimpanan gagal.');
    }

    if (result.mode === 'demo') {
      // Mode demo tetap menggunakan draft browser.
      localStorage.setItem(storageKey, JSON.stringify(content));
    } else {
      // Supabase menjadi sumber utama. Jangan simpan draft lama.
      localStorage.removeItem(storageKey);

      if (result.content) {
        setContent(resolveWeddingContent(result.content));
      }
    }

    setDirty(false);

    toast.success(
      result.mode === 'demo'
        ? 'Draft tersimpan di browser karena Supabase belum aktif.'
        : 'Perubahan berhasil tersimpan ke Supabase.',
    );
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : 'Penyimpanan gagal.',
    );
  } finally {
    setSaving(false);
  }
}

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  }

  const stats = useMemo(() => {
    const rsvps = content.rsvps ?? [];
    const total = content.guests.length;
    const hadir = rsvps.length
      ? rsvps.filter((r) => r.attendanceStatus === 'hadir').length
      : content.guests.filter((g) => g.rsvpStatus === 'hadir').length;
    const tidak = rsvps.length
      ? rsvps.filter((r) => r.attendanceStatus === 'tidak_hadir').length
      : content.guests.filter((g) => g.rsvpStatus === 'tidak_hadir').length;
    const ragu = rsvps.length
      ? rsvps.filter((r) => r.attendanceStatus === 'ragu').length
      : content.guests.filter((g) => g.rsvpStatus === 'ragu').length;
    const rsvp = hadir + tidak + ragu;
    return {
      total,
      hadir,
      tidak,
      ragu,
      rsvp,
      attendanceRate: rsvp ? Math.round((hadir / rsvp) * 100) : 0,
    };
  }, [content.guests, content.rsvps]);

  const activeLabel =
    menu.find(([id]) => id === currentTab)?.[1] || 'Dashboard';

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-800 bg-slate-950 text-white transition-transform lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <div>
            <p className="text-[10px] font-bold tracking-[.28em] text-amber-400 uppercase">
              Wedding Console
            </p>
            <p className="font-display mt-1 text-2xl">
              {content.couples[0]?.nickname} & {content.couples[1]?.nickname}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="grid size-10 place-items-center rounded-lg hover:bg-white/10 lg:hidden"
            aria-label="Tutup menu"
          >
            <X />
          </button>
        </div>
        <nav
          className="hide-scrollbar h-[calc(100vh-10rem)] overflow-y-auto p-3"
          aria-label="Navigasi admin"
        >
          {menu.map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => selectTab(id)}
              className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${currentTab === id ? 'bg-amber-500 font-bold text-slate-950' : 'text-slate-300 hover:bg-white/8 hover:text-white'}`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
        <button
          type="button"
          onClick={logout}
          className="absolute right-3 bottom-3 left-3 flex items-center gap-3 rounded-xl border border-white/10 px-3 py-3 text-sm text-slate-300 hover:bg-red-500/15 hover:text-red-200"
        >
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {mobileOpen && (
        <button
          aria-label="Tutup menu"
          className="fixed inset-0 z-30 bg-black/45 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex min-h-20 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid size-11 place-items-center rounded-xl border border-slate-200 lg:hidden"
              aria-label="Buka menu"
            >
              <Menu />
            </button>
            <div>
              <h1 className="text-xl font-bold">{activeLabel}</h1>
              <p className="text-xs text-slate-500">
                {dataSource === 'fallback'
                  ? 'Mode demo · Supabase belum aktif'
                  : 'Terhubung ke Supabase'}{' '}
                {dirty ? '· Ada perubahan belum disimpan' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`/invite/${content.slug}`}
              target="_blank"
              rel="noreferrer"
              className="hidden min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold sm:inline-flex"
            >
              <ExternalLink size={16} /> Lihat undangan
            </a>
            <button
              type="button"
              onClick={save}
              disabled={saving || !dirty}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white disabled:opacity-40"
            >
              <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6">
          {currentTab === 'dashboard' && (
            <DashboardTab content={content} stats={stats} />
          )}
          {currentTab === 'profile' && (
            <ProfileTab content={content} update={update} />
          )}
          {currentTab === 'events' && (
            <EventsTab content={content} update={update} />
          )}
          {currentTab === 'story' && (
            <StoryTab content={content} update={update} />
          )}
          {currentTab === 'gallery' && (
            <GalleryTab content={content} update={update} />
          )}
          {currentTab === 'video' && (
            <VideoTab content={content} update={update} />
          )}
          {currentTab === 'music' && (
            <MusicTab content={content} update={update} />
          )}
          {currentTab === 'location' && (
            <LocationTab content={content} update={update} />
          )}
          {currentTab === 'messages' && (
            <MessagesTab content={content} update={update} />
          )}
          {currentTab === 'rsvp' && <RsvpTab content={content} stats={stats} />}
          {currentTab === 'guests' && (
            <GuestsTab content={content} update={update} />
          )}
          {currentTab === 'import' && (
            <ImportTab content={content} update={update} />
          )}
          {currentTab === 'gifts' && (
            <GiftsTab content={content} update={update} />
          )}
          {currentTab === 'theme' && (
            <ThemeTab content={content} update={update} />
          )}
          {currentTab === 'settings' && (
            <SettingsTab content={content} update={update} />
          )}
          {currentTab === 'preview' && (
            <PreviewTab content={content} save={save} />
          )}
          {currentTab === 'analytics' && (
            <AnalyticsTab content={content} stats={stats} />
          )}
        </main>
      </div>
    </div>
  );
}

function DashboardTab({
  content,
  stats,
}: {
  content: WeddingContent;
  stats: {
    total: number;
    hadir: number;
    tidak: number;
    ragu: number;
    rsvp: number;
    attendanceRate: number;
  };
}) {
  const cards = [
    ['Total tamu', stats.total],
    ['Total RSVP', stats.rsvp],
    ['Hadir', stats.hadir],
    ['Tidak hadir', stats.tidak],
    ['Masih ragu', stats.ragu],
    ['Kehadiran', `${stats.attendanceRate}%`],
    ['Ucapan', content.messages.length],
    ['Media', content.media.length],
  ];
  const chart = [
    { name: 'Hadir', value: stats.hadir },
    { name: 'Tidak hadir', value: stats.tidak },
    { name: 'Ragu', value: stats.ragu },
    { name: 'Belum', value: Math.max(0, stats.total - stats.rsvp) },
  ];
  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
              {label}
            </p>
            <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel
          title="Ringkasan RSVP"
          description="Distribusi status RSVP dari daftar tamu."
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#b8944d" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Status undangan">
          <dl className="space-y-4 text-sm">
            <div className="flex justify-between">
              <dt>Status publikasi</dt>
              <dd className="font-bold capitalize">{content.status}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Slug</dt>
              <dd className="font-mono">{content.slug}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Tanggal utama</dt>
              <dd className="font-bold">
                {new Date(content.eventDate).toLocaleDateString('id-ID')}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Acara</dt>
              <dd className="font-bold">{content.events.length}</dd>
            </div>
          </dl>
        </Panel>
      </div>
    </>
  );
}

function ProfileTab({
  content,
  update,
}: {
  content: WeddingContent;
  update: (patch: Partial<WeddingContent>) => void;
}) {
  const [uploadingProfile, setUploadingProfile] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  function patch(index: number, value: Partial<CoupleProfile>) {
    update({
      couples: content.couples.map((item, i) =>
        i === index ? { ...item, ...value } : item,
      ),
    });
  }

  function uploadProfileImage(index: number, file: File) {
    setUploadingProfile(index);
    setUploadProgress(1);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/cloudinary/upload');
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setUploadProgress(
          Math.max(1, Math.round((event.loaded / event.total) * 100)),
        );
      }
    };
    xhr.onload = () => {
      const result = safeJsonParse<{
        ok?: boolean;
        url?: string;
        resourceType?: 'image' | 'video';
        message?: string;
      }>(xhr.responseText, {});

      setUploadingProfile(null);
      setUploadProgress(0);

      if (
        xhr.status >= 400 ||
        !result.ok ||
        !result.url ||
        result.resourceType === 'video'
      ) {
        toast.error(result.message || 'Upload foto profil gagal.');
        return;
      }

      patch(index, { photoUrl: result.url });
      toast.success('Foto profil berhasil diupload. Klik Simpan Perubahan.');
    };
    xhr.onerror = () => {
      setUploadingProfile(null);
      setUploadProgress(0);
      toast.error('Upload foto profil gagal.');
    };

    const form = new FormData();
    form.append('file', file);
    xhr.send(form);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {content.couples.map((couple, index) => (
        <Panel
          key={couple.id}
          title={couple.role === 'groom' ? 'Mempelai pria' : 'Mempelai wanita'}
          description="Semua perubahan tampil pada halaman publik setelah disimpan."
        >
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-[150px_1fr] sm:items-start">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-slate-100 shadow-inner">
                <ImageWithFallback
                  src={couple.photoUrl}
                  fallbackSrc={
                    couple.role === 'groom'
                      ? FALLBACK_MEDIA.groom
                      : FALLBACK_MEDIA.bride
                  }
                  alt={`Preview foto ${couple.nickname}`}
                  fill
                  sizes="150px"
                  className="object-cover"
                />
              </div>
              <div className="grid gap-3">
                <input
                  id={`profile-upload-${couple.id}`}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="sr-only"
                  disabled={uploadingProfile !== null}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) uploadProfileImage(index, file);
                    event.currentTarget.value = '';
                  }}
                />
                <label
                  htmlFor={`profile-upload-${couple.id}`}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
                >
                  <Upload size={16} />
                  {uploadingProfile === index
                    ? `Mengupload ${uploadProgress}%`
                    : 'Upload foto ke Cloudinary'}
                </label>
                <p className="text-xs leading-5 text-slate-500">
                  Gunakan JPG, PNG, WebP, atau AVIF. Setelah upload selesai,
                  klik tombol Simpan Perubahan di bagian atas admin.
                </p>
              </div>
            </div>

            <Field label="Nama lengkap">
              <input
                className={inputClass}
                value={couple.fullName}
                onChange={(e) => patch(index, { fullName: e.target.value })}
              />
            </Field>
            <Field label="Nama panggilan">
              <input
                className={inputClass}
                value={couple.nickname}
                onChange={(e) => patch(index, { nickname: e.target.value })}
              />
            </Field>
            <Field label="Nama orang tua">
              <textarea
                className={inputClass}
                rows={2}
                value={couple.parentNames}
                onChange={(e) => patch(index, { parentNames: e.target.value })}
              />
            </Field>
            <Field label="URL foto">
              <input
                className={inputClass}
                value={couple.photoUrl}
                onChange={(e) => patch(index, { photoUrl: e.target.value })}
                placeholder="URL Cloudinary atau gambar HTTPS"
              />
            </Field>
            <Field label="Instagram">
              <input
                className={inputClass}
                value={couple.instagramUrl || ''}
                onChange={(e) => patch(index, { instagramUrl: e.target.value })}
              />
            </Field>
            <Field label="Deskripsi">
              <textarea
                className={inputClass}
                rows={4}
                value={couple.description}
                onChange={(e) => patch(index, { description: e.target.value })}
              />
            </Field>
          </div>
        </Panel>
      ))}
    </div>
  );
}

function EventsTab({
  content,
  update,
}: {
  content: WeddingContent;
  update: (patch: Partial<WeddingContent>) => void;
}) {
  function patch(index: number, value: Partial<WeddingEvent>) {
    update({
      events: content.events.map((item, i) =>
        i === index ? { ...item, ...value } : item,
      ),
    });
  }
  function add() {
    update({
      events: [
        ...content.events,
        {
          id: crypto.randomUUID(),
          eventType: 'acara-tambahan',
          title: 'Acara Tambahan',
          date: content.eventDate.slice(0, 10),
          startTime: '10:00',
          endTime: '12:00',
          timezone: 'Asia/Jakarta',
          venueName: '',
          address: '',
          sortOrder: content.events.length + 1,
        },
      ],
    });
  }
  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={add}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white"
        >
          <Plus size={16} /> Tambah acara
        </button>
      </div>
      {content.events.map((event, index) => (
        <Panel
          key={event.id}
          title={event.title || `Acara ${index + 1}`}
          action={
            <button
              type="button"
              onClick={() =>
                update({ events: content.events.filter((_, i) => i !== index) })
              }
              className="text-red-600"
              aria-label="Hapus acara"
            >
              <Trash2 />
            </button>
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Jenis acara">
              <input
                className={inputClass}
                value={event.eventType}
                onChange={(e) => patch(index, { eventType: e.target.value })}
              />
            </Field>
            <Field label="Judul">
              <input
                className={inputClass}
                value={event.title}
                onChange={(e) => patch(index, { title: e.target.value })}
              />
            </Field>
            <Field label="Tanggal">
              <input
                type="date"
                className={inputClass}
                value={event.date}
                onChange={(e) => patch(index, { date: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Mulai">
                <input
                  type="time"
                  className={inputClass}
                  value={event.startTime}
                  onChange={(e) => patch(index, { startTime: e.target.value })}
                />
              </Field>
              <Field label="Selesai">
                <input
                  type="time"
                  className={inputClass}
                  value={event.endTime}
                  onChange={(e) => patch(index, { endTime: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Nama tempat">
              <input
                className={inputClass}
                value={event.venueName}
                onChange={(e) => patch(index, { venueName: e.target.value })}
              />
            </Field>
            <Field label="Zona waktu">
              <input
                className={inputClass}
                value={event.timezone}
                onChange={(e) => patch(index, { timezone: e.target.value })}
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="Alamat">
                <textarea
                  rows={2}
                  className={inputClass}
                  value={event.address}
                  onChange={(e) => patch(index, { address: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Dress code">
              <input
                className={inputClass}
                value={event.dressCode || ''}
                onChange={(e) => patch(index, { dressCode: e.target.value })}
              />
            </Field>
            <Field label="Link Google Maps">
              <input
                className={inputClass}
                value={event.googleMapsUrl || ''}
                onChange={(e) =>
                  patch(index, { googleMapsUrl: e.target.value })
                }
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="Catatan">
                <textarea
                  rows={2}
                  className={inputClass}
                  value={event.notes || ''}
                  onChange={(e) => patch(index, { notes: e.target.value })}
                />
              </Field>
            </div>
          </div>
        </Panel>
      ))}
    </div>
  );
}

function StoryTab({
  content,
  update,
}: {
  content: WeddingContent;
  update: (patch: Partial<WeddingContent>) => void;
}) {
  const stories = content.loveStories;
  const [uploading, setUploading] = useState(0);
  const [uploadingStory, setUploadingStory] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingStoryIndex = useRef<number | null>(null);

  function patchStory(index: number, patch: Partial<(typeof stories)[number]>) {
    update({
      loveStories: stories.map((story, storyIndex) =>
        storyIndex === index ? { ...story, ...patch } : story,
      ),
    });
  }

  function chooseStoryImage(index: number) {
    pendingStoryIndex.current = index;
    fileRef.current?.click();
  }

  function uploadStoryImage(file: File) {
    const index = pendingStoryIndex.current;
    if (index === null) return;
    setUploadingStory(index);
    setUploading(1);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/cloudinary/upload');
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setUploading(
          Math.max(1, Math.round((event.loaded / event.total) * 100)),
        );
      }
    };
    xhr.onload = () => {
      const result = safeJsonParse<{
        ok?: boolean;
        url?: string;
        resourceType?: 'image' | 'video';
        message?: string;
      }>(xhr.responseText, {});
      setUploading(0);
      setUploadingStory(null);
      pendingStoryIndex.current = null;
      if (
        xhr.status >= 400 ||
        !result.ok ||
        !result.url ||
        result.resourceType === 'video'
      ) {
        toast.error(result.message || 'Upload foto cerita gagal.');
        return;
      }
      patchStory(index, { imageUrl: result.url });
      toast.success('Foto Our Story berhasil diupload.');
    };
    xhr.onerror = () => {
      setUploading(0);
      setUploadingStory(null);
      pendingStoryIndex.current = null;
      toast.error('Upload foto cerita gagal.');
    };
    const form = new FormData();
    form.append('file', file);
    xhr.send(form);
  }

  return (
    <div className="space-y-5">
      <Panel
        title="Our Story sinematik"
        description="Setiap bab dapat memiliki foto sendiri. Pada undangan, foto akan tampil dengan parallax lembut, polaroid pendamping, reveal bergantian, dan timeline progres saat halaman digulir."
        action={
          <button
            type="button"
            onClick={() =>
              update({
                loveStories: [
                  ...stories,
                  {
                    id: crypto.randomUUID(),
                    title: 'Cerita Baru',
                    story: '',
                    date: content.eventDate.slice(0, 10),
                    imageUrl:
                      FALLBACK_MEDIA.story[
                        stories.length % FALLBACK_MEDIA.story.length
                      ],
                    sortOrder: stories.length + 1,
                  },
                ],
              })
            }
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white"
          >
            <Plus size={16} /> Tambah bab
          </button>
        }
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) uploadStoryImage(file);
            event.target.value = '';
          }}
        />
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <strong>Efek otomatis:</strong> gambar utama bergerak perlahan
          mengikuti scroll, foto kecil bergaya polaroid muncul dengan rotasi
          lembut, dan chapter berganti arah agar alur terasa editorial. Semua
          animasi tetap menghormati pengaturan reduced motion pengguna.
        </div>
      </Panel>

      {stories.map((story, index) => (
        <Panel
          key={story.id}
          title={`Chapter ${String(index + 1).padStart(2, '0')} — ${story.title || 'Tanpa judul'}`}
          action={
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  update({ loveStories: moveItem(stories, index, -1) })
                }
                disabled={index === 0}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                aria-label="Naikkan urutan"
              >
                <ChevronUp size={18} />
              </button>
              <button
                type="button"
                onClick={() =>
                  update({ loveStories: moveItem(stories, index, 1) })
                }
                disabled={index === stories.length - 1}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                aria-label="Turunkan urutan"
              >
                <ChevronDown size={18} />
              </button>
              <button
                type="button"
                onClick={() =>
                  update({
                    loveStories: stories.filter((_, i) => i !== index),
                  })
                }
                className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                aria-label="Hapus"
              >
                <Trash2 size={18} />
              </button>
            </div>
          }
        >
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <div>
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-slate-100 shadow-inner">
                <ImageWithFallback
                  src={
                    story.imageUrl ||
                    FALLBACK_MEDIA.story[index % FALLBACK_MEDIA.story.length]
                  }
                  fallbackSrc={
                    FALLBACK_MEDIA.story[index % FALLBACK_MEDIA.story.length]
                  }
                  alt={`Preview ${story.title}`}
                  fill
                  sizes="280px"
                  className="object-cover"
                />
                <div className="absolute inset-x-3 bottom-3 rounded-xl bg-black/60 px-3 py-2 text-xs text-white backdrop-blur">
                  Preview foto utama chapter {index + 1}
                </div>
              </div>
              <button
                type="button"
                onClick={() => chooseStoryImage(index)}
                disabled={uploadingStory !== null}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
              >
                <Upload size={16} />
                {uploadingStory === index
                  ? `Mengupload ${uploading}%`
                  : 'Upload foto chapter'}
              </button>
              <button
                type="button"
                onClick={() =>
                  patchStory(index, {
                    imageUrl:
                      FALLBACK_MEDIA.story[index % FALLBACK_MEDIA.story.length],
                  })
                }
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Gunakan foto fallback
              </button>
            </div>

            <div className="grid content-start gap-4 md:grid-cols-2">
              <Field label="Judul cerita">
                <input
                  className={inputClass}
                  value={story.title}
                  onChange={(event) =>
                    patchStory(index, { title: event.target.value })
                  }
                  placeholder="Contoh: Pertama Bertemu"
                />
              </Field>
              <Field label="Tanggal kejadian">
                <input
                  type="date"
                  className={inputClass}
                  value={story.date}
                  onChange={(event) =>
                    patchStory(index, { date: event.target.value })
                  }
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="URL foto">
                  <input
                    className={inputClass}
                    value={story.imageUrl || ''}
                    onChange={(event) =>
                      patchStory(index, { imageUrl: event.target.value })
                    }
                    placeholder="URL Cloudinary atau gambar HTTPS"
                  />
                </Field>
              </div>
              {content.media.some((item) => item.type === 'image') && (
                <div className="md:col-span-2">
                  <Field label="Pilih dari galeri yang sudah ada">
                    <select
                      className={inputClass}
                      value=""
                      onChange={(event) => {
                        if (event.target.value) {
                          patchStory(index, { imageUrl: event.target.value });
                        }
                      }}
                    >
                      <option value="">Pilih foto galeri...</option>
                      {content.media
                        .filter((item) => item.type === 'image')
                        .map((item, mediaIndex) => (
                          <option key={item.id} value={item.url}>
                            {item.caption || `Foto galeri ${mediaIndex + 1}`}
                          </option>
                        ))}
                    </select>
                  </Field>
                </div>
              )}
              <div className="md:col-span-2">
                <Field label="Isi cerita">
                  <textarea
                    className={inputClass}
                    rows={6}
                    value={story.story}
                    onChange={(event) =>
                      patchStory(index, { story: event.target.value })
                    }
                    placeholder="Tuliskan perjalanan hubungan dengan bahasa yang hangat dan personal."
                  />
                </Field>
              </div>
            </div>
          </div>
        </Panel>
      ))}

      {!stories.length && (
        <Panel title="Belum ada cerita">
          <p className="text-sm text-slate-500">
            Tambahkan bab pertama untuk menampilkan section Our Story pada
            undangan.
          </p>
        </Panel>
      )}
    </div>
  );
}

function GalleryTab({
  content,
  update,
}: {
  content: WeddingContent;
  update: (patch: Partial<WeddingContent>) => void;
}) {
  const [uploading, setUploading] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  function upload(file: File) {
    setUploading(1);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/cloudinary/upload');
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable)
        setUploading(
          Math.max(1, Math.round((event.loaded / event.total) * 100)),
        );
    };
    xhr.onload = () => {
      setUploading(0);
      const result = safeJsonParse<{
        ok?: boolean;
        url?: string;
        publicId?: string;
        resourceType?: 'image' | 'video';
        thumbnailUrl?: string;
        message?: string;
      }>(xhr.responseText, {});
      if (xhr.status >= 400 || !result.ok || !result.url)
        return toast.error(result.message || 'Upload gagal.');
      const item: MediaItem = {
        id: crypto.randomUUID(),
        type: result.resourceType || 'image',
        url: result.url,
        cloudinaryPublicId: result.publicId,
        thumbnailUrl: result.thumbnailUrl,
        caption: file.name,
        altText: `Foto ${content.groomName} dan ${content.brideName}`,
        sortOrder: content.media.length + 1,
      };
      update({ media: [...content.media, item] });
      toast.success('Media berhasil diupload.');
    };
    xhr.onerror = () => {
      setUploading(0);
      toast.error('Upload gagal.');
    };
    const form = new FormData();
    form.append('file', file);
    xhr.send(form);
  }
  async function remove(item: MediaItem) {
    if (item.cloudinaryPublicId)
      await fetch('/api/cloudinary/delete', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          publicId: item.cloudinaryPublicId,
          resourceType: item.type === 'video' ? 'video' : 'image',
        }),
      }).catch(() => undefined);
    update({ media: content.media.filter((x) => x.id !== item.id) });
  }
  return (
    <Panel
      title="Galeri dan media"
      description="Gambar: JPG, PNG, WebP, AVIF maksimal 8 MB. Video: MP4, WebM, MOV maksimal 50 MB."
      action={
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,video/quicktime"
            hidden
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white"
          >
            <Upload size={16} /> Upload media
          </button>
        </>
      }
    >
      {uploading > 0 && (
        <div className="mb-5">
          <div className="mb-1 flex justify-between text-xs">
            <span>Proses upload</span>
            <span>{uploading}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-amber-500 transition-all"
              style={{ width: `${uploading}%` }}
            />
          </div>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {content.media.map((item, index) => (
          <div
            key={item.id}
            className="overflow-hidden rounded-2xl border border-slate-200"
          >
            <div className="relative aspect-video bg-slate-100">
              {item.type === 'video' ? (
                <video src={item.url} className="h-full w-full object-cover" />
              ) : (
                <ImageWithFallback
                  src={item.url}
                  fallbackSrc={
                    FALLBACK_MEDIA.gallery[
                      index % FALLBACK_MEDIA.gallery.length
                    ]
                  }
                  alt={item.altText}
                  fill
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              )}
            </div>
            <div className="space-y-2 p-3">
              <input
                className={inputClass}
                value={item.caption || ''}
                placeholder="Caption"
                onChange={(e) =>
                  update({
                    media: content.media.map((x, i) =>
                      i === index ? { ...x, caption: e.target.value } : x,
                    ),
                  })
                }
              />
              <input
                className={inputClass}
                value={item.altText}
                placeholder="Alt text wajib"
                onChange={(e) =>
                  update({
                    media: content.media.map((x, i) =>
                      i === index ? { ...x, altText: e.target.value } : x,
                    ),
                  })
                }
              />
              <div className="flex justify-between">
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      update({ media: moveItem(content.media, index, -1) })
                    }
                    aria-label="Naik"
                  >
                    <ChevronUp size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      update({ media: moveItem(content.media, index, 1) })
                    }
                    aria-label="Turun"
                  >
                    <ChevronDown size={18} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(item)}
                  className="text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function VideoTab({
  content,
  update,
}: {
  content: WeddingContent;
  update: (patch: Partial<WeddingContent>) => void;
}) {
  const isYouTube = /(?:youtube\.com|youtu\.be)/i.test(content.videoUrl);
  const [source, setSource] = useState<'youtube' | 'cloudinary'>(
    isYouTube ? 'youtube' : 'cloudinary',
  );

  return (
    <Panel
      title="Video pernikahan"
      description="Gunakan YouTube agar hemat penyimpanan, atau upload video langsung ke Cloudinary. Pilihan disimpan sebagai URL video pada undangan."
    >
      <div className="grid gap-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setSource('youtube')}
            className={`rounded-2xl border p-4 text-left transition ${
              source === 'youtube'
                ? 'border-red-500 bg-red-50 ring-2 ring-red-100'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="font-bold text-slate-900">YouTube</span>
            <span className="mt-1 block text-xs leading-5 text-slate-500">
              Direkomendasikan untuk menghemat kuota Cloudinary.
            </span>
          </button>
          <button
            type="button"
            onClick={() => setSource('cloudinary')}
            className={`rounded-2xl border p-4 text-left transition ${
              source === 'cloudinary'
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="font-bold text-slate-900">Upload Cloudinary</span>
            <span className="mt-1 block text-xs leading-5 text-slate-500">
              Cocok untuk video privat atau tanpa branding YouTube.
            </span>
          </button>
        </div>

        {source === 'youtube' ? (
          <Field
            label="Link YouTube"
            hint="Mendukung format youtube.com/watch, youtu.be, Shorts, dan URL embed. Video tidak autoplay dengan suara."
          >
            <input
              className={inputClass}
              value={isYouTube ? content.videoUrl : ''}
              onChange={(e) => update({ videoUrl: e.target.value.trim() })}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </Field>
        ) : (
          <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <CloudinaryUploadButton
              label="Upload video ke Cloudinary"
              accept="video/mp4,video/webm,video/quicktime"
              expected="video"
              help="Format MP4, WebM, atau MOV. Maksimal 50 MB. Setelah upload, klik Simpan Perubahan."
              onUploaded={(result) =>
                update({
                  videoUrl: result.url,
                  videoPosterUrl: result.thumbnailUrl || content.videoPosterUrl,
                })
              }
            />
            <Field label="URL video Cloudinary">
              <input
                className={inputClass}
                value={!isYouTube ? content.videoUrl : ''}
                onChange={(e) => update({ videoUrl: e.target.value })}
                placeholder="URL terisi otomatis setelah upload"
              />
            </Field>
          </div>
        )}

        <div className="grid gap-4 rounded-2xl border border-slate-200 p-4 md:grid-cols-[1fr_auto] md:items-end">
          <Field
            label="Poster/thumbnail video"
            hint="Untuk YouTube, thumbnail berasal dari player. Poster ini dipakai untuk video Cloudinary atau fallback."
          >
            <input
              className={inputClass}
              value={content.videoPosterUrl}
              onChange={(e) => update({ videoPosterUrl: e.target.value })}
              placeholder="URL poster"
            />
          </Field>
          <CloudinaryUploadButton
            label="Upload poster"
            accept="image/jpeg,image/png,image/webp,image/avif"
            expected="image"
            onUploaded={(result) => update({ videoPosterUrl: result.url })}
          />
        </div>

        <div className="aspect-video max-w-3xl overflow-hidden rounded-2xl bg-black shadow-lg">
          <ResponsiveVideo
            src={content.videoUrl}
            poster={content.videoPosterUrl}
            title="Preview video pernikahan"
          />
        </div>
      </div>
    </Panel>
  );
}
function MusicTab({
  content,
  update,
}: {
  content: WeddingContent;
  update: (patch: Partial<WeddingContent>) => void;
}) {
  return (
    <Panel
      title="Musik latar"
      description="Musik hanya dimainkan setelah tamu menekan tombol Buka Undangan. Audio dapat diupload ke Cloudinary atau menggunakan URL langsung."
    >
      <div className="grid gap-4">
        <Field label="Judul musik">
          <input
            className={inputClass}
            value={content.musicTitle}
            onChange={(e) => update({ musicTitle: e.target.value })}
          />
        </Field>
        <div className="grid gap-4 rounded-2xl border border-slate-200 p-4 md:grid-cols-[1fr_auto] md:items-end">
          <Field label="URL audio">
            <input
              className={inputClass}
              value={content.musicUrl}
              onChange={(e) => update({ musicUrl: e.target.value })}
              placeholder="URL Cloudinary atau file audio HTTPS"
            />
          </Field>
          <CloudinaryUploadButton
            label="Upload audio"
            accept="audio/mpeg,audio/mp4,audio/x-m4a,audio/wav,audio/ogg"
            expected="audio"
            help="MP3, M4A, WAV, atau OGG. Maksimal 20 MB."
            onUploaded={(result) => update({ musicUrl: result.url })}
          />
        </div>
        <audio controls src={content.musicUrl} className="w-full" />
      </div>
    </Panel>
  );
}
function LocationTab({
  content,
  update,
}: {
  content: WeddingContent;
  update: (patch: Partial<WeddingContent>) => void;
}) {
  return (
    <div className="space-y-5">
      {content.events.map((event, index) => (
        <Panel key={event.id} title={`Lokasi ${event.title}`}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Latitude">
              <input
                type="number"
                step="any"
                className={inputClass}
                value={event.latitude ?? ''}
                onChange={(e) =>
                  update({
                    events: content.events.map((x, i) =>
                      i === index
                        ? {
                            ...x,
                            latitude: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          }
                        : x,
                    ),
                  })
                }
              />
            </Field>
            <Field label="Longitude">
              <input
                type="number"
                step="any"
                className={inputClass}
                value={event.longitude ?? ''}
                onChange={(e) =>
                  update({
                    events: content.events.map((x, i) =>
                      i === index
                        ? {
                            ...x,
                            longitude: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          }
                        : x,
                    ),
                  })
                }
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="Link Google Maps">
                <input
                  className={inputClass}
                  value={event.googleMapsUrl || ''}
                  onChange={(e) =>
                    update({
                      events: content.events.map((x, i) =>
                        i === index
                          ? { ...x, googleMapsUrl: e.target.value }
                          : x,
                      ),
                    })
                  }
                />
              </Field>
            </div>
          </div>
        </Panel>
      ))}
    </div>
  );
}

function MessagesTab({
  content,
  update,
}: {
  content: WeddingContent;
  update: (patch: Partial<WeddingContent>) => void;
}) {
  return (
    <Panel
      title="Moderasi buku tamu"
      description="Ucapan yang disembunyikan tidak tampil di halaman publik."
    >
      <div className="space-y-3">
        {content.messages.length ? (
          content.messages.map((message) => (
            <div
              key={message.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center"
            >
              <div className="flex-1">
                <p className="font-bold">{message.guestName}</p>
                <p className="mt-1 text-sm text-slate-600">{message.message}</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  update({
                    messages: content.messages.map((x) =>
                      x.id === message.id ? { ...x, approved: !x.approved } : x,
                    ),
                  })
                }
                className={`rounded-lg px-3 py-2 text-xs font-bold ${message.approved ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200'}`}
              >
                {message.approved ? 'Ditampilkan' : 'Disembunyikan'}
              </button>
              <button
                type="button"
                onClick={() =>
                  update({
                    messages: content.messages.filter(
                      (x) => x.id !== message.id,
                    ),
                  })
                }
                className="text-red-600"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        ) : (
          <Empty text="Belum ada ucapan." />
        )}
      </div>
    </Panel>
  );
}

function RsvpTab({
  content,
  stats,
}: {
  content: WeddingContent;
  stats: {
    total: number;
    hadir: number;
    tidak: number;
    ragu: number;
    rsvp: number;
    attendanceRate: number;
  };
}) {
  const rsvps = content.rsvps ?? [];
  const guestById = new Map(content.guests.map((guest) => [guest.id, guest]));

  return (
    <Panel title="Daftar RSVP">
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ['Hadir', stats.hadir],
          ['Tidak hadir', stats.tidak],
          ['Ragu', stats.ragu],
          ['Total respons', stats.rsvp],
        ].map(([a, b]) => (
          <div key={String(a)} className="rounded-xl bg-slate-100 p-4">
            <p className="text-xs text-slate-500">{a}</p>
            <p className="mt-1 text-2xl font-black">{b}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-3">Nama</th>
              <th className="p-3">Tamu terdaftar</th>
              <th className="p-3">Jumlah hadir</th>
              <th className="p-3">Status</th>
              <th className="p-3">WhatsApp</th>
              <th className="p-3">Waktu kirim</th>
            </tr>
          </thead>
          <tbody>
            {rsvps.length ? (
              rsvps.map((rsvp) => {
                const guest = rsvp.guestId
                  ? guestById.get(rsvp.guestId)
                  : undefined;
                return (
                  <tr key={rsvp.id} className="border-b border-slate-100">
                    <td className="p-3 font-semibold">{rsvp.guestName}</td>
                    <td className="p-3">
                      {guest ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
                          {guest.group}
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700">
                          Tamu umum
                        </span>
                      )}
                    </td>
                    <td className="p-3">{rsvp.guestCount}</td>
                    <td className="p-3 capitalize">
                      {rsvp.attendanceStatus.replace('_', ' ')}
                    </td>
                    <td className="p-3">{rsvp.phone || '—'}</td>
                    <td className="p-3">
                      {rsvp.createdAt
                        ? new Intl.DateTimeFormat('id-ID', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          }).format(new Date(rsvp.createdAt))
                        : '—'}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  Belum ada RSVP masuk.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function GuestsTab({
  content,
  update,
}: {
  content: WeddingContent;
  update: (patch: Partial<WeddingContent>) => void;
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('semua');
  const [appOrigin, setAppOrigin] = useState('');

  useEffect(() => {
    setAppOrigin(window.location.origin);
  }, []);

  const filtered = content.guests.filter(
    (g) =>
      `${g.name} ${g.phone} ${g.group}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (filter === 'semua' || g.rsvpStatus === filter),
  );
  function add() {
    const name = `Tamu Baru ${content.guests.length + 1}`;
    update({
      guests: [
        ...content.guests,
        {
          id: crypto.randomUUID(),
          name,
          greeting: 'Bapak/Ibu/Saudara/i',
          phone: '',
          group: 'Umum',
          invitationQuota: 1,
          slug: createGuestSlug(name, String(content.guests.length + 1)),
          token: crypto.randomUUID(),
          invitationStatus: 'belum_dikirim',
          rsvpStatus: 'belum',
        },
      ],
    });
  }
  function exportExcel() {
    const rows = content.guests.map((g) => ({
      name: g.name,
      greeting: g.greeting,
      phone: g.phone,
      group: g.group,
      invitation_quota: g.invitationQuota,
      invitation_status: g.invitationStatus,
      rsvp_status: g.rsvpStatus,
      notes: g.notes || '',
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(rows),
      'Daftar Tamu',
    );
    XLSX.writeFile(wb, `daftar-tamu-${content.slug}.xlsx`);
  }
  return (
    <Panel
      title="Daftar tamu"
      action={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={exportExcel}
            className="rounded-xl border px-3 py-2 text-sm font-bold"
          >
            Export Excel
          </button>
          <button
            type="button"
            onClick={add}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-sm font-bold text-white"
          >
            <Plus size={16} /> Tambah
          </button>
        </div>
      }
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_180px]">
        <div className="relative">
          <Search
            className="absolute top-3.5 left-3 text-slate-400"
            size={17}
          />
          <input
            className={`${inputClass} mt-0 pl-10`}
            placeholder="Cari nama, nomor, grup..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className={`${inputClass} mt-0`}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="semua">Semua RSVP</option>
          <option value="hadir">Hadir</option>
          <option value="tidak_hadir">Tidak hadir</option>
          <option value="ragu">Ragu</option>
          <option value="belum">Belum</option>
        </select>
      </div>
      <div className="space-y-3">
        {filtered.map((guest) => {
          const index = content.guests.findIndex((x) => x.id === guest.id);
          const linkPath =
  `/invite/${content.slug}` +
  `?to=${encodeURIComponent(guest.name)}` +
  `&greeting=${encodeURIComponent(guest.greeting)}`;
          const link = appOrigin ? `${appOrigin}${linkPath}` : linkPath;
          const message = content.whatsappTemplate
            .replace('[Nama Tamu]', guest.name)
            .replace('[Link Undangan]', link);
          return (
            <div
              key={guest.id}
              className="rounded-2xl border border-slate-200 p-4"
            >
              <div className="grid gap-3 md:grid-cols-6">
                <input
                  className={inputClass}
                  value={guest.name}
                  onChange={(e) =>
                    update({
                      guests: content.guests.map((x, i) =>
                        i === index
                          ? {
                              ...x,
                              name: e.target.value,
                              slug: createGuestSlug(
                                e.target.value,
                                String(index + 1),
                              ),
                            }
                          : x,
                      ),
                    })
                  }
                />
                <input
                  className={inputClass}
                  value={guest.greeting}
                  onChange={(e) =>
                    update({
                      guests: content.guests.map((x, i) =>
                        i === index ? { ...x, greeting: e.target.value } : x,
                      ),
                    })
                  }
                />
                <input
                  className={inputClass}
                  value={guest.phone}
                  onChange={(e) =>
                    update({
                      guests: content.guests.map((x, i) =>
                        i === index
                          ? {
                              ...x,
                              phone: normalizeIndonesianPhone(e.target.value),
                            }
                          : x,
                      ),
                    })
                  }
                />
                <input
                  className={inputClass}
                  value={guest.group}
                  onChange={(e) =>
                    update({
                      guests: content.guests.map((x, i) =>
                        i === index ? { ...x, group: e.target.value } : x,
                      ),
                    })
                  }
                />
                <input
                  type="number"
                  className={inputClass}
                  value={guest.invitationQuota}
                  onChange={(e) =>
                    update({
                      guests: content.guests.map((x, i) =>
                        i === index
                          ? { ...x, invitationQuota: Number(e.target.value) }
                          : x,
                      ),
                    })
                  }
                />
                <select
                  className={inputClass}
                  value={guest.rsvpStatus}
                  onChange={(e) =>
                    update({
                      guests: content.guests.map((x, i) =>
                        i === index
                          ? {
                              ...x,
                              rsvpStatus: e.target
                                .value as GuestRecord['rsvpStatus'],
                            }
                          : x,
                      ),
                    })
                  }
                >
                  <option value="belum">Belum</option>
                  <option value="hadir">Hadir</option>
                  <option value="ragu">Ragu</option>
                  <option value="tidak_hadir">Tidak hadir</option>
                </select>
              </div>
              <div className="mt-3">
  <textarea
    className={inputClass}
    rows={2}
    value={guest.notes || ''}
    placeholder="Catatan tamu"
    onChange={(e) =>
      update({
        guests: content.guests.map((x, i) =>
          i === index ? { ...x, notes: e.target.value } : x,
        ),
      })
    }
  />
</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    navigator.clipboard
                      .writeText(link)
                      .then(() => toast.success('Link disalin.'))
                  }
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold"
                >
                  <Link2 size={14} /> Salin link
                </button>
                {guest.phone && (
                  <>
                    <a
                      href={buildWhatsAppLink(guest.phone, message)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-900"
                    >
                      <MessageCircle size={14} /> WhatsApp
                    </a>
                    <a
                      href={buildWhatsAppLink(guest.phone, message, true)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold"
                    >
                      WhatsApp Web
                    </a>
                  </>
                )}
                <button
                  type="button"
                  disabled={guest.invitationStatus === 'sudah_dikirim'}
                  onClick={() => {
                    update({
                      guests: content.guests.map((x, i) =>
                        i === index
                          ? { ...x, invitationStatus: 'sudah_dikirim' }
                          : x,
                      ),
                    });
                    toast.success(
                      `${guest.name} ditandai sudah dikirim. Klik Simpan.`,
                    );
                  }}
                  className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                    guest.invitationStatus === 'sudah_dikirim'
                      ? 'cursor-default bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                  }`}
                >
                  {guest.invitationStatus === 'sudah_dikirim'
                    ? 'Sudah dikirim'
                    : 'Tandai dikirim'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    update({
                      guests: content.guests.filter((x) => x.id !== guest.id),
                    })
                  }
                  className="ml-auto text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function ImportTab({
  content,
  update,
}: {
  content: WeddingContent;
  update: (patch: Partial<WeddingContent>) => void;
}) {
  const [result, setResult] = useState<ReturnType<
    typeof parseGuestWorkbook
  > | null>(null);
  const [mode, setMode] = useState<'skip' | 'overwrite'>('skip');
  const [busy, setBusy] = useState(false);
  async function read(file: File) {
    if (file.size > 5 * 1024 * 1024) return toast.error('File maksimal 5 MB.');
    try {
      setResult(parseGuestWorkbook(await file.arrayBuffer()));
    } catch {
      toast.error('File Excel tidak dapat dibaca.');
    }
  }
  async function commit() {
    if (!result?.valid.length) return;
    setBusy(true);
    const response = await fetch('/api/guests/import', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        weddingId: content.id,
        mode,
        guests: result.valid,
      }),
    });
    const data = (await response.json()) as {
      ok?: boolean;
      message?: string;
      mode?: 'supabase' | 'demo';
      imported?: number;
      updated?: number;
      skipped?: number;
      guests?: GuestRecord[];
    };
    setBusy(false);
    if (!response.ok || !data.ok)
      return toast.error(data.message || 'Import gagal.');

    if (data.guests) {
      update({ guests: data.guests });
    } else {
      const incoming: GuestRecord[] = result.valid.map((g) => ({
        id: crypto.randomUUID(),
        name: g.name,
        greeting: g.greeting,
        phone: g.phone,
        group: g.group,
        invitationQuota: g.invitation_quota,
        slug: g.slug,
        token: crypto.randomUUID(),
        invitationStatus: 'belum_dikirim',
        rsvpStatus: 'belum',
        notes: g.notes,
      }));
      const normalized = (value: string) =>
        value.trim().toLowerCase().replace(/\s+/g, ' ');
      const phoneKey = (value: string) => value.replace(/\D/g, '');
      const merged = [...content.guests];

      for (const guest of incoming) {
        const index = merged.findIndex(
          (existing) =>
            normalized(existing.slug) === normalized(guest.slug) ||
            (phoneKey(guest.phone) &&
              phoneKey(existing.phone) === phoneKey(guest.phone)) ||
            normalized(existing.name) === normalized(guest.name),
        );
        if (index >= 0) {
          if (mode === 'overwrite') merged[index] = { ...merged[index], ...guest };
        } else {
          merged.push(guest);
        }
      }
      update({ guests: merged });
    }

    const parts = [
      `${data.imported ?? 0} baru`,
      `${data.updated ?? 0} diperbarui`,
      `${data.skipped ?? 0} dilewati`,
    ];
    toast.success(`Import selesai: ${parts.join(', ')}.`);
  }
  function failureReport() {
    if (!result?.invalid.length) return;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        result.invalid.map((x) => ({
          row: x.row,
          errors: x.errors.join('; '),
          data: JSON.stringify(x.data),
        })),
      ),
      'Gagal Import',
    );
    XLSX.writeFile(wb, 'laporan-gagal-import.xlsx');
  }
  return (
    <Panel
      title="Import daftar tamu dari Excel"
      description="Maksimal 1.000 baris dan 5 MB. Nomor WhatsApp otomatis dinormalisasi ke format 62."
    >
      <div className="flex flex-wrap gap-3">
        <a
          href="/templates/template-daftar-tamu.xlsx"
          download
          className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold"
        >
          Download template Excel
        </a>
        <label className="cursor-pointer rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">
          <input
            type="file"
            accept=".xlsx,.xls"
            hidden
            onChange={(e) => e.target.files?.[0] && read(e.target.files[0])}
          />
          Pilih file Excel
        </label>
      </div>
      {result && (
        <div className="mt-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-sm text-emerald-700">Data valid</p>
              <p className="text-3xl font-black text-emerald-900">
                {result.valid.length}
              </p>
            </div>
            <div className="rounded-xl bg-red-50 p-4">
              <p className="text-sm text-red-700">Bermasalah</p>
              <p className="text-3xl font-black text-red-900">
                {result.invalid.length}
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2">Baris</th>
                  <th className="p-2">Nama</th>
                  <th className="p-2">WhatsApp</th>
                  <th className="p-2">Grup</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {result.valid.slice(0, 20).map((g) => (
                  <tr key={g.row} className="border-b border-slate-100">
                    <td className="p-2">{g.row}</td>
                    <td className="p-2">{g.name}</td>
                    <td className="p-2">{g.phone}</td>
                    <td className="p-2">{g.group}</td>
                    <td className="p-2 text-emerald-700">Valid</td>
                  </tr>
                ))}
                {result.invalid.slice(0, 10).map((g) => (
                  <tr key={g.row} className="border-b border-slate-100">
                    <td className="p-2">{g.row}</td>
                    <td className="p-2" colSpan={3}>
                      {g.errors.join(', ')}
                    </td>
                    <td className="p-2 text-red-700">Gagal</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              className={`${inputClass} mt-0 max-w-48`}
              value={mode}
              onChange={(e) => setMode(e.target.value as 'skip' | 'overwrite')}
            >
              <option value="skip">Lewati duplikat</option>
              <option value="overwrite">Timpa duplikat</option>
            </select>
            <button
              type="button"
              onClick={commit}
              disabled={busy || !result.valid.length}
              className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              {busy ? 'Mengimport...' : 'Import data valid'}
            </button>
            {result.invalid.length > 0 && (
              <button
                type="button"
                onClick={failureReport}
                className="rounded-xl border border-red-300 px-4 py-3 text-sm font-bold text-red-700"
              >
                Download laporan gagal
              </button>
            )}
          </div>
        </div>
      )}
    </Panel>
  );
}

function GiftsTab({
  content,
  update,
}: {
  content: WeddingContent;
  update: (patch: Partial<WeddingContent>) => void;
}) {
  const gifts = content.gifts;
  function add() {
    update({
      gifts: [
        ...gifts,
        {
          id: crypto.randomUUID(),
          giftType: 'bank',
          bankName: '',
          accountNumber: '',
          accountHolder: '',
          sortOrder: gifts.length + 1,
        },
      ],
    });
  }
  return (
    <Panel
      title="Rekening dan hadiah"
      action={
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white"
        >
          <Plus size={16} /> Tambah
        </button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        {gifts.map((gift, index) => (
          <div key={gift.id} className="rounded-xl border p-4">
            <div className="mb-2 flex justify-between">
              <strong>Hadiah {index + 1}</strong>
              <button
                type="button"
                onClick={() =>
                  update({ gifts: gifts.filter((_, i) => i !== index) })
                }
                className="text-red-600"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <select
                className={inputClass}
                value={gift.giftType}
                onChange={(e) =>
                  update({
                    gifts: gifts.map((x, i) =>
                      i === index
                        ? {
                            ...x,
                            giftType: e.target.value as GiftAccount['giftType'],
                          }
                        : x,
                    ),
                  })
                }
              >
                <option value="bank">Rekening bank</option>
                <option value="qris">QRIS</option>
                <option value="shipping">Alamat hadiah</option>
              </select>
              <input
                className={inputClass}
                placeholder="Nama bank"
                value={gift.bankName || ''}
                onChange={(e) =>
                  update({
                    gifts: gifts.map((x, i) =>
                      i === index ? { ...x, bankName: e.target.value } : x,
                    ),
                  })
                }
              />
              <input
                className={inputClass}
                placeholder="Nomor rekening"
                value={gift.accountNumber || ''}
                onChange={(e) =>
                  update({
                    gifts: gifts.map((x, i) =>
                      i === index
                        ? {
                            ...x,
                            accountNumber: e.target.value.replace(/\D/g, ''),
                          }
                        : x,
                    ),
                  })
                }
              />
              <input
                className={inputClass}
                placeholder="Nama pemilik"
                value={gift.accountHolder || ''}
                onChange={(e) =>
                  update({
                    gifts: gifts.map((x, i) =>
                      i === index ? { ...x, accountHolder: e.target.value } : x,
                    ),
                  })
                }
              />
              <div className="grid gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <Field label="URL QRIS">
                  <input
                    className={inputClass}
                    placeholder="URL QRIS"
                    value={gift.qrisUrl || ''}
                    onChange={(e) =>
                      update({
                        gifts: gifts.map((x, i) =>
                          i === index ? { ...x, qrisUrl: e.target.value } : x,
                        ),
                      })
                    }
                  />
                </Field>
                <CloudinaryUploadButton
                  label="Upload QRIS"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  expected="image"
                  onUploaded={(result) =>
                    update({
                      gifts: gifts.map((x, i) =>
                        i === index ? { ...x, qrisUrl: result.url } : x,
                      ),
                    })
                  }
                />
              </div>
              <textarea
                className={inputClass}
                placeholder="Alamat pengiriman"
                value={gift.shippingAddress || ''}
                onChange={(e) =>
                  update({
                    gifts: gifts.map((x, i) =>
                      i === index
                        ? { ...x, shippingAddress: e.target.value }
                        : x,
                    ),
                  })
                }
              />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ThemeMiniPreview({
  theme,
  groom,
  bride,
}: {
  theme: ThemeConfig;
  groom: string;
  bride: string;
}) {
  const radius =
    theme.cornerStyle === 'round'
      ? '28px'
      : theme.cornerStyle === 'classic'
        ? '8px'
        : '18px';
  const pattern =
    theme.ornamentStyle === 'batik'
      ? `radial-gradient(circle at center, transparent 30%, ${theme.accent}22 31% 34%, transparent 35%)`
      : theme.ornamentStyle === 'geometric'
        ? `linear-gradient(135deg, ${theme.accent}1f 12%, transparent 12.5% 87%, ${theme.accent}1f 87.5%)`
        : theme.ornamentStyle === 'botanical'
          ? `radial-gradient(ellipse at 12% 20%, ${theme.accent}38 0 8%, transparent 9%)`
          : theme.ornamentStyle === 'floral'
            ? `radial-gradient(circle at 18% 22%, ${theme.accent}35 0 5%, transparent 6%)`
            : `linear-gradient(90deg, transparent 12%, ${theme.accent}25 12.3%, transparent 12.6%)`;

  return (
    <div
      className="relative aspect-[9/13] min-h-[360px] overflow-hidden border shadow-2xl"
      style={{
        borderRadius: radius,
        borderColor: `${theme.accent}55`,
        background: theme.secondary,
        color: theme.text,
        fontFamily: `${theme.bodyFont}, sans-serif`,
      }}
    >
      <div
        className="absolute inset-0 opacity-50"
        style={{ backgroundImage: pattern, backgroundSize: '70px 70px' }}
      />
      <div
        className="relative flex h-[47%] flex-col justify-between overflow-hidden p-5 text-white"
        style={{
          background: `linear-gradient(155deg, ${theme.primary}, ${theme.primary}dd 68%, ${theme.accent}aa)`,
        }}
      >
        <div className="flex items-center justify-between text-[8px] font-bold tracking-[.22em] uppercase opacity-65">
          <span>Wedding Invitation</span>
          <Sparkles size={13} />
        </div>
        <div>
          <p
            className="text-[9px] font-bold tracking-[.3em] uppercase"
            style={{ color: theme.accent }}
          >
            Save the date
          </p>
          <p
            className="mt-2 text-4xl leading-[.78]"
            style={{ fontFamily: `${theme.headingFont}, Georgia, serif` }}
          >
            {groom}
            <span className="mx-1 text-lg" style={{ color: theme.accent }}>
              &
            </span>
            {bride}
          </p>
          <div
            className="mt-4 h-px w-20"
            style={{ background: theme.accent }}
          />
        </div>
      </div>
      <div className="relative space-y-3 p-4">
        <div
          className="p-3 shadow-sm"
          style={{
            borderRadius: radius,
            background: theme.surface,
            border: `1px solid ${theme.accent}32`,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[7px] font-bold tracking-[.2em] uppercase opacity-50">
                The Celebration
              </p>
              <p
                className="mt-1 text-xl"
                style={{ fontFamily: `${theme.headingFont}, Georgia, serif` }}
              >
                Akad Nikah
              </p>
            </div>
            <div
              className="grid size-10 place-items-center text-xs font-bold text-white"
              style={{ borderRadius: radius, background: theme.primary }}
            >
              17
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[0, 1].map((item) => (
            <div
              key={item}
              className="h-20"
              style={{
                borderRadius: radius,
                background: `linear-gradient(145deg, ${theme.accent}55, ${theme.primary}20)`,
              }}
            />
          ))}
        </div>
        <div
          className="mx-auto h-2 w-24 rounded-full"
          style={{ background: `${theme.accent}75` }}
        />
      </div>
    </div>
  );
}

function LayoutMiniPreview({ theme }: { theme: ThemeConfig }) {
  const layout = getLayoutPreset(theme.layoutPreset);
  const navPosition =
    theme.navigationStyle === 'top-bar'
      ? 'top-3 right-6 left-6 h-5 rounded-full'
      : theme.navigationStyle === 'side-dots'
        ? 'top-1/3 right-3 h-24 w-3 rounded-full'
        : theme.navigationStyle === 'menu-button'
          ? 'right-3 bottom-3 size-9 rounded-full'
          : theme.navigationStyle === 'minimal'
            ? 'right-1/2 bottom-3 h-1.5 w-16 translate-x-1/2 rounded-full'
            : 'right-1/2 bottom-3 h-8 w-32 translate-x-1/2 rounded-2xl';
  const storyClass =
    theme.storyStyle === 'vertical'
      ? 'grid-cols-[18px_1fr]'
      : theme.storyStyle === 'polaroid' || theme.storyStyle === 'scrapbook'
        ? 'grid-cols-2'
        : 'grid-cols-1';

  return (
    <div
      className="relative aspect-[9/13] min-h-[360px] overflow-hidden border bg-white shadow-2xl"
      style={{
        borderColor: `${theme.accent}55`,
        background: theme.secondary,
        color: theme.text,
      }}
    >
      <div
        className={`relative overflow-hidden ${theme.heroStyle === 'split' ? 'ml-auto h-[46%] w-[58%]' : 'h-[48%] w-full'}`}
        style={{
          background: `linear-gradient(145deg, ${theme.primary}, ${theme.accent}aa)`,
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent,rgba(255,255,255,.16))]" />
        <div
          className={`absolute text-white ${theme.heroStyle === 'split' ? 'top-1/3 -left-[72%] w-[150%] text-left' : 'inset-x-4 bottom-5 text-center'}`}
        >
          <p className="text-[7px] font-bold tracking-[.25em] uppercase opacity-60">
            {layout.category}
          </p>
          <p
            className="mt-1 text-3xl leading-none"
            style={{ fontFamily: `${theme.headingFont}, Georgia, serif` }}
          >
            Nathan <span style={{ color: theme.accent }}>&</span> Aulia
          </p>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className={`grid gap-2 ${storyClass}`}>
          {theme.storyStyle === 'vertical' && (
            <div
              className="mx-auto h-full w-px"
              style={{ background: `${theme.accent}88` }}
            />
          )}
          <div className="grid gap-2">
            {[0, 1].map((item) => (
              <div
                key={item}
                className={`${theme.storyStyle === 'scrapbook' ? (item === 0 ? '-rotate-2' : 'rotate-2') : ''} h-14 border p-2 shadow-sm`}
                style={{
                  background: theme.surface,
                  borderColor: `${theme.accent}35`,
                  borderRadius:
                    theme.cornerStyle === 'round'
                      ? 18
                      : theme.cornerStyle === 'classic'
                        ? 2
                        : 10,
                }}
              >
                <div
                  className="h-2 w-1/2 rounded-full"
                  style={{ background: `${theme.primary}45` }}
                />
                <div
                  className="mt-2 h-1.5 w-4/5 rounded-full"
                  style={{ background: `${theme.accent}35` }}
                />
              </div>
            ))}
          </div>
        </div>
        <div
          className={`grid gap-1.5 ${theme.galleryStyle === 'filmstrip' ? 'grid-cols-4' : theme.galleryStyle === 'slideshow' ? 'grid-cols-1' : 'grid-cols-3'}`}
        >
          {Array.from({
            length: theme.galleryStyle === 'slideshow' ? 1 : 6,
          }).map((_, index) => (
            <div
              key={index}
              className={`${theme.galleryStyle === 'polaroid' ? 'border-4 border-white shadow' : ''} ${theme.galleryStyle === 'slideshow' ? 'h-20' : 'h-10'}`}
              style={{
                background: `linear-gradient(145deg, ${theme.accent}55, ${theme.primary}35)`,
              }}
            />
          ))}
        </div>
      </div>

      <div
        className={`absolute bg-slate-950/85 shadow-lg ${navPosition}`}
        aria-hidden="true"
      />
      <div className="absolute top-3 left-3 rounded-full bg-white/85 px-2 py-1 text-[7px] font-black tracking-[.12em] uppercase">
        {layout.name}
      </div>
    </div>
  );
}

function ThemeTab({
  content,
  update,
}: {
  content: WeddingContent;
  update: (patch: Partial<WeddingContent>) => void;
}) {
  const activePreset = getThemePreset(content.theme.preset);
  const activeLayout = getLayoutPreset(content.theme.layoutPreset);

  function theme(patch: Partial<ThemeConfig>) {
    update({ theme: { ...content.theme, ...patch } });
  }

  function applyPreset(presetId: ThemeConfig['preset']) {
    const preset = getThemePreset(presetId);
    const currentLayout = {
      layoutPreset: content.theme.layoutPreset,
      layoutStyle: content.theme.layoutStyle,
      heroStyle: content.theme.heroStyle,
      coverStyle: content.theme.coverStyle,
      navigationStyle: content.theme.navigationStyle,
      galleryStyle: content.theme.galleryStyle,
      storyStyle: content.theme.storyStyle,
      surfaceStyle: content.theme.surfaceStyle,
      cornerStyle: content.theme.cornerStyle,
      animationIntensity: content.theme.animationIntensity,
    };
    update({ theme: { ...preset.config, ...currentLayout } });
    toast.success(
      `Tema ${preset.name} diterapkan tanpa mengubah layout UI/UX.`,
    );
  }

  function applyLayout(layoutId: ThemeConfig['layoutPreset']) {
    const layout = getLayoutPreset(layoutId);
    update({ theme: { ...content.theme, ...layout.config } });
    toast.success(
      `Layout ${layout.name} diterapkan. Konten undangan tetap aman.`,
    );
  }

  const colorFields: Array<[string, keyof ThemeConfig]> = [
    ['Warna utama', 'primary'],
    ['Warna latar', 'secondary'],
    ['Warna aksen', 'accent'],
    ['Warna teks', 'text'],
    ['Warna permukaan', 'surface'],
    ['Warna teks lembut', 'muted'],
  ];

  return (
    <div className="space-y-5">
      <Panel
        title="Pilih UI/UX layout"
        description="Layout mengubah pengalaman membuka undangan, struktur hero, gaya Our Story, galeri, dan navigasi. Tema warna dapat diganti secara terpisah."
        action={
          <button
            type="button"
            onClick={() => applyLayout(content.theme.layoutPreset)}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw size={15} /> Reset layout
          </button>
        }
      >
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <strong>Tema dan layout bekerja secara independen.</strong> Mengganti
          UI/UX tidak menghapus profil, acara, foto, RSVP, atau data tamu.
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {LAYOUT_PRESETS.map((layout) => {
            const selected = content.theme.layoutPreset === layout.id;
            const recommended = layout.recommendedThemes.includes(
              content.theme.preset,
            );
            return (
              <button
                key={layout.id}
                type="button"
                onClick={() => applyLayout(layout.id)}
                aria-pressed={selected}
                data-testid={`layout-option-${layout.id}`}
                className={`group relative overflow-hidden rounded-2xl border-2 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${
                  selected
                    ? 'border-amber-500 shadow-md ring-4 ring-amber-100'
                    : 'border-slate-200'
                }`}
              >
                <div className="relative h-32 overflow-hidden rounded-xl bg-slate-950">
                  <div
                    className={`absolute inset-0 ${
                      layout.config.heroStyle === 'split' ? 'left-[42%]' : ''
                    }`}
                    style={{
                      background: `linear-gradient(145deg, ${content.theme.primary}, ${content.theme.accent}aa)`,
                    }}
                  />
                  <div className="absolute inset-x-3 bottom-3 text-white">
                    <span className="text-[7px] font-bold tracking-[.2em] uppercase opacity-60">
                      Live layout
                    </span>
                    <span className="font-display block text-xl leading-none">
                      N <i className="text-amber-300">&</i> A
                    </span>
                  </div>
                  <div
                    className={`absolute bg-white/85 ${
                      layout.config.navigationStyle === 'side-dots'
                        ? 'top-8 right-2 h-14 w-2 rounded-full'
                        : layout.config.navigationStyle === 'top-bar'
                          ? 'top-2 right-3 left-3 h-3 rounded-full'
                          : layout.config.navigationStyle === 'menu-button'
                            ? 'right-2 bottom-2 size-6 rounded-full'
                            : 'right-1/2 bottom-2 h-4 w-16 translate-x-1/2 rounded-full'
                    }`}
                  />
                </div>
                {selected && (
                  <span className="absolute top-5 right-5 grid size-7 place-items-center rounded-full bg-amber-500 text-slate-950">
                    <Check size={16} strokeWidth={3} />
                  </span>
                )}
                <p className="mt-3 text-[9px] font-black tracking-[.16em] text-slate-400 uppercase">
                  {layout.category}
                </p>
                <h3 className="mt-1 text-base font-black text-slate-900">
                  {layout.name}
                </h3>
                <p className="mt-2 text-[11px] leading-5 text-slate-500">
                  {layout.description}
                </p>
                <p className="mt-3 border-t border-slate-100 pt-3 text-[9px] leading-4 font-bold text-slate-400">
                  {layout.experience}
                </p>
                <span
                  className={`mt-3 inline-flex rounded-full px-2 py-1 text-[8px] font-black uppercase ${
                    recommended
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {recommended
                    ? 'Cocok dengan tema aktif'
                    : 'Bisa dikombinasikan'}
                </span>
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel
        title="Pilih tema siap pakai"
        description="Pemilihan tema mengubah warna, tipografi, bentuk komponen, ornamen, gaya hero, dan karakter animasi. Semua konten undangan tetap aman."
        action={
          <button
            type="button"
            onClick={() => applyPreset(content.theme.preset)}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw size={15} /> Reset preset
          </button>
        }
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {THEME_PRESETS.map((preset) => {
            const selected = content.theme.preset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                aria-pressed={selected}
                className={`group relative overflow-hidden rounded-2xl border-2 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${
                  selected
                    ? 'border-amber-500 bg-amber-50/50 shadow-md'
                    : 'border-slate-200 bg-white'
                }`}
              >
                {selected && (
                  <span className="absolute top-3 right-3 grid size-7 place-items-center rounded-full bg-amber-500 text-slate-950">
                    <Check size={16} strokeWidth={3} />
                  </span>
                )}
                <div className="flex gap-2 pr-9">
                  {[
                    preset.config.primary,
                    preset.config.secondary,
                    preset.config.accent,
                    preset.config.surface,
                  ].map((color) => (
                    <span
                      key={color}
                      className="size-8 rounded-full border border-black/10 shadow-sm"
                      style={{ background: color }}
                    />
                  ))}
                </div>
                <p className="mt-4 text-[10px] font-bold tracking-[.18em] text-slate-400 uppercase">
                  {preset.category}
                </p>
                <h3 className="mt-1 text-lg font-black text-slate-900">
                  {preset.name}
                </h3>
                <p className="mt-2 min-h-10 text-xs leading-5 text-slate-500">
                  {preset.description}
                </p>
                <p className="mt-3 text-[10px] font-semibold text-slate-400">
                  Cocok untuk: {preset.recommendedFor}
                </p>
              </button>
            );
          })}
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px] xl:items-start">
        <div className="space-y-5">
          <Panel
            title="Kustomisasi tema"
            description={`Berbasis preset ${activePreset.name}. Pengaturan ini hanya memengaruhi tampilan, bukan isi undangan.`}
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {colorFields.map(([label, key]) => (
                <Field key={key} label={label}>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      className="mt-1.5 h-11 w-14 shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                      value={content.theme[key] as string}
                      onChange={(event) => theme({ [key]: event.target.value })}
                    />
                    <input
                      className={inputClass}
                      value={content.theme[key] as string}
                      onChange={(event) => theme({ [key]: event.target.value })}
                    />
                  </div>
                </Field>
              ))}
            </div>
          </Panel>

          <Panel title="Tipografi dan karakter visual">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Field label="Font heading">
                <select
                  className={inputClass}
                  value={content.theme.headingFont}
                  onChange={(event) =>
                    theme({ headingFont: event.target.value })
                  }
                >
                  <option>Cormorant Garamond</option>
                  <option>Playfair Display</option>
                  <option>DM Serif Display</option>
                  <option>Libre Baskerville</option>
                  <option>Georgia</option>
                </select>
              </Field>
              <Field label="Font body">
                <select
                  className={inputClass}
                  value={content.theme.bodyFont}
                  onChange={(event) => theme({ bodyFont: event.target.value })}
                >
                  <option>Manrope</option>
                  <option>Inter</option>
                  <option>Arial</option>
                  <option>Georgia</option>
                </select>
              </Field>
              <Field label="Gaya layout">
                <select
                  className={inputClass}
                  value={content.theme.layoutStyle}
                  onChange={(event) =>
                    theme({
                      layoutStyle: event.target
                        .value as ThemeConfig['layoutStyle'],
                    })
                  }
                >
                  <option value="editorial">Editorial</option>
                  <option value="botanical">Botanical</option>
                  <option value="heritage">Heritage Indonesia</option>
                  <option value="classic">Classic Romantic</option>
                  <option value="minimal">Minimal</option>
                </select>
              </Field>
              <Field label="Gaya cover pembuka">
                <select
                  className={inputClass}
                  value={content.theme.coverStyle}
                  onChange={(event) =>
                    theme({
                      coverStyle: event.target
                        .value as ThemeConfig['coverStyle'],
                    })
                  }
                >
                  <option value="curtain">Tirai sinematik</option>
                  <option value="envelope">Amplop terbuka</option>
                  <option value="door">Pintu elegan</option>
                  <option value="paper">Lembar undangan</option>
                  <option value="floral">Floral reveal</option>
                </select>
              </Field>
              <Field label="Gaya navigasi">
                <select
                  className={inputClass}
                  value={content.theme.navigationStyle}
                  onChange={(event) =>
                    theme({
                      navigationStyle: event.target
                        .value as ThemeConfig['navigationStyle'],
                    })
                  }
                >
                  <option value="floating-dock">Floating bottom dock</option>
                  <option value="top-bar">Top navigation</option>
                  <option value="side-dots">Side journey dots</option>
                  <option value="menu-button">Compact menu button</option>
                  <option value="minimal">Minimal indicator</option>
                </select>
              </Field>
              <Field label="Layout galeri">
                <select
                  className={inputClass}
                  value={content.theme.galleryStyle}
                  onChange={(event) =>
                    theme({
                      galleryStyle: event.target
                        .value as ThemeConfig['galleryStyle'],
                    })
                  }
                >
                  <option value="masonry">Masonry editorial</option>
                  <option value="classic-grid">Grid klasik</option>
                  <option value="polaroid">Polaroid collage</option>
                  <option value="filmstrip">Horizontal filmstrip</option>
                  <option value="slideshow">Full slideshow</option>
                </select>
              </Field>
              <Field label="Layout Our Story">
                <select
                  className={inputClass}
                  value={content.theme.storyStyle}
                  onChange={(event) =>
                    theme({
                      storyStyle: event.target
                        .value as ThemeConfig['storyStyle'],
                    })
                  }
                >
                  <option value="cinematic">Chapter cinematic</option>
                  <option value="vertical">Timeline vertikal</option>
                  <option value="zigzag">Zig-zag journey</option>
                  <option value="polaroid">Polaroid cards</option>
                  <option value="scrapbook">Scrapbook heritage</option>
                </select>
              </Field>
              <Field label="Ornamen">
                <select
                  className={inputClass}
                  value={content.theme.ornamentStyle}
                  onChange={(event) =>
                    theme({
                      ornamentStyle: event.target
                        .value as ThemeConfig['ornamentStyle'],
                    })
                  }
                >
                  <option value="gold-lines">Garis emas</option>
                  <option value="botanical">Daun botanical</option>
                  <option value="batik">Batik lembut</option>
                  <option value="floral">Floral romantis</option>
                  <option value="geometric">Geometris</option>
                  <option value="minimal">Tanpa ornamen</option>
                </select>
              </Field>
              <Field label="Gaya hero">
                <select
                  className={inputClass}
                  value={content.theme.heroStyle}
                  onChange={(event) =>
                    theme({
                      heroStyle: event.target.value as ThemeConfig['heroStyle'],
                    })
                  }
                >
                  <option value="cinematic">Cinematic</option>
                  <option value="split">Split editorial</option>
                  <option value="royal">Royal heritage</option>
                  <option value="soft">Soft romantic</option>
                </select>
              </Field>
              <Field label="Permukaan komponen">
                <select
                  className={inputClass}
                  value={content.theme.surfaceStyle}
                  onChange={(event) =>
                    theme({
                      surfaceStyle: event.target
                        .value as ThemeConfig['surfaceStyle'],
                    })
                  }
                >
                  <option value="glass">Glassmorphism lembut</option>
                  <option value="paper">Kertas premium</option>
                  <option value="clean">Clean solid</option>
                </select>
              </Field>
              <Field label="Bentuk sudut">
                <select
                  className={inputClass}
                  value={content.theme.cornerStyle}
                  onChange={(event) =>
                    theme({
                      cornerStyle: event.target
                        .value as ThemeConfig['cornerStyle'],
                    })
                  }
                >
                  <option value="soft">Soft premium</option>
                  <option value="round">Sangat membulat</option>
                  <option value="classic">Klasik tegas</option>
                </select>
              </Field>
              <Field label="Intensitas animasi">
                <select
                  className={inputClass}
                  value={content.theme.animationIntensity}
                  onChange={(event) =>
                    theme({
                      animationIntensity: event.target
                        .value as ThemeConfig['animationIntensity'],
                    })
                  }
                >
                  <option value="low">Rendah</option>
                  <option value="medium">Sedang</option>
                  <option value="high">Tinggi</option>
                </select>
              </Field>
              <Field label="Mode tema">
                <select
                  className={inputClass}
                  value={content.theme.mode}
                  onChange={(event) =>
                    theme({ mode: event.target.value as ThemeConfig['mode'] })
                  }
                >
                  <option value="light">Terang</option>
                  <option value="dark">Gelap</option>
                </select>
              </Field>
            </div>
          </Panel>
        </div>

        <aside className="xl:sticky xl:top-24">
          <Panel
            title="Preview langsung"
            description="Preview ini berubah seketika. Klik Simpan untuk menerapkan ke halaman publik."
            action={
              <a
                href={`/invite/${content.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-700"
              >
                <Eye size={15} /> Full preview
              </a>
            }
          >
            <div className="space-y-4">
              <LayoutMiniPreview theme={content.theme} />
              <details className="rounded-xl border border-slate-200 bg-white p-3">
                <summary className="cursor-pointer text-xs font-black text-slate-800">
                  Lihat preview palet tema
                </summary>
                <div className="mt-3">
                  <ThemeMiniPreview
                    theme={content.theme}
                    groom={content.couples[0]?.nickname || content.groomName}
                    bride={content.couples[1]?.nickname || content.brideName}
                  />
                </div>
              </details>
            </div>
            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
              <strong className="block text-slate-800">
                {activePreset.name} + {activeLayout.name}
              </strong>
              Cover {content.theme.coverStyle}, navigasi{' '}
              {content.theme.navigationStyle}, galeri{' '}
              {content.theme.galleryStyle}, dan Our Story{' '}
              {content.theme.storyStyle}.
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function SettingsTab({
  content,
  update,
}: {
  content: WeddingContent;
  update: (patch: Partial<WeddingContent>) => void;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel title="Identitas undangan">
        <div className="space-y-4">
          <Field label="Judul">
            <input
              className={inputClass}
              value={content.title}
              onChange={(e) => update({ title: e.target.value })}
            />
          </Field>
          <Field
            label="Slug URL"
            hint="Gunakan huruf kecil, angka, dan tanda hubung."
          >
            <input
              className={inputClass}
              value={content.slug}
              onChange={(e) =>
                update({
                  slug: e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, '-'),
                })
              }
            />
          </Field>
          <Field label="Status">
            <select
              className={inputClass}
              value={content.status}
              onChange={(e) =>
                update({ status: e.target.value as WeddingContent['status'] })
              }
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </Field>
          <Field label="Tanggal utama">
            <input
              type="datetime-local"
              className={inputClass}
              value={content.eventDate.slice(0, 16)}
              onChange={(e) =>
                update({ eventDate: `${e.target.value}:00+07:00` })
              }
            />
          </Field>
          <Field label="Kutipan romantis">
            <textarea
              className={inputClass}
              rows={3}
              value={content.quote}
              onChange={(e) => update({ quote: e.target.value })}
            />
          </Field>
          <Field label="Pesan setelah acara">
            <textarea
              className={inputClass}
              rows={2}
              value={content.pastEventMessage}
              onChange={(e) => update({ pastEventMessage: e.target.value })}
            />
          </Field>
          <Field label="Ucapan terima kasih">
            <textarea
              className={inputClass}
              rows={3}
              value={content.thankYouMessage}
              onChange={(e) => update({ thankYouMessage: e.target.value })}
            />
          </Field>
        </div>
      </Panel>
      <Panel title="SEO dan WhatsApp">
        <div className="space-y-4">
          <Field label="SEO title">
            <input
              className={inputClass}
              value={content.seo.title}
              onChange={(e) =>
                update({ seo: { ...content.seo, title: e.target.value } })
              }
            />
          </Field>
          <Field label="SEO description">
            <textarea
              className={inputClass}
              rows={3}
              value={content.seo.description}
              onChange={(e) =>
                update({ seo: { ...content.seo, description: e.target.value } })
              }
            />
          </Field>
          <div className="grid gap-4 rounded-2xl border border-slate-200 p-4 md:grid-cols-[1fr_auto] md:items-end">
            <Field label="Open Graph image">
              <input
                className={inputClass}
                value={content.seo.imageUrl}
                onChange={(e) =>
                  update({ seo: { ...content.seo, imageUrl: e.target.value } })
                }
                placeholder="Gambar preview saat link dibagikan"
              />
            </Field>
            <CloudinaryUploadButton
              label="Upload OG image"
              accept="image/jpeg,image/png,image/webp,image/avif"
              expected="image"
              onUploaded={(result) =>
                update({ seo: { ...content.seo, imageUrl: result.url } })
              }
            />
          </div>
          <div className="grid gap-4 rounded-2xl border border-slate-200 p-4 md:grid-cols-[1fr_auto] md:items-end">
            <Field label="Foto hero">
              <input
                className={inputClass}
                value={content.heroImageUrl}
                onChange={(e) => update({ heroImageUrl: e.target.value })}
                placeholder="Foto utama cover dan hero"
              />
            </Field>
            <CloudinaryUploadButton
              label="Upload foto hero"
              accept="image/jpeg,image/png,image/webp,image/avif"
              expected="image"
              onUploaded={(result) => update({ heroImageUrl: result.url })}
            />
          </div>
          <Field
            label="Template pesan WhatsApp"
            hint="Gunakan token [Nama Tamu] dan [Link Undangan]."
          >
            <textarea
              className={inputClass}
              rows={6}
              value={content.whatsappTemplate}
              onChange={(e) => update({ whatsappTemplate: e.target.value })}
            />
          </Field>
        </div>
      </Panel>
    </div>
  );
}

function PreviewTab({
  content,
  save,
}: {
  content: WeddingContent;
  save: () => Promise<void>;
}) {
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>(
    'mobile',
  );
  const widths = { mobile: 390, tablet: 768, desktop: 1200 };
  return (
    <Panel
      title="Preview undangan"
      description="Simpan perubahan terlebih dahulu agar preview publik memuat data terbaru."
      action={
        <div className="flex gap-2">
          <select
            className="rounded-lg border px-3 py-2 text-sm"
            value={device}
            onChange={(e) => setDevice(e.target.value as typeof device)}
          >
            <option value="mobile">Mobile</option>
            <option value="tablet">Tablet</option>
            <option value="desktop">Desktop</option>
          </select>
          <button
            type="button"
            onClick={save}
            className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-bold text-white"
          >
            Simpan & refresh
          </button>
        </div>
      }
    >
      <div
        className="mx-auto overflow-hidden rounded-2xl border bg-slate-200 p-2 transition-all"
        style={{ maxWidth: widths[device] }}
      >
        <iframe
          key={`${content.slug}-${device}`}
          title="Preview undangan"
          src={`/invite/${content.slug}?to=Nama%20Tamu`}
          className="h-[720px] w-full rounded-xl bg-white"
        />
      </div>
    </Panel>
  );
}

function AnalyticsTab({
  content,
  stats,
}: {
  content: WeddingContent;
  stats: {
    total: number;
    hadir: number;
    tidak: number;
    ragu: number;
    rsvp: number;
    attendanceRate: number;
  };
}) {
  const visitor = [
    { date: 'Sen', visitors: 18 },
    { date: 'Sel', visitors: 26 },
    { date: 'Rab', visitors: 41 },
    { date: 'Kam', visitors: 35 },
    { date: 'Jum', visitors: 58 },
    { date: 'Sab', visitors: 74 },
    { date: 'Min', visitors: 67 },
  ];
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel
        title="Pengunjung 7 hari"
        description="Data contoh ditampilkan saat tabel visitor_logs belum berisi data."
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={visitor}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="visitors"
                stroke="#b8944d"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>
      <Panel title="Ringkasan konversi">
        <dl className="space-y-4">
          <div className="flex justify-between">
            <dt>Total tamu</dt>
            <dd className="font-black">{stats.total}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Sudah RSVP</dt>
            <dd className="font-black">{stats.rsvp}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Tingkat hadir</dt>
            <dd className="font-black">{stats.attendanceRate}%</dd>
          </div>
          <div className="flex justify-between">
            <dt>Ucapan disetujui</dt>
            <dd className="font-black">
              {content.messages.filter((x) => x.approved).length}
            </dd>
          </div>
        </dl>
      </Panel>
    </div>
  );
}
