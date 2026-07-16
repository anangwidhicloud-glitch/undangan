import { z } from 'zod';

export const rsvpSchema = z.object({
  weddingId: z
    .string()
    .uuid()
    .or(z.literal('11111111-1111-4111-8111-111111111111')),
  guestId: z.string().optional(),
  guestName: z.string().trim().min(2, 'Nama minimal 2 karakter.').max(100),
  attendanceStatus: z.enum(['hadir', 'tidak_hadir', 'ragu']),
  guestCount: z.coerce.number().int().min(0).max(10),
  phone: z.string().trim().max(20).optional().or(z.literal('')),
  message: z.string().trim().min(3, 'Ucapan minimal 3 karakter.').max(500),
  website: z
    .string()
    .max(0, 'Permintaan terdeteksi sebagai bot.')
    .optional()
    .or(z.literal('')),
});

export type RsvpFormInput = z.input<typeof rsvpSchema>;
export type RsvpInput = z.output<typeof rsvpSchema>;
