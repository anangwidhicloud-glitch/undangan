import { z } from 'zod';

function readOptionalString(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function readOptionalUrl(name: string): string | undefined {
  const value = readOptionalString(name);
  if (!value) return undefined;

  const result = z.string().url().safeParse(value);
  return result.success ? result.data : undefined;
}

export const env = {
  NEXT_PUBLIC_APP_URL: readOptionalUrl('NEXT_PUBLIC_APP_URL'),

  ADMIN_EMAIL: readOptionalString('ADMIN_EMAIL'),
  ADMIN_PASSWORD: readOptionalString('ADMIN_PASSWORD'),
  ADMIN_PASSWORD_HASH: readOptionalString('ADMIN_PASSWORD_HASH'),
  ADMIN_SESSION_SECRET: readOptionalString('ADMIN_SESSION_SECRET'),

  NEXT_PUBLIC_SUPABASE_URL: readOptionalUrl(
    'NEXT_PUBLIC_SUPABASE_URL',
  ),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: readOptionalString(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ),
  SUPABASE_SERVICE_ROLE_KEY: readOptionalString(
    'SUPABASE_SERVICE_ROLE_KEY',
  ),

  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: readOptionalString(
    'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
  ),
  CLOUDINARY_API_KEY: readOptionalString('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: readOptionalString('CLOUDINARY_API_SECRET'),
  CLOUDINARY_UPLOAD_FOLDER:
    readOptionalString('CLOUDINARY_UPLOAD_FOLDER') ||
    'wedding-invitation',

  NEXT_PUBLIC_DEFAULT_WEDDING_SLUG:
    readOptionalString('NEXT_PUBLIC_DEFAULT_WEDDING_SLUG') ||
    'nathan-dan-aulia',

  NEXT_PUBLIC_DEFAULT_TIMEZONE:
    readOptionalString('NEXT_PUBLIC_DEFAULT_TIMEZONE') ||
    'Asia/Jakarta',
};

export const envErrors: string[] = [];

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
  if (!env.ADMIN_EMAIL) {
    return 'ADMIN_EMAIL belum dikonfigurasi.';
  }

  if (!env.ADMIN_PASSWORD && !env.ADMIN_PASSWORD_HASH) {
    return 'ADMIN_PASSWORD atau ADMIN_PASSWORD_HASH belum dikonfigurasi.';
  }

  if (
    !env.ADMIN_SESSION_SECRET ||
    env.ADMIN_SESSION_SECRET.length < 32
  ) {
    return 'ADMIN_SESSION_SECRET wajib minimal 32 karakter.';
  }

  return null;
}