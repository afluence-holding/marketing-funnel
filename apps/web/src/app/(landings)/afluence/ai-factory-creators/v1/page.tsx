import type { Metadata } from 'next';
import { LeadForm } from '@/components/lead-form';
import { LandingConfig } from '@/components/landing-config';

export const metadata: Metadata = {
  title: 'Afluence | Pipeline',
  description: 'Landing original de AI Factory Creators',
  openGraph: {
    title: 'Afluence | Pipeline',
    description: 'Landing original de AI Factory Creators',
  },
};

export default function AiFactoryCreatorsV1() {
  return (
    <main style={mainStyle}>
      <LandingConfig
        metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_AFLUENCE_FAKTORY_CREATORS}
        ga4Id={process.env.NEXT_PUBLIC_GA4_AFLUENCE_FAKTORY_CREATORS}
        tiktokPixelId={process.env.NEXT_PUBLIC_TIKTOK_AFLUENCE_FAKTORY_CREATORS}
      />

      <section style={heroStyle}>
        <span style={eyebrowStyle}>DIAGNOSTICO ESTRATEGICO</span>
        <h1 style={titleStyle}>Agenda tu sesion y activa tu plan con IA</h1>
        <p style={descriptionStyle}>
          Completa el formulario para registrar tu lead en el pipeline y sincronizar seguimiento en
          ClickUp.
        </p>
      </section>

      <section style={cardStyle}>
        <h2 style={formTitleStyle}>Formulario de aplicacion</h2>
        <LeadForm
          ingestOrgKey="afluence"
          ingestBuKey="ai-factory-creators"
          source="landing-ai-factory-creators-v1"
          fields={['firstName', 'email', 'phone']}
          placeholders={{
            firstName: 'Nombre completo',
            email: 'Correo electronico',
            phone: 'WhatsApp',
          }}
          defaultValues={{ phone: '+51 ' }}
          extraFields={[
            { name: 'link_social', type: 'url', placeholder: 'Link IG / TikTok / YouTube', required: true },
            {
              name: 'nicho',
              type: 'select',
              placeholder: 'Seleccionar nicho',
              required: true,
              options: [
                { value: 'Fitness', label: 'Fitness' },
                { value: 'Coaching', label: 'Coaching' },
                { value: 'Educacion', label: 'Educacion' },
                { value: 'Entretenimiento', label: 'Entretenimiento' },
                { value: 'Finanzas', label: 'Finanzas' },
                { value: 'Tecnologia', label: 'Tecnologia' },
                { value: 'Lifestyle', label: 'Lifestyle' },
                { value: 'Belleza', label: 'Belleza' },
                { value: 'Otro', label: 'Otro' },
              ],
            },
            {
              name: 'genera_ingresos',
              type: 'select',
              placeholder: 'Tu negocio actualmente genera ingresos?',
              required: true,
              options: [
                { value: 'Si', label: 'Si' },
                { value: 'No', label: 'No' },
              ],
            },
            {
              name: 'facturacion',
              type: 'select',
              placeholder: 'Facturacion mensual aproximada',
              required: true,
              options: [
                { value: 'Aun no monetizo', label: 'Aun no monetizo' },
                { value: '0-1K USD', label: '0-1K USD' },
                { value: '1-5K USD', label: '1-5K USD' },
                { value: '5-20K USD', label: '5-20K USD' },
                { value: '20K+ USD', label: '20K+ USD' },
              ],
            },
            {
              name: 'que_construir',
              type: 'select',
              placeholder: 'Que quieres construir primero?',
              required: true,
              options: [
                { value: 'App para mi audiencia', label: 'App para mi audiencia' },
                { value: 'Reto con IA', label: 'Reto con IA' },
                { value: 'Membresia', label: 'Membresia' },
                { value: 'Curso digital', label: 'Curso digital' },
                { value: 'Automatizacion con IA', label: 'Automatizacion con IA' },
                { value: 'Agentes de voz', label: 'Agentes de voz' },
                { value: 'Plataforma web', label: 'Plataforma web' },
                { value: 'No estoy seguro', label: 'No estoy seguro' },
              ],
            },
            {
              name: 'inversion',
              type: 'select',
              placeholder: 'Disposicion de inversion',
              required: true,
              options: [
                { value: 'ready', label: 'Listo desde 7K' },
                { value: 'evaluating', label: 'Evaluando ese rango' },
                { value: 'lower', label: 'Busco algo menor' },
              ],
            },
            {
              name: 'timing',
              type: 'select',
              placeholder: 'Cuando te gustaria lanzar?',
              required: true,
              options: [
                { value: 'Inmediatamente', label: 'Inmediatamente' },
                { value: '1-3 meses', label: '1-3 meses' },
                { value: '3-6 meses', label: '3-6 meses' },
                { value: 'Explorando', label: 'Explorando' },
              ],
            },
            {
              name: 'confirma_whatsapp',
              type: 'select',
              placeholder: 'Confirmaras la reunion por WhatsApp?',
              required: true,
              options: [
                { value: 'yes', label: 'Si, confirmo por WhatsApp' },
                { value: 'no', label: 'No voy a confirmar' },
              ],
            },
          ]}
          hiddenFields={{ landing_version: 'v1', campaign: 'ai-factory-creators' }}
          conversion={{ event: 'Lead', data: { content_name: 'ai-factory-creators-v1' } }}
          submitLabel="Enviar aplicacion"
          loadingLabel="Enviando..."
          successMessage="Gracias. Tu solicitud fue registrada correctamente."
          style={{ gap: '0.75rem' }}
        />
      </section>
    </main>
  );
}

const mainStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem 1rem 4rem',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
};

const heroStyle: React.CSSProperties = {
  maxWidth: 760,
  textAlign: 'center',
  marginBottom: '2rem',
};

const eyebrowStyle: React.CSSProperties = {
  display: 'inline-block',
  fontSize: '0.75rem',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  opacity: 0.8,
};

const titleStyle: React.CSSProperties = {
  fontSize: 'clamp(1.75rem, 4vw, 2.8rem)',
  lineHeight: 1.1,
  margin: '0.75rem 0',
};

const descriptionStyle: React.CSSProperties = {
  fontSize: '1rem',
  opacity: 0.8,
  maxWidth: 680,
  margin: '0 auto',
};

const cardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 560,
  padding: '1.5rem',
  borderRadius: '1rem',
  border: '1px solid #2d2d37',
  background: 'rgba(23,23,31,0.72)',
};

const formTitleStyle: React.CSSProperties = {
  fontSize: '1.25rem',
  margin: '0 0 1rem',
};
