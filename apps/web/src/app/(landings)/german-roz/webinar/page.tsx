import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { LandingConfig } from '@/components/landing-config';
import { WebinarRegistration } from './webinar-registration';
import { GERMAN_WEBINAR } from './webinar-config';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Masterclass gratis 10 de junio — Nutrición y cocina con Germán Roz',
  description:
    'Masterclass en vivo, gratis, con Germán Roz. Una clase de nutrición real + tips de cocina para entender qué comer (y qué no) sin dietas extremas. Miércoles 10 de junio.',
  openGraph: {
    title: 'Masterclass gratis · Nutrición y cocina con Germán Roz',
    description:
      'Una clase en vivo de nutrición real y cocina práctica. Miércoles 10 de junio, gratis.',
  },
};

export default function GermanRozWebinarPage() {
  return (
    <div className={jakarta.className}>
      <LandingConfig metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_GERMAN_ROZ} />
      <WebinarRegistration />
    </div>
  );
}
