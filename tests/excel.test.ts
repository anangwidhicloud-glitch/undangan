import { describe, expect, it } from 'vitest';
import * as XLSX from 'xlsx';
import { parseGuestWorkbook } from '@/lib/excel';

function workbookBuffer(rows: Record<string, unknown>[]): ArrayBuffer {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(rows),
    'Tamu',
  );
  const bytes = XLSX.write(workbook, {
    type: 'array',
    bookType: 'xlsx',
  }) as ArrayBuffer;
  return bytes;
}

describe('Excel guest parser', () => {
  it('memisahkan data valid, invalid, dan duplikat', () => {
    const buffer = workbookBuffer([
      {
        name: 'Bapak Andi',
        greeting: 'Bapak',
        phone: '081234567890',
        group: 'Keluarga',
        invitation_quota: 2,
        notes: '',
      },
      {
        name: 'Bapak Andi',
        greeting: 'Bapak',
        phone: '081234567890',
        group: 'Keluarga',
        invitation_quota: 2,
        notes: '',
      },
      {
        name: '',
        greeting: 'Ibu',
        phone: '0811',
        group: 'Sahabat',
        invitation_quota: 1,
        notes: '',
      },
    ]);
    const result = parseGuestWorkbook(buffer);
    expect(result.valid).toHaveLength(1);
    expect(result.valid[0].phone).toBe('6281234567890');
    expect(result.invalid).toHaveLength(2);
  });

  it('membatasi pemrosesan maksimal 1.000 baris', () => {
    const rows = Array.from({ length: 1005 }, (_, index) => ({
      name: `Tamu ${index + 1}`,
      greeting: 'Saudara/i',
      phone: `0812${String(index).padStart(8, '0')}`,
      group: 'Umum',
      invitation_quota: 1,
      notes: '',
    }));
    const result = parseGuestWorkbook(workbookBuffer(rows));
    expect(result.valid.length + result.invalid.length).toBe(1000);
  });
});
