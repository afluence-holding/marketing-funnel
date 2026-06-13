import type { Metadata } from 'next';
import { LandingConfig } from '@/components/landing-config';
import LandingFrame from '../diagnostico/landing-frame';

export const metadata: Metadata = {
  title: 'Webinar · Train Like A Pro',
  description:
    'Regístrate al webinar en vivo de Carolina Manrique. Guarda el evento en tu calendario y entra al grupo VIP de WhatsApp.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Webinar · Train Like A Pro',
    description:
      'Regístrate al webinar en vivo de Carolina Manrique. Guarda el evento en tu calendario y entra al grupo VIP de WhatsApp.',
  },
};

type SearchParams = Record<string, string | string[] | undefined>;

function buildIframeSrc(searchParams: SearchParams) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === 'string') qs.set(key, value);
    else if (Array.isArray(value) && value[0]) qs.set(key, value[0]);
  }
  const query = qs.toString();
  return `/caro-fitness/gracias-webinar/raw${query ? `?${query}` : ''}`;
}

export default async function CaroFitnessGraciasWebinarPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const iframeSrc = buildIframeSrc(sp);
  const isConfirmado = sp.confirmado === '1';

  return (
    <>
      <LandingConfig
        metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_CARO_FITNESS}
      />
      <LandingFrame
        src={iframeSrc}
        title={
          isConfirmado
            ? 'Estás dentro · Train Like A Pro'
            : 'Registro webinar · Train Like A Pro'
        }
      />
    </>
  );
}
