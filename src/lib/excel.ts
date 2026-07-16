import * as XLSX from 'xlsx';
import { z } from 'zod';
import { createGuestSlug, normalizeIndonesianPhone } from '@/lib/guest-utils';

export const guestImportSchema = z.object({
  name: z.string().trim().min(2),
  greeting: z.string().trim().min(1).default('Bapak/Ibu/Saudara/i'),
  phone: z
    .string()
    .transform(normalizeIndonesianPhone)
    .refine(
      (value) => !value || /^62\d{8,14}$/.test(value),
      'Nomor WhatsApp tidak valid.',
    ),
  group: z.string().trim().default('Umum'),
  invitation_quota: z.coerce.number().int().min(1).max(20).default(1),
  notes: z.string().trim().optional().default(''),
});

export type ParsedGuest = z.infer<typeof guestImportSchema> & {
  slug: string;
  row: number;
};
export type ExcelParseResult = {
  valid: ParsedGuest[];
  invalid: Array<{ row: number; data: unknown; errors: string[] }>;
};

export function parseGuestWorkbook(buffer: ArrayBuffer): ExcelParseResult {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: '',
  });
  const valid: ParsedGuest[] = [];
  const invalid: ExcelParseResult['invalid'] = [];
  const seen = new Set<string>();

  rows.slice(0, 1000).forEach((row, index) => {
    const rowNumber = index + 2;
    const parsed = guestImportSchema.safeParse(row);
    if (!parsed.success) {
      invalid.push({
        row: rowNumber,
        data: row,
        errors: parsed.error.issues.map((issue) => issue.message),
      });
      return;
    }
    const duplicateKey = `${parsed.data.name.toLowerCase()}|${parsed.data.phone}`;
    if (seen.has(duplicateKey)) {
      invalid.push({
        row: rowNumber,
        data: row,
        errors: ['Duplikat pada file import.'],
      });
      return;
    }
    seen.add(duplicateKey);
    valid.push({
      ...parsed.data,
      slug: createGuestSlug(parsed.data.name, String(rowNumber)),
      row: rowNumber,
    });
  });
  return { valid, invalid };
}
