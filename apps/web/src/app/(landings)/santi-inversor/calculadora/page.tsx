import type { Metadata } from 'next';
import { LandingConfig } from '@/components/landing-config';

const CALCULATOR_URL = 'https://frabjous-treacle-316d4f.netlify.app/';

export const metadata: Metadata = {
  title: 'Santi Inversor / Calculadora',
  description:
    'Calculadora de libertad financiera para estimar en cuántos años puedes dejar de depender de tu sueldo.',
  openGraph: {
    title: 'Santi Inversor / Calculadora',
    description:
      'Calculadora de libertad financiera para estimar en cuántos años puedes dejar de depender de tu sueldo.',
  },
};

export default function SantinversorCalculadoraLanding() {
  return (
    <>
      <LandingConfig metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_SANTI_INVERSOR} />
      <iframe
        src={CALCULATOR_URL}
        title="Santi Inversor / Calculadora"
        style={{
          width: '100%',
          height: '100vh',
          border: 'none',
          display: 'block',
        }}
      />
    </>
  );
}
