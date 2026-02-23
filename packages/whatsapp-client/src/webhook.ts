import { getWhatsAppConfig } from './config';
// Dynamic import workaround for server exports
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { normalizeWebhook, verifySignature } = require('@kapso/whatsapp-cloud-api/server');

/**
 * Webhook Processing Helpers
 * 
 * Helpers para procesar webhooks de WhatsApp en apps/api
 * Usa las funciones de @kapso/whatsapp-cloud-api para normalización y verificación
 */

export interface WebhookVerificationParams {
  mode: string;
  token: string;
  challenge: string;
}

export interface IncomingMessage {
  from: string;
  messageId: string;
  timestamp: number;
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contacts' | 'interactive';
  text?: string;
  mediaId?: string;
  mediaUrl?: string;
  mimeType?: string;
  caption?: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  locationAddress?: string;
  interactive?: {
    type: string;
    buttonReply?: { id: string; title: string };
    listReply?: { id: string; title: string; description?: string };
  };
}

export interface WebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: { name: string };
          wa_id: string;
        }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          type: string;
          text?: { body: string };
          image?: { id: string; mime_type: string; caption?: string };
          video?: { id: string; mime_type: string; caption?: string };
          audio?: { id: string; mime_type: string };
          document?: { id: string; mime_type: string; caption?: string; filename?: string };
          location?: { latitude: number; longitude: number; name?: string; address?: string };
          interactive?: {
            type: string;
            button_reply?: { id: string; title: string };
            list_reply?: { id: string; title: string; description?: string };
          };
        }>;
        statuses?: Array<{
          id: string;
          status: string;
          timestamp: string;
          recipient_id: string;
        }>;
      };
      field: string;
    }>;
  }>;
}

/**
 * Verifica el webhook de WhatsApp durante la configuración inicial
 * 
 * @param params Parámetros del query string de verificación
 * @returns Challenge token si la verificación es exitosa, null en caso contrario
 */
export function verifyWebhook(params: WebhookVerificationParams): string | null {
  const config = getWhatsAppConfig();
  
  const { mode, token, challenge } = params;
  
  // Verificar que el modo sea 'subscribe'
  if (mode !== 'subscribe') {
    console.warn('[Webhook] Invalid mode:', mode);
    return null;
  }
  
  // Verificar el token
  if (!config.webhookVerifyToken) {
    console.warn('[Webhook] Webhook verify token not configured');
    return null;
  }
  
  if (token !== config.webhookVerifyToken) {
    console.warn('[Webhook] Invalid verify token');
    return null;
  }
  
  // Retornar el challenge
  return challenge;
}

/**
 * Verifica la firma del webhook usando el app secret de Meta
 * 
 * @param rawBody - El body crudo del request (Buffer)
 * @param signatureHeader - El header x-hub-signature-256
 * @returns true si la firma es válida
 */
export function verifyWebhookSignature(rawBody: Buffer, signatureHeader: string): boolean {
  const config = getWhatsAppConfig();
  
  if (!config.appSecret) {
    console.warn('[Webhook] META_APP_SECRET not configured, skipping signature verification');
    return true; // No fallar si no está configurado (para desarrollo)
  }

  return verifySignature({
    appSecret: config.appSecret,
    rawBody,
    signatureHeader,
  });
}

/**
 * Parsea el payload del webhook usando la función normalizeWebhook de la librería
 * y luego adapta el formato a nuestra interfaz IncomingMessage
 * 
 * @param payload Payload crudo del webhook (JSON parseado)
 * @returns Array de mensajes entrantes parseados
 */
