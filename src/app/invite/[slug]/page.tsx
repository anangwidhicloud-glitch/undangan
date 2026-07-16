import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InvitationExperience } from '@/components/invitation/InvitationExperience';
import { getWeddingContent } from '@/services/content-service';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
  to?: string | string[];
  greeting?: string | string[];
}>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { content } = await getWeddingContent(slug);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return {
    title: content.seo.title,
    description: content.seo.description,
    alternates: { canonical: `${appUrl}/invite/${content.slug}` },
    openGraph: {
      type: 'website',
      title: content.seo.title,
      description: content.seo.description,
      url: `${appUrl}/invite/${content.slug}`,
      images: [
        {
          url: content.seo.imageUrl,
          alt: `Undangan ${content.groomName} dan ${content.brideName}`,
        },
      ],
      locale: 'id_ID',
    },
    twitter: {
      card: 'summary_large_image',
      title: content.seo.title,
      description: content.seo.description,
      images: [content.seo.imageUrl],
    },
    robots:
      content.status === 'published'
        ? { index: true, follow: true }
        : { index: false, follow: false },
  };
}

export default async function InvitePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{3,100}$/.test(slug)) notFound();
  const query = await searchParams;
const name = Array.isArray(query.to) ? query.to[0] : query.to || '';
const greeting = Array.isArray(query.greeting)
  ? query.greeting[0]
  : query.greeting || '';

const guestName = [greeting.trim(), name.trim()].filter(Boolean).join(' ');
  const { content, source } = await getWeddingContent(slug);
  if (!content) notFound();

  const event = content.events[0];
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: content.title,
    startDate: content.eventDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: event
      ? { '@type': 'Place', name: event.venueName, address: event.address }
      : undefined,
    image: [content.seo.imageUrl],
    description: content.seo.description,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />
      <InvitationExperience
        content={content}
        guestName={guestName.slice(0, 120)}
        dataSource={source}
      />
    </>
  );
}
