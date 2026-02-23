# @carlazaplana/whatsapp-client

Package compartido para WhatsApp Business API usando [@kapso/whatsapp-cloud-api-js](https://github.com/gokapso/whatsapp-cloud-api-js/).

## 🎯 Propósito

Package compartido para WhatsApp Business API que implementa **Strategy Pattern** para separar la lógica de envío directo vs encolado. Proporciona una interfaz limpia y desacoplada que permite a las apps elegir entre enviar mensajes directamente o encolarlos para procesamiento asíncrono.

## 📦 Instalación

```bash
# En la raíz del monorepo
npm install

# El package se instala automáticamente con la dependencia @kapso/whatsapp-cloud-api
```

## ⚙️ Configuración

### Variables de Entorno

Agrega estas variables en el `.env` de la raíz del monorepo:

```bash
# WhatsApp Business API (REQUERIDO)
WHATSAPP_ACCESS_TOKEN=EAAbc...tu-access-token
WHATSAPP_PHONE_NUMBER_ID=123456789

# Webhook (OPCIONAL)
WHATSAPP_WEBHOOK_TOKEN=tu-webhook-verify-token
META_APP_SECRET=tu-app-secret  # Para verificar firmas de webhooks

# Kapso Proxy (OPCIONAL - alternativa a Meta directo)
KAPSO_API_KEY=tu-kapso-api-key
KAPSO_BASE_URL=https://api.kapso.ai/meta/whatsapp
```

### Obtener Credenciales

#### Opción 1: Meta Setup (~1 hora)
1. Ve a [Meta for Developers](https://developers.facebook.com/)
2. Crea una app de tipo "Business"
3. Agrega el producto "WhatsApp"
4. Obtén tu **Access Token** y **Phone Number ID**

#### Opción 2: Kapso Proxy (~2 minutos)
1. Usa el servicio proxy de Kapso
2. Obtén tu **Kapso API Key**
3. Usa `baseUrl: "https://api.kapso.ai/meta/whatsapp"` y `kapsoApiKey` en la configuración

## 🚀 Uso

### En apps/agent (Con Queueing - Encolar Mensajes)

Las apps que necesitan encolar mensajes (para rate limiting, retry, etc.) deben crear un cliente con queueing:

```typescript
import { createQueuedWhatsAppClient } from '@carlazaplana/whatsapp-client';
import { enqueueOutgoingMessage } from '@carlazaplana/queues';

// Crear cliente con queueing habilitado
const whatsappClient = createQueuedWhatsAppClient(enqueueOutgoingMessage);

// Todos los métodos se encolan automáticamente
await whatsappClient.sendText('+573001234567', 'Hola! Soy Pat 🎯');
await whatsappClient.sendImage('+573001234567', 'https://example.com/image.jpg', {
  caption: 'Mira esta imagen!'
});
await whatsappClient.markRead('wamid.xxx'); // También se encola
```

### En apps/workers (Sin Queueing - Enviar Directo)

Las apps que procesan la cola deben usar el cliente directo (sin queueing):

```typescript
import { directWhatsAppClient } from '@carlazaplana/whatsapp-client';
// O crear uno local:
import { createWhatsAppSender } from '@carlazaplana/whatsapp-client';
const directClient = createWhatsAppSender('direct');

// Enviar mensajes directamente a Meta API
await directWhatsAppClient.sendText('+573001234567', 'Mensaje directo');
await directWhatsAppClient.sendImage('+573001234567', 'https://example.com/image.jpg');
await directWhatsAppClient.markRead('wamid.xxx');

### Métodos Disponibles

Todos los métodos están disponibles en ambos modos (directo y queued):

```typescript
// Texto
await client.sendText(to, text, { replyTo?, previewUrl? });

// Media
await client.sendImage(to, imageUrl, { caption?, replyTo? });
await client.sendVideo(to, videoUrl, { caption?, replyTo? });
await client.sendAudio(to, audioUrl, { replyTo? });
await client.sendDocument(to, documentUrl, { caption?, filename?, replyTo? });

// Ubicación
await client.sendLocation(to, latitude, longitude, { name?, address? });

// Interactivos
await client.sendButtons(to, {
  bodyText: string,
  buttons: Array<{ id: string; title: string }>,
  headerText?: string,
  footerText?: string,
});

await client.sendList(to, {
  bodyText: string,
  buttonText: string,
  sections: Array<{
    title?: string;
    items: Array<{ id: string; title: string; description?: string }>;
  }>,
  headerText?: string,
  footerText?: string,
});

// Acciones
await client.markRead(messageId); // Marca como leído Y envía typing indicator
```

### En apps/api (Recibir Webhooks)

```typescript
import {
  verifyWebhook,
  verifyWebhookSignature,
  parseIncomingMessages,
  validateWebhookPayload,
  getNormalizedWebhookEvents,
} from '@carlazaplana/whatsapp-client';
import express from 'express';

const app = express();

// IMPORTANTE: Usar express.raw() para webhooks POST
app.post('/webhook/whatsapp', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // 1. Verificar firma (si META_APP_SECRET está configurado)
    const signatureHeader = req.headers['x-hub-signature-256'] as string;
    if (signatureHeader) {
      const isValid = verifyWebhookSignature(req.body, signatureHeader);
      if (!isValid) {
        return res.status(401).send('Invalid signature');
      }
    }

    // 2. Parsear payload
    const payload = JSON.parse(req.body.toString('utf8'));

    // 3. Validar payload
    if (!validateWebhookPayload(payload)) {
      return res.status(400).send('Invalid payload');
    }

    // 4. Obtener eventos normalizados (incluye messages, statuses, calls, contacts)
    const events = getNormalizedWebhookEvents(payload);

    // 5. Procesar mensajes
    const messages = parseIncomingMessages(payload);
    for (const message of messages) {
      console.log('Mensaje de:', message.from);
      console.log('Texto:', message.text);
      
      // Encolar para procesamiento
      await enqueueMessage(message);
    }

    // 6. Procesar statuses (delivery receipts)
    for (const status of events.statuses || []) {
      console.log('Status:', status.status, 'for message:', status.id);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.sendStatus(200); // Responder 200 para que Meta no reintente
  }
});

// Endpoint GET - Verificación del webhook (setup inicial)
app.get('/webhook/whatsapp', (req, res) => {
  const challenge = verifyWebhook({
    mode: req.query['hub.mode'] as string,
    token: req.query['hub.verify_token'] as string,
    challenge: req.query['hub.challenge'] as string,
  });

  if (challenge) {
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Forbidden');
  }
});
```

## 📚 API Reference

### Factory Functions

#### `createWhatsAppSender(mode, options?)`

Crea un cliente de WhatsApp con el modo especificado.

**Parámetros:**
- `mode`: `'direct'` | `'queued'` - Modo de envío
- `options.enqueueFn`: Función para encolar (requerido si `mode === 'queued'`)

**Retorna:** `WhatsAppSender`

```typescript
// Directo
const direct = createWhatsAppSender('direct');

// Con queueing
const queued = createWhatsAppSender('queued', {
  enqueueFn: async (payload) => {
    await enqueueJob(QUEUE_NAMES.OUTGOING_MESSAGES, payload.method, payload.args);
  }
});
```

#### `createQueuedWhatsAppClient(enqueueFn)`

Atajo para crear cliente con queueing. Equivalente a `createWhatsAppSender('queued', { enqueueFn })`.

#### `getDirectWhatsAppClient()`

Singleton para cliente directo. Retorna la misma instancia en cada llamada.

#### `directWhatsAppClient`

Export de conveniencia del singleton directo.

### Interfaz WhatsAppSender

Todos los clientes implementan esta interfaz:

```typescript
interface WhatsAppSender {
  sendText(to: string, text: string, options?): Promise<any>;
  sendImage(to: string, imageUrl: string, options?): Promise<any>;
  sendVideo(to: string, videoUrl: string, options?): Promise<any>;
  sendAudio(to: string, audioUrl: string, options?): Promise<any>;
  sendDocument(to: string, documentUrl: string, options?): Promise<any>;
  sendLocation(to: string, lat: number, lng: number, options?): Promise<any>;
  sendButtons(to: string, options): Promise<any>;
  sendList(to: string, options): Promise<any>;
  markRead(messageId: string): Promise<any>;
}
```

### Webhooks

#### `verifyWebhook(params): string | null`

Verifica el webhook durante la configuración inicial en Meta.

**Parámetros:**
- `mode`: Debe ser 'subscribe'
- `token`: Token de verificación
- `challenge`: Challenge string de Meta

**Retorna:** Challenge si la verificación es exitosa, `null` en caso contrario.

#### `verifyWebhookSignature(rawBody, signatureHeader): boolean`

Verifica la firma del webhook usando el app secret de Meta.

**Parámetros:**
- `rawBody`: Buffer del body crudo del request
- `signatureHeader`: Header `x-hub-signature-256`

**Retorna:** `true` si la firma es válida.

#### `validateWebhookPayload(payload): boolean`

Valida que un payload de webhook sea válido.

#### `parseIncomingMessages(payload): IncomingMessage[]`

Parsea el payload del webhook y extrae los mensajes entrantes usando `normalizeWebhook` de la librería.

**Retorna:** Array de mensajes parseados con estructura simplificada.

#### `getNormalizedWebhookEvents(payload)`

Obtiene eventos normalizados del webhook (messages, statuses, calls, contacts) usando la librería.

## 🏗️ Arquitectura

Implementa **Strategy Pattern** para separar responsabilidades:

```
packages/whatsapp-client/
├── src/
│   ├── core.ts         # WhatsAppClientCore - Cliente base (sin colas)
│   ├── sender.ts       # Interfaz + DirectWhatsAppSender + QueuedWhatsAppSender
│   ├── factory.ts      # Factory functions para crear clientes
│   ├── config.ts       # Configuración (lee de packages/config)
│   ├── webhook.ts      # Helpers para webhooks
│   ├── types.ts        # TypeScript types
│   └── index.ts        # Exports públicos
├── package.json
├── tsconfig.json
└── README.md
```

### Principios de Diseño

1. **Separación de Responsabilidades**: El package NO sabe sobre colas. Las apps deciden si encolar o no.
2. **Strategy Pattern**: Dos implementaciones (`DirectWhatsAppSender` y `QueuedWhatsAppSender`) comparten la misma interfaz.
3. **Sin Estado Global**: No hay variables globales mutables. Cada app crea su propio cliente.
4. **Type-Safe**: TypeScript garantiza que la interfaz se respete.

## 🔄 Acerca de la Librería

Este package usa [@kapso/whatsapp-cloud-api](https://github.com/gokapso/whatsapp-cloud-api-js/) que ofrece:

- ✅ Mejor soporte para templates
- ✅ Historial de conversaciones
- ✅ Normalización de webhooks
- ✅ Soporte para Kapso proxy
- ✅ Mejor manejo de media
- ✅ TypeScript completo

## 🔄 Migración desde Versión Anterior

Si estás migrando desde la versión anterior con `setupQueueing()`:

**Antes:**
```typescript
import { setupQueueing, whatsappClient } from '@carlazaplana/whatsapp-client';
setupQueueing({ enqueueOutgoingMessage });
await whatsappClient.sendText(...);
```

**Ahora:**
```typescript
import { createQueuedWhatsAppClient } from '@carlazaplana/whatsapp-client';
import { enqueueOutgoingMessage } from '@carlazaplana/queues';

const whatsappClient = createQueuedWhatsAppClient(enqueueOutgoingMessage);
await whatsappClient.sendText(...);
```

## 🔧 Desarrollo

```bash
# Compilar
npm run build

# Compilar en modo watch
npm run dev

# Limpiar
npm run clean
```

## 🧪 Testing

```typescript
// Verificar configuración
import { validateWhatsAppConfig } from '@carlazaplana/whatsapp-client';

const isValid = validateWhatsAppConfig();
console.log('Config valid:', isValid);
```

## 📖 Recursos

- **Documentación de la librería**: https://github.com/gokapso/whatsapp-cloud-api-js/
- **Documentación de Kapso**: https://docs.kapso.ai/
- **Meta WhatsApp Cloud API**: https://developers.facebook.com/docs/whatsapp/cloud-api/

## 🔐 Seguridad

- ✅ Las credenciales se leen desde variables de entorno
- ✅ Nunca commitees el `.env` al repositorio
- ✅ Valida siempre los payloads antes de procesarlos
- ✅ Verifica las firmas de webhooks cuando sea posible (configura `META_APP_SECRET`)

## 🆕 Nuevas Features Disponibles

Con la nueva librería, también puedes acceder directamente al cliente para features avanzadas:

```typescript
import { getWhatsAppClient } from '@carlazaplana/whatsapp-client';

const client = getWhatsAppClient();

// Consultar historial de conversaciones
const conversations = await client.conversations.list({
  phoneNumberId: '<PHONE_NUMBER_ID>',
  limit: 20,
});

// Consultar mensajes de una conversación
const messages = await client.messages.listByConversation({
  phoneNumberId: '<PHONE_NUMBER_ID>',
  conversationId: '<CONVERSATION_ID>',
  limit: 50,
});

// Enviar templates
await client.messages.sendTemplate({
  phoneNumberId: '<PHONE_NUMBER_ID>',
  to: '+573001234567',
  template: {
    name: 'welcome',
    language: 'es',
  },
});

// Subir y gestionar media
const media = await client.media.upload({
  phoneNumberId: '<PHONE_NUMBER_ID>',
  type: 'image',
  file: imageBlob,
  fileName: 'photo.png',
});
```

## 🤝 Contribuir

Este package es interno del monorepo. Para agregar funcionalidad:

1. Agregar método interno en `core.ts` (ej: `sendStickerInternal`)
2. Implementar en ambas strategies en `sender.ts` (DirectWhatsAppSender y QueuedWhatsAppSender)
3. Exportar en `src/index.ts`
4. Actualizar este README
5. Recompilar: `npm run build`

---

**Versión**: 2.0.0  
**Última actualización**: 2025-01-20  
**Librería base**: @kapso/whatsapp-cloud-api-js
