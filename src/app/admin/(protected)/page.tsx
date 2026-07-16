import { Suspense } from 'react';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { getWeddingContent } from '@/services/content-service';

export default async function AdminPage() {
  const slug =
    process.env.NEXT_PUBLIC_DEFAULT_WEDDING_SLUG || 'nathan-dan-aulia';
  const { content, source } = await getWeddingContent(slug);
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-100" />}>
      <AdminDashboard initialContent={content} dataSource={source} />
    </Suspense>
  );
}
