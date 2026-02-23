/**
 * Types Re-exports and Custom Types
 * 
 * Tipos útiles para el uso del cliente WhatsApp en el monorepo
 */

/**
 * Tipo para el estado de lectura de un mensaje
 */
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed';

/**
 * Tipo para el resultado de envío de mensaje
 */
export interface SendMessageResult {
  messageId: string;
  status: MessageStatus;
  timestamp: number;
}

/**
 * Opciones para enviar mensaje de texto
 */
export interface SendTextOptions {
  previewUrl?: boolean;
  replyTo?: string;
}

/**
 * Opciones para enviar imagen
 */
export interface SendImageOptions {
  caption?: string;
  replyTo?: string;
}

/**
 * Opciones para enviar video
 */
export interface SendVideoOptions {
  caption?: string;
  replyTo?: string;
}

/**
 * Opciones para enviar audio
 */
export interface SendAudioOptions {
  replyTo?: string;
}

/**
 * Opciones para enviar documento
 */
export interface SendDocumentOptions {
  caption?: string;
  filename?: string;
  replyTo?: string;
}

/**
 * Opciones para enviar ubicación
 */
export interface SendLocationOptions {
  name?: string;
  address?: string;
}

/**
 * Botón interactivo
 */
export interface InteractiveButton {
  id: string;
  title: string;
}

/**
 * Opciones para mensaje con botones
 */
export interface SendButtonsOptions {
  bodyText: string;
  buttons: InteractiveButton[];
  headerText?: string;
  footerText?: string;
  contextMessageId?: string; // Para responder a un mensaje específico
  bizOpaqueCallbackData?: string; // Datos opacos para callbacks
}

/**
 * Item de lista interactiva
 */
export interface InteractiveListItem {
  id: string;
  title: string;
  description?: string;
}

/**
 * Sección de lista interactiva
 */
export interface InteractiveListSection {
  title?: string;
  items: InteractiveListItem[];
}

/**
 * Opciones para mensaje con lista
 */
export interface SendListOptions {
  bodyText: string;
  buttonText: string;
  sections: InteractiveListSection[];
  headerText?: string;
  footerText?: string;
  contextMessageId?: string; // Para responder a un mensaje específico
  bizOpaqueCallbackData?: string; // Datos opacos para callbacks
}

/**
 * Tipo de media
 */
export type MediaType = 'image' | 'video' | 'audio' | 'document';

/**
 * Información de archivo media
 */
export interface MediaInfo {
  id: string;
  url?: string;
  mimeType: string;
  sha256?: string;
  fileSize?: number;
}

/**
 * Opciones para enviar sticker
 */
export interface SendStickerOptions {
  replyTo?: string;
}

/**
 * Contacto para enviar vCard
 */
export interface Contact {
  name: {
    formattedName: string;
    firstName?: string;
    lastName?: string;
  };
  phones?: Array<{
    phone: string;
    type?: string;
  }>;
  emails?: Array<{
    email: string;
    type?: string;
  }>;
  addresses?: Array<{
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    countryCode?: string;
    type?: string;
  }>;
}

/**
 * Opciones para enviar contactos
 */
export interface SendContactsOptions {
  replyTo?: string;
}

/**
 * Opciones para consultar mensajes
 */
export interface QueryMessagesOptions {
  direction?: 'inbound' | 'outbound';
  status?: string;
  since?: string; // ISO 8601 format
  until?: string; // ISO 8601 format
  conversationId?: string;
  limit?: number;
  after?: string;
  before?: string;
  fields?: string;
}

/**
 * Opciones para listar mensajes por conversación
 */
export interface ListByConversationOptions {
  limit?: number;
  after?: string;
  before?: string;
  fields?: string;
}

/**
 * Respuesta de consulta de mensajes
 */
export interface MessageListResponse {
  data: Array<{
    id: string;
    from: string;
    to: string;
    timestamp: string;
    type: string;
    [key: string]: any;
  }>;
  paging?: {
    cursors?: {
      before?: string;
      after?: string;
    };
    next?: string;
    previous?: string;
  };
}
