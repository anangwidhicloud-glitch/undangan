import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/auth/session';

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdminAuthenticated())) redirect('/admin/login');
  return children;
}
