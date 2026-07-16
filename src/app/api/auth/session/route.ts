import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth/session';
export async function GET() {
  return NextResponse.json({ authenticated: await isAdminAuthenticated() });
}
