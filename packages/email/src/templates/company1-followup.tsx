import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
} from '@react-email/components';
import * as React from 'react';

interface Company1FollowupProps {
  lead_name: string;
  lead_email?: string;
  ctaUrl?: string;
}

export function Company1Followup({
  lead_name,
  lead_email,
  ctaUrl = 'https://faktory.ai',
}: Company1FollowupProps) {
  return (
    <Html>
      <Head />
      <Preview>{lead_name}, no te pierdas esto</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Hola {lead_name} 👋</Heading>

          <Text style={text}>
            Te escribimos porque mostraste interés en AI Faktory. Queremos
            contarte como podemos ayudarte a automatizar tu negocio con
            inteligencia artificial.
          </Text>

          <Text style={text}>
            Nuestros clientes ya estan ahorrando +10 horas semanales
            automatizando tareas repetitivas.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={ctaUrl}>
              Quiero saber mas
            </Button>
          </Section>

          <Text style={footer}>
            — El equipo de AI Faktory
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default Company1Followup;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 'bold' as const,
  margin: '40px 0',
  padding: '0 48px',
};

const text = {
  color: '#444',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  padding: '0 48px',
};

const buttonContainer = {
  padding: '27px 48px',
};

const button = {
  backgroundColor: '#7c3aed',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '12px',
};

const footer = {
  color: '#8898aa',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '32px 0 0',
  padding: '0 48px',
};
