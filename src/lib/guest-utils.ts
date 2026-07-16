import { slugify } from '@/lib/utils';

export function normalizeIndonesianPhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('62')) return digits;
  if (digits.startsWith('0')) return `62${digits.slice(1)}`;
  if (digits.startsWith('8')) return `62${digits}`;
  return digits;
}

export function createGuestSlug(name: string, suffix?: string): string {
  return [slugify(name), suffix].filter(Boolean).join('-');
}

export function buildWhatsAppLink(
  phone: string,
  message: string,
  web = false,
): string {
  const normalized = normalizeIndonesianPhone(phone);
  const base = web ? 'https://web.whatsapp.com/send' : 'https://wa.me';
  return web
    ? `${base}?phone=${normalized}&text=${encodeURIComponent(message)}`
    : `${base}/${normalized}?text=${encodeURIComponent(message)}`;
}
