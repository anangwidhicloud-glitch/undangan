import { z } from 'zod';

const optionalUrl = z.string().url().optional().or(z.literal(''));

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: optionalUrl,
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(10).optional(),
  ADMIN_PASSWORD_HASH: z.string().optional(),
  ADMIN_SESSION_SECRET: z.string().min(32).optional(),
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_UPLOAD_FOLDER: z.string().default('wedding-invitation'),
  NEXT_PUBLIC_DEFAULT_WEDDING_SLUG: z.string().default('nathan-dan-aulia'),
  NEXT_PUBLIC_DEFAULT_TIMEZONE: z.string().default('Asia/Jakarta'),
});

const parsed = envSchema.safeParse(process.env);

export const env = parsed.success
  ? parsed.data
  : {
      CLOUDINARY_UPLOAD_FOLDER: 'wedding-invitation',
      NEXT_PUBLIC_DEFAULT_WEDDING_SLUG: 'nathan-dan-aulia',
      NEXT_PUBLIC_DEFAULT_TIMEZONE: 'Asia/Jakarta',
    };

export const envErrors = parsed.success
  ? []
  : parsed.error.issues.map(
      (issue) => `${issue.path.join('.')}: ${issue.message}`,
    );

export function isSupabaseConfigured(): boolean {
  return Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL &&
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET,
  );
}

export function getAdminConfigurationError(): string | null {
  if (!env.ADMIN_EMAIL) return 'ADMIN_EMAIL belum dikonfigurasi.';
  if (!env.ADMIN_PASSWORD && !env.ADMIN_PASSWORD_HASH)
    return 'ADMIN_PASSWORD atau ADMIN_PASSWORD_HASH belum dikonfigurasi.';
  if (!env.ADMIN_SESSION_SECRET || env.ADMIN_SESSION_SECRET.length < 32)
    return 'ADMIN_SESSION_SECRET wajib minimal 32 karakter.';
  return null;
}
