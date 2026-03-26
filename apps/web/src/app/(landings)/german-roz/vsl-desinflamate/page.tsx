import fs from 'node:fs/promises';
import path from 'node:path';
import type { Metadata } from 'next';
import { HtmlLanding } from '@/components/html-landing';
import { LandingConfig } from '@/components/landing-config';
import { LeadForm } from '@/components/lead-form';
import { DesinflamateYoutubeVsl } from './desinflamate-youtube-vsl';

export const metadata: Metadata = {
  title: 'DESINFLAMATE! — VSL del reto con German Roz',
  description:
    'Mira la VSL y únete al reto DESINFLAMATE! con German Roz. Deja tus datos para reservar tu cupo.',
  openGraph: {
    title: 'DESINFLAMATE! — VSL del reto con German Roz',
    description:
      'Mira la VSL y únete al reto DESINFLAMATE! con German Roz. Deja tus datos para reservar tu cupo.',
  },
};

async function loadLandingHtml(): Promise<string> {
  const filePath = path.join(
    process.cwd(),
    'src/app/(landings)/german-roz/vsl-desinflamate/landing-desinflamate.html',
  );
  return fs.readFile(filePath, 'utf-8');
}

export default async function GermanRozVslDesinflamateLanding() {
  const html = await loadLandingHtml();

  return (
    <main>
      <LandingConfig />

      <DesinflamateYoutubeVsl />

      <HtmlLanding html={html} />

      <div style={{ maxWidth: 400, margin: '0 auto 3rem', padding: '0 1rem' }}>
        <LeadForm
          ingestOrgKey="german-roz"
          ingestBuKey="main"
          source="landing-german-roz-vsl-desinflamate"
          fields={['firstName', 'email', 'phone']}
          placeholders={{
            firstName: 'Nombre',
            email: 'Correo',
            phone: 'WhatsApp',
          }}
          defaultValues={{ phone: '+51 ' }}
          hiddenFields={{ creator: 'german-roz' }}
          conversion={{
            event: 'Lead',
            data: { content_name: 'desinflamate-vsl', content_category: 'challenge' },
          }}
          submitLabel="¡Quiero entrar al reto DESINFLAMATE!"
          loadingLabel="Enviando..."
          successMessage="Listo. Revisa tu correo y WhatsApp: te contactamos con los siguientes pasos del reto."
        />
      </div>
    </main>
  );
}
