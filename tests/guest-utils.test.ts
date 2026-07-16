import { describe, expect, it } from 'vitest';
import {
  buildWhatsAppLink,
  createGuestSlug,
  normalizeIndonesianPhone,
} from '@/lib/guest-utils';

describe('guest utilities', () => {
  it.each([
    ['0812-3456-7890', '6281234567890'],
    ['812 3456 7890', '6281234567890'],
    ['+62 812 3456 7890', '6281234567890'],
    ['', ''],
  ])('normalisasi nomor %s', (input, expected) => {
    expect(normalizeIndonesianPhone(input)).toBe(expected);
  });

  it('membuat slug tamu yang stabil', () => {
    expect(createGuestSlug('Bapak Andi & Keluarga', '2')).toBe(
      'bapak-andi-keluarga-2',
    );
  });

  it('meng-encode pesan WhatsApp dengan benar', () => {
    const link = buildWhatsAppLink('081234567890', 'Nathan & Aulia');
    expect(link).toContain('https://wa.me/6281234567890');
    expect(link).toContain('Nathan%20%26%20Aulia');
  });
});
