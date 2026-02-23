import { WhatsAppClient, buildTemplateSendPayload } from '@kapso/whatsapp-cloud-api';
import { WhatsAppConfig } from './config';

/**
 * WhatsAppClientCore
 * 
 * Cliente base de WhatsApp que envuelve @kapso/whatsapp-cloud-api
 * NO sabe nada sobre colas, solo envía mensajes directamente a Meta API
 */
export class WhatsAppClientCore {
  private client: WhatsAppClient;
  private phoneNumberId: string;

  constructor(config: WhatsAppConfig) {
    const clientConfig: any = {
      accessToken: config.accessToken,
    };

    // Si hay baseUrl (puede ser Kapso proxy)
    if (config.baseUrl) {
      clientConfig.baseUrl = config.baseUrl;
    }

    // Si hay Kapso API key
    if (config.kapsoApiKey) {
      clientConfig.kapsoApiKey = config.kapsoApiKey;
    }

    this.client = new WhatsAppClient(clientConfig);
    this.phoneNumberId = config.phoneNumberId;
  }

  /**
   * Envía un mensaje de texto
   */
  async sendTextInternal(
    to: string,
    text: string,
    options?: { replyTo?: string; previewUrl?: boolean }
  ): Promise<any> {
    return this.client.messages.sendText({
      phoneNumberId: this.phoneNumberId,
      to,
      body: text,
      previewUrl: options?.previewUrl,
      ...(options?.replyTo && { contextMessageId: options.replyTo }),
    });
  }

  /**
   * Envía una imagen
   */
  async sendImageInternal(
    to: string,
    imageUrl: string,
    options?: { caption?: string; replyTo?: string }
  ): Promise<any> {
    return this.client.messages.sendImage({
      phoneNumberId: this.phoneNumberId,
      to,
      image: { link: imageUrl, caption: options?.caption },
      ...(options?.replyTo && { contextMessageId: options.replyTo }),
    });
  }

  /**
   * Envía un video
   */
  async sendVideoInternal(
    to: string,
    videoUrl: string,
    options?: { caption?: string; replyTo?: string }
  ): Promise<any> {
    return this.client.messages.sendVideo({
      phoneNumberId: this.phoneNumberId,
      to,
      video: { link: videoUrl, caption: options?.caption },
      ...(options?.replyTo && { contextMessageId: options.replyTo }),
    });
  }

  /**
   * Envía un audio
   */
  async sendAudioInternal(
    to: string,
    audioUrl: string,
    options?: { replyTo?: string }
  ): Promise<any> {
    return this.client.messages.sendAudio({
      phoneNumberId: this.phoneNumberId,
      to,
      audio: { link: audioUrl },
      ...(options?.replyTo && { contextMessageId: options.replyTo }),
    });
  }

  /**
   * Envía un documento
   */
  async sendDocumentInternal(
    to: string,
    documentUrl: string,
    options?: { caption?: string; filename?: string; replyTo?: string }
  ): Promise<any> {
    return this.client.messages.sendDocument({
      phoneNumberId: this.phoneNumberId,
      to,
      document: {
        link: documentUrl,
        filename: options?.filename,
        caption: options?.caption,
      },
      ...(options?.replyTo && { contextMessageId: options.replyTo }),
    });
  }

  /**
   * Envía una ubicación
   */
  async sendLocationInternal(
    to: string,
    latitude: number,
    longitude: number,
    options?: { name?: string; address?: string }
  ): Promise<any> {
    return this.client.messages.sendLocation({
      phoneNumberId: this.phoneNumberId,
      to,
      location: {
        latitude,
        longitude,
        name: options?.name,
        address: options?.address,
      },
    });
  }