export function parseIncomingMessages(payload: WebhookPayload): IncomingMessage[] {
  try {
    // Usar normalizeWebhook de la librería para normalizar el payload
    const normalized = normalizeWebhook(payload);
    
    const messages: IncomingMessage[] = [];
    
    // Procesar mensajes normalizados
    for (const message of normalized.messages || []) {
      const parsed: IncomingMessage = {
        from: message.from || '',
        messageId: message.id || '',
        timestamp: message.timestamp ? parseInt(String(message.timestamp)) : Date.now(),
        type: (message.type as any) || 'text',
      };
      
      // Parsear según tipo de mensaje
      if (message.type === 'text' && message.text) {
        parsed.text = typeof message.text === 'string' ? message.text : message.text.body;
      }
      
      if (message.type === 'image' && message.image) {
        parsed.mediaId = typeof message.image === 'string' ? undefined : message.image.id;
        parsed.mediaUrl = typeof message.image === 'string' ? message.image : (message.image as any).link;
        parsed.caption = typeof message.image === 'string' ? undefined : (message.image as any).caption;
      }
      
      if (message.type === 'video' && message.video) {
        parsed.mediaId = typeof message.video === 'string' ? undefined : message.video.id;
        parsed.mediaUrl = typeof message.video === 'string' ? message.video : (message.video as any).link;
        parsed.caption = typeof message.video === 'string' ? undefined : (message.video as any).caption;
      }
      
      if (message.type === 'audio' && message.audio) {
        parsed.mediaId = typeof message.audio === 'string' ? undefined : message.audio.id;
        parsed.mediaUrl = typeof message.audio === 'string' ? message.audio : (message.audio as any).link;
      }
      
      if (message.type === 'document' && message.document) {
        parsed.mediaId = typeof message.document === 'string' ? undefined : message.document.id;
        parsed.mediaUrl = typeof message.document === 'string' ? message.document : (message.document as any).link;
        parsed.caption = typeof message.document === 'string' ? undefined : (message.document as any).caption;
      }
      
      if (message.type === 'location' && message.location) {
        parsed.latitude = typeof message.location === 'object' ? message.location.latitude : undefined;
        parsed.longitude = typeof message.location === 'object' ? message.location.longitude : undefined;
        parsed.locationName = typeof message.location === 'object' ? message.location.name : undefined;
        parsed.locationAddress = typeof message.location === 'object' ? message.location.address : undefined;
      }
      
      if (message.type === 'interactive' && message.interactive) {
        const interactive = typeof message.interactive === 'object' ? message.interactive : null;
        parsed.interactive = {
          type: (interactive as any)?.type || '',
          buttonReply: (interactive as any)?.buttonReply,
          listReply: (interactive as any)?.listReply,
        };
      }
      
      // Intentar obtener kapso extensions si están disponibles
      const kapsoExtensions = (message as any).kapso;
      if (kapsoExtensions?.mediaUrl) {
        parsed.mediaUrl = kapsoExtensions.mediaUrl;
      }
      
      messages.push(parsed);
    }
    
    return messages;
  } catch (error) {
    console.error('[Webhook] Error parsing webhook payload:', error);
    // Fallback al método antiguo si falla la normalización
    return parseIncomingMessagesLegacy(payload);
  }
}

/**
 * Método legacy para parsear mensajes (fallback)
 */
function parseIncomingMessagesLegacy(payload: WebhookPayload): IncomingMessage[] {
  const messages: IncomingMessage[] = [];
  
  try {
    // Iterar sobre los entries
    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        // Solo procesar cambios de tipo 'messages'
        if (change.field !== 'messages') {
          continue;
        }
        
        const value = change.value;
        
        // Procesar mensajes
        for (const message of value.messages || []) {
          const parsed: IncomingMessage = {
            from: message.from,
            messageId: message.id,
            timestamp: parseInt(message.timestamp),
            type: message.type as any,
          };
          
          // Parsear según tipo de mensaje
          switch (message.type) {
            case 'text':
              parsed.text = message.text?.body;
              break;
              
            case 'image':
              parsed.mediaId = message.image?.id;
              parsed.mimeType = message.image?.mime_type;
              parsed.caption = message.image?.caption;
              break;
              
            case 'video':
              parsed.mediaId = message.video?.id;
              parsed.mimeType = message.video?.mime_type;
              parsed.caption = message.video?.caption;
              break;
              
            case 'audio':
              parsed.mediaId = message.audio?.id;
              parsed.mimeType = message.audio?.mime_type;
              break;
              
            case 'document':
              parsed.mediaId = message.document?.id;
              parsed.mimeType = message.document?.mime_type;
              parsed.caption = message.document?.caption;
              break;
              
            case 'location':
              parsed.latitude = message.location?.latitude;
              parsed.longitude = message.location?.longitude;
              parsed.locationName = message.location?.name;
              parsed.locationAddress = message.location?.address;
              break;
              
            case 'interactive':
              parsed.interactive = {
                type: message.interactive?.type || '',
                buttonReply: message.interactive?.button_reply,
                listReply: message.interactive?.list_reply,
              };
              break;
          }
          
          messages.push(parsed);
        }
      }
    }
  } catch (error) {
    console.error('[Webhook] Error parsing webhook payload (legacy):', error);
  }
  
  return messages;
}

/**
 * Valida que el payload del webhook sea válido
 * 
 * @param payload Payload a validar
 * @returns true si el payload es válido
 */
export function validateWebhookPayload(payload: any): payload is WebhookPayload {
  return (
    payload &&
    typeof payload === 'object' &&
    (payload.object === 'whatsapp_business_account' || payload.object === 'page') &&
    Array.isArray(payload.entry)
  );
}

/**
 * Obtiene eventos normalizados del webhook usando la librería
 * Útil para obtener statuses, calls, etc.
 */
export function getNormalizedWebhookEvents(payload: WebhookPayload): any {
  return normalizeWebhook(payload as any);
}
