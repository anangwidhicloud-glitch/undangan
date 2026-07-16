import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect(
    `/invite/${process.env.NEXT_PUBLIC_DEFAULT_WEDDING_SLUG || 'nathan-dan-aulia'}`,
  );
}