  /**
   * Envía botones interactivos
   * @param to Número de teléfono del destinatario (formato internacional: +1234567890)
   * @param options Opciones del mensaje con botones
   * @returns Respuesta de la API de WhatsApp
   */
  async sendButtonsInternal(
    to: string,
    options: {
      bodyText: string;
      buttons: Array<{ id: string; title: string }>;
      headerText?: string;
      footerText?: string;
      contextMessageId?: string; // Para responder a un mensaje específico
      bizOpaqueCallbackData?: string; // Datos opacos para callbacks
    }
  ): Promise<any> {
    // Verificar que options tenga los campos requeridos
    if (!options || typeof options !== 'object') {
      throw new Error('options object is required');
    }
    if (!options.bodyText || typeof options.bodyText !== 'string') {
      throw new Error(`bodyText is required and must be a string. Got: ${typeof options.bodyText}`);
    }
    if (!options.buttons || !Array.isArray(options.buttons) || options.buttons.length === 0) {
      throw new Error(`buttons array is required and must not be empty. Got: ${typeof options.buttons}`);
    }
    // Validar límites de Meta API: máximo 3 botones
    if (options.buttons.length > 3) {
      throw new Error(`Maximum 3 buttons allowed. Got: ${options.buttons.length}`);
    }

    // Kapso espera botones directamente como { id, title }, no envueltos en { type: 'reply', reply: {...} }
    const buttons = options.buttons.map((btn, index) => {
      if (!btn || typeof btn !== 'object') {
        throw new Error(`Button at index ${index} must be an object. Got: ${typeof btn}`);
      }
      if (!btn.id || typeof btn.id !== 'string') {
        throw new Error(`Button at index ${index} must have id (string). Got: ${JSON.stringify(btn)}`);
      }
      if (!btn.title || typeof btn.title !== 'string') {
        throw new Error(`Button at index ${index} must have title (string). Got: ${JSON.stringify(btn)}`);
      }
      // Validar límites de longitud de Meta API
      if (btn.id.length > 256) {
        throw new Error(`Button id at index ${index} must be <= 256 chars. Got: ${btn.id.length}`);
      }
      if (btn.title.length > 20) {
        throw new Error(`Button title at index ${index} must be <= 20 chars. Got: ${btn.title.length}`);
      }
      // Kapso espera directamente { id, title }, no el formato de Meta API
      return {
        id: btn.id,
        title: btn.title,
      };
    });

    const payload: any = {
      phoneNumberId: this.phoneNumberId,
      to,
      bodyText: options.bodyText,
      buttons,
    };

    // Header opcional: debe ser objeto con { type: 'text', text: string }
    if (options.headerText) {
      payload.header = { type: 'text', text: options.headerText };
    }

    // Footer opcional: string directo
    if (options.footerText) {
      payload.footerText = options.footerText;
    }

    // Contexto opcional: para responder a un mensaje específico
    if (options.contextMessageId) {
      payload.contextMessageId = options.contextMessageId;
    }

    // Datos opacos opcionales para callbacks
    if (options.bizOpaqueCallbackData) {
      payload.bizOpaqueCallbackData = options.bizOpaqueCallbackData;
    }

    return this.client.messages.sendInteractiveButtons(payload);
  }

