import { describe, expect, it } from 'vitest';
import { rsvpSchema } from '@/lib/validations/rsvp';

const valid = {
  weddingId: '11111111-1111-4111-8111-111111111111',
  guestName: 'Bapak Andi',
  attendanceStatus: 'hadir' as const,
  guestCount: '2',
  phone: '081234567890',
  message: 'Semoga menjadi keluarga yang bahagia.',
  website: '',
};

describe('validasi RSVP', () => {
  it('menerima dan mengubah jumlah tamu menjadi angka', () => {
    const result = rsvpSchema.parse(valid);
    expect(result.guestCount).toBe(2);
  });

  it('menolak honeypot bot', () => {
    const result = rsvpSchema.safeParse({
      ...valid,
      website: 'https://spam.invalid',
    });
    expect(result.success).toBe(false);
  });

  it('menolak jumlah tamu di atas batas', () => {
    const result = rsvpSchema.safeParse({ ...valid, guestCount: 99 });
    expect(result.success).toBe(false);
  });

  it('menolak ucapan terlalu pendek', () => {
    const result = rsvpSchema.safeParse({ ...valid, message: 'ok' });
    expect(result.success).toBe(false);
  });
});
