import { v2 as cloudinary } from 'cloudinary';
import { env, isCloudinaryConfigured } from '@/lib/env';

function configure() {
  if (!isCloudinaryConfigured()) return false;
  cloudinary.config({
    cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return true;
}

export async function uploadBuffer(
  buffer: Buffer,
  resourceType: 'image' | 'video',
) {
  if (!configure()) throw new Error('Cloudinary belum dikonfigurasi.');
  return new Promise<{
    secure_url: string;
    public_id: string;
    resource_type: string;
    width?: number;
    height?: number;
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: env.CLOUDINARY_UPLOAD_FOLDER,
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        quality: 'auto',
      },
      (error, result) => {
        if (error || !result) reject(error ?? new Error('Upload gagal.'));
        else resolve(result);
      },
    );
    stream.end(buffer);
  });
}

export async function deleteCloudinaryAsset(
  publicId: string,
  resourceType: 'image' | 'video',
) {
  if (!configure()) throw new Error('Cloudinary belum dikonfigurasi.');
  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate: true,
  });
}

export function optimizedCloudinaryUrl(url: string, width = 1200): string {
  if (!url.includes('/upload/')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${width}/`);
}

export function videoThumbnailUrl(url: string): string {
  return url
    .replace(/\.[a-zA-Z0-9]+$/, '.jpg')
    .replace('/video/upload/', '/video/upload/so_0,f_jpg,q_auto/');
}