  /**
   * Envía una lista interactiva
   * @param to Número de teléfono del destinatario (formato internacional: +1234567890)
   * @param options Opciones del mensaje con lista
   * @returns Respuesta de la API de WhatsApp
   */
  async sendListInternal(
    to: string,
    options: {
      bodyText: string;
      buttonText: string;
      sections: Array<{
        title?: string;
        items: Array<{ id: string; title: string; description?: string }>;
      }>;
      headerText?: string;
      footerText?: string;
      contextMessageId?: string; // Para responder a un mensaje específico
      bizOpaqueCallbackData?: string; // Datos opacos para callbacks
    }
  ): Promise<any> {
    // Verificar que options tenga los campos requeridos
    if (!options || typeof options !== 'object') {
      throw new Error('options object is required');
    }
    if (!options.bodyText || typeof options.bodyText !== 'string') {
      throw new Error(`bodyText is required and must be a string. Got: ${typeof options.bodyText}`);
    }
    if (!options.buttonText || typeof options.buttonText !== 'string') {
      throw new Error(`buttonText is required and must be a string. Got: ${typeof options.buttonText}`);
    }
    if (!options.sections || !Array.isArray(options.sections) || options.sections.length === 0) {
      throw new Error(`sections array is required and must not be empty. Got: ${typeof options.sections}`);
    }

    // Validar límites de Meta API para listas
    if (options.sections.length > 10) {
      throw new Error(`Maximum 10 sections allowed. Got: ${options.sections.length}`);
    }

    const sections = options.sections.map((section, sectionIndex) => {
      if (!section.items || !Array.isArray(section.items) || section.items.length === 0) {
        throw new Error(`Section ${sectionIndex} must have at least one item`);
      }
      if (section.items.length > 10) {
        throw new Error(`Section ${sectionIndex} can have maximum 10 items. Got: ${section.items.length}`);
      }

      return {
        title: section.title,
        rows: section.items.map((item, itemIndex) => {
          if (!item || typeof item !== 'object') {
            throw new Error(`List item at section ${sectionIndex}, item ${itemIndex} must be an object. Got: ${typeof item}`);
          }
          if (!item.id || typeof item.id !== 'string') {
            throw new Error(`List item at section ${sectionIndex}, item ${itemIndex} must have id (string). Got: ${JSON.stringify(item)}`);
          }
          if (!item.title || typeof item.title !== 'string') {
            throw new Error(`List item at section ${sectionIndex}, item ${itemIndex} must have title (string). Got: ${JSON.stringify(item)}`);
          }
          // Validar límites de longitud de Meta
          if (item.id.length > 200) {
            throw new Error(`Item id at section ${sectionIndex}, item ${itemIndex} must be <= 200 chars. Got: ${item.id.length}`);
          }
          if (item.title.length > 24) {
            throw new Error(`Item title at section ${sectionIndex}, item ${itemIndex} must be <= 24 chars. Got: ${item.title.length}`);
          }
          if (item.description && item.description.length > 72) {
            throw new Error(`Item description at section ${sectionIndex}, item ${itemIndex} must be <= 72 chars. Got: ${item.description.length}`);
          }
          return {
            id: item.id,
            title: item.title,
            description: item.description,
          };
        }),
      };
    });

    const payload: any = {
      phoneNumberId: this.phoneNumberId,
      to,
      bodyText: options.bodyText,
      buttonText: options.buttonText,
      sections,
    };

    // Header opcional: debe ser objeto con { type: 'text', text: string }
    if (options.headerText) {
      payload.header = { type: 'text', text: options.headerText };
    }

    // Footer opcional: string directo
    if (options.footerText) {
      payload.footerText = options.footerText;
    }

    // Contexto opcional: para responder a un mensaje específico
    if (options.contextMessageId) {
      payload.contextMessageId = options.contextMessageId;
    }

    // Datos opacos opcionales para callbacks
    if (options.bizOpaqueCallbackData) {
      payload.bizOpaqueCallbackData = options.bizOpaqueCallbackData;
    }

    return this.client.messages.sendInteractiveList(payload);
  }

  /**
   * Marca un mensaje como leído y envía typing indicator
   */
  async markReadInternal(messageId: string): Promise<any> {
    return this.client.messages.markRead({
      phoneNumberId: this.phoneNumberId,
      messageId,
      typingIndicator: { type: 'text' },
    });
  }

  /**
   * Envía un sticker
   */
  async sendStickerInternal(
    to: string,
    stickerId: string,
    options?: { replyTo?: string }
  ): Promise<any> {
    return this.client.messages.sendSticker({
      phoneNumberId: this.phoneNumberId,
      to,
      sticker: { id: stickerId },
      ...(options?.replyTo && { contextMessageId: options.replyTo }),
    });
  }

