import { WhatsAppClientCore } from './core';

export interface WhatsAppSender {
  sendText(to: string, text: string, options?: { replyTo?: string; previewUrl?: boolean }): Promise<any>;
  sendImage(to: string, imageUrl: string, options?: { caption?: string; replyTo?: string }): Promise<any>;
  sendVideo(to: string, videoUrl: string, options?: { caption?: string; replyTo?: string }): Promise<any>;
  sendAudio(to: string, audioUrl: string, options?: { replyTo?: string }): Promise<any>;
  sendDocument(to: string, documentUrl: string, options?: { caption?: string; filename?: string; replyTo?: string }): Promise<any>;
  sendLocation(to: string, latitude: number, longitude: number, options?: { name?: string; address?: string }): Promise<any>;
  sendButtons(to: string, options: {
    bodyText: string;
    buttons: Array<{ id: string; title: string }>;
    headerText?: string;
    footerText?: string;
    contextMessageId?: string;
    bizOpaqueCallbackData?: string;
  }): Promise<any>;
  sendList(to: string, options: {
    bodyText: string;
    buttonText: string;
    sections: Array<{ title?: string; items: Array<{ id: string; title: string; description?: string }> }>;
    headerText?: string;
    footerText?: string;
    contextMessageId?: string;
    bizOpaqueCallbackData?: string;
  }): Promise<any>;
  markRead(messageId: string): Promise<any>;
  sendSticker(to: string, stickerId: string, options?: { replyTo?: string }): Promise<any>;
  sendContacts(to: string, contacts: Array<{
    name: { formattedName: string; firstName?: string; lastName?: string };
    phones?: Array<{ phone: string; type?: string }>;
    emails?: Array<{ email: string; type?: string }>;
    addresses?: Array<{ street?: string; city?: string; state?: string; zip?: string; country?: string; countryCode?: string; type?: string }>;
  }>, options?: { replyTo?: string }): Promise<any>;
  sendReaction(to: string, messageId: string, emoji: string): Promise<any>;
  queryMessages(options: { direction?: string; status?: string; since?: string; until?: string; conversationId?: string; limit?: number; after?: string; before?: string; fields?: string }): Promise<any>;
  listByConversation(conversationId: string, options?: { limit?: number; after?: string; before?: string; fields?: string }): Promise<any>;
  sendTemplate(to: string, templateName: string, languageCode: string, bodyParams?: string[], buttonParams?: Array<{ index: number; type: 'url' | 'quick_reply' | 'phone_number' | 'copy_code'; text?: string }>): Promise<any>;
}

export class DirectWhatsAppSender implements WhatsAppSender {
  constructor(private core: WhatsAppClientCore) {}

  sendText(to: string, text: string, options?: { replyTo?: string; previewUrl?: boolean }) {
    return this.core.sendTextInternal(to, text, options);
  }
  sendImage(to: string, imageUrl: string, options?: { caption?: string; replyTo?: string }) {
    return this.core.sendImageInternal(to, imageUrl, options);
  }
  sendVideo(to: string, videoUrl: string, options?: { caption?: string; replyTo?: string }) {
    return this.core.sendVideoInternal(to, videoUrl, options);
  }
  sendAudio(to: string, audioUrl: string, options?: { replyTo?: string }) {
    return this.core.sendAudioInternal(to, audioUrl, options);
  }
  sendDocument(to: string, documentUrl: string, options?: { caption?: string; filename?: string; replyTo?: string }) {
    return this.core.sendDocumentInternal(to, documentUrl, options);
  }
  sendLocation(to: string, lat: number, lng: number, options?: { name?: string; address?: string }) {
    return this.core.sendLocationInternal(to, lat, lng, options);
  }
  sendButtons(to: string, options: any) {
    return this.core.sendButtonsInternal(to, options);
  }
  sendList(to: string, options: any) {
    return this.core.sendListInternal(to, options);
  }
  markRead(messageId: string) {
    return this.core.markReadInternal(messageId);
  }
  sendSticker(to: string, stickerId: string, options?: { replyTo?: string }) {
    return this.core.sendStickerInternal(to, stickerId, options);
  }
  sendContacts(to: string, contacts: any[], options?: { replyTo?: string }) {
    return this.core.sendContactsInternal(to, contacts, options);
  }
  sendReaction(to: string, messageId: string, emoji: string) {
    return this.core.sendReactionInternal(to, messageId, emoji);
  }
  queryMessages(options: any) {
    return this.core.queryMessagesInternal(options);
  }
  listByConversation(conversationId: string, options?: any) {
    return this.core.listByConversationInternal(conversationId, options);
  }
  sendTemplate(to: string, templateName: string, languageCode: string, bodyParams?: string[], buttonParams?: any[]) {
    return this.core.sendTemplateInternal(to, templateName, languageCode, bodyParams, buttonParams);
  }
}
