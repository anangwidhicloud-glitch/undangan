import { describe, expect, it } from 'vitest';
import { calculateCountdown } from '@/components/invitation/Countdown';

describe('countdown', () => {
  it('menghitung waktu sebelum hari H', () => {
    const now = new Date('2027-07-16T09:00:00+07:00').getTime();
    const result = calculateCountdown('2027-07-17T10:01:02+07:00', now);
    expect(result).toMatchObject({
      valid: true,
      ended: false,
      days: 1,
      hours: 1,
      minutes: 1,
      seconds: 2,
    });
  });

  it('menandai acara yang sudah lewat', () => {
    const now = new Date('2027-07-18T00:00:00+07:00').getTime();
    expect(calculateCountdown('2027-07-17T09:00:00+07:00', now).ended).toBe(
      true,
    );
  });

  it('menangani event date yang tidak tersedia', () => {
    expect(calculateCountdown('tanggal-kosong', 0).valid).toBe(false);
  });
});