  /**
   * Envía contactos
   */
  async sendContactsInternal(
    to: string,
    contacts: Array<{
      name: { formattedName: string; firstName?: string; lastName?: string };
      phones?: Array<{ phone: string; type?: string }>;
      emails?: Array<{ email: string; type?: string }>;
      addresses?: Array<{
        street?: string;
        city?: string;
        state?: string;
        zip?: string;
        country?: string;
        countryCode?: string;
        type?: string;
      }>;
    }>,
    options?: { replyTo?: string }
  ): Promise<any> {
    return this.client.messages.sendContacts({
      phoneNumberId: this.phoneNumberId,
      to,
      contacts,
      ...(options?.replyTo && { contextMessageId: options.replyTo }),
    });
  }

  /**
   * Envía una reacción a un mensaje
   */
  async sendReactionInternal(
    to: string,
    messageId: string,
    emoji: string
  ): Promise<any> {
    return this.client.messages.sendReaction({
      phoneNumberId: this.phoneNumberId,
      to,
      reaction: { messageId, emoji },
    });
  }

  /**
   * Consulta el historial de mensajes
   */
  async queryMessagesInternal(options: {
    direction?: string;
    status?: string;
    since?: string;
    until?: string;
    conversationId?: string;
    limit?: number;
    after?: string;
    before?: string;
    fields?: string;
  }): Promise<any> {
    return this.client.messages.query({
      phoneNumberId: this.phoneNumberId,
      ...options,
    });
  }

  /**
   * Lista mensajes por conversación
   */
  async listByConversationInternal(
    conversationId: string,
    options?: {
      limit?: number;
      after?: string;
      before?: string;
      fields?: string;
    }
  ): Promise<any> {
    return this.client.messages.listByConversation({
      phoneNumberId: this.phoneNumberId,
      conversationId,
      ...options,
    });
  }

  /**
   * Envía un template de WhatsApp usando buildTemplateSendPayload de Kapso
   * 
   * @param to Número de teléfono del destinatario (formato internacional: +1234567890)
   * @param templateName Nombre del template aprobado en Meta Business Suite
   * @param languageCode Código de idioma (ej: 'es', 'en_US')
   * @param bodyParams Array de parámetros para el body del template (reemplazan {{1}}, {{2}}, etc.)
   * @param buttonParams Array opcional de parámetros para botones (si el template tiene botones con variables)
   */
  async sendTemplateInternal(
    to: string,
    templateName: string,
    languageCode: string,
    bodyParams?: string[],
    buttonParams?: Array<{ index: number; type: 'url' | 'quick_reply' | 'phone_number' | 'copy_code'; text?: string }>
  ): Promise<any> {
    // Construir el payload usando buildTemplateSendPayload de Kapso
    const inputPayload: any = {
      name: templateName,
      language: languageCode,
    };

    // Si hay parámetros para el body, incluirlos
    if (bodyParams && bodyParams.length > 0) {
      inputPayload.body = bodyParams.map(text => ({
        type: 'text' as const,
        text,
      }));
    }

    // Si hay parámetros para botones, incluirlos
    // Los botones pueden tener variables en su URL, código para copiar, etc.
    if (buttonParams && buttonParams.length > 0) {
      inputPayload.buttons = buttonParams.map(btn => {
        const button: any = {
          type: 'button',
          subType: btn.type,
          index: btn.index,
        };

        // Para botones copy_code y url, siempre requieren parámetros con el texto
        if ((btn.type === 'url' || btn.type === 'copy_code') && btn.text) {
          button.parameters = [
            {
              type: 'text',
              text: btn.text,
            },
          ];
        }
        // Para otros tipos de botones (quick_reply, phone_number), pueden necesitar parámetros también
        else if (btn.text) {
          button.parameters = [
            {
              type: 'text',
              text: btn.text,
            },
          ];
        }

        return button;
      });
    }
    const templatePayload = buildTemplateSendPayload(inputPayload);

    const finalPayload = {
      phoneNumberId: this.phoneNumberId,
      to,
      template: templatePayload,
    };

    try {
      const result = await this.client.messages.sendTemplate(finalPayload);
      return result;
    } catch (error: any) {
      throw error;
    }
  }
}

