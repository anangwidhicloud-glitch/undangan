import { describe, expect, it } from 'vitest';
import { assertSameOrigin } from '@/lib/security';

describe('assertSameOrigin', () => {
  it('menerima origin yang sama berdasarkan Host proxy', () => {
    const request = new Request('http://localhost:3000/api/auth/login', {
      headers: {
        host: '127.0.0.1:3000',
        origin: 'http://127.0.0.1:3000',
      },
    });
    expect(assertSameOrigin(request)).toBe(true);
  });

  it('menolak host dan protokol yang berbeda', () => {
    expect(
      assertSameOrigin(
        new Request('https://wedding.example/api/auth/login', {
          headers: {
            host: 'wedding.example',
            origin: 'https://evil.example',
          },
        }),
      ),
    ).toBe(false);
    expect(
      assertSameOrigin(
        new Request('http://localhost/api/auth/login', {
          headers: {
            host: 'wedding.example',
            origin: 'http://wedding.example',
            'x-forwarded-proto': 'https',
          },
        }),
      ),
    ).toBe(false);
  });
});
