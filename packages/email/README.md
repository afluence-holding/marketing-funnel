# @nutrition-crm/email

Servicio simple de email con templates React para el CRM de Nutrición.

## Setup

Variables de entorno en `.env`:
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM_NAME="Nutrition CRM"
EMAIL_FROM_EMAIL=noreply@tudominio.com
EMAIL_REPLY_TO=support@tudominio.com
```

**No requiere DB ni queues.** Envío directo vía Resend.

## Uso

### Inicializar

```typescript
import { getEmailService } from '@nutrition-crm/email';

const emailService = getEmailService({
  provider: 'resend',
  apiKey: process.env.RESEND_API_KEY!,
  defaultFrom: {
    name: process.env.EMAIL_FROM_NAME!,
    email: process.env.EMAIL_FROM_EMAIL!,
  },
  replyTo: process.env.EMAIL_REPLY_TO,
});
```

### Envío directo

```typescript
// Envío inmediato
const result = await emailService.send({
  template: 'welcome',
  to: 'user@example.com',
  subject: '¡Bienvenido!',
  data: { name: 'Juan', verifyUrl: 'https://...' },
});

// result: { id, success, messageId?, error? }
```

### Envío masivo

```typescript
const results = await emailService.sendBulk({
  template: 'newsletter',
  subject: 'Newsletter',
  recipients: [
    { email: 'user1@example.com', data: { name: 'Juan' } },
    { email: 'user2@example.com', data: { name: 'María' } },
  ],
});
// results: EmailResult[] - uno por cada recipient
```

## Crear nuevo template

1. **Crear archivo**: `src/templates/mi-template.tsx`

```tsx
import { Html, Body, Container, Heading, Text } from '@react-email/components';

interface MiTemplateProps {
  name: string;
}

export default function MiTemplate({ name }: MiTemplateProps) {
  return (
    <Html>
      <Body style={{ backgroundColor: '#f6f9fc' }}>
        <Container>
          <Heading>Hola {name}</Heading>
          <Text>Contenido del email</Text>
        </Container>
      </Body>
    </Html>
  );
}
```

2. **Usar**: 

```typescript
await emailService.send({
  template: 'mi-template',
  to: 'user@example.com',
  subject: 'Asunto',
  data: { name: 'Juan' },
});
```

**¡Ya!** Se auto-detecta, no necesitas registrarlo.

## Templates disponibles

- `welcome` - Email de bienvenida
- `reminder` - Recordatorios
- `payment-confirmation` - Confirmación de pago
- `otp` - Código de verificación

## Métodos

### EmailService

- `send(options)` → `EmailResult` - Envío directo inmediato
- `sendBulk(options)` → `EmailResult[]` - Envío masivo directo

## Arquitectura

```
App → emailService.send() → Resend API
```

## Notas

- Sin DB, sin queues
- Logs solo en consola
- Templates profesionales (React Email)
- Type-safe con TypeScript
